import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const Header = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { siteSettings } = useSiteSettings();
  const navigate = useNavigate();
  const navLinks = [
    { label: 'Events', to: '/events' },
    { label: 'DJs', to: '/djs' },
    { label: 'Playlists', to: '/playlists' },
    { label: 'Gallery', to: '/gallery' },
    { label: 'Tickets', to: '/tickets' },
    { label: 'Contact', to: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-black/60 backdrop-blur border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={siteSettings.logoUrl || '/icons/lets-go-klubn-320.png'}
            alt={siteSettings.siteName}
            className="h-24 w-auto drop-shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
            loading="lazy"
          />
          <span className="sr-only">{siteSettings.siteName}</span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-4">
          <nav className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[0.7rem] uppercase tracking-[0.35em]">
            {navLinks.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    'px-3 py-1.5 rounded-full transition-colors',
                    isActive ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-black font-semibold' : 'text-gray-300 hover:text-white',
                  ].join(' ')
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="md:hidden">
            <select
              className="rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[0.7rem] uppercase tracking-[0.35em]"
              onChange={(event) => {
                const value = event.target.value;
                if (value) {
                  navigate(value);
                  event.currentTarget.value = '';
                }
              }}
            >
              <option value="">Navigate</option>
              {navLinks.map(({ label, to }) => (
                <option key={to} value={to}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {isAdmin && (
            <Link
              to="/admin"
              className="hidden md:inline-flex rounded-full border border-white/20 px-3 py-1.5 text-xs uppercase tracking-[0.4em] text-orange-400 hover:text-white"
            >
              Admin
            </Link>
          )}
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="rounded-full bg-white text-black px-5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.35em] hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-black transition"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-white/20 px-5 py-2 text-[0.65rem] uppercase tracking-[0.35em] text-gray-300 hover:text-white"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
