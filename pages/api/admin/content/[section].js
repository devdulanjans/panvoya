import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/apiSession';
import { getSectionConfig, validatePayload } from '../../../../lib/sections';
import { createContent, ConflictError } from '../../../../lib/contentWorkflow';

export default async function handler(req, res) {
  const { section } = req.query;

  let config;
  try {
    config = getSectionConfig(section);
  } catch {
    return res.status(404).json({ error: 'Unknown section' });
  }

  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const [items, pendingChanges] = await Promise.all([
      prisma.contentItem.findMany({
        where: { section },
        orderBy: [{ groupName: 'asc' }, { position: 'asc' }],
      }),
      prisma.contentChange.findMany({
        where: { section, status: 'PENDING' },
        include: { submitter: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' },
      }),
    ]);
    return res.status(200).json({ config, items, pendingChanges });
  }

  if (req.method === 'POST') {
    const { groupName, ...data } = req.body || {};
    if (config.hasGroup) data.groupName = groupName;

    const parsed = validatePayload(section, data);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });
    }

    const { groupName: parsedGroupName, ...fields } = parsed.data;

    try {
      const result = await createContent({ section, groupName: parsedGroupName, data: fields, user });
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
