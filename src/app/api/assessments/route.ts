import {NextResponse} from 'next/server';
import {z} from 'zod';
import {db} from '@/db';
import {assessments} from '@/db/schema';
import {getAssessments} from '@/data/assessmentRepository';
import {authenticate} from '@/lib/auth';
import {enforceRateLimit} from '@/lib/rate-limit';

const AssessmentSchema = z.object({
    id: z.string().min(1).max(100),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    type: z.enum(['practice', 'official', 'mock']),
    score: z.number().int().min(0).max(10000),
    maxScore: z.number().int().min(1).max(10000),
    timeTaken: z.number().int().min(0),
    domain: z.string().min(1).max(200),
    notes: z.string().max(2000).default(''),
    createdAt: z.string().min(1).max(50).optional(),
}).refine((data) => data.score <= data.maxScore, {
    message: 'score cannot exceed maxScore',
    path: ['score'],
});

export async function GET(request: Request) {
    const authError = authenticate(request);
    if (authError) return authError;

    try {
        return NextResponse.json(await getAssessments());
    } catch {
        return NextResponse.json({error: 'Failed to fetch assessments.'}, {status: 500});
    }
}

export async function POST(request: Request) {
    const authError = authenticate(request);
    if (authError) return authError;

    const limited = enforceRateLimit(request, 'assessments:create', 30, 60_000);
    if (limited) return limited;

    const body = await request.json().catch(() => null);
    const parsed = AssessmentSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            {error: 'Invalid request body.', details: parsed.error.flatten()},
            {status: 400},
        );
    }

    const data = parsed.data;
    const percentage = Math.round((data.score / data.maxScore) * 100);
    const passed = percentage >= 70;

    if (process.env.E2E_FIXTURES === 'true') {
        return NextResponse.json({
            ...data,
            percentage,
            passed,
            createdAt: '2026-07-18T12:00:00.000Z',
        }, {status: 201});
    }

    try {
        const [created] = await db
            .insert(assessments)
            .values({...data, percentage, passed, createdAt: new Date().toISOString()})
            .returning();
        return NextResponse.json(created, {status: 201});
    } catch (err: unknown) {
        const isUniqueViolation =
            typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === '23505';
        if (isUniqueViolation) {
            return NextResponse.json({error: 'An assessment with this ID already exists.'}, {status: 409});
        }
        return NextResponse.json({error: 'Failed to create assessment.'}, {status: 500});
    }
}

export async function DELETE(request: Request) {
    const authError = authenticate(request);
    if (authError) return authError;

    const limited = enforceRateLimit(request, 'assessments:clear', 5, 60_000);
    if (limited) return limited;

    try {
        await db.delete(assessments);
        return new Response(null, {status: 204});
    } catch {
        return NextResponse.json({error: 'Failed to clear assessments.'}, {status: 500});
    }
}
