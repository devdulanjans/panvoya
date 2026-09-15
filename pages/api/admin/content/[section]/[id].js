import { requireUser } from '../../../../../lib/apiSession';
import { getSectionConfig, validatePayload } from '../../../../../lib/sections';
import { updateContent, deleteContent, NotFoundError, ConflictError } from '../../../../../lib/contentWorkflow';

export default async function handler(req, res) {
  const { section, id } = req.query;
  const itemId = Number(id);

  let config;
  try {
    config = getSectionConfig(section);
  } catch {
    return res.status(404).json({ error: 'Unknown section' });
  }

  if (!Number.isInteger(itemId)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const user = await requireUser(req, res);
  if (!user) return;

  try {
    if (req.method === 'PUT') {
      const { groupName, ...data } = req.body || {};
      if (config.hasGroup) data.groupName = groupName;

      const parsed = validatePayload(section, data);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });
      }
      const { groupName: parsedGroupName, ...fields } = parsed.data;

      const result = await updateContent({ section, id: itemId, groupName: parsedGroupName, data: fields, user });
      return res.status(200).json(result);
    }

    if (req.method === 'DELETE') {
      const result = await deleteContent({ section, id: itemId, user });
      return res.status(200).json(result);
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof NotFoundError) return res.status(404).json({ error: error.message });
    if (error instanceof ConflictError) return res.status(409).json({ error: error.message });
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
