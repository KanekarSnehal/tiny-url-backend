import { z } from 'zod';

// login schema
export const loginZObject = z
  .object({
    name: z.string(),
    email: z.string(),
    password: z.string(),
  }).partial();

export const loginPayloadSchema = loginZObject.required({ email: true, password: true });

export type LoginDto = z.infer<typeof loginPayloadSchema>;

// signup schema
export const signupPayloadSchema = z
  .object({
    name: z.string(),
    email: z.string(),
    password: z.string(),
  }).required();

export type SignupDto = z.infer<typeof signupPayloadSchema>;