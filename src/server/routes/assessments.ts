import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db';
import { assessments } from '../../db/schema';

const router = Router();

const AssessmentSchema = z.object({
  id: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  type: z.enum(['practice', 'official', 'mock']),
  score: z.number().int().min(0).max(10000),
  maxScore: z.number().int().min(1).max(10000),
  timeTaken: z.number().int().min(0),
  domain: z.string().min(1).max(200),
  notes: z.string().max(2000).default(''),
  createdAt: z.string().min(1).max(50),
});

router.get('/', async (_req, res) => {
  try {
    const rows = await db.select().from(assessments).orderBy(assessments.createdAt);
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch assessments.' });
  }
});

router.post('/', async (req, res) => {
  const parsed = AssessmentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request body.', details: parsed.error.flatten() });
    return;
  }

  const data = parsed.data;
  const percentage = Math.round((data.score / data.maxScore) * 100);
  const passed = percentage >= 70;

  try {
    const [created] = await db
      .insert(assessments)
      .values({ ...data, percentage, passed })
      .returning();
    res.status(201).json(created);
  } catch (err: unknown) {
    const isUniqueViolation =
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === '23505';
    if (isUniqueViolation) {
      res.status(409).json({ error: 'An assessment with this ID already exists.' });
    } else {
      res.status(500).json({ error: 'Failed to create assessment.' });
    }
  }
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  if (!id || typeof id !== 'string' || id.length > 100) {
    res.status(400).json({ error: 'Invalid ID.' });
    return;
  }
  try {
    await db.delete(assessments).where(eq(assessments.id, id));
    res.status(204).end();
  } catch {
    res.status(500).json({ error: 'Failed to delete assessment.' });
  }
});

router.delete('/', async (_req, res) => {
  try {
    await db.delete(assessments);
    res.status(204).end();
  } catch {
    res.status(500).json({ error: 'Failed to clear assessments.' });
  }
});

export default router;
