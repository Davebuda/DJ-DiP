import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_LANDING_DATA } from '../graphql/queries';
import NewsletterSignup from '../components/common/NewsletterSignup';

type ShowcaseItem = {
  label: string;
  title: string;
  copy: string;
  meta?: string;
  href: string;
  image?: string;
};

const HeroSection = ({
  highlight,
  stats,
  showcaseItems,
}: {
  highlight?: any;
  stats: { label: string; value: number }[];
  showcaseItems: ShowcaseItem[];
}) => {
  const [activeShowcaseIndex, setActiveShowcaseIndex] = useState(0);
  const hasShowcase = showcaseItems.length > 0;
  const safeIndex = hasShowcase
    ? ((activeShowcaseIndex % showcaseItems.length) + showcaseItems.length) % showcaseItems.length
    : 0;
  const activeShowcase = hasShowcase ? showcaseItems[safeIndex] : undefined;
  const featuredImage = highlight?.imageUrl ?? '/media/sections/hero/KlubN12.07 screen (1) copy.png';

  useEffect(() => {
    if (!hasShowcase) {
      return;
    }
    const interval = setInterval(() => {
      setActiveShowcaseIndex((prev) => (prev + 1) % showcaseItems.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [hasShowcase, showcaseItems.length]);

  const setIndex = (next: number) => {
    if (!hasShowcase) return;
    setActiveShowcaseIndex(((next % showcaseItems.length) + showcaseItems.length) % showcaseItems.length);
  };

  return (
    <section className="relative isolate flex min-h-[92vh] w-full flex-col justify-center overflow-hidden bg-black text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/media/sections/hero/KlubN12.07 screen (1) copy.png"
      >
        {['/media/hero/0721-copy.mp4', '/media/sections/hero/0721-copy.mp4'].map((src) => (
          <source key={src} src={src} type="video/mp4" />
        ))}
      </video>
      <div className="absolute inset-0 bg-gradient-to-r from-[#050202] via-[#120703]/85 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,_rgba(255,87,34,0.25),_transparent_55%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col-reverse gap-12 px-6 py-20 lg:flex-row lg:items-center lg:gap-16 lg:px-10 lg:py-28">
        <div className="flex-1 space-y-10">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.65em] text-orange-200">High life sound system</p>
            <h1 className="text-5xl md:text-6xl font-black leading-tight">
              Lets Go <span className="text-orange-300">KlubN</span>
            </h1>
            <p className="text-lg text-gray-200 max-w-2xl">
              Culture-forward bookings, immersive visuals, and the club technology powering tomorrow’s dance floors.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.4em]">
            <Link to="/events" className="px-8 py-3 rounded-full bg-white text-black">
              Discover Events
            </Link>
            <Link
              to="/tickets"
              className="px-8 py-3 rounded-full border border-white/40 text-white hover:bg-white/10 transition"
            >
              Secure Tickets
            </Link>
            <Link to="/contact" className="px-8 py-3 rounded-full border border-white/20 text-white/80 hover:text-white">
              Talk To Us
            </Link>
          </div>
          {highlight && (
            <div className="space-y-2 border-l-2 border-orange-500/70 pl-6 text-sm text-gray-300">
              <p className="uppercase tracking-[0.5em] text-orange-200">Next Event</p>
              <p className="text-lg text-white">{highlight.title}</p>
              <p>{highlight.description}</p>
              <p className="text-xs uppercase tracking-[0.4em] text-gray-400">
                {new Date(highlight.date).toLocaleDateString()} · {highlight.venue?.name ?? 'TBA'}
              </p>
            </div>
          )}
        </div>

        <div className="w-full max-w-sm space-y-6 lg:max-w-md">
          {activeShowcase ? (
            <>
              <div className="rounded-[1.4rem] border border-orange-200/25 bg-black/80 p-[1px] shadow-[0_15px_50px_rgba(255,68,0,0.25)] backdrop-blur">
                <Link to={activeShowcase.href} className="relative block rounded-[1.2rem] overflow-hidden min-h-[480px]">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: activeShowcase.image ? `url(${activeShowcase.image})` : undefined,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/75 to-black/95" />
                  <div className="relative z-10 flex h-full flex-col justify-between p-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.5em] text-orange-200">{activeShowcase.label}</p>
                      <h3 className="text-3xl font-semibold">{activeShowcase.title}</h3>
                    </div>
                    <div className="space-y-2 text-sm text-gray-200">
                      <p className="line-clamp-4">{activeShowcase.copy}</p>
                      {activeShowcase.meta && (
                        <p className="text-xs uppercase tracking-[0.4em] text-gray-400">{activeShowcase.meta}</p>
                      )}
                      <span className="inline-flex items-center gap-2 text-orange-300 text-xs uppercase tracking-[0.4em]">
                        Dive In →
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {showcaseItems.map((item, idx) => (
                    <button
                      key={`${item.label}-${idx}`}
                      type="button"
                      aria-label={`Show ${item.label}`}
                      onClick={() => setIndex(idx)}
                      className={`h-1.5 w-9 rounded-full transition ${
                        idx === safeIndex ? 'bg-orange-400' : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-3 text-xs uppercase tracking-[0.4em] text-gray-300">
                  <button type="button" onClick={() => setIndex(safeIndex - 1)} className="hover:text-white">
                    Prev
                  </button>
                  <button type="button" onClick={() => setIndex(safeIndex + 1)} className="hover:text-white">
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-[1.4rem] border border-orange-200/25 bg-black/80 p-[1px] shadow-[0_15px_50px_rgba(255,68,0,0.25)] backdrop-blur">
              <div className="relative block rounded-[1.2rem] overflow-hidden min-h-[480px]">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${featuredImage})` }} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/75 to-black/95" />
                <div className="relative z-10 flex h-full flex-col justify-end space-y-2 p-6">
                  <p className="text-xs uppercase tracking-[0.5em] text-orange-200">Spotlight</p>
                  <h3 className="text-3xl font-semibold">New experiences loading…</h3>
                  <p className="text-sm text-gray-300">Hang tight while we source the latest drops.</p>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-4 border border-white/15 rounded-xl px-5 py-4 bg-black/60 backdrop-blur">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-[0.65rem] uppercase tracking-[0.5em] text-orange-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const LandingPage = () => {
  const { data, loading, error } = useQuery(GET_LANDING_DATA);
  const events = data?.landing?.events ?? [];
  const djs = data?.landing?.dJs ?? [];
  const featuredImageFallback = '/media/sections/hero/KlubN12.07 screen (1) copy.png';

  const highlightEvent = events[0];
  const latestDrops = events.slice(0, 3);
  const heroStats = [
    { label: 'Active Shows', value: events.length || 18 },
    { label: 'Resident DJs', value: djs.length || 42 },
    { label: 'Cities Live', value: 12 },
  ];
  const featureTiles = latestDrops.length ? latestDrops : djs.slice(0, 3);
  const featuredDjs = djs.slice(0, 4);
  const galleryPreview = events.slice(0, 5);

  const trendingDj = djs[0];
  const heroShowcaseItems = useMemo(() => {
    const items: ShowcaseItem[] = [];
    if (highlightEvent) {
      items.push({
        label: 'Events',
        title: highlightEvent.title,
        copy: highlightEvent.description,
        meta: `${new Date(highlightEvent.date).toLocaleDateString()} · ${highlightEvent.venue?.name ?? 'TBA'}`,
        href: `/events/${highlightEvent.id}`,
        image: highlightEvent.imageUrl ?? featuredImageFallback,
      });
    }
    if (trendingDj) {
      items.push({
        label: 'Hottest DJ',
        title: trendingDj.stageName ?? trendingDj.name,
        copy: trendingDj.bio,
        meta: 'Sound Architects · Weekly residency',
        href: `/djs/${trendingDj.id}`,
        image: trendingDj.profilePictureUrl ?? highlightEvent?.imageUrl ?? featuredImageFallback,
      });
    }
    items.push({
      label: 'Playlist Drop',
      title: 'Afterhours Pulse',
      copy: 'A 2am blend of electro, breaks, and left-field club cuts.',
      meta: 'Curated by Lets Go KlubN',
      href: '/gallery',
      image: featuredImageFallback,
    });
    const galleryHeadline = galleryPreview.find((item: any) => item?.imageUrl) ?? highlightEvent;
    if (galleryHeadline) {
      items.push({
        label: 'Best of Gallery',
        title: galleryHeadline.title ?? 'Gallery Drop',
        copy: galleryHeadline.description ?? 'High-definition snapshots from neon-lit dance floors.',
        meta: 'Shot live on-site',
        href: galleryHeadline.id ? `/events/${galleryHeadline.id}` : '/gallery',
        image: galleryHeadline.imageUrl ?? featuredImageFallback,
      });
    }
    if (!items.length) {
      items.push({
        label: 'Spotlight',
        title: 'Stay tuned',
        copy: 'Bookings and gallery drops update here as soon as they go live.',
        href: '/events',
        image: featuredImageFallback,
      });
    }
    return items;
  }, [galleryPreview, highlightEvent, trendingDj]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center space-y-2">
        <p className="text-orange-400 text-lg">Unable to load the showcase</p>
        <p className="text-gray-500 text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1c0b02] via-[#080505] to-black text-white">
      <HeroSection highlight={highlightEvent} stats={heroStats} showcaseItems={heroShowcaseItems} />

      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-12 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.5em] text-orange-500">Behind the Designs</p>
            <h2 className="text-4xl font-bold leading-tight mt-2">Shaping Experiences That Make Life Simpler (and Louder)</h2>
          </div>
          <p className="text-gray-300 lg:max-w-xl">
            We obsess over tactile merch, playlist-ready photography, and a frictionless fan journey. Browse the latest environments we’re staging this season.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestDrops.map((event: any) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="tile h-[420px] flex flex-col"
              style={
                event.imageUrl
                  ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.9)), url(${event.imageUrl})` }
                  : undefined
              }
            >
              <div className="tile-content p-6 flex flex-col justify-end space-y-3">
                <p className="text-xs uppercase tracking-[0.5em] text-gray-300">
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <h3 className="text-2xl font-semibold">{event.title}</h3>
                <p className="text-gray-200/80 text-sm line-clamp-3">{event.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <span>{event.venue?.name ?? 'TBA'}</span>
                  <span className="text-orange-300 font-semibold">${event.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-10 pb-16 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.5em] text-orange-500">Visual Essays</p>
            <h2 className="text-3xl font-bold mt-2">Tactile Moments for Every Drop</h2>
          </div>
          <Link to="/gallery" className="px-8 py-3 rounded-full bg-white text-black font-semibold tracking-wide">
            View Gallery
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureTiles.map((tile: any, idx: number) => (
            <Link
              key={`${tile.id ?? idx}-tile`}
              to={tile.id ? `/events/${tile.id}` : '/gallery'}
              className="tile h-[360px] flex flex-col"
              style={
                tile.imageUrl
                  ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.9)), url(${tile.imageUrl})` }
                  : undefined
              }
            >
              <div className="tile-content p-6 flex flex-col justify-end space-y-2">
                <p className="text-xs uppercase tracking-[0.5em] text-gray-300">Feature</p>
                <h3 className="text-2xl font-semibold">{tile.title ?? tile.name ?? 'New Editorial'}</h3>
                <p className="text-gray-300 text-sm line-clamp-3">
                  {tile.description ?? tile.bio ?? 'Stories from the booth and beyond.'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-10 pb-24">
        <NewsletterSignup />
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-10 pb-16 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.5em] text-orange-500">Residents</p>
            <h2 className="text-3xl font-bold mt-2">DJs Curating the Movement</h2>
          </div>
          <Link to="/djs" className="px-6 py-2 rounded-full border border-white/20 text-white text-sm tracking-[0.3em] uppercase">
            Meet the roster
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDjs.map((dj: any) => (
            <Link key={dj.id} to={`/djs/${dj.id}`} className="tile h-[280px]">
              <div className="tile-content p-6 flex flex-col space-y-3">
                <div className="h-14 w-14 rounded-xl bg-white/10 flex items-center justify-center text-xl font-bold text-white/70">
                  {dj.stageName?.[0] ?? dj.name?.[0] ?? 'DJ'}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Stage Name</p>
                  <p className="text-xl font-semibold text-white">{dj.stageName ?? dj.name}</p>
                </div>
                <p className="text-gray-300 text-sm line-clamp-4">{dj.bio}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-10 pb-24 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.5em] text-orange-500">Gallery</p>
            <h2 className="text-3xl font-bold mt-2">Snapshots from the Floor</h2>
          </div>
          <Link to="/gallery" className="px-6 py-2 rounded-full border border-white/20 text-white text-sm tracking-[0.3em] uppercase">
            Open gallery
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryPreview.map((item: any, index: number) => (
            <Link
              key={`${item.id}-${index}`}
              to={`/events/${item.id}`}
              className={`tile h-48 ${index === 0 ? 'md:col-span-2 md:row-span-2 md:h-[420px]' : ''}`}
              style={
                item.imageUrl
                  ? { backgroundImage: `linear-gradient(200deg, rgba(0,0,0,0.2), rgba(0,0,0,0.9)), url(${item.imageUrl})` }
                  : undefined
              }
            >
              <div className="tile-content p-4 flex items-end text-white text-sm font-semibold">{item.title}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
