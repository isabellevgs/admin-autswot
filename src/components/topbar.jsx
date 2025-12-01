import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, Edit, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="bg-linear-to-r from-violet-700 to-violet-800 px-6 py-4 rounded-2xl mt-5 shadow-lg">
      <nav className="flex flex-wrap items-center justify-between gap-4" aria-label="Navegação principal">
        <div className="flex items-center gap-8 lg:gap-12">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/home">
              <h1 className="text-white font-bold text-2xl sm:text-3xl tracking-wide hover:text-violet-200 transition-colors duration-200 cursor-pointer">
                AutSWOT
              </h1>
            </Link>
          </div>

          {/* Menu de Navegação */}
          <ul className="flex flex-wrap items-center gap-6 lg:gap-8">
            <li>
              <Link
                to="/pessoas"
                className={`text-white font-semibold text-base sm:text-lg hover:text-violet-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-violet-700 rounded px-3 py-1.5 ${
                  location.pathname === '/pessoas' ? 'text-violet-200' : ''
                }`}
                aria-current={location.pathname === '/pessoas' ? 'page' : undefined}
              >
                Pessoas
              </Link>
            </li>

            <li>
              <Link
                to="/posts"
                className={`text-white font-semibold text-base sm:text-lg hover:text-violet-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-violet-700 rounded px-3 py-1.5 ${
                  location.pathname === '/posts' ? 'text-violet-200' : ''
                }`}
                aria-current={location.pathname === '/posts' ? 'page' : undefined}
              >
                Postagens
              </Link>
            </li>

            <li>
              <Link
                to="/comunidade"
                className={`text-white font-semibold text-base sm:text-lg hover:text-violet-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-violet-700 rounded px-3 py-1.5 ${
                  location.pathname === '/comunidade' ? 'text-violet-200' : ''
                }`}
                aria-current={location.pathname === '/comunidade' ? 'page' : undefined}
              >
                Comunidade
              </Link>
            </li>
          </ul>
        </div>

        {/* Perfil do Usuário e menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 transition-colors duration-200 px-4 py-2 rounded-lg cursor-pointer"
          >
            <User className="w-5 h-5 text-white" />
            <span className="text-white font-semibold text-base sm:text-lg whitespace-nowrap">
              Olá, {user?.name || 'Usuário'}
            </span>
            <ChevronDown 
              className={`w-4 h-4 text-white transition-transform duration-200 ${
                isMenuOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {/* Menu Dropdown */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
              <div className="py-1">
                <button
                  onClick={() => {
                    // Editar perfil - desabilitado por enquanto
                  }}
                  disabled
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-500 cursor-not-allowed opacity-50 hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm font-medium">Editar perfil</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sair</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Topbar