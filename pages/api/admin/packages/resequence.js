import { prisma } from '../../../../lib/prisma';
import { requireAdmin } from '../../../../lib/apiSession';

const SECTION = 'tourPackages';

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const items = await prisma.contentItem.findMany({
    where: { section: SECTION },
    orderBy: [{ clickCount: 'desc' }, { position: 'asc' }],
  });

  await prisma.$transaction(
    items.map((item, index) => prisma.contentItem.update({ where: { id: item.id }, data: { position: index } })),
  );

  return res.status(200).json({ ok: true });
}
