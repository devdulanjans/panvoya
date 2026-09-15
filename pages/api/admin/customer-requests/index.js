import { query } from '../../../../lib/db';
import { requireUser } from '../../../../lib/apiSession';

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const requests = await query('SELECT * FROM `customerrequest` ORDER BY createdAt DESC');
  return res.status(200).json({ requests });
}
