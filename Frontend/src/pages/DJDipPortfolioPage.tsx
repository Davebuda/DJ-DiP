import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { ArrowUpRight, Disc3, Mail, Radio } from 'lucide-react';
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
  profilePictureUrl?: string;
  coverImageUrl?: string;
};

type Mix = {
  id: string;
  title: string;
  description?: string;
  mixUrl?: string;
  thumbnailUrl?: string;
  genre?: string;
  mixType?: string;
  djName?: string;
};

type GalleryMedia = {
  id: string;
  mediaUrl: string;
  mediaType: string;
  title?: string;
  thumbnailUrl?: string;
};

const splitGenres = (value?: string) =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));
const isKlubnValue = (value?: string) => /klubn/i.test(value ?? '');

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

  const heroDj = djs[0];
  const leadMix = mixes[0];
  const safeContactEmail = isKlubnValue(siteSettings.contactEmail) ? '' : siteSettings.contactEmail;
  const boardMixes = mixes.slice(0, 3);

  const heroGenres = unique([
    ...splitGenres(siteSettings.heroGenres),
    ...djs.flatMap((dj) => splitGenres(dj.genre)),
    ...mixes.map((mix) => mix.genre ?? ''),
  ]).slice(0, 6);

  const stageTokens = (heroGenres.length ? heroGenres : ['DJ DiP', 'Techno', 'House']).slice(0, 4);
  const artistName = heroDj?.stageName || heroDj?.name || 'DJ DiP';
  const heroImage = heroDj?.coverImageUrl || events[0]?.imageUrl || '/media/sections/hero/djdip-hero-photo.png';
  const profileLink = heroDj ? `/djs/${heroDj.id}` : '/djs';

  const galleryFrames = Array.from({ length: 4 }, (_, index) => ({
    index,
    media: galleryItems[index] ?? null,
  }));

  const finaleSocials = [
    { label: 'Instagram', url: siteSettings.instagramUrl },
    { label: 'YouTube', url: siteSettings.youTubeUrl },
    { label: 'SoundCloud', url: siteSettings.soundCloudUrl },
    { label: 'Twitter', url: siteSettings.twitterUrl },
  ].filter((item) => Boolean(item.url));

  const bookingLinks = [
    siteSettings.facebookUrl ? { label: 'Facebook', url: siteSettings.facebookUrl } : null,
    siteSettings.tikTokUrl ? { label: 'TikTok', url: siteSettings.tikTokUrl } : null,
    safeContactEmail ? { label: 'General', url: `mailto:${safeContactEmail}` } : null,
  ].filter(Boolean) as { label: string; url: string }[];

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
            {['DJs', 'Mixes', 'Gallery', 'Contact'].map((label) => (
              <a key={label} href={`#${label.toLowerCase()}`} className="djdip-nav__link">
                {label}
              </a>
            ))}
          </nav>
        </header>

        <section className="djdip-mosaic" id="top">
          <article className="djdip-panel djdip-panel--hero" id="djs">
            <div className="djdip-hero__header">
              <div className="djdip-hero__title">
                <p className="djdip-kicker">{siteSettings.lineupHeading || 'The Lineup'}</p>
                <h1>DJS</h1>
              </div>

              <Link to={profileLink} className="djdip-inline-link">
                <span>Profile</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="djdip-hero__visual">
              <img src={heroImage} alt={artistName} className="djdip-hero__image" loading="eager" />
              <div className="djdip-hero__watermark" aria-hidden="true">DJDIP</div>
            </div>

            <div className="djdip-hero__footer">
              <strong className="djdip-hero__artist-name">{artistName}</strong>
              <div className="djdip-hero__artist-links">
                {siteSettings.youTubeUrl && (
                  <a href={siteSettings.youTubeUrl} target="_blank" rel="noreferrer" className="djdip-inline-link">
                    <span>YouTube</span>
                    <ArrowUpRight size={12} />
                  </a>
                )}
                <Link to={profileLink} className="djdip-inline-link">
                  <span>Profile</span>
                  <ArrowUpRight size={12} />
                </Link>
              </div>
            </div>
          </article>

          <div className="djdip-rail">
            <article className="djdip-panel djdip-side-card" id="mixes">
              <div className="djdip-side-card__head">
                <div>
                  <p className="djdip-kicker">Discography</p>
                  <h2>Mixes</h2>
                </div>

                <Link to="/mixes" className="djdip-inline-link">
                  <span>Open</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>

              {leadMix ? (
                <div className="djdip-stack-list djdip-stack-list--mixes">
                  <a
                    href={leadMix.mixUrl || '#mixes'}
                    target={leadMix.mixUrl ? '_blank' : undefined}
                    rel={leadMix.mixUrl ? 'noreferrer' : undefined}
                    className="djdip-stack-list__lead"
                  >
                    <span className="djdip-stack-list__icon">
                      <Radio size={14} />
                    </span>

                    <span className="djdip-stack-list__body">
                      <span className="djdip-stack-list__title">{leadMix.title}</span>
                      <span className="djdip-stack-list__meta">
                        {leadMix.mixType || leadMix.genre || leadMix.djName || 'Latest mix'}
                      </span>
                    </span>
                  </a>

                  <div className="djdip-stack-list__group">
                    {boardMixes.slice(1).map((mix) => (
                      <a
                        key={mix.id}
                        href={mix.mixUrl || '#mixes'}
                        target={mix.mixUrl ? '_blank' : undefined}
                        rel={mix.mixUrl ? 'noreferrer' : undefined}
                        className="djdip-stack-list__row djdip-stack-list__row--mix"
                      >
                        <span className="djdip-stack-list__icon">
                          <Disc3 size={14} />
                        </span>
                        <span className="djdip-stack-list__body">
                          <span className="djdip-stack-list__title">{mix.title}</span>
                          <span className="djdip-stack-list__meta">{mix.mixType || mix.genre || mix.djName || 'Mixes'}</span>
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="djdip-empty">
                  <p className="djdip-empty__title">Latest Mix</p>
                  <p className="djdip-empty__copy">{stageTokens.join(' / ')}</p>
                </div>
              )}
            </article>

            <article className="djdip-panel djdip-side-card djdip-side-card--gallery" id="gallery">
              <div className="djdip-side-card__head">
                <div>
                  <p className="djdip-kicker">Gallery</p>
                  <h2>Gallery</h2>
                </div>

                <Link to="/gallery" className="djdip-inline-link">
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
                        alt={media.title || artistName}
                        loading="lazy"
                      />
                    ) : (
                      <span className="djdip-brand-surface" aria-hidden="true">
                        <span className="djdip-brand-surface__title">DJDIP</span>
                      </span>
                    )}
                  </figure>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="djdip-finale" id="contact">
          <div className="djdip-finale__title">
            <p className="djdip-kicker">Book · Contact</p>
            <h2>DJ DiP</h2>
            <p className="djdip-finale__phrase">{siteSettings.tagline || 'High Life Sound System'}</p>

            <div className="djdip-finale__socials">
              {finaleSocials.map((item) => (
                <a key={item.label} href={item.url!} target="_blank" rel="noreferrer" className="djdip-contact-pill">
                  <span>{item.label}</span>
                  <ArrowUpRight size={12} />
                </a>
              ))}
            </div>
          </div>

          <div className="djdip-finale__meta">
            {bookingLinks.map((item) => (
              <a
                key={item.label}
                href={item.url}
                target={item.url.startsWith('mailto:') ? undefined : '_blank'}
                rel={item.url.startsWith('mailto:') ? undefined : 'noreferrer'}
                className="djdip-contact-pill"
              >
                {item.url.startsWith('mailto:') && <Mail size={12} />}
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
