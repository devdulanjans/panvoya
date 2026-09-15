import { query, withTransaction } from '../../../../../lib/db';
import { requireAdmin } from '../../../../../lib/apiSession';

const SECTION = 'tourPackages';

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const itemId = Number(id);
  const { direction } = req.body || {};
  if (!Number.isInteger(itemId) || !['up', 'down'].includes(direction)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const items = await query('SELECT * FROM `contentitem` WHERE section = ? ORDER BY position ASC', [SECTION]);

  const index = items.findIndex((item) => item.id === itemId);
  if (index === -1) return res.status(404).json({ error: 'Package not found' });

  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= items.length) {
    return res.status(200).json({ ok: true });
  }

  const current = items[index];
  const neighbor = items[swapIndex];

  await withTransaction(async (conn) => {
    await query('UPDATE `contentitem` SET position = ?, updatedAt = NOW(3) WHERE id = ?', [neighbor.position, current.id], conn);
    await query('UPDATE `contentitem` SET position = ?, updatedAt = NOW(3) WHERE id = ?', [current.position, neighbor.id], conn);
  });

  return res.status(200).json({ ok: true });
}
