// Cancels renewal at the end of the current billing period. The user keeps Pro until then.
import { db, razorpay, requireUser, HttpError, sendError } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  try {
    const user = await requireUser(req);
    const ref = db().doc(`users/${user.uid}`);
    const subId = (await ref.get()).get('subscriptionId');
    if (!subId) throw new HttpError(400, 'No active subscription found.');

    await razorpay().subscriptions.cancel(subId, true); // true = cancel at end of current cycle
    await ref.set({ subscriptionStatus: 'cancelled' }, { merge: true });
    res.status(200).json({ ok: true });
  } catch (e) {
    sendError(res, e);
  }
}
