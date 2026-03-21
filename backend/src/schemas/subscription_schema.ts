import { z } from 'zod';

export const subscribeBodySchema = z.object({
    email: z
        .string({ required_error: 'Имейлът е задължителен' })
        .email('Невалиден имейл адрес'),
    subscriptionTypes: z
        .array(
            z.enum(['NEWS', 'EVENTS', 'DEADLINES'], {
                errorMap: () => ({ message: 'Невалиден тип абонамент' }),
            })
        )
        .min(1, 'Изберете поне един тип известие'),
});

export const subscribeSchema = z.object({ body: subscribeBodySchema });

export type SubscribeType = z.infer<typeof subscribeBodySchema>;
