import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getSectionConfig } from '../../lib/sections';
import { requireAdminPageSession } from '../../lib/serverAuth';
import styles from './approvals.module.css';

function formatFieldValue(field, value) {
  if (value === null || value === undefined || value === '') return '—';
  if (field?.type === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
  return String(value);
}

function ChangeSummary({ section, groupName, data }) {
  let config = null;
  try {
    config = getSectionConfig(section);
  } catch {
    config = null;
  }

  if (!config || !data) {
    return <pre className={styles.payload}>{JSON.stringify(data, null, 2)}</pre>;
  }

  const rows = [];
  if (config.hasGroup) {
    rows.push({ key: 'groupName', label: config.groupLabel || 'Category', field: null, value: groupName });
  }
  Object.entries(config.fields).forEach(([name, field]) => {
    rows.push({ key: name, label: field.label, field, value: data[name] });
  });

  return (
    <dl className={styles.changeGrid}>
      {rows.map((row) => (
        <div className={styles.changeRow} key={row.key}>
          <dt>{row.label}</dt>
          <dd>
            {row.field?.type === 'url' && row.value ? (
              <a href={row.value} target="_blank" rel="noreferrer">{row.value}</a>
            ) : (
              formatFieldValue(row.field, row.value)
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export async function getServerSideProps(context) {
  const result = await requireAdminPageSession(context);
  if (result.redirect) return result;
  return { props: {} };
}

export default function ApprovalsPage() {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/approvals');
    const json = await res.json();
    setChanges(json.changes || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const review = async (id, decision) => {
    const note = decision === 'reject' ? window.prompt('Reason for rejecting (optional):') || '' : '';
    const res = await fetch(`/api/admin/approvals/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, note }),
    });
    if (!res.ok) {
      const json = await res.json();
      window.alert(json.error || 'Something went wrong.');
      return;
    }
    load();
  };

  return (
    <AdminLayout title="Pending Approvals">
      {loading ? (
        <p className={styles.muted}>Loading…</p>
      ) : changes.length === 0 ? (
        <p className={styles.muted}>Nothing waiting for review.</p>
      ) : (
        <div className={styles.list}>
          {changes.map((change) => {
            let label;
            try {
              label = getSectionConfig(change.section).label;
            } catch {
              label = change.section;
            }
            return (
              <div key={change.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <strong>
                    {change.action} · {label}
                  </strong>
                  <span className={styles.meta}>
                    by {change.submitter?.name} ({change.submitter?.email})
                  </span>
                </div>
                {change.payload && (
                  <ChangeSummary section={change.section} groupName={change.payload.groupName} data={change.payload.data} />
                )}
                {change.action === 'DELETE' && change.contentItem && (
                  <ChangeSummary section={change.section} groupName={change.contentItem.groupName} data={change.contentItem.data} />
                )}
                <div className={styles.actions}>
                  <button type="button" className={styles.approveButton} onClick={() => review(change.id, 'approve')}>
                    Approve
                  </button>
                  <button type="button" className={styles.rejectButton} onClick={() => review(change.id, 'reject')}>
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
