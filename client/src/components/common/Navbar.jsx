import { Bell, ChevronDown, LogOut } from 'lucide-react';
import { useState } from 'react';

function Navbar({ pageTitle, userName, userRole, unreadCount = 0, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-600 px-1 text-[10px] font-medium text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-neutral-100"
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <div className="text-right">
              <p className="font-medium text-neutral-900">{userName}</p>
              <p className="text-xs text-neutral-500">{userRole}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-neutral-500" />
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10 cursor-default"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-1 w-48 rounded-md border border-neutral-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
