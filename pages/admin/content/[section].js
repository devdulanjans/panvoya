import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import AdminLayout from '../../../components/admin/AdminLayout';
import ContentField from '../../../components/admin/ContentField';
import { getSectionConfig, defaultValuesFor } from '../../../lib/sections';
import { requirePageSession } from '../../../lib/serverAuth';
import styles from './ContentManager.module.css';

function groupItems(items) {
  const groups = new Map();
  items.forEach((item) => {
    const key = item.groupName || '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });
  return groups;
}

export async function getServerSideProps(context) {
  const result = await requirePageSession(context);
  if (result.redirect) return result;
  return { props: {} };
}

export default function ContentManagerPage() {
  const router = useRouter();
  const { section } = router.query;
  const { data: sessionData } = useSession();
  const role = sessionData?.user?.role;

  const config = section ? getSectionConfig(section) : null;

  const [items, setItems] = useState([]);
  const [pendingChanges, setPendingChanges] = useState([]);
  const [settings, setSettings] = useState({ title: '', subtitle: '' });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [existingGroups, setExistingGroups] = useState([]);

  const loadData = async () => {
    if (!section) return;
    setLoading(true);
    const [contentRes, settingsRes] = await Promise.all([
      fetch(`/api/admin/content/${section}`),
      fetch(`/api/admin/settings/${section}`),
    ]);
    const contentJson = await contentRes.json();
    const settingsJson = await settingsRes.json();
    setItems(contentJson.items || []);
    setPendingChanges(contentJson.pendingChanges || []);
    setExistingGroups([...new Set((contentJson.items || []).map((i) => i.groupName).filter(Boolean))]);
    setSettings({ title: settingsJson.setting?.title || '', subtitle: settingsJson.setting?.subtitle || '' });
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    setFormOpen(false);
    setEditingId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  useEffect(() => {
    if (!formOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setFormOpen(false);
        setEditingId(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [formOpen]);

  useEffect(() => {
    if (!formOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [formOpen]);

  const pendingByItemId = useMemo(() => {
    const map = new Map();
    pendingChanges.forEach((change) => {
      if (change.contentItemId) map.set(change.contentItemId, change);
    });
    return map;
  }, [pendingChanges]);

  const creationPending = pendingChanges.filter((change) => change.action === 'CREATE');

  if (!config) {
    return (
      <AdminLayout title="Content">
        <p>Unknown section.</p>
      </AdminLayout>
    );
  }

  const openCreateForm = () => {
    setEditingId(null);
    setFormValues(defaultValuesFor(section));
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingId(item.id);
    setFormValues({ ...item.data, groupName: item.groupName || '' });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
  };

  const handleFieldChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const url = editingId ? `/api/admin/content/${section}/${editingId}` : `/api/admin/content/${section}`;
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formValues),
    });
    const json = await res.json();

    if (!res.ok) {
      setToast({ type: 'error', message: json.error || 'Something went wrong.' });
      return;
    }

    setToast({
      type: json.status === 'applied' ? 'applied' : 'pending',
      message: json.status === 'applied' ? 'Change saved and published.' : 'Submitted for admin approval.',
    });
    closeForm();
    loadData();
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Delete this item?')) return;
    const res = await fetch(`/api/admin/content/${section}/${item.id}`, { method: 'DELETE' });
    const json = await res.json();

    if (!res.ok) {
      setToast({ type: 'error', message: json.error || 'Something went wrong.' });
      return;
    }

    setToast({
      type: json.status === 'applied' ? 'applied' : 'pending',
      message: json.status === 'applied' ? 'Item deleted.' : 'Deletion submitted for admin approval.',
    });
    loadData();
  };

  const handleSettingsSave = async (event) => {
    event.preventDefault();
    const res = await fetch(`/api/admin/settings/${section}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) {
      const json = await res.json();
      setToast({ type: 'error', message: json.error || 'Could not save heading.' });
      return;
    }
    setToast({ type: 'applied', message: 'Heading saved.' });
  };

  const fieldNames = Object.keys(config.fields);
  const groups = groupItems(items);

  return (
    <AdminLayout title={config.label}>
      {toast && (
        <div
          className={`${styles.toast} ${
            toast.type === 'applied' ? styles.toastApplied : toast.type === 'pending' ? styles.toastPending : styles.toastError
          }`}
        >
          {toast.message}
        </div>
      )}

      {role === 'ADMIN' && (
        <section className={styles.panel}>
          <div className={styles.panelHeading}>
            <h2>Section heading</h2>
          </div>
          <form className={styles.settingsForm} onSubmit={handleSettingsSave}>
            <label>
              Title
              <input
                type="text"
                value={settings.title}
                onChange={(e) => setSettings((prev) => ({ ...prev, title: e.target.value }))}
              />
            </label>
            <label>
              Subtitle
              <textarea
                rows={2}
                value={settings.subtitle}
                onChange={(e) => setSettings((prev) => ({ ...prev, subtitle: e.target.value }))}
              />
            </label>
            <div>
              <button type="submit" className={styles.button}>Save heading</button>
            </div>
          </form>
        </section>
      )}

      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <h2>Items</h2>
          <button type="button" className={styles.button} onClick={openCreateForm}>
            + Add new
          </button>
        </div>

        {creationPending.length > 0 && (
          <div className={styles.pendingList} style={{ marginBottom: 16 }}>
            {creationPending.map((change) => (
              <div key={change.id} className={styles.pendingItem}>
                <span>
                  New item pending approval
                  {change.submitter ? ` — submitted by ${change.submitter.name}` : ''}
                </span>
                <span className={styles.pendingBadge}>PENDING</span>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <p className={styles.muted}>Loading…</p>
        ) : items.length === 0 ? (
          <p className={styles.muted}>No items yet.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                {fieldNames.map((name) => (
                  <th key={name}>{config.fields[name].label}</th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {[...groups.entries()].map(([groupName, groupItemsList]) => (
                <FragmentGroup key={groupName || 'default'} groupName={groupName} hasGroup={config.hasGroup} colSpan={fieldNames.length + 1}>
                  {groupItemsList.map((item) => {
                    const pending = pendingByItemId.get(item.id);
                    return (
                      <tr key={item.id}>
                        {fieldNames.map((name) => (
                          <td key={name}>
                            {config.fields[name].type === 'boolean'
                              ? item.data[name]
                                ? 'Yes'
                                : 'No'
                              : String(item.data[name] ?? '')}
                          </td>
                        ))}
                        <td>
                          <div className={styles.rowActions}>
                            <button type="button" className={styles.actionButton} onClick={() => openEditForm(item)}>
                              Edit
                            </button>
                            <button type="button" className={styles.actionButton} onClick={() => handleDelete(item)}>
                              Delete
                            </button>
                            {pending && <span className={styles.pendingBadge}>PENDING {pending.action}</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </FragmentGroup>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {formOpen && (
        <div className={styles.modalOverlay} onClick={closeForm}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className={styles.modalHeader}>
              <h3>{editingId ? 'Edit item' : 'Add new item'}</h3>
              <button type="button" className={styles.modalCloseButton} aria-label="Close" onClick={closeForm}>
                ×
              </button>
            </div>
            <form className={styles.modalForm} onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGrid}>
                  {config.hasGroup && (
                    <label className={styles.formField}>
                      {config.groupLabel || 'Category'}
                      {config.groupOptions ? (
                        <select
                          value={formValues.groupName || ''}
                          onChange={(e) => handleFieldChange('groupName', e.target.value)}
                          required
                        >
                          <option value="" disabled>Select…</option>
                          {config.groupOptions.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      ) : (
                        <>
                          <input
                            type="text"
                            list="existing-groups"
                            value={formValues.groupName || ''}
                            onChange={(e) => handleFieldChange('groupName', e.target.value)}
                            required
                          />
                          <datalist id="existing-groups">
                            {existingGroups.map((g) => (
                              <option key={g} value={g} />
                            ))}
                          </datalist>
                        </>
                      )}
                    </label>
                  )}
                  {fieldNames.map((name) => (
                    <label
                      key={name}
                      className={`${styles.formField} ${config.fields[name].type === 'boolean' ? styles.checkboxField : ''} ${config.fields[name].type === 'textarea' ? styles.fieldWide : ''}`}
                    >
                      {config.fields[name].label}
                      <ContentField
                        name={name}
                        field={config.fields[name]}
                        value={formValues[name] ?? (config.fields[name].type === 'boolean' ? false : '')}
                        onChange={handleFieldChange}
                      />
                    </label>
                  ))}
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={`${styles.button} ${styles.buttonSecondary}`} onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className={styles.button}>
                  {editingId ? 'Save changes' : 'Create item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function FragmentGroup({ groupName, hasGroup, colSpan, children }) {
  return (
    <>
      {hasGroup && groupName && (
        <tr className={styles.groupHeaderRow}>
          <td colSpan={colSpan}>{groupName}</td>
        </tr>
      )}
      {children}
    </>
  );
}
