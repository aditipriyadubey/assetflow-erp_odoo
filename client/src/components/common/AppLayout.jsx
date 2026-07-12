import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useNotifications from '../../hooks/useNotifications';
import { getPageTitle } from '../../routes/navConfig';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function AppLayout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1024px)');

    const handleChange = (event) => {
      setCollapsed(event.matches);
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleNotificationClick = () => {
    navigate('/notifications', { replace: false });
  };

  const sidebarWidth = collapsed ? 'lg:pl-16' : 'lg:pl-64';

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar
        userRole={user?.role}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((value) => !value)}
      />

      <div className={`flex min-h-screen flex-col transition-all duration-200 ${sidebarWidth}`}>
        <Navbar
          pageTitle={getPageTitle(location.pathname)}
          userName={user?.name ?? 'User'}
          userRole={user?.role ?? ''}
          unreadCount={unreadCount}
          onNotificationClick={handleNotificationClick}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-x-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
