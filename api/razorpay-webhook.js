// Receives renewal, failure and cancellation events from Razorpay and keeps Pro access in sync.
// Razorpay Dashboard → Webhooks → URL: https://YOUR-DOMAIN/api/razorpay-webhook
import { getAdmin, db, hmac, safeEqualHex, confirmConsult } from './_lib.js';

export const config = { api: { bodyParser: false } };

async function readRaw(req) {
  const chunks = [];
  for await (const c of req) chunks.push(typeof c === 'string' ? Buffer.from(c) : c);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const raw = await readRaw(req);
  const expected = hmac(process.env.RAZORPAY_WEBHOOK_SECRET, raw);
  if (!safeEqualHex(expected, req.headers['x-razorpay-signature'])) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const evt = JSON.parse(raw.toString('utf8'));

  // One-time consultation payments (backup in case the app could not confirm)
  if (evt.event === 'payment.captured') {
    const p = evt.payload && evt.payload.payment && evt.payload.payment.entity;
    if (p && p.notes && p.notes.type === 'consult' && p.order_id) {
      try { await confirmConsult(p.order_id, p.id); } catch (e) { console.error(e); }
    }
    return res.status(200).json({ ok: true });
  }
  const sub = evt.payload && evt.payload.subscription && evt.payload.subscription.entity;
  const uid = sub && sub.notes && sub.notes.uid;
  if (!uid) return res.status(200).json({ ignored: true });

  const ref = db().doc(`users/${uid}`);
  const update = { subscriptionId: sub.id, subscriptionStatus: sub.status };

  switch (evt.event) {
    case 'subscription.activated':
    case 'subscription.charged':
    case 'subscription.resumed':
      update.plan = 'pro';
      if (sub.current_end) update.proUntil = getAdmin().firestore.Timestamp.fromMillis(sub.current_end * 1000);
      break;
    case 'subscription.cancelled':
    case 'subscription.completed':
    case 'subscription.halted':
    case 'subscription.paused':
      // Access continues until proUntil, then the app shows Free automatically.
      break;
    default:
      break;
  }

  await ref.set(update, { merge: true });
  res.status(200).json({ ok: true });
}
