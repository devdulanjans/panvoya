import { resolveNavLink, trackPackageClick } from './navMenu';
import { useContact } from './ContactContext';

export default function DrawerNavItem({ item, path, openKeys, onToggle, onNavigate, depth, isActive }) {
  const { whatsapp } = useContact();
  const link = resolveNavLink(item, whatsapp);
  const isOpen = openKeys.has(path);

  return (
    <div className={`drawer-item depth-${depth}`}>
      <div className="drawer-item-row">
        {link ? (
          <a
            href={link.href}
            className={isActive ? 'active' : ''}
            onClick={(e) => {
              if (item.trackable) trackPackageClick(item.id);
              onNavigate(e);
            }}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noreferrer' : undefined}
          >
            {item.label}
          </a>
        ) : (
          <span className="drawer-item-label">{item.label}</span>
        )}
        {item.children && (
          <button
            type="button"
            className={`drawer-toggle${isOpen ? ' open' : ''}`}
            aria-expanded={isOpen}
            aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${item.label} menu`}
            onClick={() => onToggle(path)}
          >
            <span className="submenu-arrow" aria-hidden="true" />
          </button>
        )}
      </div>
      {item.children && isOpen && (
        <div className="drawer-submenu">
          {item.children.map((child) => (
            <DrawerNavItem
              key={child.label}
              item={child}
              path={`${path}/${child.label}`}
              openKeys={openKeys}
              onToggle={onToggle}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
