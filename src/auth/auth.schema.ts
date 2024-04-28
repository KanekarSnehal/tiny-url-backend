import { z } from 'zod';

// login schema
export const loginZObject = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(1),
  }).partial();

export const loginPayloadSchema = loginZObject.required({ email: true, password: true });

export type LoginDto = z.infer<typeof loginPayloadSchema>;

// signup schema
export const signupPayloadSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(1),
  }).required();

export type SignupDto = z.infer<typeof signupPayloadSchema>;