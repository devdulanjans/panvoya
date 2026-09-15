import { z } from 'zod';
import { query, queryOne } from '../../../../lib/db';
import { requireUser, requireAdmin } from '../../../../lib/apiSession';

const updateSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'CLOSED']),
});

export default async function handler(req, res) {
  const { id } = req.query;
  const requestId = Number(id);
  if (!Number.isInteger(requestId)) return res.status(400).json({ error: 'Invalid id' });

  if (req.method === 'PUT') {
    const user = await requireUser(req, res);
    if (!user) return;

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.issues });
    }

    await query('UPDATE `customerrequest` SET status = ? WHERE id = ?', [parsed.data.status, requestId]);
    const request = await queryOne('SELECT * FROM `customerrequest` WHERE id = ?', [requestId]);
    return res.status(200).json({ request });
  }

  if (req.method === 'DELETE') {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    await query('DELETE FROM `customerrequest` WHERE id = ?', [requestId]);
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).json({ error: 'Method not allowed' });
}
