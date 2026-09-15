import { queryOne, mapContentItem } from '../../../../lib/db';
import { requireUser } from '../../../../lib/apiSession';
import { packageSchema } from '../../../../lib/packageSchema';
import { updateContent, deleteContent, NotFoundError, ConflictError } from '../../../../lib/contentWorkflow';

const SECTION = 'tourPackages';

export default async function handler(req, res) {
  const { id } = req.query;
  const itemId = Number(id);
  if (!Number.isInteger(itemId)) return res.status(400).json({ error: 'Invalid id' });

  const user = await requireUser(req, res);
  if (!user) return;

  try {
    if (req.method === 'GET') {
      const item = mapContentItem(await queryOne('SELECT * FROM `ContentItem` WHERE id = ?', [itemId]));
      if (!item || item.section !== SECTION) return res.status(404).json({ error: 'Package not found' });
      return res.status(200).json({ item });
    }

    if (req.method === 'PUT') {
      const parsed = packageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });
      }
      const result = await updateContent({ section: SECTION, id: itemId, groupName: null, data: parsed.data, user });
      return res.status(200).json(result);
    }

    if (req.method === 'DELETE') {
      const result = await deleteContent({ section: SECTION, id: itemId, user });
      return res.status(200).json(result);
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof NotFoundError) return res.status(404).json({ error: error.message });
    if (error instanceof ConflictError) return res.status(409).json({ error: error.message });
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
