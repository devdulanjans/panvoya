import { prisma } from './prisma';
import { slugify } from './slug';

export class NotFoundError extends Error {}
export class ConflictError extends Error {}

async function resolveUniqueSlug({ desiredSlug, title, excludeId }) {
  const base = slugify(desiredSlug || title) || 'package';
  let candidate = base;
  let suffix = 2;

  for (;;) {
    const existing = await prisma.contentItem.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
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
  const max = await prisma.contentItem.aggregate({
    where: { section, groupName: groupName ?? null },
    _max: { position: true },
  });
  return (max._max.position ?? -1) + 1;
}

async function findItemOrThrow(section, id) {
  const item = await prisma.contentItem.findUnique({ where: { id } });
  if (!item || item.section !== section) throw new NotFoundError('Content item not found.');
  return item;
}

async function assertNoPendingChange(contentItemId) {
  const existing = await prisma.contentChange.findFirst({
    where: { contentItemId, status: 'PENDING' },
  });
  if (existing) {
    throw new ConflictError('This item already has a pending change awaiting review.');
  }
}

export async function createContent({ section, groupName, data, user }) {
  if (user.role === 'ADMIN') {
    const position = await nextPosition(section, groupName ?? null);
    const resolved = await withResolvedSlug(section, data);
    const item = await prisma.contentItem.create({
      data: { section, groupName: groupName ?? null, position, slug: resolved.slug, data: resolved.data },
    });
    await prisma.contentChange.create({
      data: {
        section,
        action: 'CREATE',
        contentItemId: item.id,
        payload: { groupName: groupName ?? null, data: resolved.data },
        status: 'APPROVED',
        submittedBy: user.id,
        reviewedBy: user.id,
        reviewedAt: new Date(),
      },
    });
    return { status: 'applied', item };
  }

  const change = await prisma.contentChange.create({
    data: {
      section,
      action: 'CREATE',
      payload: { groupName: groupName ?? null, data },
      status: 'PENDING',
      submittedBy: user.id,
    },
  });
  return { status: 'pending', change };
}

export async function updateContent({ section, id, groupName, data, user }) {
  const existing = await findItemOrThrow(section, id);

  if (user.role === 'ADMIN') {
    const resolved = await withResolvedSlug(section, data, id);
    const item = await prisma.contentItem.update({
      where: { id },
      data: { groupName: groupName ?? existing.groupName, slug: resolved.slug, data: resolved.data },
    });
    await prisma.contentChange.create({
      data: {
        section,
        action: 'UPDATE',
        contentItemId: id,
        payload: { groupName: groupName ?? null, data: resolved.data },
        baseUpdatedAt: existing.updatedAt,
        status: 'APPROVED',
        submittedBy: user.id,
        reviewedBy: user.id,
        reviewedAt: new Date(),
      },
    });
    return { status: 'applied', item };
  }

  await assertNoPendingChange(id);
  const change = await prisma.contentChange.create({
    data: {
      section,
      action: 'UPDATE',
      contentItemId: id,
      payload: { groupName: groupName ?? null, data },
      baseUpdatedAt: existing.updatedAt,
      status: 'PENDING',
      submittedBy: user.id,
    },
  });
  return { status: 'pending', change };
}

export async function deleteContent({ section, id, user }) {
  const existing = await findItemOrThrow(section, id);

  if (user.role === 'ADMIN') {
    await prisma.$transaction([
      prisma.contentChange.updateMany({
        where: { contentItemId: id, status: 'PENDING' },
        data: {
          status: 'REJECTED',
          reviewedBy: user.id,
          reviewedAt: new Date(),
          reviewNote: 'Source item was deleted.',
        },
      }),
      prisma.contentItem.delete({ where: { id } }),
      prisma.contentChange.create({
        data: {
          section,
          action: 'DELETE',
          payload: null,
          status: 'APPROVED',
          submittedBy: user.id,
          reviewedBy: user.id,
          reviewedAt: new Date(),
        },
      }),
    ]);
    return { status: 'applied' };
  }

  await assertNoPendingChange(id);
  const change = await prisma.contentChange.create({
    data: {
      section,
      action: 'DELETE',
      contentItemId: id,
      payload: null,
      baseUpdatedAt: existing.updatedAt,
      status: 'PENDING',
      submittedBy: user.id,
    },
  });
  return { status: 'pending', change };
}

export async function reviewChange({ changeId, decision, note, reviewer }) {
  const change = await prisma.contentChange.findUnique({ where: { id: changeId } });
  if (!change) throw new NotFoundError('Change not found.');
  if (change.status !== 'PENDING') throw new ConflictError('This change has already been reviewed.');

  if (decision === 'reject') {
    return prisma.contentChange.update({
      where: { id: changeId },
      data: { status: 'REJECTED', reviewedBy: reviewer.id, reviewedAt: new Date(), reviewNote: note ?? null },
    });
  }

  if (change.action === 'CREATE') {
    const { groupName, data } = change.payload;
    const resolved = await withResolvedSlug(change.section, data);
    return prisma.$transaction(async (tx) => {
      const position = await tx.contentItem.aggregate({
        where: { section: change.section, groupName: groupName ?? null },
        _max: { position: true },
      });
      const item = await tx.contentItem.create({
        data: {
          section: change.section,
          groupName: groupName ?? null,
          position: (position._max.position ?? -1) + 1,
          slug: resolved.slug,
          data: resolved.data,
        },
      });
      return tx.contentChange.update({
        where: { id: changeId },
        data: {
          status: 'APPROVED',
          reviewedBy: reviewer.id,
          reviewedAt: new Date(),
          reviewNote: note ?? null,
          contentItemId: item.id,
        },
      });
    });
  }

  const target = change.contentItemId
    ? await prisma.contentItem.findUnique({ where: { id: change.contentItemId } })
    : null;

  if (!target) {
    return prisma.contentChange.update({
      where: { id: changeId },
      data: { status: 'REJECTED', reviewedBy: reviewer.id, reviewedAt: new Date(), reviewNote: 'Item no longer exists.' },
    });
  }

  if (change.baseUpdatedAt && target.updatedAt.getTime() !== change.baseUpdatedAt.getTime()) {
    return prisma.contentChange.update({
      where: { id: changeId },
      data: {
        status: 'REJECTED',
        reviewedBy: reviewer.id,
        reviewedAt: new Date(),
        reviewNote: 'Item was modified since this change was submitted; please resubmit.',
      },
    });
  }

  if (change.action === 'UPDATE') {
    const { groupName, data } = change.payload;
    const resolved = await withResolvedSlug(change.section, data, target.id);
    return prisma.$transaction([
      prisma.contentItem.update({
        where: { id: target.id },
        data: { groupName: groupName ?? target.groupName, slug: resolved.slug, data: resolved.data },
      }),
      prisma.contentChange.update({
        where: { id: changeId },
        data: { status: 'APPROVED', reviewedBy: reviewer.id, reviewedAt: new Date(), reviewNote: note ?? null },
      }),
    ]).then((results) => results[1]);
  }

  // DELETE
  return prisma.$transaction([
    prisma.contentItem.delete({ where: { id: target.id } }),
    prisma.contentChange.update({
      where: { id: changeId },
      data: { status: 'APPROVED', reviewedBy: reviewer.id, reviewedAt: new Date(), reviewNote: note ?? null },
    }),
  ]).then((results) => results[1]);
}
