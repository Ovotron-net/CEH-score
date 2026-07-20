import {NextResponse} from 'next/server';
import {deleteAssessment} from '@/data/assessmentRepository';
import {guardWrite} from '@/lib/routeGuard';

export async function DELETE(
    request: Request,
    {params}: { params: Promise<{ id: string }> },
) {
    const denied = guardWrite(request, 'assessments:delete', 30, 60_000);
    if (denied) return denied;

    const {id} = await params;
    if (!id || id.length > 100) {
        return NextResponse.json({error: 'Invalid ID.'}, {status: 400});
    }
    try {
        await deleteAssessment(id);
        return new Response(null, {status: 204});
    } catch {
        return NextResponse.json({error: 'Failed to delete assessment.'}, {status: 500});
    }
}
