import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { assessments } from '../../db/schema';

const router = Router();

router.get('/', async (_req, res) => {
  const rows = await db.select().from(assessments).orderBy(assessments.createdAt);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const [created] = await db.insert(assessments).values(req.body).returning();
  res.status(201).json(created);
});

router.delete('/:id', async (req, res) => {
  await db.delete(assessments).where(eq(assessments.id, req.params.id));
  res.status(204).end();
});

router.delete('/', async (_req, res) => {
  await db.delete(assessments);
  res.status(204).end();
});

export default router;
