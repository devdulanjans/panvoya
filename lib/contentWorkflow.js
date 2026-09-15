import { query, queryOne, withTransaction, toJson, mapContentItem, mapContentChange } from './db';
import { slugify } from './slug';

export class NotFoundError extends Error {}
export class ConflictError extends Error {}

async function resolveUniqueSlug({ desiredSlug, title, excludeId }) {
  const base = slugify(desiredSlug || title) || 'package';
  let candidate = base;
  let suffix = 2;

  for (;;) {
    const existing = excludeId
      ? await queryOne('SELECT id FROM `contentitem` WHERE slug = ? AND id != ? LIMIT 1', [candidate, excludeId])
      : await queryOne('SELECT id FROM `contentitem` WHERE slug = ? LIMIT 1', [candidate]);
    if (!existing) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

async function withResolvedSlug(section, data, excludeId) {
  if (section !== 'tourPackages') return { slug: undefined, data };
  const slug = await resolveUniqueSlug({ desiredSlug: data.slug, title: data.title, excludeId });
  return { slug, data: { ...data, slug } };
}

async function nextPosition(section, groupName) {
  const row = await queryOne(
    'SELECT MAX(position) AS maxPosition FROM `contentitem` WHERE section = ? AND groupName <=> ?',
    [section, groupName ?? null],
  );
  return (row?.maxPosition ?? -1) + 1;
}

async function findItemOrThrow(section, id) {
  const row = await queryOne('SELECT * FROM `contentitem` WHERE id = ?', [id]);
  const item = mapContentItem(row);
  if (!item || item.section !== section) throw new NotFoundError('Content item not found.');
  return item;
}

async function assertNoPendingChange(contentItemId) {
  const existing = await queryOne(
    "SELECT id FROM `contentchange` WHERE contentItemId = ? AND status = 'PENDING' LIMIT 1",
    [contentItemId],
  );
  if (existing) {
    throw new ConflictError('This item already has a pending change awaiting review.');
  }
}

async function getContentItem(id) {
  return mapContentItem(await queryOne('SELECT * FROM `contentitem` WHERE id = ?', [id]));
}

async function getContentChange(id) {
  return mapContentChange(await queryOne('SELECT * FROM `contentchange` WHERE id = ?', [id]));
}

export async function createContent({ section, groupName, data, user }) {
  if (user.role === 'ADMIN') {
    const position = await nextPosition(section, groupName ?? null);
    const resolved = await withResolvedSlug(section, data);
    const insertResult = await query(
      'INSERT INTO `contentitem` (section, groupName, position, slug, data, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(3))',
      [section, groupName ?? null, position, resolved.slug ?? null, toJson(resolved.data)],
    );
    const item = await getContentItem(insertResult.insertId);
    await query(
      `INSERT INTO \`contentchange\`
        (section, action, contentItemId, payload, status, submittedBy, reviewedBy, reviewedAt)
       VALUES (?, 'CREATE', ?, ?, 'APPROVED', ?, ?, NOW(3))`,
      [section, item.id, toJson({ groupName: groupName ?? null, data: resolved.data }), user.id, user.id],
    );
    return { status: 'applied', item };
  }

  const insertResult = await query(
    `INSERT INTO \`contentchange\` (section, action, payload, status, submittedBy)
     VALUES (?, 'CREATE', ?, 'PENDING', ?)`,
    [section, toJson({ groupName: groupName ?? null, data }), user.id],
  );
  const change = await getContentChange(insertResult.insertId);
  return { status: 'pending', change };
}

export async function updateContent({ section, id, groupName, data, user }) {
  const existing = await findItemOrThrow(section, id);

  if (user.role === 'ADMIN') {
    const resolved = await withResolvedSlug(section, data, id);
    const nextGroupName = groupName ?? existing.groupName;
    await query(
      'UPDATE `contentitem` SET groupName = ?, slug = ?, data = ?, updatedAt = NOW(3) WHERE id = ?',
      [nextGroupName, resolved.slug ?? null, toJson(resolved.data), id],
    );
    const item = await getContentItem(id);
    await query(
      `INSERT INTO \`contentchange\`
        (section, action, contentItemId, payload, baseUpdatedAt, status, submittedBy, reviewedBy, reviewedAt)
       VALUES (?, 'UPDATE', ?, ?, ?, 'APPROVED', ?, ?, NOW(3))`,
      [section, id, toJson({ groupName: groupName ?? null, data: resolved.data }), existing.updatedAt, user.id, user.id],
    );
    return { status: 'applied', item };
  }

  await assertNoPendingChange(id);
  const insertResult = await query(
    `INSERT INTO \`contentchange\` (section, action, contentItemId, payload, baseUpdatedAt, status, submittedBy)
     VALUES (?, 'UPDATE', ?, ?, ?, 'PENDING', ?)`,
    [section, id, toJson({ groupName: groupName ?? null, data }), existing.updatedAt, user.id],
  );
  const change = await getContentChange(insertResult.insertId);
  return { status: 'pending', change };
}

export async function deleteContent({ section, id, user }) {
  const existing = await findItemOrThrow(section, id);

  if (user.role === 'ADMIN') {
    await withTransaction(async (conn) => {
      await query(
        `UPDATE \`contentchange\`
         SET status = 'REJECTED', reviewedBy = ?, reviewedAt = NOW(3), reviewNote = 'Source item was deleted.'
         WHERE contentItemId = ? AND status = 'PENDING'`,
        [user.id, id],
        conn,
      );
      await query('DELETE FROM `contentitem` WHERE id = ?', [id], conn);
      await query(
        `INSERT INTO \`contentchange\` (section, action, payload, status, submittedBy, reviewedBy, reviewedAt)
         VALUES (?, 'DELETE', NULL, 'APPROVED', ?, ?, NOW(3))`,
        [section, user.id, user.id],
        conn,
      );
    });
    return { status: 'applied' };
  }

  await assertNoPendingChange(id);
  const insertResult = await query(
    `INSERT INTO \`contentchange\` (section, action, contentItemId, payload, baseUpdatedAt, status, submittedBy)
     VALUES (?, 'DELETE', ?, NULL, ?, 'PENDING', ?)`,
    [section, id, existing.updatedAt, user.id],
  );
  const change = await getContentChange(insertResult.insertId);
  return { status: 'pending', change };
}

export async function reviewChange({ changeId, decision, note, reviewer }) {
  const change = await getContentChange(changeId);
  if (!change) throw new NotFoundError('Change not found.');
  if (change.status !== 'PENDING') throw new ConflictError('This change has already been reviewed.');

  if (decision === 'reject') {
    await query(
      "UPDATE `contentchange` SET status = 'REJECTED', reviewedBy = ?, reviewedAt = NOW(3), reviewNote = ? WHERE id = ?",
      [reviewer.id, note ?? null, changeId],
    );
    return getContentChange(changeId);
  }

  if (change.action === 'CREATE') {
    const { groupName, data } = change.payload;
    const resolved = await withResolvedSlug(change.section, data);
    await withTransaction(async (conn) => {
      const positionRow = await queryOne(
        'SELECT MAX(position) AS maxPosition FROM `contentitem` WHERE section = ? AND groupName <=> ?',
        [change.section, groupName ?? null],
        conn,
      );
      const position = (positionRow?.maxPosition ?? -1) + 1;
      const insertResult = await query(
        'INSERT INTO `contentitem` (section, groupName, position, slug, data, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(3))',
        [change.section, groupName ?? null, position, resolved.slug ?? null, toJson(resolved.data)],
        conn,
      );
      await query(
        `UPDATE \`contentchange\`
         SET status = 'APPROVED', reviewedBy = ?, reviewedAt = NOW(3), reviewNote = ?, contentItemId = ?
         WHERE id = ?`,
        [reviewer.id, note ?? null, insertResult.insertId, changeId],
        conn,
      );
    });
    return getContentChange(changeId);
  }

  const target = change.contentItemId ? await getContentItem(change.contentItemId) : null;

  if (!target) {
    await query(
      "UPDATE `contentchange` SET status = 'REJECTED', reviewedBy = ?, reviewedAt = NOW(3), reviewNote = 'Item no longer exists.' WHERE id = ?",
      [reviewer.id, changeId],
    );
    return getContentChange(changeId);
  }

  if (change.baseUpdatedAt && target.updatedAt.getTime() !== change.baseUpdatedAt.getTime()) {
    await query(
      `UPDATE \`contentchange\`
       SET status = 'REJECTED', reviewedBy = ?, reviewedAt = NOW(3),
           reviewNote = 'Item was modified since this change was submitted; please resubmit.'
       WHERE id = ?`,
      [reviewer.id, changeId],
    );
    return getContentChange(changeId);
  }

  if (change.action === 'UPDATE') {
    const { groupName, data } = change.payload;
    const resolved = await withResolvedSlug(change.section, data, target.id);
    await withTransaction(async (conn) => {
      await query(
        'UPDATE `contentitem` SET groupName = ?, slug = ?, data = ?, updatedAt = NOW(3) WHERE id = ?',
        [groupName ?? target.groupName, resolved.slug ?? null, toJson(resolved.data), target.id],
        conn,
      );
      await query(
        "UPDATE `contentchange` SET status = 'APPROVED', reviewedBy = ?, reviewedAt = NOW(3), reviewNote = ? WHERE id = ?",
        [reviewer.id, note ?? null, changeId],
        conn,
      );
    });
    return getContentChange(changeId);
  }

  // DELETE
  await withTransaction(async (conn) => {
    await query('DELETE FROM `contentitem` WHERE id = ?', [target.id], conn);
    await query(
      "UPDATE `contentchange` SET status = 'APPROVED', reviewedBy = ?, reviewedAt = NOW(3), reviewNote = ? WHERE id = ?",
      [reviewer.id, note ?? null, changeId],
      conn,
    );
  });
  return getContentChange(changeId);
}
