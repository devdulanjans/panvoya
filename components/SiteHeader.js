import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { wildcardMatch } from './TourPackageSearch';
import { navMenu } from './navMenu';
import { useContact } from './ContactContext';
import DesktopNavItem from './DesktopNavItem';
import DrawerNavItem from './DrawerNavItem';

export default function SiteHeader({ searchIndex = [], packagesNavChildren, navVisibility = {}, stickyHeader = true }) {
  const router = useRouter();
  const { whatsapp, phone } = useContact();
  const resolvedNavMenu = useMemo(
    () => navMenu
      .filter((item) => navVisibility[item.label] !== false)
      .map((item) => (item.label === 'Packages' ? { ...item, children: packagesNavChildren } : item)),
    [packagesNavChildren, navVisibility],
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDrawerKeys, setOpenDrawerKeys] = useState(() => new Set());
  const [headerSearch, setHeaderSearch] = useState('');

  const toggleDrawerKey = (key) => {
    setOpenDrawerKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const closeDrawer = () => setIsMenuOpen(false);
  const headerResults = useMemo(() => {
    if (!headerSearch.trim()) return [];
    return searchIndex.filter((tour) => [tour.name, tour.location, tour.type].some((field) => wildcardMatch(field, headerSearch)));
  }, [headerSearch, searchIndex]);

  return (
    <>
      <header className={`topbar${stickyHeader ? ' topbar-fixed' : ''}`}>
        <div className="topbar-main">
          <Link href="/" className="logo-link">
            <img src="/panvoya-logo.svg" alt="Panvoya logo" className="brand-logo" />
          </Link>
          <div className="header-search">
            <span aria-hidden="true">⌕</span>
            <input
              value={headerSearch}
              onChange={(event) => setHeaderSearch(event.target.value)}
              placeholder="Find Your Tour Package"
              aria-label="Search tour packages"
            />
            {headerSearch.trim() && (
              <div className="header-search-results" aria-live="polite">
                {headerResults.length > 0 ? headerResults.map((tour) => (
                  <a
                    href={tour.slug ? `/packages/${tour.slug}` : '#contact'}
                    key={`${tour.name}-${tour.location}`}
                    onClick={() => {
                      if (tour.trackable && tour.id) {
                        fetch('/api/track/click', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: tour.id }),
                          keepalive: true,
                        });
                      }
                      setHeaderSearch('');
                    }}
                  >
                    <strong>{tour.name}</strong><small>{tour.location} · {tour.type}</small>
                  </a>
                )) : <span>No tour packages found.</span>}
              </div>
            )}
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="mobile-menu-button"
              aria-label="Open navigation menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
        <div className="nav-row">
          <nav className="site-nav">
            {resolvedNavMenu.map((item) => (
              <DesktopNavItem key={item.label} item={item} isActive={item.href === router.pathname} />
            ))}
          </nav>
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="whatsapp-link"
          >
            <strong>◉</strong><span>WhatsApp<br /><b>{phone}</b></span><span className="submenu-arrow" aria-hidden="true" />
          </a>
        </div>
      </header>

      {isMenuOpen && (
        <>
          <button
            type="button"
            className="menu-overlay"
            aria-label="Close navigation menu"
            onClick={() => setIsMenuOpen(false)}
          />
          <aside className="mobile-drawer" aria-label="Mobile navigation">
            <div className="drawer-header">
              <strong>Menu</strong>
              <button type="button" aria-label="Close navigation menu" onClick={() => setIsMenuOpen(false)}>×</button>
            </div>
            <nav className="drawer-nav">
              {resolvedNavMenu.map((item) => (
                <DrawerNavItem
                  key={item.label}
                  item={item}
                  path={item.label}
                  openKeys={openDrawerKeys}
                  onToggle={toggleDrawerKey}
                  onNavigate={closeDrawer}
                  depth={0}
                  isActive={item.href === router.pathname}
                />
              ))}
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
