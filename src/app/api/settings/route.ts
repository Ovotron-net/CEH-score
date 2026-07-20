import {NextResponse} from 'next/server';
import {z} from 'zod';
import {getSettings, updateSettings} from '@/data/settingsRepository';
import {guardRead, guardWrite} from '@/lib/routeGuard';

const SettingsSchema = z.object({
    name: z.string().min(1).max(100),
    targetScore: z.number().int().min(0).max(100),
    examDate: z.union([z.literal(''), z.iso.date()]),
    theme: z.enum(['dark', 'light']),
});

export async function GET(request: Request) {
    const denied = guardRead(request);
    if (denied) return denied;

    try {
        return NextResponse.json(await getSettings());
    } catch {
        return NextResponse.json({error: 'Failed to fetch settings.'}, {status: 500});
    }
}

export async function PUT(request: Request) {
    const denied = guardWrite(request, 'settings:update', 30, 60_000);
    if (denied) return denied;

    const body = await request.json().catch(() => null);
    const parsed = SettingsSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            {error: 'Invalid request body.', details: parsed.error.flatten()},
            {status: 400},
        );
    }

    try {
        return NextResponse.json(await updateSettings(parsed.data));
    } catch {
        return NextResponse.json({error: 'Failed to update settings.'}, {status: 500});
    }
}
