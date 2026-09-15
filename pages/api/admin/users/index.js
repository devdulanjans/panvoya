import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query, queryOne } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/apiSession';

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ADMIN', 'USER']),
});

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method === 'GET') {
    const users = await query(
      'SELECT id, name, email, role, active, createdAt FROM `user` ORDER BY createdAt ASC',
    );
    return res.status(200).json({ users });
  }

  if (req.method === 'POST') {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });
    }

    const existing = await queryOne('SELECT id FROM `user` WHERE email = ?', [parsed.data.email]);
    if (existing) return res.status(409).json({ error: 'A user with this email already exists.' });

    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
    const insertResult = await query(
      'INSERT INTO `user` (name, email, password, role) VALUES (?, ?, ?, ?)',
      [parsed.data.name, parsed.data.email, hashedPassword, parsed.data.role],
    );
    const user = await queryOne(
      'SELECT id, name, email, role, active, createdAt FROM `user` WHERE id = ?',
      [insertResult.insertId],
    );
    return res.status(201).json({ user });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}
