// Shared helpers for the payment API (runs on Vercel, never in the browser).
import admin from 'firebase-admin';
import Razorpay from 'razorpay';
import crypto from 'node:crypto';

export function getAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    });
  }
  return admin;
}

export const db = () => getAdmin().firestore();

export const razorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Plan IDs come from Razorpay Dashboard → Subscriptions → Plans
export const PLANS = {
  monthly: { id: process.env.RAZORPAY_PLAN_MONTHLY, totalCount: 120 }, // up to 10 years of renewals
  yearly: { id: process.env.RAZORPAY_PLAN_YEARLY, totalCount: 10 }
};

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

// Checks the Firebase sign-in token sent by the app
export async function requireUser(req) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) throw new HttpError(401, 'Sign in first.');
  try {
    return await getAdmin().auth().verifyIdToken(token);
  } catch {
    throw new HttpError(401, 'Your session has expired. Sign in again.');
  }
}

export function safeEqualHex(a, b) {
  const x = Buffer.from(String(a || ''), 'utf8');
  const y = Buffer.from(String(b || ''), 'utf8');
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function hmac(secret, data) {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

export function sendError(res, e) {
  if (e instanceof HttpError) return res.status(e.status).json({ error: e.message });
  console.error(e);
  return res.status(500).json({ error: 'Something went wrong on our side. Try again in a minute.' });
}

// ───────── Consultations ─────────

// Marks a consultation as paid once (safe if both the app and the webhook call it)
// and notifies the doctor on WhatsApp and email.
export async function confirmConsult(orderId, paymentId) {
  const ref = db().doc(`consultations/${orderId}`);
  const bookingId = 'PC-' + orderId.replace(/^order_/, '').slice(-6).toUpperCase();
  let booking = null;
  await db().runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpError(404, 'Booking not found.');
    if (snap.get('status') === 'paid') return; // already confirmed and notified
    tx.update(ref, { status: 'paid', paymentId, bookingId, paidAt: getAdmin().firestore.FieldValue.serverTimestamp() });
    booking = { ...snap.data(), bookingId, paymentId };
  });
  if (booking) await notifyDoctor(booking);
  return bookingId;
}

function bookingText(b) {
  return [
    `New Poshan consultation · ${b.bookingId}`,
    `Paid: ₹${b.fee}`,
    `Name: ${b.name}${b.age || b.sex ? ` (${[b.age, b.sex].filter(Boolean).join(', ')})` : ''}`,
    `WhatsApp: ${b.phone}`,
    b.email ? `Email: ${b.email}` : '',
    `Reply on: ${b.reply === 'email' ? 'Email' : 'WhatsApp'}`,
    `Concern: ${b.concern}`,
    '',
    b.details,
    b.plan ? `\nPoshan plan:\n${b.plan}` : ''
  ].filter(l => l !== null && l !== undefined).join('\n').replace(/\n{3,}/g, '\n\n');
}

export async function notifyDoctor(b) {
  const text = bookingText(b);
  const jobs = [];

  // Email through Resend (resend.com). The doctor's address must be the Resend account email
  // until you verify your own domain and set MAIL_FROM.
  if (process.env.RESEND_API_KEY && process.env.DOCTOR_EMAIL) {
    const from = process.env.MAIL_FROM || 'Poshan <onboarding@resend.dev>';
    jobs.push(fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from, to: [process.env.DOCTOR_EMAIL],
        subject: `New consultation: ${b.name} · ${b.concern}`,
        text, ...(b.email ? { reply_to: b.email } : {})
      })
    }));
    // Confirmation to the patient (only after your domain is verified in Resend)
    if (process.env.MAIL_FROM && b.email) {
      jobs.push(fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from, to: [b.email], reply_to: process.env.DOCTOR_EMAIL, subject: `Your consultation is booked · ${b.bookingId}`,
          text: `Hello ${b.name},\n\nYour consultation with Dr Rajesh Bandgar is booked (ID ${b.bookingId}, ₹${b.fee} paid).\nYou will get a reply on ${b.reply === 'email' ? 'email' : 'WhatsApp'} within 1–2 days.\n\nQuestions: WhatsApp +91 81696 63781 or reply to this email.\n\nPoshan`
        })
      }));
    }
  }

  // WhatsApp message to the doctor's own number through CallMeBot (free, for personal alerts)
  if (process.env.CALLMEBOT_APIKEY && process.env.DOCTOR_WHATSAPP) {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(process.env.DOCTOR_WHATSAPP)}`
      + `&text=${encodeURIComponent(text.slice(0, 1500))}&apikey=${encodeURIComponent(process.env.CALLMEBOT_APIKEY)}`;
    jobs.push(fetch(url));
  }

  const results = await Promise.allSettled(jobs);
  results.forEach(r => { if (r.status === 'rejected') console.error('Notification failed', r.reason); });
}
