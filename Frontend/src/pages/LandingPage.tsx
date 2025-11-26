import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_LANDING_DATA } from '../graphql/queries';
import NewsletterSignup from '../components/common/NewsletterSignup';
import GallerySlideshow from '../components/gallery/GallerySlideshow';
import { useSiteSettings } from '../context/SiteSettingsContext';

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
  siteSettings,
}: {
  highlight?: any;
  stats: { label: string; value: number }[];
  showcaseItems: ShowcaseItem[];
  siteSettings: {
    heroTitle?: string;
    heroSubtitle?: string;
    heroCtaText?: string;
    heroCtaLink?: string;
    heroBackgroundImageUrl?: string;
    heroBackgroundVideoUrl?: string;
    heroOverlayOpacity?: number;
    tagline?: string;
  };
}) => {
  const [activeShowcaseIndex, setActiveShowcaseIndex] = useState(0);
  const hasShowcase = showcaseItems.length > 0;
  const safeIndex = hasShowcase
    ? ((activeShowcaseIndex % showcaseItems.length) + showcaseItems.length) % showcaseItems.length
    : 0;
  const activeShowcase = hasShowcase ? showcaseItems[safeIndex] : undefined;
  const featuredImage =
    highlight?.imageUrl ?? siteSettings.heroBackgroundImageUrl ?? '/media/sections/hero/KlubN12.07 screen (1) copy.png';

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
    <section className="relative isolate flex min-h-[80vh] w-full flex-col justify-center overflow-hidden bg-black text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={featuredImage}
      >
        {[siteSettings.heroBackgroundVideoUrl, '/media/hero/0721-copy.mp4', '/media/sections/hero/0721-copy.mp4']
          .filter(Boolean)
          .map((src) => (
            <source key={src} src={src as string} type="video/mp4" />
          ))}
      </video>
      <div
        className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent"
        style={{ opacity: siteSettings.heroOverlayOpacity ?? 0.95 }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,_rgba(255,87,34,0.25),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent via-black/40 to-black" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col-reverse gap-8 px-6 py-12 lg:flex-row lg:items-center lg:gap-12 lg:px-8 lg:py-16">
        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            {siteSettings.tagline && (
              <p className="text-xs font-medium tracking-wider text-orange-400 uppercase">{siteSettings.tagline}</p>
            )}
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight">
              {siteSettings.heroTitle ?? (
                <>
                  Your Night.<br />Your Music.<br /><span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">Your KlubN.</span>
                </>
              )}
            </h1>
            <p className="text-lg text-gray-300 max-w-xl leading-relaxed">
              {siteSettings.heroSubtitle ??
                'Book tickets to exclusive DJ events, discover new artists, and be part of the underground electronic music scene.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={siteSettings.heroCtaLink || '/events'}
              className="px-6 py-3 text-sm rounded-full bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 text-white font-semibold hover:from-orange-500 hover:via-red-500 hover:to-orange-600 transition-all shadow-lg shadow-orange-600/30 hover:shadow-orange-500/50"
            >
              {siteSettings.heroCtaText || 'Explore Events'}
            </Link>
            <Link
              to="/djs"
              className="px-6 py-3 text-sm rounded-full border-2 border-orange-600/60 text-orange-300 font-semibold hover:border-orange-500 hover:bg-orange-600/20 transition-all shadow-lg shadow-orange-600/20"
            >
              View Artists
            </Link>
          </div>
          {highlight && (
            <div className="space-y-2 border-l-4 border-orange-500 pl-4 py-2 bg-gradient-to-r from-orange-950/40 via-red-950/30 to-transparent rounded-r">
              <p className="text-[0.65rem] font-semibold tracking-wide text-orange-400 uppercase">Next Event</p>
              <p className="text-base font-semibold text-white">{highlight.title}</p>
              <p className="text-xs text-gray-400 line-clamp-2">{highlight.description}</p>
              <p className="text-[0.65rem] text-orange-300/70">
                {new Date(highlight.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {highlight.venue?.name ?? 'Venue TBA'}
              </p>
            </div>
          )}
        </div>

        <div className="w-full max-w-sm space-y-4 lg:max-w-md">
          {activeShowcase ? (
            <>
              <div className="group rounded-xl border border-orange-600/30 bg-gradient-to-br from-zinc-900/80 to-black/90 overflow-hidden backdrop-blur-sm hover:border-orange-500/60 transition-all shadow-lg shadow-orange-900/20">
                <Link to={activeShowcase.href} className="relative block h-[360px]">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage: activeShowcase.image ? `url(${activeShowcase.image})` : undefined,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-orange-950/30 to-black/95" />
                  <div className="relative z-10 flex h-full flex-col justify-between p-5">
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-orange-400">{activeShowcase.label}</p>
                      <h3 className="text-xl font-bold mt-1 text-white group-hover:text-orange-300 transition-colors">{activeShowcase.title}</h3>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">{activeShowcase.copy}</p>
                      {activeShowcase.meta && (
                        <p className="text-[0.65rem] text-orange-400/60">{activeShowcase.meta}</p>
                      )}
                      <span className="inline-flex items-center gap-2 text-orange-400 text-xs font-semibold group-hover:gap-3 group-hover:text-orange-300 transition-all">
                        Learn More →
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="flex items-center justify-between px-1">
                <div className="flex gap-1.5">
                  {showcaseItems.map((item, idx) => (
                    <button
                      key={`${item.label}-${idx}`}
                      type="button"
                      aria-label={`Show ${item.label}`}
                      onClick={() => setIndex(idx)}
                      className={`h-1 rounded-full transition-all ${
                        idx === safeIndex ? 'w-8 bg-gradient-to-r from-orange-500 to-red-600' : 'w-6 bg-white/20 hover:bg-orange-600/40'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-3 text-xs text-gray-400">
                  <button type="button" onClick={() => setIndex(safeIndex - 1)} className="hover:text-orange-400 transition">
                    Prev
                  </button>
                  <button type="button" onClick={() => setIndex(safeIndex + 1)} className="hover:text-orange-400 transition">
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-orange-600/30 bg-gradient-to-br from-zinc-900/80 to-black/90 overflow-hidden backdrop-blur-sm shadow-lg shadow-orange-900/20">
              <div className="relative block h-[360px]">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${featuredImage})` }} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-orange-950/30 to-black/95" />
                <div className="relative z-10 flex h-full flex-col justify-end space-y-2 p-5">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-orange-400">Coming Soon</p>
                  <h3 className="text-xl font-bold">New Events Loading</h3>
                  <p className="text-xs text-gray-300">Stay tuned for upcoming shows and exclusive DJ performances.</p>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-4 border border-orange-600/30 rounded-xl px-4 py-4 bg-gradient-to-br from-orange-950/20 to-black/60 backdrop-blur-sm shadow-lg shadow-orange-900/20">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold bg-gradient-to-br from-orange-400 to-red-500 bg-clip-text text-transparent">{stat.value}</p>
                <p className="text-[0.6rem] uppercase tracking-wide text-orange-400/70 mt-0.5">{stat.label}</p>
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
  const { siteSettings } = useSiteSettings();
  const events = data?.landing?.events ?? [];
  const djs = data?.landing?.dJs ?? [];
  const featuredImageFallback =
    siteSettings.heroBackgroundImageUrl ?? '/media/sections/hero/KlubN12.07 screen (1) copy.png';

  const highlightEvent = events[0];
  const latestDrops = events.slice(0, 3);
  const heroStats = [
    { label: 'Active Shows', value: events.length || 18 },
    { label: 'Resident DJs', value: djs.length || 42 },
    { label: 'Cities Live', value: 12 },
  ];
  const defaultEventImage = siteSettings.defaultEventImageUrl ?? featuredImageFallback;
  const defaultDjImage = siteSettings.defaultDjImageUrl ?? '/media/defaults/dj.jpg';
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
        label: 'Featured Artist',
        title: trendingDj.stageName ?? trendingDj.name,
        copy: trendingDj.bio,
        meta: 'Resident DJ · Weekly Performances',
        href: `/djs/${trendingDj.id}`,
        image: trendingDj.profilePictureUrl ?? highlightEvent?.imageUrl ?? featuredImageFallback,
      });
    }
    items.push({
      label: 'Featured Mix',
      title: 'Afterhours Pulse',
      copy: 'A 2AM blend of electro, breaks, and left-field club cuts. Perfect for late-night sessions.',
      meta: 'Curated by KlubN Residents',
      href: '/gallery',
      image: featuredImageFallback,
    });
    const galleryHeadline = galleryPreview.find((item: any) => item?.imageUrl) ?? highlightEvent;
    if (galleryHeadline) {
      items.push({
        label: 'Event Gallery',
        title: galleryHeadline.title ?? 'Latest Moments',
        copy: galleryHeadline.description ?? 'Immersive visuals capturing the energy and atmosphere of our events.',
        meta: 'Professional Event Photography',
        href: galleryHeadline.id ? `/events/${galleryHeadline.id}` : '/gallery',
        image: galleryHeadline.imageUrl ?? featuredImageFallback,
      });
    }
    if (!items.length) {
      items.push({
        label: 'Coming Soon',
        title: 'Stay Tuned',
        copy: 'New events, DJ lineups, and exclusive content coming soon. Check back for updates.',
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
    <div className="min-h-screen bg-gradient-to-b from-[#121016] via-[#0c0c12] to-[#0a0a10] text-white">
      <HeroSection
        highlight={highlightEvent}
        stats={heroStats}
        showcaseItems={heroShowcaseItems}
        siteSettings={siteSettings}
      />

      {/* Upcoming Events Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">Upcoming Events</p>
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
              What's On<br /><span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">This Month</span>
            </h2>
          </div>
          <p className="text-sm text-gray-400 lg:max-w-md leading-relaxed">
            From intimate club nights to massive warehouse raves.
          </p>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {latestDrops.map((event: any) => {
            return (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="group block rounded-xl border border-orange-600/30 bg-gradient-to-br from-zinc-900/70 to-black/80 overflow-hidden hover:border-orange-500/60 transition-all shadow-lg shadow-orange-900/20 neon-red-hover"
              >
                <div className="flex flex-col">
                  <div className="relative overflow-hidden aspect-[16/9] min-h-[220px]">
                    <img
                      src={event.imageUrl ?? defaultEventImage}
                      alt={event.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.35),transparent_60%)]" />
                  </div>

                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div className="space-y-2">
                      <div>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-orange-400/80 mb-1">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                          {event.title}
                        </h3>
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{event.description}</p>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-br from-orange-950/30 to-black/60 border border-orange-600/20">
                        <div>
                          <p className="text-[0.6rem] font-medium text-orange-400/60">Venue</p>
                          <p className="text-xs text-white font-semibold mt-0.5 line-clamp-1">{event.venue?.name ?? 'TBA'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[0.6rem] font-medium text-orange-400/60">Price</p>
                          <p className="text-lg font-bold bg-gradient-to-br from-orange-400 to-red-500 bg-clip-text text-transparent mt-0.5">
                            ${event.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Stats & Trust Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="rounded-xl border border-orange-600/30 bg-gradient-to-br from-orange-950/20 via-zinc-900/40 to-black/50 p-6 shadow-lg shadow-orange-900/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center space-y-1">
              <p className="text-3xl font-bold bg-gradient-to-br from-orange-400 to-red-500 bg-clip-text text-transparent">{events.length || 24}</p>
              <p className="text-xs text-orange-400/70">Active Events</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-3xl font-bold bg-gradient-to-br from-orange-400 to-red-500 bg-clip-text text-transparent">{djs.length || 42}</p>
              <p className="text-xs text-orange-400/70">Featured DJs</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-3xl font-bold bg-gradient-to-br from-orange-400 to-red-500 bg-clip-text text-transparent">12</p>
              <p className="text-xs text-orange-400/70">Cities</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-3xl font-bold bg-gradient-to-br from-orange-400 to-red-500 bg-clip-text text-transparent">24/7</p>
              <p className="text-xs text-orange-400/70">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured DJs Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">Featured Artists</p>
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">The Lineup</span>
            </h2>
          </div>
          <Link
            to="/djs"
            className="inline-flex items-center gap-2 px-5 py-2 text-sm rounded-full border-2 border-orange-600/60 text-orange-300 font-semibold hover:border-orange-500 hover:bg-orange-600/20 transition-all shadow-lg shadow-orange-600/20"
          >
            View All Artists →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredDjs.map((dj: any) => {
            return (
              <Link
                key={dj.id}
                to={`/djs/${dj.id}`}
                className="group block rounded-xl border border-orange-600/30 bg-gradient-to-br from-zinc-900/70 to-black/80 overflow-hidden hover:border-orange-500/60 transition-all shadow-lg shadow-orange-900/20"
              >
                <div className="flex flex-col h-[320px]">
                  <div className="relative overflow-hidden h-40">
                    <img
                      src={dj.profilePictureUrl ?? dj.coverImageUrl ?? defaultDjImage}
                      alt={dj.stageName ?? dj.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-950/40 via-black/30 to-transparent" />
                  </div>

                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div className="space-y-2">
                      <div>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-orange-400/80">Artist</p>
                        <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors mt-1 line-clamp-1">
                          {dj.stageName ?? dj.name}
                        </h3>
                        {dj.tagline && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{dj.tagline}</p>}
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{dj.bio}</p>

                      <div className="flex flex-wrap gap-1.5">
                        {(dj.genre ?? '')
                          .split(',')
                          .slice(0, 2)
                          .map((genre: string) => (
                            <span
                              key={`${dj.id}-${genre.trim()}`}
                              className="px-2 py-0.5 rounded-full text-[0.6rem] font-medium bg-gradient-to-r from-orange-950/50 to-red-950/50 text-orange-300 border border-orange-600/30"
                            >
                              {genre.trim()}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Testimonial/Quote Section */}
      <section className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
        <div className="rounded-xl border border-orange-600/30 bg-gradient-to-br from-orange-950/20 via-zinc-900/40 to-black/50 p-8 text-center space-y-4 shadow-lg shadow-orange-900/20">
          <p className="text-xl md:text-2xl font-medium text-white/95 max-w-2xl mx-auto leading-relaxed">
            "Every night is a new experience. From intimate basement sets to main stage moments — this is where music comes alive."
          </p>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-orange-400">The KlubN Experience</p>
            <p className="text-[0.65rem] text-orange-400/50">Join thousands of music lovers</p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 space-y-8">
        <div className="text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">Gallery</p>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">Captured Moments</span>
          </h2>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Real nights, real energy. See what goes down when the lights drop.
          </p>
        </div>
        <GallerySlideshow />
      </section>

      {/* Music Discovery Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">Listen Now</p>
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">Mixes & Sets</span>
            </h2>
          </div>
          <p className="text-sm text-gray-400 lg:max-w-md leading-relaxed">
            Stream curated mixes from our resident DJs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* First Mix */}
          <Link
            to="/gallery"
            className="group block rounded-xl border border-orange-600/30 bg-gradient-to-br from-zinc-900/70 to-black/80 overflow-hidden hover:border-orange-500/60 transition-all shadow-lg shadow-orange-900/20"
          >
            <div className="flex flex-col h-[300px]">
              <div className="relative overflow-hidden h-32">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                  style={{ backgroundImage: `url(${featuredImageFallback})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-950/40 via-black/30 to-transparent" />
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-orange-400/80">Weekly Mix</p>
                  <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors">
                    Afterhours Pulse
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                    Late-night electro and breaks for those 2AM moments.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-orange-400 text-xs font-semibold">
                  Listen Now →
                </span>
              </div>
            </div>
          </Link>

          {/* Second Mix */}
          <Link
            to="/gallery"
            className="group block rounded-xl border border-orange-600/30 bg-gradient-to-br from-zinc-900/70 to-black/80 overflow-hidden hover:border-orange-500/60 transition-all shadow-lg shadow-orange-900/20"
          >
            <div className="flex flex-col h-[300px]">
              <div className="relative overflow-hidden h-32">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                  style={{ backgroundImage: `url(${featuredImageFallback})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-950/40 via-black/30 to-transparent" />
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-orange-400/80">Live Set</p>
                  <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors">
                    Peak Hour Sessions
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                    High-energy techno and house from the dancefloor.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-orange-400 text-xs font-semibold">
                  Listen Now →
                </span>
              </div>
            </div>
          </Link>

          {/* Third Mix */}
          <Link
            to="/gallery"
            className="group block rounded-xl border border-orange-600/30 bg-gradient-to-br from-zinc-900/70 to-black/80 overflow-hidden hover:border-orange-500/60 transition-all shadow-lg shadow-orange-900/20"
          >
            <div className="flex flex-col h-[300px]">
              <div className="relative overflow-hidden h-32">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                  style={{ backgroundImage: `url(${featuredImageFallback})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-950/40 via-black/30 to-transparent" />
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-orange-400/80">Underground</p>
                  <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors">
                    Deep Cuts
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                    Hidden gems from the underground scene.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-orange-400 text-xs font-semibold">
                  Listen Now →
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Newsletter CTA Section */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        <NewsletterSignup />
      </section>
    </div>
  );
};

export default LandingPage;
