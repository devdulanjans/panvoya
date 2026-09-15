import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { requirePageSession } from '../../../lib/serverAuth';
import styles from '../packages/packages.module.css';

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

export default function PopularPackagesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/packages');
    const json = await res.json();
    const sorted = [...(json.items || [])].sort((a, b) => a.position - b.position);
    setItems(sorted);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const reorder = async (id, direction) => {
    setBusy(true);
    await fetch(`/api/admin/packages/${id}/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction }),
    });
    await load();
    setBusy(false);
  };

  const sortByClicks = async () => {
    setBusy(true);
    await fetch('/api/admin/packages/resequence', { method: 'POST' });
    await load();
    setBusy(false);
  };

  return (
    <AdminLayout title="Popular Travel Packages">
      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <h2>Order shown on the website</h2>
          <button type="button" className={styles.button} onClick={sortByClicks} disabled={busy}>
            Sort by clicks
          </button>
        </div>

        <p className={styles.muted} style={{ marginBottom: 14 }}>
          Only packages with status <strong>Public</strong> appear on the website. Use the arrows to manually
          reorder, or click &quot;Sort by clicks&quot; to rank every package by how many times visitors have
          clicked it.
        </p>

        {loading ? (
          <p className={styles.muted}>Loading…</p>
        ) : items.length === 0 ? (
          <p className={styles.muted}>No packages yet.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Tour Name</th>
                <th>Status</th>
                <th>Clicks</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.data.title}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${STATUS_CLASS[item.data.status] || ''}`}>
                      {item.data.status}
                    </span>
                  </td>
                  <td>{item.clickCount}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => reorder(item.id, 'up')}
                        disabled={busy || index === 0}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => reorder(item.id, 'down')}
                        disabled={busy || index === items.length - 1}
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </AdminLayout>
  );
}
