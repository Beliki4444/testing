import {describe, it} from "vitest";
import {calculateSleepEfficiency, getOuraSleepSessions} from "./db.js";

describe('sleep efficiency is correct', async () => {
    it('oura is correct', async () => {
        const sleepSessionOura = await getOuraSleepSessions('user_001', '2025-10-01', '2025-10-10');
        const sleepSessionsLength = sleepSessionOura?.length;
        expect(sleepSessionsLength).toBeGreaterThan(0)

        sleepSessionOura.forEach(session => {
            const efficiency = calculateSleepEfficiency(session);
            console.log(efficiency);
            console.log(`Расчитанная эффективность ${efficiency}`, `Эффектиность в бд: ${session.metrics.sleep_efficiency}`);
            expect(efficiency).toBe(session.metrics.sleep_efficiency);
        })
    });
})