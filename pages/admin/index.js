import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';
import { query } from '../../lib/db';
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

  const contentCounts = await query('SELECT section, COUNT(*) AS count FROM `contentitem` GROUP BY section');
  const countsBySection = Object.fromEntries(contentCounts.map((row) => [row.section, Number(row.count)]));

  let pendingApprovalsCount = null;
  let usersCount = null;
  let myPendingCount = null;
  let myApprovedCount = null;
  let myRejectedCount = null;

  if (user.role === 'ADMIN') {
    const [[pendingRow], [usersRow]] = await Promise.all([
      query("SELECT COUNT(*) AS count FROM `contentchange` WHERE status = 'PENDING'"),
      query('SELECT COUNT(*) AS count FROM `user`'),
    ]);
    pendingApprovalsCount = Number(pendingRow.count);
    usersCount = Number(usersRow.count);
  } else {
    const submittedBy = Number(user.id);
    const [[pendingRow], [approvedRow], [rejectedRow]] = await Promise.all([
      query("SELECT COUNT(*) AS count FROM `contentchange` WHERE submittedBy = ? AND status = 'PENDING'", [submittedBy]),
      query("SELECT COUNT(*) AS count FROM `contentchange` WHERE submittedBy = ? AND status = 'APPROVED'", [submittedBy]),
      query("SELECT COUNT(*) AS count FROM `contentchange` WHERE submittedBy = ? AND status = 'REJECTED'", [submittedBy]),
    ]);
    myPendingCount = Number(pendingRow.count);
    myApprovedCount = Number(approvedRow.count);
    myRejectedCount = Number(rejectedRow.count);
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
