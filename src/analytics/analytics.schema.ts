import { z } from 'zod';

export const analyticsZObject = z
    .object({
        analytical_type: z.string(),
        url_id: z.string(),
        qr_code_id: z.string(),
        country: z.string(),
        city: z.string(),
        device_type: z.string(),
        browser: z.string(),
        os: z.string()
    }).partial();

export type AnalyticsDto = z.infer<typeof analyticsZObject>;