import { useEffect, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { ArrowUpRight, CalendarDays, Disc3, Headphones, Mail, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GET_DJ_MIXES, GET_LANDING_DATA } from '../graphql/queries';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import './DJDipPortfolioPage.css';

type LandingEvent = {
  id: string;
  title: string;
  description?: string;
  date?: string;
  price?: number;
  imageUrl?: string;
  venue?: { name?: string };
};

type LandingDj = {
  id: string;
  name?: string;
  stageName?: string;
  bio?: string;
  genre?: string;
  profilePictureUrl?: string;
  coverImageUrl?: string;
  followerCount?: number;
};

type Mix = {
  id: string;
  title: string;
  description?: string;
  mixUrl?: string;
  genre?: string;
  mixType?: string;
};

const portraits = [
  '/media/sections/djs/IMG_9581.JPG',
  '/media/sections/djs/IMG_0554 (1).jpg',
  '/media/sections/djs/IMG_2837.JPG',
];

const galleryFallback = [
  '/media/sections/djs/IMG_9581.JPG',
  '/media/sections/events/KlubN12.07 screen (1) copy.png',
  '/media/sections/djs/IMG_0554 (1).jpg',
  '/media/sections/djs/IMG_2837.JPG',
];

const clip = (value?: string, max = 140) =>
  value ? (value.length > max ? `${value.slice(0, max).trimEnd()}...` : value) : '';

const splitGenres = (value?: string) =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const posterDate = (value?: string) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return { day: '00', month: '00', label: 'LIVE NOW' };

  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase(),
  };
};

const eventMeta = (event?: LandingEvent) => {
  if (!event?.date) return event?.venue?.name ?? '';

  const date = new Date(event.date);
  if (Number.isNaN(date.getTime())) return event.venue?.name ?? '';

  return [date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }), event.venue?.name]
    .filter(Boolean)
    .join(' / ');
};

const eventPrice = (value?: number) =>
  value == null
    ? ''
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

const DJDipPortfolioPage = () => {
  const reducedMotion = useReducedMotion();
  const { data: landingData } = useQuery(GET_LANDING_DATA);
  const { data: mixesData } = useQuery(GET_DJ_MIXES);
  const { siteSettings } = useSiteSettings();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'DJ DiP';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const events: LandingEvent[] = landingData?.landing?.events ?? [];
  const djs: LandingDj[] = landingData?.landing?.dJs ?? [];
  const mixes: Mix[] = mixesData?.djMixes ?? [];

  const leadDj = djs[0];
  const supportDj = djs[1];
  const leadEvent = events[0];
  const secondaryEvent = events[1];
  const featureMix = mixes[0];
  const date = posterDate(leadEvent?.date);

  const leadName = leadDj?.stageName || leadDj?.name || 'DJ DiP';
  const supportName = supportDj?.stageName || supportDj?.name || 'Events';
  const heroCopy = clip(leadDj?.bio || leadEvent?.description || siteSettings.tagline, 148);
  const heroGenres = unique([
    ...splitGenres(leadDj?.genre),
    ...splitGenres(supportDj?.genre),
    ...splitGenres(siteSettings.heroGenres),
  ]).slice(0, 6);

  const galleryFrames = useMemo(
    () =>
      unique([
        leadDj?.profilePictureUrl ?? '',
        supportDj?.profilePictureUrl ?? '',
        leadEvent?.imageUrl ?? '',
        secondaryEvent?.imageUrl ?? '',
        ...galleryFallback,
      ]).slice(0, 5),
    [leadDj?.profilePictureUrl, leadEvent?.imageUrl, secondaryEvent?.imageUrl, supportDj?.profilePictureUrl],
  );

  const socials = [
    { label: 'Instagram', url: siteSettings.instagramUrl },
    { label: 'TikTok', url: siteSettings.tikTokUrl },
    { label: 'YouTube', url: siteSettings.youTubeUrl },
    { label: 'SoundCloud', url: siteSettings.soundCloudUrl },
    { label: 'Twitter', url: siteSettings.twitterUrl },
  ].filter((item) => Boolean(item.url));

  const stats = [
    { label: 'DJs', value: String(Math.max(djs.length, 1)).padStart(2, '0') },
    { label: 'Events', value: String(Math.max(events.length, 1)).padStart(2, '0') },
    { label: 'Mixes', value: String(Math.max(mixes.length, 1)).padStart(2, '0') },
    { label: 'Gallery', value: String(Math.max(galleryFrames.length, 1)).padStart(2, '0') },
  ];

  return (
    <div className={`djdip-portfolio ${reducedMotion ? 'djdip-portfolio--reduced' : ''}`}>
      <div className="djdip-ambient djdip-ambient--one" />
      <div className="djdip-ambient djdip-ambient--two" />
      <div className="djdip-grid-lines" />

      <main className="djdip-shell">
        <header className="djdip-topbar">
          <a href="#top" className="djdip-brandmark"><span className="djdip-brandmark__square" /><span className="djdip-brandmark__label">DJ DiP</span></a>
          <nav className="djdip-nav">{['DJs', 'Events', 'Mixes', 'Gallery', 'Contact'].map((label) => <a key={label} href={`#${label.toLowerCase()}`} className="djdip-nav__link">{label}</a>)}</nav>
        </header>

        <section className="djdip-hero" id="top">
          <div className="djdip-poster">
            <aside className="djdip-meta-card">
              <div>
                <p className="djdip-eyebrow">{siteSettings.heroLocation || 'Portfolio'}</p>
                <div className="djdip-signal-lines" aria-hidden="true"><span /><span /><span /></div>
              </div>
              <div className="djdip-token-wrap">{heroGenres.map((genre) => <span key={genre} className="djdip-token">{genre}</span>)}</div>
              <div className="djdip-meta-links">
                <a href="#events" className="djdip-card-link"><span>Events</span><ArrowUpRight size={16} /></a>
                <a href="#mixes" className="djdip-card-link"><span>Mixes</span><ArrowUpRight size={16} /></a>
              </div>
            </aside>

            <figure className="djdip-secondary-shot">
              <img src={supportDj?.profilePictureUrl || secondaryEvent?.imageUrl || portraits[1]} alt={supportName} loading="eager" />
              <figcaption className="djdip-caption">{supportName}</figcaption>
            </figure>

            <figure className="djdip-main-shot">
              <img src={leadDj?.coverImageUrl || leadDj?.profilePictureUrl || leadEvent?.imageUrl || portraits[0]} alt={leadName} loading="eager" />
              <div className="djdip-overlay-card">
                <p>{heroCopy}</p>
                <div className="djdip-overlay-date"><span>{date.day}</span><span>{date.month}</span></div>
              </div>
            </figure>

            <aside className="djdip-rail">
              <div className="djdip-rail__squares" aria-hidden="true"><span /><span /><span /></div>
              <p className="djdip-vertical-label">DJ DI P</p>
              <div className="djdip-rail__meta"><span>{date.label}</span><span>{eventMeta(leadEvent)}</span></div>
            </aside>

            <div className="djdip-lockup">
              <p className="djdip-lockup__outline">DJ DiP</p>
              <p className="djdip-lockup__fill">{leadName}</p>
            </div>
          </div>
        </section>

        <section className="djdip-stat-band">{stats.map((stat) => <article key={stat.label} className="djdip-stat-card"><p className="djdip-stat-card__value">{stat.value}</p><p className="djdip-stat-card__label">{stat.label}</p></article>)}</section>

        <section className="djdip-section" id="djs">
          <div className="djdip-section-heading"><p className="djdip-section-heading__kicker">{siteSettings.lineupHeading || 'The Lineup'}</p><h1 className="djdip-section-heading__title">{leadName}</h1></div>
          <div className="djdip-signal-grid">
            <article className="djdip-signal-card djdip-signal-card--dark">
              <p className="djdip-card-kicker">{siteSettings.cultureHeading || 'The Culture'}</p>
              <p className="djdip-copy">{heroCopy}</p>
              {leadDj?.id && <Link to={`/djs/${leadDj.id}`} className="djdip-card-link"><span>DJs</span><ArrowUpRight size={16} /></Link>}
            </article>
            <article className="djdip-signal-card">
              <p className="djdip-card-kicker">Mixes</p>
              <div className="djdip-list-row"><Disc3 size={16} /><span>{featureMix?.title || leadEvent?.title || leadName}</span></div>
              {featureMix?.description && <p className="djdip-copy">{clip(featureMix.description, 116)}</p>}
              {featureMix?.mixUrl && <a href={featureMix.mixUrl} target="_blank" rel="noreferrer" className="djdip-card-link"><span>Mixes</span><ArrowUpRight size={16} /></a>}
            </article>
            <article className="djdip-signal-card">
              <p className="djdip-card-kicker">Contact</p>
              <div className="djdip-contact-rows">{[siteSettings.contactEmail, siteSettings.contactPhone, siteSettings.contactAddress].filter(Boolean).map((row) => <span key={row}>{row}</span>)}</div>
              <div className="djdip-social-pills">{socials.slice(0, 4).map((item) => <a key={item.label} href={item.url!} target="_blank" rel="noreferrer" className="djdip-social-pill">{item.label}</a>)}</div>
            </article>
          </div>

          <div className="djdip-lineup-grid">
            {djs.slice(0, 4).map((dj, index) => (
              <article key={dj.id} className={`djdip-lineup-card djdip-lineup-card--${index + 1}`}>
                <div className="djdip-lineup-card__media"><img src={dj.coverImageUrl || dj.profilePictureUrl || portraits[index % portraits.length]} alt={dj.stageName || dj.name || 'DJ'} loading="lazy" /></div>
                <div className="djdip-lineup-card__body">
                  <p className="djdip-card-kicker">{(splitGenres(dj.genre)[0] || 'DJs').toUpperCase()}</p>
                  <h2>{dj.stageName || dj.name}</h2>
                  {dj.bio && <p className="djdip-copy">{clip(dj.bio, 118)}</p>}
                  <div className="djdip-card-meta"><span>{dj.followerCount ?? 0}</span><span>{splitGenres(dj.genre).slice(0, 2).join(' / ') || 'DJs'}</span></div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="djdip-split-section">
          <div className="djdip-split-panel" id="events">
            <div className="djdip-section-heading djdip-section-heading--compact"><p className="djdip-section-heading__kicker">{siteSettings.eventsHeading || 'Events'}</p><h2 className="djdip-section-heading__title">{leadEvent?.title || 'Events'}</h2></div>
            <div className="djdip-event-stack">
              {events.slice(0, 3).map((event, index) => {
                const itemDate = posterDate(event.date);
                return (
                  <article key={event.id} className="djdip-event-card">
                    <div className="djdip-event-card__date"><span>{itemDate.day}</span><span>{itemDate.month}</span></div>
                    <div className="djdip-event-card__content">
                      <div className="djdip-event-card__text"><p className="djdip-card-kicker">{eventMeta(event)}</p><h3>{event.title}</h3>{event.description && <p className="djdip-copy">{clip(event.description, 122)}</p>}</div>
                      <div className="djdip-event-card__footer"><span>{eventPrice(event.price) || event.venue?.name || 'Events'}</span><Link to={`/events/${event.id}`} className="djdip-card-link"><span>Events</span><ArrowUpRight size={16} /></Link></div>
                    </div>
                    <div className="djdip-event-card__media"><img src={event.imageUrl || galleryFallback[index % galleryFallback.length]} alt={event.title} loading="lazy" /></div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="djdip-split-panel" id="mixes">
            <div className="djdip-section-heading djdip-section-heading--compact"><p className="djdip-section-heading__kicker">Mixes</p><h2 className="djdip-section-heading__title">{featureMix?.title || 'Mixes'}</h2></div>
            <div className="djdip-mix-stack">
              {mixes.slice(0, 3).map((mix, index) => (
                <a key={mix.id} href={mix.mixUrl || '#mixes'} target={mix.mixUrl ? '_blank' : undefined} rel={mix.mixUrl ? 'noreferrer' : undefined} className="djdip-mix-card">
                  <div className="djdip-mix-card__icon">{index === 0 ? <Radio size={18} /> : <Headphones size={18} />}</div>
                  <div className="djdip-mix-card__content"><p className="djdip-card-kicker">{mix.mixType || mix.genre || 'Mixes'}</p><h3>{mix.title}</h3>{mix.description && <p className="djdip-copy">{clip(mix.description, 98)}</p>}</div>
                  <ArrowUpRight size={18} className="djdip-mix-card__arrow" />
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="djdip-section" id="gallery">
          <div className="djdip-section-heading djdip-section-heading--compact"><p className="djdip-section-heading__kicker">Gallery</p><h2 className="djdip-section-heading__title">{siteSettings.conceptHeading || 'Gallery'}</h2></div>
          <div className="djdip-gallery-grid">{galleryFrames.map((image, index) => <figure key={`${image}-${index}`} className={`djdip-gallery-tile djdip-gallery-tile--${index + 1}`}><img src={image} alt={`Gallery frame ${index + 1}`} loading="lazy" /></figure>)}</div>
        </section>

        <section className="djdip-contact-board" id="contact">
          <div className="djdip-contact-board__copy">
            <p className="djdip-section-heading__kicker">Contact</p>
            {siteSettings.contactEmail ? <a href={`mailto:${siteSettings.contactEmail}`} className="djdip-mail-link"><Mail size={18} /><span>{siteSettings.contactEmail}</span></a> : <p className="djdip-mail-link"><CalendarDays size={18} /><span>{siteSettings.contactAddress || 'Contact'}</span></p>}
          </div>
          <div className="djdip-contact-board__links">{socials.map((item) => <a key={item.label} href={item.url!} target="_blank" rel="noreferrer" className="djdip-contact-link"><span>{item.label}</span><ArrowUpRight size={16} /></a>)}</div>
        </section>
      </main>
    </div>
  );
};

export default DJDipPortfolioPage;
