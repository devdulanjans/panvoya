import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '../../../components/admin/AdminLayout';
import { requirePageSession } from '../../../lib/serverAuth';
import styles from './packages.module.css';

const STATUS_CLASS = {
  Public: styles.statusPublic,
  Pending: styles.statusPending,
  Complete: styles.statusComplete,
};

export async function getServerSideProps(context) {
  const result = await requirePageSession(context);
  if (result.redirect) return result;
  return { props: {} };
}

export default function PackagesListPage() {
  const [items, setItems] = useState([]);
  const [pendingChanges, setPendingChanges] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/packages');
    const json = await res.json();
    setItems(json.items || []);
    setPendingChanges(json.pendingChanges || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const pendingByItemId = useMemo(() => {
    const map = new Map();
    pendingChanges.forEach((change) => {
      if (change.contentItemId) map.set(change.contentItemId, change);
    });
    return map;
  }, [pendingChanges]);

  const creationPending = pendingChanges.filter((change) => change.action === 'CREATE');

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.data.title}"?`)) return;
    const res = await fetch(`/api/admin/packages/${item.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json();
      window.alert(json.error || 'Something went wrong.');
      return;
    }
    load();
  };

  return (
    <AdminLayout title="Packages">
      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <h2>All packages</h2>
          <Link href="/admin/packages/new" className={styles.button}>
            + Create Package
          </Link>
        </div>

        {creationPending.length > 0 && (
          <p className={styles.muted} style={{ marginBottom: 12 }}>
            {creationPending.length} new package(s) awaiting admin approval.
          </p>
        )}

        {loading ? (
          <p className={styles.muted}>Loading…</p>
        ) : items.length === 0 ? (
          <p className={styles.muted}>No packages yet.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tour Name</th>
                <th>Short Name</th>
                <th>Category</th>
                <th>Tour Area</th>
                <th>Trip Length</th>
                <th>Duration</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const pending = pendingByItemId.get(item.id);
                return (
                  <tr key={item.id}>
                    <td>{item.data.title}</td>
                    <td>{item.data.shortName}</td>
                    <td>{item.data.category}</td>
                    <td>{item.data.tourArea}</td>
                    <td>{item.data.tripLength}</td>
                    <td>{item.data.duration}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${STATUS_CLASS[item.data.status] || ''}`}>
                        {item.data.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <Link href={`/admin/packages/${item.id}`} className={styles.actionButton}>
                          Edit
                        </Link>
                        <button type="button" className={styles.actionButton} onClick={() => handleDelete(item)}>
                          Delete
                        </button>
                        {pending && <span className={styles.pendingBadge}>PENDING {pending.action}</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </AdminLayout>
  );
}
