import { query, withTransaction } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/apiSession';

const SECTION = 'tourPackages';

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const items = await query('SELECT * FROM `contentitem` WHERE section = ? ORDER BY clickCount DESC, position ASC', [SECTION]);

  await withTransaction(async (conn) => {
    for (let index = 0; index < items.length; index += 1) {
      await query('UPDATE `contentitem` SET position = ?, updatedAt = NOW(3) WHERE id = ?', [index, items[index].id], conn);
    }
  });

  return res.status(200).json({ ok: true });
}
