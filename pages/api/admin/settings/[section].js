import { query, queryOne } from '../../../../lib/db';
import { requireUser, requireAdmin } from '../../../../lib/apiSession';
import { getSectionConfig } from '../../../../lib/sections';

export default async function handler(req, res) {
  const { section } = req.query;
  try {
    getSectionConfig(section);
  } catch {
    return res.status(404).json({ error: 'Unknown section' });
  }

  if (req.method === 'GET') {
    const user = await requireUser(req, res);
    if (!user) return;
    const setting = await queryOne('SELECT * FROM `sectionsetting` WHERE section = ?', [section]);
    return res.status(200).json({ setting: setting || { section, title: '', subtitle: '' } });
  }

  if (req.method === 'PUT') {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const { title, subtitle } = req.body || {};
    await query(
      `INSERT INTO \`SectionSetting\` (section, title, subtitle, updatedAt) VALUES (?, ?, ?, NOW(3))
       ON DUPLICATE KEY UPDATE title = VALUES(title), subtitle = VALUES(subtitle), updatedAt = NOW(3)`,
      [section, title || null, subtitle || null],
    );
    const setting = await queryOne('SELECT * FROM `sectionsetting` WHERE section = ?', [section]);
    return res.status(200).json({ setting });
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).json({ error: 'Method not allowed' });
}
