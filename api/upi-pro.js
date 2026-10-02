// A signed-in user submits the UPI transaction ID for a Pro payment. Pro unlocks when you approve it.
import { db, now, SETTINGS, getUser, cleanUtr, claimUtr, reviewLink, notifyDoctor, HttpError, sendError } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  try {
    const user = await getUser(req);
    const utr = cleanUtr((req.body || {}).utr);
    const userRef = db().doc(`users/${user.uid}`);
    if ((await userRef.get()).get('proPending')) throw new HttpError(409, 'Your earlier payment is still being verified. Pro unlocks as soon as it is checked.');

    const reqRef = db().collection('proRequests').doc();
    await claimUtr(utr, { kind: 'pro', id: reqRef.id, uid: user.uid });
    const amount = SETTINGS.proPrice;
    await reqRef.set({ uid: user.uid, email: user.email || null, utr, amount, status: 'pending', createdAt: now() });
    await userRef.set({ email: user.email || null, proPending: { utr, amount, requestId: reqRef.id, at: Date.now() } }, { merge: true });

    const link = reviewLink(req, 'pro', reqRef.id);
    await notifyDoctor(
      `Poshan Pro payment to verify: ₹${amount} · UTR ${utr}`,
      `Poshan Pro payment to verify\n₹${amount} · UTR ${utr}\nFrom: ${user.email || user.uid}\n\nCheck GPay, then approve or reject:\n${link}`
    );
    res.status(200).json({ ok: true });
  } catch (e) {
    sendError(res, e);
  }
}
