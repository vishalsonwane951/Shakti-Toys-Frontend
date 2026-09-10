import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/superadmin', label: 'Overview', icon: '📊', exact: true },
  { to: '/superadmin/shops', label: 'Shops', icon: '🏪' },
  { to: '/superadmin/plans', label: 'Plans', icon: '💳' },
];

export default function SuperAdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-gray-950 text-white">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col fixed left-0 top-0 h-full z-40">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛠️</span>
            <div>
              <div className="font-display font-bold text-lg">Platform Admin</div>
              <div className="text-xs text-orange-400 font-medium">Superadmin</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const isActive = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                <span className="text-lg">{item.icon}</span>{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold text-gray-900">{user?.name?.[0]}</div>
            <div className="min-w-0"><div className="text-sm font-medium truncate">{user?.name}</div><div className="text-xs text-gray-500">Superadmin</div></div>
          </div>
          <button onClick={() => { logout(); navigate('/superadmin/login'); }}
            className="w-full text-left text-sm text-red-400 hover:text-red-300 px-2 py-1.5 rounded-lg hover:bg-red-500/5 transition-colors">
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-8 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
