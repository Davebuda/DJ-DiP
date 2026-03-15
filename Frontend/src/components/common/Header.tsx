import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const { isAuthenticated, isAdmin, isDJ, logout } = useAuth();
  const { siteSettings } = useSiteSettings();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Events', to: '/events' },
    { label: 'DJs', to: '/djs' },
    { label: 'Playlists', to: '/playlists' },
    { label: 'Mixes', to: '/mixes' },
    { label: 'Gallery', to: '/gallery' },
    { label: 'Tickets', to: '/tickets' },
    { label: 'Contact', to: '/contact' },
  ];

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-30 w-full max-w-full bg-[#09090b]/90 backdrop-blur-md border-b border-white/[0.06]" style={{ willChange: 'transform' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* ── Main row ── */}
        <div className="py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-3">
          <Link to="/" className="flex items-center gap-3 flex-shrink-0" onClick={closeMobile}>
            <img
              src={siteSettings.logoUrl || '/icons/lets-go-klubn-320.png'}
              alt={siteSettings.siteName}
              className="h-12 sm:h-16 md:h-20 w-auto drop-shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
              loading="lazy"
            />
            <span className="sr-only">{siteSettings.siteName}</span>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2 lg:gap-3 min-w-0 overflow-hidden">
            {/* Desktop nav */}
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

            {/* Desktop: Admin / DJ Portal */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden lg:inline-flex rounded-full border border-white/20 px-2.5 py-1.5 text-[0.6rem] uppercase tracking-[0.3em] text-orange-400 hover:text-white whitespace-nowrap"
              >
                Admin
              </Link>
            )}
            {isDJ && !isAdmin && (
              <Link
                to="/dj-dashboard"
                className="hidden lg:inline-flex rounded-full border border-orange-500/40 bg-gradient-to-r from-[#FF6B35]/10 to-orange-500/10 px-2.5 py-1.5 text-[0.6rem] uppercase tracking-[0.3em] text-orange-400 hover:text-white hover:border-orange-400 whitespace-nowrap"
              >
                DJ Portal
              </Link>
            )}

            {/* Desktop: Dashboard (admin only) + Logout / Login */}
            {isAdmin && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `hidden lg:inline-flex rounded-full px-2.5 py-1.5 text-[0.6rem] uppercase tracking-[0.3em] transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-[#FF6B35] text-black font-semibold'
                      : 'border border-white/20 text-gray-300 hover:text-white hover:border-orange-400'
                  }`
                }
              >
                Dashboard
              </NavLink>
            )}
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="hidden lg:inline-flex rounded-full bg-white text-black px-4 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.3em] hover:bg-gradient-to-r hover:from-orange-500 hover:to-[#FF6B35] hover:text-black transition whitespace-nowrap"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="hidden lg:inline-flex rounded-full border border-white/20 px-4 py-1.5 text-[0.6rem] uppercase tracking-[0.3em] text-gray-300 hover:text-white whitespace-nowrap"
              >
                Login
              </Link>
            )}

            {/* Tablet: show portal/auth but not full nav (sm to lg) */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex lg:hidden rounded-full border border-white/20 px-2.5 py-1.5 text-[0.6rem] uppercase tracking-[0.3em] text-orange-400 hover:text-white whitespace-nowrap"
              >
                Admin
              </Link>
            )}
            {isDJ && !isAdmin && (
              <Link
                to="/dj-dashboard"
                className="hidden sm:inline-flex lg:hidden rounded-full border border-orange-500/40 bg-gradient-to-r from-[#FF6B35]/10 to-orange-500/10 px-2.5 py-1.5 text-[0.6rem] uppercase tracking-[0.3em] text-orange-400 hover:text-white hover:border-orange-400 whitespace-nowrap"
              >
                DJ Portal
              </Link>
            )}
            {isAdmin && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `hidden sm:inline-flex lg:hidden rounded-full px-2.5 py-1.5 text-[0.6rem] uppercase tracking-[0.3em] transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-[#FF6B35] text-black font-semibold'
                      : 'border border-white/20 text-gray-300 hover:text-white hover:border-orange-400'
                  }`
                }
              >
                Dashboard
              </NavLink>
            )}
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="hidden sm:inline-flex lg:hidden rounded-full bg-white text-black px-4 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.3em] hover:bg-gradient-to-r hover:from-orange-500 hover:to-[#FF6B35] hover:text-black transition whitespace-nowrap"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex lg:hidden rounded-full border border-white/20 px-4 py-1.5 text-[0.6rem] uppercase tracking-[0.3em] text-gray-300 hover:text-white whitespace-nowrap"
              >
                Login
              </Link>
            )}

            {/* Tablet navigate select (sm only, hidden on mobile and desktop) */}
            <div className="hidden sm:block lg:hidden">
              <select
                className="rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-gray-300"
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) { navigate(value); e.currentTarget.value = ''; }
                }}
              >
                <option value="">Navigate</option>
                {navLinks.map(({ label, to }) => (
                  <option key={to} value={to}>{label}</option>
                ))}
              </select>
            </div>

            {/* Mobile hamburger (sm:hidden) */}
            <button
              className="sm:hidden flex items-center justify-center w-8 h-8 rounded-lg border border-white/20 text-gray-300 hover:text-white hover:border-orange-400 transition-colors flex-shrink-0"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-white/[0.06] pb-4 pt-3 space-y-1">
            {/* Role badge */}
            {(isAdmin || isDJ) && (
              <div className="mb-3">
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={closeMobile}
                    className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500/10 to-[#FF6B35]/10 border border-orange-500/30 text-orange-400 text-[0.7rem] uppercase tracking-[0.3em] font-semibold"
                  >
                    <span>Admin Panel</span>
                    <span className="text-orange-500/60">→</span>
                  </Link>
                )}
                {isDJ && !isAdmin && (
                  <Link
                    to="/dj-dashboard"
                    onClick={closeMobile}
                    className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500/10 to-[#FF6B35]/10 border border-orange-500/30 text-orange-400 text-[0.7rem] uppercase tracking-[0.3em] font-semibold"
                  >
                    <span>DJ Portal</span>
                    <span className="text-orange-500/60">→</span>
                  </Link>
                )}
              </div>
            )}

            {/* Nav links grid */}
            <div className="grid grid-cols-2 gap-1">
              {navLinks.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-xl text-[0.65rem] uppercase tracking-[0.25em] text-center transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-[#FF6B35] text-black font-semibold'
                        : 'bg-white/[0.04] border border-white/[0.08] text-gray-300 hover:text-white hover:border-orange-400/30'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>

            {/* Auth row */}
            <div className="pt-2 flex gap-2">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <NavLink
                      to="/dashboard"
                      onClick={closeMobile}
                      className={({ isActive }) =>
                        `flex-1 px-3 py-2 rounded-xl text-[0.65rem] uppercase tracking-[0.25em] text-center transition-colors ${
                          isActive
                            ? 'bg-gradient-to-r from-orange-500 to-[#FF6B35] text-black font-semibold'
                            : 'bg-white/[0.04] border border-white/[0.08] text-gray-300 hover:text-white'
                        }`
                      }
                    >
                      Dashboard
                    </NavLink>
                  )}
                  <button
                    onClick={() => { logout(); closeMobile(); }}
                    className="flex-1 px-3 py-2 rounded-xl bg-white text-black text-[0.65rem] font-semibold uppercase tracking-[0.25em] hover:bg-gradient-to-r hover:from-orange-500 hover:to-[#FF6B35] hover:text-black transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className="flex-1 px-3 py-2 rounded-xl border border-white/20 text-[0.65rem] uppercase tracking-[0.25em] text-center text-gray-300 hover:text-white"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
