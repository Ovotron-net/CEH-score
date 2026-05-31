import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db';
import { settings } from '../../db/schema';

const router = Router();

const SETTINGS_ID = 1;

const SettingsSchema = z.object({
  name: z.string().min(1).max(100),
  targetScore: z.number().int().min(0).max(100),
  examDate: z.string().max(50),
  theme: z.enum(['dark', 'light']),
});

router.get('/', async (_req, res) => {
  try {
    const rows = await db.select().from(settings).where(eq(settings.id, SETTINGS_ID));
    if (rows.length === 0) {
      const [created] = await db.insert(settings).values({ id: SETTINGS_ID }).returning();
      return res.json(created);
    }
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to fetch settings.' });
  }
});

router.put('/', async (req, res) => {
  const parsed = SettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request body.', details: parsed.error.flatten() });
    return;
  }

  const { name, targetScore, examDate, theme } = parsed.data;

  try {
    const [updated] = await db
      .insert(settings)
      .values({ id: SETTINGS_ID, name, targetScore, examDate, theme })
      .onConflictDoUpdate({ target: settings.id, set: { name, targetScore, examDate, theme } })
      .returning();
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

export default router;
