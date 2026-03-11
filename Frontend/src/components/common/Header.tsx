import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const Header = () => {
  const { isAuthenticated, isAdmin, isDJ, logout } = useAuth();
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
    <header className="sticky top-0 z-30 w-full max-w-full bg-[#09090b]/90 backdrop-blur-md border-b border-white/[0.06]" style={{ willChange: 'transform' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-3">
        <Link to="/" className="flex items-center gap-3 flex-shrink-0">
          <img
            src={siteSettings.logoUrl || '/icons/lets-go-klubn-320.png'}
            alt={siteSettings.siteName}
            className="h-12 sm:h-16 md:h-20 w-auto drop-shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
            loading="lazy"
          />
          <span className="sr-only">{siteSettings.siteName}</span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2 lg:gap-3 min-w-0 overflow-hidden">
          <nav className="hidden lg:flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2 py-1 text-[0.65rem] uppercase tracking-[0.3em]">
            {navLinks.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    'px-2 xl:px-3 py-1.5 rounded-full transition-colors whitespace-nowrap',
                    isActive ? 'bg-gradient-to-r from-orange-500 to-[#FF6B35] text-black font-semibold' : 'text-gray-300 hover:text-white',
                  ].join(' ')
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="lg:hidden">
            <select
              className="rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em]"
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
              className="hidden sm:inline-flex rounded-full border border-white/20 px-2.5 py-1.5 text-[0.6rem] uppercase tracking-[0.3em] text-orange-400 hover:text-white whitespace-nowrap"
            >
              Admin
            </Link>
          )}
          {isDJ && !isAdmin && (
            <Link
              to="/dj-dashboard"
              className="hidden sm:inline-flex rounded-full border border-orange-500/40 bg-gradient-to-r from-[#FF6B35]/10 to-orange-500/10 px-2.5 py-1.5 text-[0.6rem] uppercase tracking-[0.3em] text-orange-400 hover:text-white hover:border-orange-400 whitespace-nowrap"
            >
              DJ Portal
            </Link>
          )}

          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `hidden sm:inline-flex rounded-full px-2.5 py-1.5 text-[0.6rem] uppercase tracking-[0.3em] transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-[#FF6B35] text-black font-semibold'
                      : 'border border-white/20 text-gray-300 hover:text-white hover:border-orange-400'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <button
                onClick={logout}
                className="rounded-full bg-white text-black px-4 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.3em] hover:bg-gradient-to-r hover:from-orange-500 hover:to-[#FF6B35] hover:text-black transition whitespace-nowrap"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-white/20 px-4 py-1.5 text-[0.6rem] uppercase tracking-[0.3em] text-gray-300 hover:text-white whitespace-nowrap"
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
