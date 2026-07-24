import {NextResponse} from 'next/server';
import {z} from 'zod';
import {
    clearAssessments,
    createAssessment,
    getAssessments,
} from '@/data/assessmentRepository';
import {toErrorResponse} from '@/lib/errors';
import {guardRead, guardWrite} from '@/lib/routeGuard';

const AssessmentSchema = z.object({
    id: z.string().min(1).max(100),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    type: z.enum(['practice', 'official', 'mock']),
    score: z.number().int().min(0).max(10000),
    maxScore: z.number().int().min(1).max(10000),
    // Minutes; cap at 7 days so clients cannot store unbounded integers.
    timeTaken: z.number().int().min(0).max(10_080),
    domain: z.string().min(1).max(200),
    notes: z.string().max(2000).default(''),
    createdAt: z.string().min(1).max(50).optional(),
}).refine((data) => data.score <= data.maxScore, {
    message: 'score cannot exceed maxScore',
    path: ['score'],
});

export async function GET(request: Request) {
    const denied = guardRead(request);
    if (denied) return denied;

    try {
        return NextResponse.json(await getAssessments());
    } catch {
        return NextResponse.json({error: 'Failed to fetch assessments.'}, {status: 500});
    }
}

export async function POST(request: Request) {
    const denied = guardWrite(request, 'assessments:create', 30, 60_000);
    if (denied) return denied;

    const body = await request.json().catch(() => null);
    const parsed = AssessmentSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            {error: 'Invalid request body.', details: parsed.error.flatten()},
            {status: 400},
        );
    }

    try {
        const created = await createAssessment(parsed.data);
        return NextResponse.json(created, {status: 201});
    } catch (err) {
        const mapped = toErrorResponse(err, 'Failed to create assessment.');
        return NextResponse.json(mapped.body, {status: mapped.status});
    }
}

export async function DELETE(request: Request) {
    const denied = guardWrite(request, 'assessments:clear', 5, 60_000);
    if (denied) return denied;

    try {
        await clearAssessments();
        return new Response(null, {status: 204});
    } catch {
        return NextResponse.json({error: 'Failed to clear assessments.'}, {status: 500});
    }
}
