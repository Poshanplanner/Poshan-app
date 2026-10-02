// The link in your WhatsApp/email alert opens this page. Opening it only shows the payment;
// nothing changes until you tap Approve or Reject (so link previews can't approve by accident).
import { getAdmin, db, now, SETTINGS, checkSign, grantPro, sendEmail } from './_lib.js';

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const day = ms => new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });

function page(title, body) {
  return `<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>${esc(title)} · Poshan</title>
<style>
:root{--bg:#F2F4F7;--card:#fff;--ink:#172031;--muted:#576276;--line:#D8DDE5;--ok:#2C7955;--bad:#AE501B}
@media (prefers-color-scheme:dark){:root{--bg:#0F131A;--card:#161C26;--ink:#E6EAF1;--muted:#9AA5B6;--line:#283142;--ok:#5CC08F;--bad:#F08A55;color-scheme:dark}}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:480px;margin:0 auto;padding:24px 16px}
h1{font-size:24px;margin:0 0 12px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px;display:grid;gap:8px}
dl{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;margin:0}dt{color:var(--muted)}dd{margin:0;font-weight:600;overflow-wrap:anywhere}
form{margin:0}.row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}
button{width:100%;height:48px;border-radius:10px;font:600 16px system-ui,sans-serif;cursor:pointer;border:1px solid var(--line);background:var(--card);color:var(--ink)}
button.ok{background:var(--ok);border-color:var(--ok);color:#fff}
p{margin:12px 0 0}.muted{color:var(--muted);font-size:14px}.okt{color:var(--ok);font-weight:600}.badt{color:var(--bad);font-weight:600}
pre{white-space:pre-wrap;font:14px/1.5 system-ui,sans-serif;margin:0}
</style></head><body><main>${body}</main></body></html>`;
}
const send = (res, status, title, body) => { res.status(status).setHeader('Content-Type', 'text/html; charset=utf-8'); res.send(page(title, body)); };

export default async function handler(req, res) {
  const { k, id, t } = req.query || {};
  if (!['pro', 'consult'].includes(k) || !id || !process.env.ADMIN_SECRET || !checkSign(k, id, t)) {
    return send(res, 403, 'Link not valid', '<h1>Link not valid</h1><p class="muted">Open the link exactly as it arrived in your alert.</p>');
  }
  const ref = db().doc(`${k === 'pro' ? 'proRequests' : 'consultations'}/${id}`);
  const snap = await ref.get();
  if (!snap.exists) return send(res, 404, 'Not found', '<h1>Payment not found</h1>');
  const d = snap.data();
  const amount = k === 'pro' ? d.amount : d.fee;
  const pending = k === 'pro' ? d.status === 'pending' : d.status === 'payment_to_verify';

  const details = `<div class="card"><dl>
    <dt>For</dt><dd>${k === 'pro' ? 'Poshan Pro' : `Consultation ${esc(d.bookingId)}`}</dd>
    <dt>Amount</dt><dd>₹${esc(amount)}</dd>
    <dt>UTR</dt><dd>${esc(d.utr)}</dd>
    <dt>${k === 'pro' ? 'User' : 'Patient'}</dt><dd>${esc(k === 'pro' ? d.email || d.uid : `${d.name} · ${d.phone}`)}</dd>
    ${k === 'consult' ? `<dt>Concern</dt><dd>${esc(d.concern)}</dd>` : ''}
    <dt>Status</dt><dd>${esc(d.status.replace(/_/g, ' '))}</dd></dl></div>`;

  if (req.method === 'GET') {
    if (!pending) return send(res, 200, 'Already done', `<h1>Already ${esc(d.status.replace(/_/g, ' '))}</h1>${details}`);
    return send(res, 200, 'Verify payment', `<h1>Verify this payment</h1>${details}
      <p class="muted">Check that ₹${esc(amount)} with UTR ${esc(d.utr)} arrived in GPay, then:</p>
      <div class="row">
        <form method="post"><input type="hidden" name="action" value="reject"><button>Reject</button></form>
        <form method="post"><input type="hidden" name="action" value="approve"><button class="ok">Approve</button></form>
      </div>`);
  }
  if (req.method !== 'POST') return res.status(405).end();

  const action = (req.body && req.body.action) || '';
  if (!pending) return send(res, 200, 'Already done', `<h1>Already ${esc(d.status.replace(/_/g, ' '))}</h1>${details}`);

  if (k === 'pro') {
    const userRef = db().doc(`users/${d.uid}`);
    if (action === 'approve') {
      let until = 0;
      await db().runTransaction(async tx => {
        const cur = await tx.get(ref);
        if (cur.get('status') !== 'pending') return;
        until = await grantPro(d.uid, SETTINGS.proDays, tx);
        tx.update(ref, { status: 'approved', decidedAt: now() });
      });
      return send(res, 200, 'Approved', `<h1 class="okt">Approved</h1><p>Pro is active for ${esc(d.email || 'the user')} until ${day(until)}. It unlocks on their screen right away.</p>`);
    }
    if (action === 'reject') {
      await ref.update({ status: 'rejected', decidedAt: now() });
      await userRef.set({ proPending: getAdmin().firestore.FieldValue.delete(), proRejected: { utr: d.utr, at: Date.now() } }, { merge: true });
      return send(res, 200, 'Rejected', `<h1 class="badt">Rejected</h1><p>The user sees that the payment could not be found and can submit again.</p>`);
    }
  } else {
    if (action === 'approve') {
      await ref.update({ status: 'verified', decidedAt: now() });
      let proMsg = 'No Poshan account found for this patient, so free Pro was not added. They can sign in and send you their email.';
      let uid = d.uid;
      if (!uid && d.email) { try { uid = (await getAdmin().auth().getUserByEmail(d.email)).uid; } catch { uid = null; } }
      if (uid) { const until = await grantPro(uid, SETTINGS.consultProDays); proMsg = `Free Pro added until ${day(until)}.`; }
      if (process.env.MAIL_FROM && d.email) {
        try {
          await sendEmail(d.email, `Payment received · ${d.bookingId}`,
            `Hello ${d.name},\n\nYour payment of ₹${d.fee} for your consultation with Dr Rajesh Bandgar is confirmed (booking ${d.bookingId}).\nYou will be contacted on WhatsApp within 1–2 days to fix the time of your ${d.mode === 'phone' ? 'phone call' : 'online video call'}.\n\nPoshan`,
            process.env.DOCTOR_EMAIL);
        } catch (e) { console.error(e); }
      }
      return send(res, 200, 'Approved', `<h1 class="okt">Payment verified</h1><p>${esc(d.name)} · ${esc(d.phone)} · ${d.mode === 'phone' ? 'Phone call' : 'Online video call'}, ${esc(d.slot || 'any time')}.</p><p>${esc(proMsg)}</p><p class="muted">Next: WhatsApp them to fix the call time.</p>`);
    }
    if (action === 'reject') {
      await ref.update({ status: 'rejected', decidedAt: now() });
      return send(res, 200, 'Rejected', `<h1 class="badt">Marked as not paid</h1><p>Consider messaging ${esc(d.name)} on ${esc(d.phone)} to check their UTR.</p>`);
    }
  }
  return send(res, 400, 'Choose an action', '<h1>Choose Approve or Reject</h1>');
}
