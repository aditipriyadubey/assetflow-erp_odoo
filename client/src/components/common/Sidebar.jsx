import { NavLink } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { getNavItemsForRole } from '../../routes/navConfig';

function Sidebar({ userRole, collapsed, onToggleCollapse }) {
  const navItems = getNavItemsForRole(userRole);

  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-30 flex flex-col border-r border-neutral-200 bg-white transition-all duration-200',
        collapsed ? 'w-16' : 'w-64',
      ].join(' ')}
    >
      <div
        className={[
          'flex h-14 items-center border-b border-neutral-200',
          collapsed ? 'justify-center px-2' : 'justify-between px-4',
        ].join(' ')}
      >
        {!collapsed && (
          <span className="text-lg font-semibold text-primary-600">AssetFlow</span>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className={collapsed ? 'space-y-1 px-2' : 'space-y-1 px-3'}>
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    [
                      'flex items-center rounded-md text-sm font-medium transition-colors',
                      collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900',
                    ].join(' ')
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
