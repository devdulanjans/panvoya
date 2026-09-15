import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import AdminLayout from '../../components/admin/AdminLayout';
import { requireAdminPageSession } from '../../lib/serverAuth';
import styles from './users.module.css';

const emptyForm = { name: '', email: '', password: '', role: 'USER' };

export async function getServerSideProps(context) {
  const result = await requireAdminPageSession(context);
  if (result.redirect) return result;
  return { props: {} };
}

export default function UsersPage() {
  const { data: sessionData } = useSession();
  const currentUserId = sessionData?.user?.id ? Number(sessionData.user.id) : null;

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    const json = await res.json();
    setUsers(json.users || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setError('');
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || 'Could not create user.');
      return;
    }
    setForm(emptyForm);
    load();
  };

  const updateUser = async (id, data) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json();
      window.alert(json.error || 'Could not update user.');
      return;
    }
    load();
  };

  return (
    <AdminLayout title="Users">
      <section className={styles.panel}>
        <h2>Create account</h2>
        <form className={styles.form} onSubmit={handleCreate}>
          <label className={styles.field}>
            Name
            <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          </label>
          <label className={styles.field}>
            Email
            <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
          </label>
          <label className={styles.field}>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              minLength={8}
              required
            />
          </label>
          <label className={styles.field}>
            Role
            <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <button type="submit" className={styles.button}>Create</button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
      </section>

      <section className={styles.panel}>
        <h2>All users</h2>
        {loading ? (
          <p className={styles.muted}>Loading…</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = user.id === currentUserId;
                return (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        className={styles.select}
                        value={user.role}
                        disabled={isSelf}
                        onChange={(e) => updateUser(user.id, { role: e.target.value })}
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td>{user.active ? 'Active' : 'Disabled'}</td>
                    <td>
                      {!isSelf && (
                        <button
                          type="button"
                          className={styles.toggleButton}
                          onClick={() => updateUser(user.id, { active: !user.active })}
                        >
                          {user.active ? 'Disable' : 'Enable'}
                        </button>
                      )}
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
