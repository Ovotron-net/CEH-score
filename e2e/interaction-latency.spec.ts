import {expect, test} from '@playwright/test';

interface InteractionTiming {
    duration: number;
    interactionId: number;
    name: string;
}

interface InteractionPerformanceEntry extends PerformanceEntry {
    interactionId: number;
}

interface EventTimingWindow extends Window {
    readinessEventTimings?: InteractionTiming[];
    readinessEventTimingObserver?: PerformanceObserver;
}

// This is a controlled lab interaction-latency/INP proxy, not a field INP measurement.
test('@interaction-latency mobile navigation interactions stay below 200ms in the controlled lab', async ({page}) => {
    await page.setViewportSize({width: 375, height: 812});
    await page.goto('/');
    await expect(page.getByRole('heading', {name: 'Dashboard', level: 1})).toBeVisible();

    const eventTimingSupported = await page.evaluate(() => {
        if (!PerformanceObserver.supportedEntryTypes.includes('event')) return false;

        const timingWindow = window as EventTimingWindow;
        timingWindow.readinessEventTimings = [];
        const record = (entries: PerformanceEntry[]) => {
            for (const entry of entries as InteractionPerformanceEntry[]) {
                if (entry.interactionId === 0) continue;
                timingWindow.readinessEventTimings!.push({
                    duration: entry.duration,
                    interactionId: entry.interactionId,
                    name: entry.name,
                });
            }
        };
        timingWindow.readinessEventTimingObserver = new PerformanceObserver(list => record(list.getEntries()));
        timingWindow.readinessEventTimingObserver.observe({
            type: 'event',
            buffered: true,
            durationThreshold: 16,
        } as PerformanceObserverInit);
        return true;
    });
    expect(eventTimingSupported, 'Chromium does not expose PerformanceObserver event timing entries').toBe(true);

    const openButton = page.getByRole('button', {name: 'Open navigation'});
    for (let cycle = 0; cycle < 5; cycle += 1) {
        await openButton.click();
        await expect(openButton).toHaveAttribute('aria-expanded', 'true');
        await page.getByRole('button', {name: 'Close navigation'}).click();
        await expect(openButton).toHaveAttribute('aria-expanded', 'false');
    }

    const entries = await page.evaluate(async () => {
        await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        const timingWindow = window as EventTimingWindow;
        const pending = timingWindow.readinessEventTimingObserver?.takeRecords() ?? [];
        for (const entry of pending as InteractionPerformanceEntry[]) {
            if (entry.interactionId === 0) continue;
            timingWindow.readinessEventTimings!.push({
                duration: entry.duration,
                interactionId: entry.interactionId,
                name: entry.name,
            });
        }
        timingWindow.readinessEventTimingObserver?.disconnect();
        return timingWindow.readinessEventTimings ?? [];
    });

    expect(
        entries.length,
        'Chromium exposed Event Timing but returned no entries with interactionId for the trusted drawer clicks',
    ).toBeGreaterThan(0);

    const interactionDurations = new Map<number, number>();
    for (const entry of entries) {
        interactionDurations.set(
            entry.interactionId,
            Math.max(interactionDurations.get(entry.interactionId) ?? 0, entry.duration),
        );
    }
    const durations = [...interactionDurations.values()];
    const maximumDuration = Math.max(...durations);
    console.info(`Controlled lab navigation interaction durations (ms): ${durations.join(', ')}; max=${maximumDuration}`);

    expect(interactionDurations.size, 'Expected Event Timing data for repeated open and close interactions')
        .toBeGreaterThanOrEqual(2);
    expect(maximumDuration).toBeLessThan(200);
});
