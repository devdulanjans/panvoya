import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../../../../lib/prisma';
import { requireAdmin } from '../../../../lib/apiSession';

const updateUserSchema = z.object({
  role: z.enum(['ADMIN', 'USER']).optional(),
  active: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const { id } = req.query;
  const userId = Number(id);
  if (!Number.isInteger(userId)) return res.status(400).json({ error: 'Invalid id' });

  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (userId === Number(admin.id)) {
    return res.status(400).json({ error: "You can't change your own role or active status here." });
  }

  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });
  }

  const data = { ...parsed.data };
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
  });

  return res.status(200).json({ user });
}
