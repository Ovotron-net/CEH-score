import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { settings } from '../../db/schema';

const router = Router();

const SETTINGS_ID = 1;

router.get('/', async (_req, res) => {
  const rows = await db.select().from(settings).where(eq(settings.id, SETTINGS_ID));
  if (rows.length === 0) {
    const [created] = await db.insert(settings).values({ id: SETTINGS_ID }).returning();
    return res.json(created);
  }
  res.json(rows[0]);
});

router.put('/', async (req, res) => {
  const [updated] = await db
    .insert(settings)
    .values({ id: SETTINGS_ID, ...req.body })
    .onConflictDoUpdate({ target: settings.id, set: req.body })
    .returning();
  res.json(updated);
});

export default router;
