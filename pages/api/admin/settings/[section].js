import { prisma } from '../../../../lib/prisma';
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
    const setting = await prisma.sectionSetting.findUnique({ where: { section } });
    return res.status(200).json({ setting: setting || { section, title: '', subtitle: '' } });
  }

  if (req.method === 'PUT') {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const { title, subtitle } = req.body || {};
    const setting = await prisma.sectionSetting.upsert({
      where: { section },
      update: { title: title || null, subtitle: subtitle || null },
      create: { section, title: title || null, subtitle: subtitle || null },
    });
    return res.status(200).json({ setting });
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).json({ error: 'Method not allowed' });
}
