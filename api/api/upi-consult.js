// Saves a consultation booking with its UPI transaction ID and alerts the doctor with an approve link.
import { db, now, SETTINGS, getUser, clean, cleanUtr, claimUtr, reviewLink, notifyDoctor, HttpError, sendError } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  try {
    const b = req.body || {};
    const d = {
      name: clean(b.name, 80), age: clean(b.age, 3), sex: clean(b.sex, 10),
      phone: clean(b.phone, 20), email: clean(b.email, 120).toLowerCase(), concern: clean(b.concern, 60),
      details: clean(b.details, 3000), mode: b.mode === 'phone' ? 'phone' : 'video', slot: clean(b.slot, 40), plan: clean(b.plan, 1500)
    };
    const digits = d.phone.replace(/\D/g, '');
    if (!d.name || digits.length < 10 || digits.length > 13 || d.details.length < 15 || !d.concern) {
      throw new HttpError(400, 'Fill in your name, WhatsApp number, concern and details.');
    }
    const utr = cleanUtr(b.utr);
    const user = await getUser(req, true);

    const ref = db().collection('consultations').doc();
    const bookingId = 'PC-' + ref.id.slice(-6).toUpperCase();
    await claimUtr(utr, { kind: 'consult', id: ref.id });
    const fee = SETTINGS.consultFee;
    await ref.set({ ...d, utr, fee, bookingId, uid: user ? user.uid : null, status: 'payment_to_verify', createdAt: now() });

    const link = reviewLink(req, 'consult', ref.id);
    const text = [
      `New Poshan consultation · ${bookingId}`,
      `Payment to verify: ₹${fee} · UTR ${utr}`,
      `Approve or reject: ${link}`,
      '',
      `Name: ${d.name}${d.age || d.sex ? ` (${[d.age, d.sex].filter(Boolean).join(', ')})` : ''}`,
      `WhatsApp: ${d.phone}`,
      d.email ? `Email: ${d.email}` : null,
      `Consultation: ${d.mode === 'phone' ? 'Phone call' : 'Online video call'} · ${d.slot || 'Any time'}`,
      `Concern: ${d.concern}`,
      '',
      d.details,
      d.plan ? `\nPoshan plan:\n${d.plan}` : null
    ].filter(l => l !== null).join('\n');
    await notifyDoctor(`New consultation: ${d.name} · ${d.concern} · UTR ${utr}`, text, d.email || undefined);

    res.status(200).json({ ok: true, bookingId });
  } catch (e) {
    sendError(res, e);
  }
}
