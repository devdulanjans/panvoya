import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import AdminLayout from '../../components/admin/AdminLayout';
import { requirePageSession } from '../../lib/serverAuth';
import styles from './customer-requests.module.css';

const STATUS_CLASS = {
  NEW: 'statusNew',
  CONTACTED: 'statusContacted',
  CLOSED: 'statusClosed',
};

export async function getServerSideProps(context) {
  const result = await requirePageSession(context);
  if (result.redirect) return result;
  return { props: {} };
}

export default function CustomerRequestsPage() {
  const { data: sessionData } = useSession();
  const role = sessionData?.user?.role;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/customer-requests');
    const json = await res.json();
    setRequests(json.requests || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    const res = await fetch(`/api/admin/customer-requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const json = await res.json();
      window.alert(json.error || 'Could not update status.');
      return;
    }
    load();
  };

  const deleteRequest = async (id) => {
    if (!window.confirm('Delete this customer request?')) return;
    const res = await fetch(`/api/admin/customer-requests/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json();
      window.alert(json.error || 'Could not delete request.');
      return;
    }
    load();
  };

  return (
    <AdminLayout title="Customer Requests">
      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <h2>Plan Your Holidays submissions</h2>
        </div>

        {loading ? (
          <p className={styles.muted}>Loading…</p>
        ) : requests.length === 0 ? (
          <p className={styles.muted}>No customer requests yet.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Requirement</th>
                <th>Destination</th>
                <th>Travel Dates</th>
                <th>Submitted</th>
                <th>Status</th>
                {role === 'ADMIN' && <th></th>}
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.firstName}</td>
                  <td className={styles.contactCell}>
                    <span>{request.email}</span>
                    <small>{request.phone}</small>
                  </td>
                  <td>{request.requirement || '—'}</td>
                  <td>{request.destination || '—'}</td>
                  <td>{request.travelDates || '—'}</td>
                  <td>{new Date(request.createdAt).toLocaleString()}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[STATUS_CLASS[request.status]]}`}>
                      {request.status}
                    </span>
                    <div>
                      <select
                        className={styles.select}
                        value={request.status}
                        onChange={(e) => updateStatus(request.id, e.target.value)}
                      >
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>
                  </td>
                  {role === 'ADMIN' && (
                    <td>
                      <button type="button" className={styles.deleteButton} onClick={() => deleteRequest(request.id)}>
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </AdminLayout>
  );
}
