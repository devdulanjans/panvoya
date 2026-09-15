import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/admin/AdminLayout';
import GeneralTab from '../../../components/admin/packages/GeneralTab';
import ItineraryTab from '../../../components/admin/packages/ItineraryTab';
import HotelTab from '../../../components/admin/packages/HotelTab';
import SeoTab from '../../../components/admin/packages/SeoTab';
import { emptyPackage } from '../../../lib/packageSchema';
import { requirePageSession } from '../../../lib/serverAuth';
import editorStyles from '../../../components/admin/packages/PackageEditor.module.css';
import styles from './packages.module.css';

const TABS = [
  { key: 'general', label: 'General', Component: GeneralTab },
  { key: 'itinerary', label: 'Itinerary', Component: ItineraryTab },
  { key: 'hotel', label: 'Hotel', Component: HotelTab },
  { key: 'seo', label: 'SEO Keyword', Component: SeoTab },
];

export async function getServerSideProps(context) {
  const result = await requirePageSession(context);
  if (result.redirect) return result;
  return { props: {} };
}

export default function PackageEditorPage() {
  const router = useRouter();
  const { id } = router.query;
  const isNew = id === 'new';

  const [activeTab, setActiveTab] = useState('general');
  const [value, setValue] = useState(emptyPackage());
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [existingTourAreas, setExistingTourAreas] = useState([]);

  useEffect(() => {
    const loadTourAreas = async () => {
      const res = await fetch('/api/admin/packages');
      const json = await res.json();
      const areas = [...new Set((json.items || []).map((item) => item.data.tourArea).filter(Boolean))];
      setExistingTourAreas(areas);
    };
    loadTourAreas();
  }, []);

  useEffect(() => {
    if (!id || isNew) return;

    const load = async () => {
      setLoading(true);
      const res = await fetch(`/api/admin/packages/${id}`);
      const json = await res.json();
      if (res.ok) {
        setValue({ ...emptyPackage(), ...json.item.data });
      } else {
        setMessage({ type: 'error', text: json.error || 'Could not load package.' });
      }
      setLoading(false);
    };

    load();
  }, [id, isNew]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const url = isNew ? '/api/admin/packages' : `/api/admin/packages/${id}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(value),
    });
    const json = await res.json();
    setSaving(false);

    if (!res.ok) {
      const detail = json.issues?.map((issue) => issue.message).join(', ');
      setMessage({ type: 'error', text: detail || json.error || 'Something went wrong.' });
      return;
    }

    if (json.status === 'applied') {
      router.push('/admin/packages');
    } else {
      setMessage({ type: 'pending', text: 'Submitted for admin approval.' });
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Packages">
        <p className={styles.muted}>Loading…</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isNew ? 'Create Package' : 'Edit Package'}>
      <section className={styles.panel}>
        {message && (
          <p style={{ marginBottom: 16, color: message.type === 'error' ? '#c0392b' : '#8a6100', fontWeight: 600 }}>
            {message.text}
          </p>
        )}

        <div className={editorStyles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`${editorStyles.tabButton} ${activeTab === tab.key ? editorStyles.tabButtonActive : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave}>
          {TABS.map((tab) => {
            const { Component } = tab;
            return (
              <div key={tab.key} style={{ display: activeTab === tab.key ? 'block' : 'none' }}>
                <Component value={value} onChange={setValue} existingTourAreas={existingTourAreas} />
              </div>
            );
          })}

          <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
            <button type="submit" className={styles.button} disabled={saving}>
              {saving ? 'Saving…' : isNew ? 'Create Package' : 'Save Changes'}
            </button>
            <button type="button" className={styles.actionButton} onClick={() => router.push('/admin/packages')}>
              Cancel
            </button>
          </div>
        </form>
      </section>
    </AdminLayout>
  );
}
