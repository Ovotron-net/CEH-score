import {NextResponse} from 'next/server';
import {eq} from 'drizzle-orm';
import {db} from '@/db';
import {assessments} from '@/db/schema';
import {authenticate} from '@/lib/auth';
import {enforceRateLimit} from '@/lib/rate-limit';

export async function DELETE(
    request: Request,
    {params}: { params: Promise<{ id: string }> },
) {
    const authError = authenticate(request);
    if (authError) return authError;

    const limited = enforceRateLimit(request, 'assessments:delete', 30, 60_000);
    if (limited) return limited;

    const {id} = await params;
    if (!id || id.length > 100) {
        return NextResponse.json({error: 'Invalid ID.'}, {status: 400});
    }
    try {
        await db.delete(assessments).where(eq(assessments.id, id));
        return new Response(null, {status: 204});
    } catch {
        return NextResponse.json({error: 'Failed to delete assessment.'}, {status: 500});
    }
}