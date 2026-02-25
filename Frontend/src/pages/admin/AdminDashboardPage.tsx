import { Link } from 'react-router-dom';

const modules = [
  {
    title: 'DJ Profiles',
    description: 'Create new DJs, edit bios, manage media, and remove inactive artists.',
    to: '/admin/djs',
    accent: 'from-orange-600/50 to-[#5D1725]/60',
  },
  {
    title: 'Events',
    description: 'Curate the calendar, assign venues and DJs, and upload hero media.',
    to: '/admin/events',
    accent: 'from-[#FF6B35]/40 to-orange-900/60',
  },
  {
    title: 'Venues',
    description: 'Keep venue capacities, addresses, and contacts up to date.',
    to: '/admin/venues',
    accent: 'from-[#5D1725]/50 to-orange-950/60',
  },
];

const AdminDashboardPage = () => (
  <div className="space-y-8">
    <header className="space-y-2">
      <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Control Center</p>
      <h1 className="font-display text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      <p className="text-sm text-gray-400">
        Pick a module below to manage DJs, events, venues, and settings. Each panel routes you into
        its dedicated CRUD workspace.
      </p>
    </header>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {modules.map((module) => (
        <Link
          key={module.to}
          to={module.to}
          className={`group rounded-3xl border border-white/10 bg-gradient-to-br ${module.accent} p-6 transition hover:scale-[1.01]`}
        >
          <div className="flex flex-col gap-3">
            <div className="text-xs uppercase tracking-[0.4em] text-white/70">Manage</div>
            <h2 className="text-2xl font-semibold">{module.title}</h2>
            <p className="text-sm text-white/80">{module.description}</p>
            <span className="text-xs uppercase tracking-[0.35em] text-white/90">Open →</span>
          </div>
        </Link>
      ))}
    </div>

    <div className="card space-y-3">
      <h2 className="text-xl font-semibold">Need something else?</h2>
      <p className="text-sm text-gray-400">
        Tickets, playlists, and the site settings/media console are planned next. Use the quick
        links above for the modules that are already wired, or let us know which section you want
        prioritized.
      </p>
    </div>
  </div>
);

export default AdminDashboardPage;
