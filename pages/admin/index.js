import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';
import { prisma } from '../../lib/prisma';
import AdminLayout from '../../components/admin/AdminLayout';
import { sectionKeys, getSectionConfig } from '../../lib/sections';
import styles from './dashboard.module.css';

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session?.user) {
    return {
      redirect: {
        destination: `/admin/login?callbackUrl=${encodeURIComponent(context.resolvedUrl || '/admin')}`,
        permanent: false,
      },
    };
  }
  const user = session.user;

  const contentCounts = await prisma.contentItem.groupBy({
    by: ['section'],
    _count: { _all: true },
  });
  const countsBySection = Object.fromEntries(contentCounts.map((row) => [row.section, row._count._all]));

  let pendingApprovalsCount = null;
  let usersCount = null;
  let myPendingCount = null;
  let myApprovedCount = null;
  let myRejectedCount = null;

  if (user.role === 'ADMIN') {
    [pendingApprovalsCount, usersCount] = await Promise.all([
      prisma.contentChange.count({ where: { status: 'PENDING' } }),
      prisma.user.count(),
    ]);
  } else {
    const submittedBy = Number(user.id);
    [myPendingCount, myApprovedCount, myRejectedCount] = await Promise.all([
      prisma.contentChange.count({ where: { submittedBy, status: 'PENDING' } }),
      prisma.contentChange.count({ where: { submittedBy, status: 'APPROVED' } }),
      prisma.contentChange.count({ where: { submittedBy, status: 'REJECTED' } }),
    ]);
  }

  return {
    props: {
      role: user.role,
      countsBySection,
      pendingApprovalsCount,
      usersCount,
      myPendingCount,
      myApprovedCount,
      myRejectedCount,
    },
  };
}

export default function AdminDashboard({ role, countsBySection, pendingApprovalsCount, usersCount, myPendingCount, myApprovedCount, myRejectedCount }) {
  return (
    <AdminLayout title="Dashboard">
      {role === 'ADMIN' ? (
        <div className={styles.statGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{pendingApprovalsCount}</span>
            <span className={styles.statLabel}>Pending approvals</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{usersCount}</span>
            <span className={styles.statLabel}>Total users</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{Object.values(countsBySection).reduce((sum, n) => sum + n, 0)}</span>
            <span className={styles.statLabel}>Total content items</span>
          </div>
        </div>
      ) : (
        <div className={styles.statGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{myPendingCount}</span>
            <span className={styles.statLabel}>My pending changes</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{myApprovedCount}</span>
            <span className={styles.statLabel}>My approved changes</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{myRejectedCount}</span>
            <span className={styles.statLabel}>My rejected changes</span>
          </div>
        </div>
      )}

      <h2 className={styles.sectionsHeading}>Content sections</h2>
      <div className={styles.sectionGrid}>
        {sectionKeys.map((key) => (
          <a key={key} href={`/admin/content/${key}`} className={styles.sectionCard}>
            <strong>{getSectionConfig(key).label}</strong>
            <span>{countsBySection[key] || 0} items</span>
          </a>
        ))}
      </div>
    </AdminLayout>
  );
}
