// Saves the consultation details and creates a one-time Razorpay payment order.
import { getAdmin, db, razorpay, HttpError, sendError } from './_lib.js';

const clean = (v, n) => String(v ?? '').trim().slice(0, n);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  try {
    const b = req.body || {};
    const d = {
      name: clean(b.name, 80), age: clean(b.age, 3), sex: clean(b.sex, 10),
      phone: clean(b.phone, 20), email: clean(b.email, 120), concern: clean(b.concern, 60),
      details: clean(b.details, 3000), reply: b.reply === 'email' ? 'email' : 'whatsapp', plan: clean(b.plan, 1500)
    };
    const digits = d.phone.replace(/\D/g, '');
    if (!d.name || digits.length < 10 || digits.length > 13 || d.details.length < 15 || !d.concern) {
      throw new HttpError(400, 'Fill in your name, WhatsApp number, concern and details.');
    }

    const fee = Number(process.env.CONSULT_FEE_INR || 499);
    const order = await razorpay().orders.create({
      amount: Math.round(fee * 100), currency: 'INR', receipt: `consult_${Date.now()}`,
      notes: { type: 'consult', name: d.name, phone: d.phone }
    });

    await db().doc(`consultations/${order.id}`).set({
      ...d, fee, status: 'awaiting_payment', createdAt: getAdmin().firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({ orderId: order.id, amount: order.amount, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (e) {
    sendError(res, e);
  }
}
