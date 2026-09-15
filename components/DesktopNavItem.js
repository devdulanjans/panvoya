import { resolveNavLink, trackPackageClick } from './navMenu';
import { useContact } from './ContactContext';

function DropdownList({ items, depth, whatsappNumber }) {
  return (
    <ul className={`dropdown-list${depth === 0 ? ' dropdown-columns' : ''}`}>
      {items.map((item) => {
        const link = resolveNavLink(item, whatsappNumber);
        return (
          <li key={item.label} className={item.children ? 'has-children' : ''}>
            {link ? (
              <a
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noreferrer' : undefined}
                onClick={() => item.trackable && trackPackageClick(item.id)}
              >
                {item.label}
              </a>
            ) : (
              <span className="dropdown-heading">{item.label}</span>
            )}
            {item.children && <DropdownList items={item.children} depth={depth + 1} whatsappNumber={whatsappNumber} />}
          </li>
        );
      })}
    </ul>
  );
}

export default function DesktopNavItem({ item, isActive }) {
  const { whatsapp } = useContact();
  const link = resolveNavLink(item, whatsapp);

  return (
    <div className={`nav-item${item.children ? ' has-dropdown' : ''}`}>
      {link ? (
        <a
          href={link.href}
          className={isActive ? 'active' : ''}
          target={link.external ? '_blank' : undefined}
          rel={link.external ? 'noreferrer' : undefined}
        >
          {item.label}
          {item.children && <span className="submenu-arrow" aria-hidden="true" />}
        </a>
      ) : (
        <button type="button" className="nav-toggle">
          {item.label}
          <span className="submenu-arrow" aria-hidden="true" />
        </button>
      )}
      {item.children && (
        <div className="dropdown-panel">
          <DropdownList items={item.children} depth={0} whatsappNumber={whatsapp} />
        </div>
      )}
    </div>
  );
}
