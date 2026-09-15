import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

export async function requireUser(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return { ...session.user, id: Number(session.user.id) };
}

export async function requireAdmin(req, res) {
  const user = await requireUser(req, res);
  if (!user) return null;
  if (user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden' });
    return null;
  }
  return user;
}
