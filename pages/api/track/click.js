import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const id = Number(req.body?.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const result = await query(
    "UPDATE `contentitem` SET clickCount = clickCount + 1 WHERE id = ? AND section = 'tourPackages'",
    [id],
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Package not found' });
  }

  return res.status(200).json({ ok: true });
}
