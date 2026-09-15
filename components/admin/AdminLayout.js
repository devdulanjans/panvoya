import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { sectionKeys, getSectionConfig } from '../../lib/sections';
import styles from './AdminLayout.module.css';

const flatSectionKeys = sectionKeys.filter((key) => !getSectionConfig(key).navGroup);
const navGroupNames = [...new Set(sectionKeys.map((key) => getSectionConfig(key).navGroup).filter(Boolean))];

export default function AdminLayout({ title, children }) {
  const router = useRouter();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const [openGroups, setOpenGroups] = useState(() => new Set(navGroupNames));

  const isActive = (href) => router.pathname === href || router.asPath === href;

  const toggleGroup = (name) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <p className={styles.brand}>Panvoya Admin</p>
        <nav className={styles.nav}>
          <Link href="/admin" className={`${styles.navLink} ${isActive('/admin') ? styles.navLinkActive : ''}`}>
            Dashboard
          </Link>
          <Link
            href="/admin/packages"
            className={`${styles.navLink} ${router.asPath.startsWith('/admin/packages') ? styles.navLinkActive : ''}`}
          >
            Packages
          </Link>
          <Link
            href="/admin/popular-packages"
            className={`${styles.navLink} ${isActive('/admin/popular-packages') ? styles.navLinkActive : ''}`}
          >
            Popular Travel Packages
          </Link>
          <Link
            href="/admin/customer-requests"
            className={`${styles.navLink} ${isActive('/admin/customer-requests') ? styles.navLinkActive : ''}`}
          >
            Customer Requests
          </Link>

          <p className={styles.navGroupLabel}>Content</p>
          {flatSectionKeys.map((key) => (
            <Link
              key={key}
              href={`/admin/content/${key}`}
              className={`${styles.navLink} ${router.asPath === `/admin/content/${key}` ? styles.navLinkActive : ''}`}
            >
              {getSectionConfig(key).label}
            </Link>
          ))}

          {navGroupNames.map((groupName) => {
            const groupKeys = sectionKeys.filter((key) => getSectionConfig(key).navGroup === groupName);
            const isOpen = openGroups.has(groupName);
            return (
              <div key={groupName} className={styles.navGroup}>
                <button
                  type="button"
                  className={styles.navToggle}
                  aria-expanded={isOpen}
                  onClick={() => toggleGroup(groupName)}
                >
                  <span>{groupName}</span>
                  <span className={styles.navToggleArrow} aria-hidden="true">{isOpen ? '▾' : '▸'}</span>
                </button>
                {isOpen && groupKeys.map((key) => (
                  <Link
                    key={key}
                    href={`/admin/content/${key}`}
                    className={`${styles.navLink} ${styles.navSubLink} ${router.asPath === `/admin/content/${key}` ? styles.navLinkActive : ''}`}
                  >
                    {getSectionConfig(key).label}
                  </Link>
                ))}
              </div>
            );
          })}

          {role === 'ADMIN' && (
            <>
              <p className={styles.navGroupLabel}>Admin</p>
              <Link href="/admin/approvals" className={`${styles.navLink} ${isActive('/admin/approvals') ? styles.navLinkActive : ''}`}>
                Approvals
              </Link>
              <Link href="/admin/users" className={`${styles.navLink} ${isActive('/admin/users') ? styles.navLinkActive : ''}`}>
                Users
              </Link>
            </>
          )}
        </nav>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <h1 className={styles.topbarTitle}>{title}</h1>
          <div className={styles.topbarUser}>
            <span>{session?.user?.name}</span>
            {role && <span className={styles.roleBadge}>{role}</span>}
            <button type="button" className={styles.signOutButton} onClick={() => signOut({ callbackUrl: '/admin/login' })}>
              Sign out
            </button>
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
