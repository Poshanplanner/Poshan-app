// Confirms the payment signature from Razorpay Checkout and turns on Pro.
import { getAdmin, db, razorpay, requireUser, HttpError, sendError, hmac, safeEqualHex } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  try {
    const user = await requireUser(req);
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body || {};
    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      throw new HttpError(400, 'Payment details are missing.');
    }

    const ref = db().doc(`users/${user.uid}`);
    const snap = await ref.get();
    if (snap.get('subscriptionId') !== razorpay_subscription_id) {
      throw new HttpError(400, 'This payment does not match your account.');
    }

    const expected = hmac(process.env.RAZORPAY_KEY_SECRET, `${razorpay_payment_id}|${razorpay_subscription_id}`);
    if (!safeEqualHex(expected, razorpay_signature)) {
      throw new HttpError(400, 'Payment could not be verified. If money was deducted, it will be refunded or activated within a few minutes.');
    }

    const sub = await razorpay().subscriptions.fetch(razorpay_subscription_id);
    const days = snap.get('subscriptionPlan') === 'yearly' ? 366 : 31;
    const until = sub.current_end ? sub.current_end * 1000 : Date.now() + days * 864e5;

    await ref.set({
      plan: 'pro',
      proUntil: getAdmin().firestore.Timestamp.fromMillis(until),
      subscriptionStatus: sub.status,
      lastPaymentId: razorpay_payment_id
    }, { merge: true });

    res.status(200).json({ ok: true, proUntil: until });
  } catch (e) {
    sendError(res, e);
  }
}
