import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { ArrowUpRight, CalendarDays, Disc3, Mail, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GET_DJ_MIXES, GET_FEATURED_GALLERY_MEDIA, GET_LANDING_DATA } from '../graphql/queries';
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

type GalleryMedia = {
  id: string;
  mediaUrl: string;
  mediaType: string;
  title?: string;
  thumbnailUrl?: string;
};

const clip = (value?: string, max = 160) =>
  value ? (value.length > max ? `${value.slice(0, max).trimEnd()}...` : value) : '';

const splitGenres = (value?: string) =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));
const isKlubnValue = (value?: string) => /klubn/i.test(value ?? '');

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
  if (Number.isNaN(date.getTime())) return event?.venue?.name ?? '';

  return [date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }), event.venue?.name]
    .filter(Boolean)
    .join(' / ');
};

const eventPrice = (value?: number) =>
  value == null
    ? ''
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(value);

const DJDipPortfolioPage = () => {
  const reducedMotion = useReducedMotion();
  const { data: landingData } = useQuery(GET_LANDING_DATA);
  const { data: mixesData } = useQuery(GET_DJ_MIXES);
  const { data: galleryData } = useQuery(GET_FEATURED_GALLERY_MEDIA);
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
  const galleryItems: GalleryMedia[] = (galleryData?.featuredGalleryMedia ?? []).filter(
    (m: GalleryMedia) => m.mediaType?.toLowerCase() === 'image' || m.mediaType?.toLowerCase() === 'photo',
  );

  const leadEvent = events[0];
  const heroDate = posterDate(leadEvent?.date);
  const heroPhrase = siteSettings.heroSubtitle || siteSettings.tagline || siteSettings.heroLocation || 'Feel The Frequency';
  const heroCopy = clip(siteSettings.heroSubtitle || siteSettings.tagline || leadEvent?.description, 170);
  const leadMeta = eventMeta(leadEvent) || eventPrice(leadEvent?.price) || siteSettings.heroLocation || 'Events';
  const safeContactEmail = isKlubnValue(siteSettings.contactEmail) ? '' : siteSettings.contactEmail;
  const contactLines = [safeContactEmail, siteSettings.contactPhone, siteSettings.contactAddress].filter(Boolean);
  const boardEvents = events.slice(0, 4);
  const boardMixes = mixes.slice(0, 3);
  const boardDjs = djs.slice(0, 6);

  const heroGenres = unique([
    ...splitGenres(siteSettings.heroGenres),
    ...djs.flatMap((dj) => splitGenres(dj.genre)),
    ...mixes.map((mix) => mix.genre ?? ''),
  ]).slice(0, 5);
  const stageTokens = (heroGenres.length ? heroGenres : ['DJ DiP']).slice(0, 3);
  const boardNames = unique(djs.map((dj) => dj.stageName || dj.name || '').filter(Boolean)).slice(0, 3);

  const galleryFrames = Array.from({ length: 4 }, (_, index) => ({
    index,
    media: galleryItems[index] ?? null,
  }));
  const flyerMarks = Array.from({ length: 4 }, (_, index) => index);

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
  ];

  return (
    <div className={`djdip-portfolio ${reducedMotion ? 'djdip-portfolio--reduced' : ''}`}>
      <div className="djdip-ambient djdip-ambient--one" />
      <div className="djdip-ambient djdip-ambient--two" />
      <div className="djdip-grid-lines" />

      <main className="djdip-shell">
        <header className="djdip-topbar">
          <a href="#top" className="djdip-brandmark">
            <span className="djdip-brandmark__square" />
            <span className="djdip-brandmark__label">DJ DiP</span>
          </a>

          <nav className="djdip-nav">
            {['DJs', 'Events', 'Mixes', 'Gallery', 'Contact'].map((label) => (
              <a key={label} href={`#${label.toLowerCase()}`} className="djdip-nav__link">
                {label}
              </a>
            ))}
          </nav>
        </header>

        <section className="djdip-board" id="top">
          <div className="djdip-title-block">
            <div className="djdip-title-plaque" aria-hidden="true">
              <span className="djdip-title-plaque__accent" />
              <span className="djdip-title-plaque__line" />
              <span className="djdip-title-plaque__line" />
              <span className="djdip-title-plaque__line" />
            </div>

            <p className="djdip-kicker">{siteSettings.lineupHeading || 'The Lineup'}</p>
            <h1>
              <span>DJ</span>
              <span>DiP</span>
            </h1>
            <p className="djdip-title-block__sub">{heroPhrase}</p>
          </div>

          <div className="djdip-top-meta">
            <article className="djdip-meta-block">
              <p className="djdip-card__label">{siteSettings.eventsHeading || 'Events'}</p>
              <h2>{leadEvent?.title || siteSettings.eventsHeading || 'Events'}</h2>
              <p className="djdip-meta-block__copy">{leadMeta}</p>
            </article>

            <article className="djdip-meta-block">
              <p className="djdip-card__label">{siteSettings.lineupHeading || 'The Lineup'}</p>
              <div className="djdip-meta-list">
                {(heroGenres.length ? heroGenres : ['DJ DiP']).map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          </div>

          <div className="djdip-left-stack">
            <article className="djdip-card djdip-card--culture">
              <p className="djdip-card__label">{siteSettings.cultureHeading || 'The Culture'}</p>

              <div className="djdip-profile-intro">
                <div className="djdip-profile-intro__identity">
                  <span className="djdip-profile-intro__photo" aria-hidden="true" />
                  <div className="djdip-profile-intro__nameblock">
                    <span className="djdip-profile-intro__name">DJ DiP</span>
                    <span className="djdip-profile-intro__phrase">{heroPhrase}</span>
                  </div>
                </div>

                <p className="djdip-profile-intro__bio">{heroCopy}</p>
              </div>

              <div className="djdip-stat-list">
                {stats.map((stat) => (
                  <div key={stat.label} className="djdip-stat-list__item">
                    <span className="djdip-stat-list__value">{stat.value}</span>
                    <span className="djdip-stat-list__label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="djdip-card djdip-card--gallery">
              <p className="djdip-card__label">Gallery</p>

              <Link to="/gallery" className="djdip-preview-card">
                <span className="djdip-preview-card__lines" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <span className="djdip-inline-link">
                  <span>Gallery</span>
                  <ArrowUpRight size={14} />
                </span>
              </Link>
            </article>

            <article className="djdip-card djdip-card--lineup">
              <p className="djdip-card__label">{siteSettings.lineupHeading || 'The Lineup'}</p>

              <div className="djdip-compact-list">
                {(boardNames.length ? boardNames : stageTokens).map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          </div>

          <figure className="djdip-stage">
            <div className="djdip-stage__backdrop" />
            <div className="djdip-stage__red-panel" aria-hidden="true" />

            <div className="djdip-stage__side-rail" aria-hidden="true">
              <span className="djdip-stage__side-label">DJ DiP</span>

              <div className="djdip-stage__side-marks">
                {flyerMarks.map((mark) => (
                  <span key={mark} className={mark % 2 === 0 ? 'is-filled' : undefined} />
                ))}
              </div>
            </div>

            <div className="djdip-stage__orbit" aria-hidden="true">
              <span>DJ DiP</span>
            </div>

            <div className="djdip-stage__date">
              <span>{heroDate.day}</span>
              <span>{heroDate.month}</span>
              <span className="djdip-stage__date-label">{heroDate.label}</span>
            </div>

            <div className="djdip-stage__caption">
              <p className="djdip-stage__caption-label">{siteSettings.eventsHeading || 'Events'}</p>
              <p className="djdip-stage__caption-copy">{heroCopy}</p>
              <p className="djdip-stage__caption-meta">{leadMeta}</p>
            </div>

            <div className="djdip-stage__outline" aria-hidden="true">
              <span>DJ</span>
              <span>DiP</span>
            </div>
          </figure>

          <article className="djdip-journey-card">
            <div className="djdip-journey-section" id="events">
              <p className="djdip-card__label">{siteSettings.eventsHeading || 'Events'}</p>

              <div className="djdip-journey-list">
                {boardEvents.length ? (
                  boardEvents.map((event) => (
                    <Link key={event.id} to={`/events/${event.id}`} className="djdip-journey-item">
                      <span className="djdip-journey-item__title">{event.title}</span>
                      <span className="djdip-journey-item__meta">{eventMeta(event) || eventPrice(event.price) || 'Events'}</span>
                    </Link>
                  ))
                ) : (
                  <div className="djdip-journey-item">
                    <span className="djdip-journey-item__title">{siteSettings.eventsHeading || 'Events'}</span>
                    <span className="djdip-journey-item__meta">{leadMeta}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="djdip-journey-section" id="mixes">
              <p className="djdip-card__label">Mixes</p>

              <div className="djdip-journey-list">
                {boardMixes.length ? (
                  boardMixes.map((mix, index) => (
                    <a
                      key={mix.id}
                      href={mix.mixUrl || '#mixes'}
                      target={mix.mixUrl ? '_blank' : undefined}
                      rel={mix.mixUrl ? 'noreferrer' : undefined}
                      className="djdip-journey-item djdip-journey-item--mix"
                    >
                      <span className="djdip-journey-item__icon">{index === 0 ? <Radio size={14} /> : <Disc3 size={14} />}</span>
                      <span className="djdip-journey-item__body">
                        <span className="djdip-journey-item__title">{mix.title}</span>
                        <span className="djdip-journey-item__meta">{mix.mixType || mix.genre || 'Mixes'}</span>
                      </span>
                    </a>
                  ))
                ) : (
                  <div className="djdip-journey-item djdip-journey-item--mix">
                    <span className="djdip-journey-item__icon">
                      <Disc3 size={14} />
                    </span>
                    <span className="djdip-journey-item__body">
                      <span className="djdip-journey-item__title">Mixes</span>
                      <span className="djdip-journey-item__meta">{stageTokens.join(' / ')}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </article>

          <div className="djdip-contact-row" id="contact">
            <div className="djdip-contact-row__details">
              {safeContactEmail ? (
                <a href={`mailto:${safeContactEmail}`} className="djdip-contact-row__link">
                  <Mail size={14} />
                  <span>{safeContactEmail}</span>
                </a>
              ) : (
                <span className="djdip-contact-row__link">
                  <CalendarDays size={14} />
                  <span>{siteSettings.contactAddress || 'Contact'}</span>
                </span>
              )}

              {contactLines
                .filter((line) => line !== safeContactEmail)
                .map((line) => (
                  <span key={line} className="djdip-contact-row__text">
                    {line}
                  </span>
                ))}
            </div>

            <div className="djdip-contact-row__socials">
              {socials.slice(0, 5).map((item) => (
                <a key={item.label} href={item.url!} target="_blank" rel="noreferrer" className="djdip-contact-pill">
                  <span>{item.label}</span>
                  <ArrowUpRight size={12} />
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="djdip-secondary">
          <section className="djdip-panel djdip-panel--roster" id="djs">
            <div className="djdip-panel__head">
              <p className="djdip-kicker">{siteSettings.lineupHeading || 'The Lineup'}</p>
              <h2>DJs</h2>
            </div>

            <div className="djdip-roster">
              {boardDjs.length ? (
                boardDjs.map((dj, index) => (
                  <article key={dj.id} className="djdip-roster__item">
                    <span className="djdip-roster__index">{String(index + 1).padStart(2, '0')}</span>

                    <div className="djdip-roster__body">
                      <h3>{dj.stageName || dj.name}</h3>
                      <p>{splitGenres(dj.genre).slice(0, 2).join(' / ') || 'DJs'}</p>
                    </div>

                    <Link to={`/djs/${dj.id}`} className="djdip-inline-link">
                      <span>DJs</span>
                      <ArrowUpRight size={14} />
                    </Link>
                  </article>
                ))
              ) : (
                <article className="djdip-roster__item">
                  <span className="djdip-roster__index">01</span>

                  <div className="djdip-roster__body">
                    <h3>DJ DiP</h3>
                    <p>{stageTokens.slice(0, 2).join(' / ') || 'DJs'}</p>
                  </div>

                  <a href="#top" className="djdip-inline-link">
                    <span>DJs</span>
                    <ArrowUpRight size={14} />
                  </a>
                </article>
              )}
            </div>
          </section>

          <div className="djdip-secondary-stack">
            <section className="djdip-panel djdip-panel--mixboard">
              <div className="djdip-panel__head">
                <p className="djdip-kicker">Mixes</p>
                <h2>Mixes</h2>
              </div>

              <div className="djdip-mix-board">
                {boardMixes.length ? (
                  boardMixes.map((mix, index) => (
                    <a
                      key={mix.id}
                      href={mix.mixUrl || '#mixes'}
                      target={mix.mixUrl ? '_blank' : undefined}
                      rel={mix.mixUrl ? 'noreferrer' : undefined}
                      className="djdip-mix-board__item"
                    >
                      <span className="djdip-mix-board__index">{String(index + 1).padStart(2, '0')}</span>
                      <span className="djdip-mix-board__body">
                        <span className="djdip-mix-board__title">{mix.title}</span>
                        <span className="djdip-mix-board__meta">{mix.mixType || mix.genre || 'Mixes'}</span>
                      </span>
                      <ArrowUpRight size={14} />
                    </a>
                  ))
                ) : (
                  <div className="djdip-mix-board__item">
                    <span className="djdip-mix-board__index">01</span>
                    <span className="djdip-mix-board__body">
                      <span className="djdip-mix-board__title">Mixes</span>
                      <span className="djdip-mix-board__meta">{stageTokens.join(' / ')}</span>
                    </span>
                    <ArrowUpRight size={14} />
                  </div>
                )}
              </div>
            </section>

            <section className="djdip-panel djdip-panel--gallery" id="gallery">
              <div className="djdip-panel__head">
                <p className="djdip-kicker">Gallery</p>
                <h2>{siteSettings.conceptHeading || 'Gallery'}</h2>
                <Link to="/gallery" className="djdip-inline-link" style={{ marginTop: '0.25rem' }}>
                  <span>View All</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>

              <div className="djdip-gallery-grid">
                {galleryFrames.map(({ index, media }) => (
                  <figure key={index} className={`djdip-gallery-grid__tile djdip-gallery-grid__tile--${index + 1}`}>
                    {media ? (
                      <img
                        src={media.thumbnailUrl || media.mediaUrl}
                        alt={media.title || 'DJ DiP'}
                        loading="lazy"
                      />
                    ) : (
                      <span className="djdip-brand-surface" aria-hidden="true">
                        <span className="djdip-brand-surface__title">DJ DiP</span>
                      </span>
                    )}
                  </figure>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="djdip-finale">
          <div className="djdip-finale__title">
            <p className="djdip-kicker">Book · Contact</p>
            <h2>DJ DiP</h2>
            <p className="djdip-finale__phrase">{heroPhrase}</p>
            {safeContactEmail && (
              <a href={`mailto:${safeContactEmail}`} className="djdip-contact-pill" style={{ marginTop: '0.75rem', width: 'fit-content' }}>
                <span>Get In Touch</span>
                <ArrowUpRight size={12} />
              </a>
            )}
          </div>

          <div className="djdip-finale__meta">
            {(heroGenres.length ? heroGenres : stageTokens).slice(0, 4).map((item) => (
              <span key={item} className="djdip-finale__tag">
                {item}
              </span>
            ))}

            {contactLines.map((line) => (
              <span key={line} className="djdip-finale__detail">
                {line}
              </span>
            ))}
          </div>

          <div className="djdip-finale__socials">
            {socials.slice(0, 5).map((item) => (
              <a key={item.label} href={item.url!} target="_blank" rel="noreferrer" className="djdip-contact-pill">
                <span>{item.label}</span>
                <ArrowUpRight size={12} />
              </a>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default DJDipPortfolioPage;
