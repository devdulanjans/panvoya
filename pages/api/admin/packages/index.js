import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/apiSession';
import { packageSchema } from '../../../../lib/packageSchema';
import { createContent, ConflictError } from '../../../../lib/contentWorkflow';

const SECTION = 'tourPackages';

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const [items, pendingChanges] = await Promise.all([
      prisma.contentItem.findMany({ where: { section: SECTION }, orderBy: { position: 'asc' } }),
      prisma.contentChange.findMany({
        where: { section: SECTION, status: 'PENDING' },
        include: { submitter: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' },
      }),
    ]);
    return res.status(200).json({ items, pendingChanges });
  }

  if (req.method === 'POST') {
    const parsed = packageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });
    }

    try {
      const result = await createContent({ section: SECTION, groupName: null, data: parsed.data, user });
      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof ConflictError) return res.status(409).json({ error: error.message });
      console.error(error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}
