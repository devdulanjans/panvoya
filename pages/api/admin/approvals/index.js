import { query, mapContentChange, nestPrefixed, parseJson } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/apiSession';

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawChanges = await query(
    `SELECT
        cc.*,
        u.id AS submitter_id, u.name AS submitter_name, u.email AS submitter_email,
        ci.id AS item_id, ci.section AS item_section, ci.groupName AS item_groupName,
        ci.slug AS item_slug, ci.position AS item_position, ci.data AS item_data,
        ci.clickCount AS item_clickCount, ci.createdAt AS item_createdAt, ci.updatedAt AS item_updatedAt
     FROM \`contentchange\` cc
     JOIN \`user\` u ON u.id = cc.submittedBy
     LEFT JOIN \`contentitem\` ci ON ci.id = cc.contentItemId
     WHERE cc.status = 'PENDING'
     ORDER BY cc.createdAt ASC`,
  );

  const changes = rawChanges.map((row) => {
    const withSubmitter = nestPrefixed(row, 'submitter_', 'submitter');
    const withItem = nestPrefixed(withSubmitter, 'item_', 'contentItem');
    const change = mapContentChange(withItem);
    if (change.contentItem?.id != null) {
      change.contentItem.data = parseJson(change.contentItem.data);
    } else {
      change.contentItem = null;
    }
    return change;
  });

  return res.status(200).json({ changes });
}
