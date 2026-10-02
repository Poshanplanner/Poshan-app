// Confirms the consultation payment signature, marks the booking paid and notifies the doctor.
import { confirmConsult, hmac, safeEqualHex, HttpError, sendError } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) throw new HttpError(400, 'Payment details are missing.');
    const expected = hmac(process.env.RAZORPAY_KEY_SECRET, `${razorpay_order_id}|${razorpay_payment_id}`);
    if (!safeEqualHex(expected, razorpay_signature)) {
      throw new HttpError(400, 'Payment could not be verified. If money was deducted, your booking will be confirmed within a few minutes.');
    }
    const bookingId = await confirmConsult(razorpay_order_id, razorpay_payment_id);
    res.status(200).json({ ok: true, bookingId });
  } catch (e) {
    sendError(res, e);
  }
}
