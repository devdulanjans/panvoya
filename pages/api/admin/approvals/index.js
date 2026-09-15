import { prisma } from '../../../../lib/prisma';
import { requireAdmin } from '../../../../lib/apiSession';

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const changes = await prisma.contentChange.findMany({
    where: { status: 'PENDING' },
    include: {
      submitter: { select: { id: true, name: true, email: true } },
      contentItem: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return res.status(200).json({ changes });
}
