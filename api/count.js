// Counts completed calculator plans (no personal details are stored, only diet and goal).
// Totals appear in Firebase → Firestore → "stats": one document per day (IST) and one called "total".
import { db, getAdmin } from './_lib.js';

const DIETS = ['veg', 'egg', 'nonveg', 'vegan', 'jain'];
const GOALS = ['maintain', 'mild', 'lose', 'gain'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const b = req.body || {};
    const inc = getAdmin().firestore.FieldValue.increment(1);
    const add = { plans: inc };
    if (DIETS.includes(b.diet)) add['diet_' + b.diet] = inc;
    if (GOALS.includes(b.goal)) add['goal_' + b.goal] = inc;
    const day = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
    const batch = db().batch();
    batch.set(db().doc('stats/total'), add, { merge: true });
    batch.set(db().doc('stats/' + day), add, { merge: true });
    await batch.commit();
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(204).end();
  }
}
