import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { FOLLOW_DJ, GET_DJ_BY_ID, IS_FOLLOWING_DJ, UNFOLLOW_DJ } from '../graphql/queries';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

type EventSummary = {
  eventId: string;
  title: string;
  date: string;
  venueName: string;
  city?: string;
  price: number;
  imageUrl?: string;
};

type SocialLink = {
  label: string;
  url: string;
};

type DJProfile = {
  id: string;
  name: string;
  stageName: string;
  bio: string;
  longBio?: string;
  genre: string;
  profilePictureUrl?: string;
  coverImageUrl?: string;
  tagline?: string;
  specialties?: string;
  achievements?: string;
  yearsExperience?: number;
  influencedBy?: string;
  equipmentUsed?: string;
  topTracks: string[];
  followerCount: number;
  upcomingEvents: EventSummary[];
  socialLinks: SocialLink[];
};

const DJProfilePage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { siteSettings } = useSiteSettings();

  const resolvedUserId = useMemo(() => {
    if (user?.id) return user.id;
    if (typeof window === 'undefined') return '';
    const storageKey = 'dj-dip-guest-user-id';
    let stored = localStorage.getItem(storageKey);
    if (!stored) {
      stored =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `guest-${Date.now()}`;
      localStorage.setItem(storageKey, stored);
    }
    return stored;
  }, [user?.id]);

  const { data, loading, error } = useQuery(GET_DJ_BY_ID, {
    variables: { id },
    skip: !id,
  });

  const {
    data: followStatus,
    refetch: refetchFollowStatus,
    loading: followStatusLoading,
  } = useQuery(IS_FOLLOWING_DJ, {
    variables: { userId: resolvedUserId, djId: id },
    skip: !(id && resolvedUserId),
  });

  const [followDj, { loading: followLoading }] = useMutation(FOLLOW_DJ);
  const [unfollowDj, { loading: unfollowLoading }] = useMutation(UNFOLLOW_DJ);

  const dj: DJProfile | undefined = data?.dj;
  const isFollowing = Boolean(followStatus?.isFollowingDj);

  const handleFollowClick = async () => {
    if (!dj || !id || !resolvedUserId) return;
    if (!isAuthenticated) {
      alert('Following as guest. Create an account later to sync your lineup.');
    }

    const variables = { input: { userId: resolvedUserId, djId: id } };
    if (isFollowing) {
      await unfollowDj({ variables });
    } else {
      await followDj({ variables });
    }
    await refetchFollowStatus();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400" />
      </div>
    );
  }

  if (error || !dj) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center space-y-3 px-6">
        <p className="text-orange-400 text-lg">Unable to load DJ profile</p>
        <p className="text-gray-500 text-sm">{error?.message ?? 'Profile not found'}</p>
      </div>
    );
  }

  const heroBackground = dj.coverImageUrl ?? siteSettings.defaultDjImageUrl ?? '/media/defaults/dj.jpg';
  const defaultEventImage = siteSettings.defaultEventImageUrl ?? '/media/defaults/event.jpg';
  const genreTags = (dj.genre ?? '')
    .split(',')
    .map((genre) => genre.trim())
    .filter(Boolean);
  const creativeTiles = [
    { label: 'Specialties', value: dj.specialties },
    { label: 'Achievements', value: dj.achievements },
    { label: 'Influences', value: dj.influencedBy },
    { label: 'Equipment', value: dj.equipmentUsed },
  ].filter((tile) => Boolean(tile.value));
  const socialEntries = dj.socialLinks?.filter((link) => Boolean(link.url)) ?? [];

  return (
    <div className="bg-[#050214] text-white min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBackground} alt={dj.stageName} className="h-[540px] w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050010] via-[#080016]/90 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,0,128,0.32),transparent_45%)] mix-blend-screen" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)_260px] gap-10 items-center">
            {/* Left rail */}
            <div className="space-y-8 border-l border-white/10 pl-6">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.6em] text-orange-300">Featured DJ</p>
                <h1 className="text-5xl font-black leading-tight">{dj.stageName}</h1>
                {dj.tagline && <p className="text-lg text-gray-300">{dj.tagline}</p>}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{dj.bio}</p>
              <div className="flex flex-wrap gap-2">
                {genreTags.slice(0, 4).map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full border border-white/20 px-3 py-1 text-[0.65rem] uppercase tracking-[0.35em] text-gray-200"
                  >
                    {genre}
                  </span>
                ))}
                {genreTags.length === 0 && (
                  <span className="rounded-full border border-white/20 px-3 py-1 text-[0.65rem] uppercase tracking-[0.35em] text-gray-200">
                    genre blend
                  </span>
                )}
              </div>
              <div className="text-sm space-y-2">
                <div className="flex gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.5em] text-gray-500">Followers</p>
                    <p className="text-3xl font-semibold text-white">{dj.followerCount.toLocaleString()}</p>
                  </div>
                  {dj.yearsExperience && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.5em] text-gray-500">Years Active</p>
                      <p className="text-3xl font-semibold text-white">{dj.yearsExperience}</p>
                    </div>
                  )}
                </div>
                {dj.specialties && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.5em] text-gray-500">Specialties</p>
                    <p className="text-gray-200">{dj.specialties}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Center hero portrait */}
            <div className="relative">
              <div className="absolute -left-12 -right-12 -top-6 -bottom-6 bg-gradient-to-b from-white/10 to-transparent opacity-40 blur-[120px]" />
              <div className="relative h-[460px] rounded-[60px] border border-white/10 overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80" />
                <img
                  src={dj.profilePictureUrl ?? heroBackground}
                  alt={dj.stageName}
                  className="h-full w-full object-cover object-top"
                />
              </div>
            </div>

            {/* Right rail */}
            <div className="space-y-5">
              <button
                type="button"
                onClick={handleFollowClick}
                disabled={followLoading || unfollowLoading || followStatusLoading}
                className={`w-full px-8 py-3 rounded-full text-xs font-semibold tracking-[0.3em] uppercase ${
                  isFollowing ? 'bg-white text-black' : 'bg-gradient-to-r from-orange-400 to-pink-500 text-black'
                } disabled:opacity-60`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <Link
                to="/events"
                className="block w-full text-center px-8 py-3 rounded-full border border-white/20 text-xs font-semibold tracking-[0.3em] uppercase hover:border-orange-400 transition"
              >
                Upcoming Sets
              </Link>
              {socialEntries.length > 0 && (
                <div className="space-y-2 text-sm">
                  {socialEntries.map((entry) => (
                    <a
                      key={entry.label}
                      href={entry.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-2 text-gray-200 hover:border-orange-400 transition"
                    >
                      <span>{entry.label}</span>
                      <span className="text-xs uppercase tracking-[0.4em]">↗</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-20 space-y-16">
        {dj.longBio && (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.5em] text-orange-400">Storyline</p>
            <p className="text-gray-200 leading-relaxed whitespace-pre-line">{dj.longBio}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-10">
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.5em] text-orange-400">Top Tracks</p>
                <span className="text-xs uppercase tracking-[0.3em] text-gray-500">
                  {dj.topTracks.length.toString().padStart(2, '0')}
                </span>
              </div>
              {dj.topTracks.length === 0 ? (
                <p className="text-gray-500">Top 10 list coming soon.</p>
              ) : (
                <div className="space-y-2">
                  {dj.topTracks.map((track, index) => (
                    <div
                      key={`${track}-${index}`}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-white/10 to-transparent px-4 py-3 text-sm text-gray-200"
                    >
                      <span className="text-xs font-semibold text-orange-300">{String(index + 1).padStart(2, '0')}</span>
                      <p className="flex-1">{track}</p>
                      <span className="text-[0.65rem] uppercase tracking-[0.3em] text-gray-500">LISTEN</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.5em] text-orange-400">Creative DNA</p>
              {creativeTiles.length === 0 ? (
                <p className="text-gray-500 text-sm">More details coming soon.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {creativeTiles.map((tile) => (
                    <div
                      key={tile.label}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-200 space-y-2"
                    >
                      <p className="text-xs uppercase tracking-[0.4em] text-gray-500">{tile.label}</p>
                      <p>{tile.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.5em] text-orange-400">Upcoming Sets</p>
              <Link to="/events" className="text-xs uppercase tracking-[0.3em] text-gray-400 hover:text-white">
                View all
              </Link>
            </div>
            {dj.upcomingEvents.length === 0 ? (
              <p className="text-gray-500">No scheduled performances yet.</p>
            ) : (
              <div className="space-y-4">
                {dj.upcomingEvents.map((event) => (
                  <Link
                    key={event.eventId}
                    to={`/events/${event.eventId}`}
                    className="flex gap-4 items-center rounded-[20px] border border-white/10 p-4 hover:border-orange-400 transition"
                  >
                    <img
                      src={event.imageUrl ?? defaultEventImage}
                      alt={event.title}
                      className="h-16 w-16 rounded-[16px] object-cover border border-white/10"
                    />
                    <div className="flex-1">
                      <p className="text-white font-semibold">{event.title}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(event.date).toLocaleDateString()} · {event.venueName}
                        {event.city ? `, ${event.city}` : ''}
                      </p>
                      <p className="text-sm text-gray-300">{event.price ? `$${event.price}` : 'Free entry'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DJProfilePage;
