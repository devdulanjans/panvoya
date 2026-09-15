import { z } from 'zod';
import { prisma } from '../../lib/prisma';

const requestSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  requirement: z.string().optional().default(''),
  destination: z.string().optional().default(''),
  travelDates: z.string().optional().default(''),
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });
  }

  const request = await prisma.customerRequest.create({ data: parsed.data });
  return res.status(201).json({ id: request.id });
}
