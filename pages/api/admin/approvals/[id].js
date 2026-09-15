import { requireAdmin } from '../../../../lib/apiSession';
import { reviewChange, NotFoundError, ConflictError } from '../../../../lib/contentWorkflow';

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const changeId = Number(id);
  if (!Number.isInteger(changeId)) return res.status(400).json({ error: 'Invalid id' });

  const { decision, note } = req.body || {};
  if (!['approve', 'reject'].includes(decision)) {
    return res.status(400).json({ error: 'decision must be "approve" or "reject"' });
  }

  try {
    const result = await reviewChange({ changeId, decision, note, reviewer: admin });
    return res.status(200).json({ change: result });
  } catch (error) {
    if (error instanceof NotFoundError) return res.status(404).json({ error: error.message });
    if (error instanceof ConflictError) return res.status(409).json({ error: error.message });
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
