// Shared helpers for the server (runs on Vercel, never in the browser).
import admin from 'firebase-admin';
import crypto from 'node:crypto';

export function getAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  }
  return admin;
}
export const db = () => getAdmin().firestore();
export const now = () => getAdmin().firestore.FieldValue.serverTimestamp();
export const ts = ms => getAdmin().firestore.Timestamp.fromMillis(ms);

export const SETTINGS = {
  proPrice: Number(process.env.PRO_PRICE_INR || 199),
  proDays: Number(process.env.PRO_DAYS || 90),
  consultFee: Number(process.env.CONSULT_FEE_INR || 499),
  consultProDays: Number(process.env.CONSULT_PRO_DAYS || 30)
};

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export function sendError(res, e) {
  if (e instanceof HttpError) return res.status(e.status).json({ error: e.message });
  console.error(e);
  return res.status(500).json({ error: 'Something went wrong on our side. Try again in a minute.' });
}

// Firebase sign-in token sent by the app. optional=true returns null instead of failing.
export async function getUser(req, optional = false) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) { if (optional) return null; throw new HttpError(401, 'Sign in first.'); }
  try { return await getAdmin().auth().verifyIdToken(token); }
  catch { if (optional) return null; throw new HttpError(401, 'Your session has expired. Sign in again.'); }
}

export const clean = (v, n) => String(v ?? '').trim().slice(0, n);
export function cleanUtr(v) {
  const utr = String(v || '').replace(/\s/g, '');
  if (!/^\d{12}$/.test(utr)) throw new HttpError(400, 'Enter the 12-digit UPI transaction ID (numbers only).');
  return utr;
}

// Each UPI transaction ID can be used only once.
export async function claimUtr(utr, data) {
  try { await db().doc(`utrs/${utr}`).create({ ...data, at: now() }); }
  catch (e) {
    if (e.code === 6 || /already exists/i.test(e.message)) throw new HttpError(409, 'This transaction ID has already been submitted. Check the number, or WhatsApp us if you think this is a mistake.');
    throw e;
  }
}

// Signed approve/reject links so only you can act on a payment.
export function sign(kind, id) {
  return crypto.createHmac('sha256', process.env.ADMIN_SECRET).update(`${kind}:${id}`).digest('hex');
}
export function checkSign(kind, id, t) {
  const a = Buffer.from(sign(kind, id)), b = Buffer.from(String(t || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
export function baseUrl(req) {
  return process.env.PUBLIC_URL || `https://${req.headers['x-forwarded-host'] || req.headers.host}`;
}
export function reviewLink(req, kind, id) {
  return `${baseUrl(req)}/api/approve?k=${kind}&id=${encodeURIComponent(id)}&t=${sign(kind, id)}`;
}

// Alerts to the doctor on WhatsApp (CallMeBot) and email (Resend). Failures never block the patient.
export async function notifyDoctor(subject, text, replyTo) {
  const jobs = [];
  if (process.env.RESEND_API_KEY && process.env.DOCTOR_EMAIL) {
    jobs.push(sendEmail(process.env.DOCTOR_EMAIL, subject, text, replyTo));
  }
  if (process.env.CALLMEBOT_APIKEY && process.env.DOCTOR_WHATSAPP) {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(process.env.DOCTOR_WHATSAPP)}`
      + `&text=${encodeURIComponent(text.slice(0, 1500))}&apikey=${encodeURIComponent(process.env.CALLMEBOT_APIKEY)}`;
    jobs.push(fetch(url));
  }
  const results = await Promise.allSettled(jobs);
  results.forEach(r => { if (r.status === 'rejected') console.error('Notification failed', r.reason); });
}
export function sendEmail(to, subject, text, replyTo) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || 'Poshan <onboarding@resend.dev>',
      to: [to], subject, text, ...(replyTo ? { reply_to: replyTo } : {})
    })
  });
}

// Adds Pro days on top of any time the user still has.
export async function grantPro(uid, days, tx) {
  const ref = db().doc(`users/${uid}`);
  const snap = tx ? await tx.get(ref) : await ref.get();
  const cur = snap.exists && snap.get('proUntil') ? snap.get('proUntil').toMillis() : 0;
  const until = Math.max(Date.now(), cur) + days * 864e5;
  const data = { plan: 'pro', proUntil: ts(until), proPending: getAdmin().firestore.FieldValue.delete(), proRejected: getAdmin().firestore.FieldValue.delete() };
  if (tx) tx.set(ref, data, { merge: true }); else await ref.set(data, { merge: true });
  return until;
}
