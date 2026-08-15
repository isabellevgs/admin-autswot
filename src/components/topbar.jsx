import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, LayoutDashboard, Users, FileText, MessageSquare, HelpCircle, BookOpen, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NAV_LINKS = [
  { to: '/pessoas',    label: 'Pessoas',    icon: Users },
  { to: '/perguntas',  label: 'Perguntas',  icon: HelpCircle },
  { to: '/relatorios', label: 'Relatórios', icon: BookOpen },
  { to: '/posts',      label: 'Postagens',  icon: FileText },
  { to: '/comunidade', label: 'Comunidade', icon: MessageSquare },
  { to: '/dados-sistema', label: 'Sistema',      icon: Settings },
];

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

function Topbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <header className="mt-4">
      <nav className="bg-violet-800 rounded-2xl px-4 sm:px-6 py-0 shadow-xl shadow-violet-900/30 flex items-center justify-between gap-4 h-16">

        {/* Logo */}
        <Link
          to="/pessoas"
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <span className="text-white font-bold text-lg tracking-tight hidden sm:block">
            Aut<span className="text-violet-300">SWOT</span>
          </span>
        </Link>

        {/* Divider vertical */}
        <div className="hidden md:block w-px h-6 bg-white/15 shrink-0" />

        {/* Nav links */}
        <ul className="hidden md:flex items-center gap-1 flex-1">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || location.pathname.startsWith(to + '/');
            return (
              <li key={to}>
                <Link
                  to={to}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-white text-violet-800 shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* User menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 active:bg-white/25 transition-colors duration-200 pl-2 pr-3 py-1.5 rounded-xl cursor-pointer"
          >
            {/* Avatar com iniciais */}
            <div className="w-7 h-7 rounded-lg bg-violet-600 border border-white/20 flex items-center justify-center text-xs font-bold text-white select-none">
              {getInitials(user?.name)}
            </div>
            <span className="text-white text-sm font-medium hidden sm:block whitespace-nowrap max-w-32 truncate">
              {user?.name || 'Usuário'}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-white/70 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
              {/* Info do usuário */}
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Logado como</p>
                <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{user?.name || '—'}</p>
                {user?.email && (
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                )}
              </div>

              <div className="py-1.5">
                {/* Nav mobile */}
                <div className="md:hidden px-2 pb-1.5 border-b border-gray-100 mb-1.5 space-y-0.5">
                  {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </Link>
                  ))}
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Sair</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Topbar;
