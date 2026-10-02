// Starts a Razorpay subscription for the signed-in user and returns its ID for checkout.
import { db, razorpay, PLANS, requireUser, HttpError, sendError } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  try {
    const user = await requireUser(req);
    const planKey = (req.body || {}).plan;
    const plan = PLANS[planKey];
    if (!plan || !plan.id) throw new HttpError(400, 'Unknown plan.');

    const sub = await razorpay().subscriptions.create({
      plan_id: plan.id,
      total_count: plan.totalCount,
      customer_notify: 1,
      notes: { uid: user.uid, plan: planKey, email: user.email || '' }
    });

    await db().doc(`users/${user.uid}`).set({
      email: user.email || null,
      subscriptionId: sub.id,
      subscriptionPlan: planKey,
      subscriptionStatus: sub.status
    }, { merge: true });

    res.status(200).json({ subscriptionId: sub.id, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (e) {
    sendError(res, e);
  }
}
