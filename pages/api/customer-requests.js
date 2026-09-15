import { z } from 'zod';
import { query } from '../../lib/db';

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

  const { firstName, email, phone, requirement, destination, travelDates } = parsed.data;
  const insertResult = await query(
    `INSERT INTO \`customerrequest\` (firstName, email, phone, requirement, destination, travelDates)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [firstName, email, phone, requirement, destination, travelDates],
  );
  return res.status(201).json({ id: insertResult.insertId });
}
