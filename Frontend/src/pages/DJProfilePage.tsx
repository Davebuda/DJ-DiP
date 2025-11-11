import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { FOLLOW_DJ, GET_DJ_BY_ID, IS_FOLLOWING_DJ, UNFOLLOW_DJ } from '../graphql/queries';
import { useAuth } from '../context/AuthContext';

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

  const followStatusQueryEnabled = Boolean(id && resolvedUserId);
  const {
    data: followStatus,
    refetch: refetchFollowStatus,
    loading: followStatusLoading,
  } = useQuery(IS_FOLLOWING_DJ, {
    variables: { userId: resolvedUserId, djId: id },
    skip: !followStatusQueryEnabled,
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

  const heroBackground = dj?.coverImageUrl ?? '/media/defaults/dj.jpg';

  const socialEntries = useMemo(() => {
    if (!dj?.socialLinks) return [];
    return dj.socialLinks.filter((link) => Boolean(link.url));
  }, [dj?.socialLinks]);

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

  return (
    <div className="bg-gradient-to-b from-[#120602] via-[#050202] to-black text-white min-h-screen">
      <section className="relative">
        <div className="absolute inset-0">
          <img src={heroBackground} alt={dj.stageName} className="w-full h-[480px] object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-24 flex flex-col md:flex-row gap-10">
          <div className="flex-shrink-0">
            <div className="h-48 w-48 rounded-[32px] border border-white/20 overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.6)] bg-black/40">
              {dj.profilePictureUrl ? (
                <img src={dj.profilePictureUrl} alt={dj.stageName} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-5xl font-bold text-white/50">
                  {dj.stageName.charAt(0)}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.6em] text-orange-300">Featured DJ</p>
              <h1 className="text-5xl font-black mt-2">{dj.stageName}</h1>
              {dj.tagline && <p className="text-lg text-gray-300 mt-2">{dj.tagline}</p>}
            </div>
            <p className="text-gray-300 text-lg max-w-3xl">{dj.bio}</p>
            <div className="flex flex-wrap gap-6 pt-4">
              <div>
                <p className="text-xs uppercase tracking-[0.5em] text-gray-500">Followers</p>
                <p className="text-2xl font-semibold text-white">{dj.followerCount}</p>
              </div>
              {dj.yearsExperience && (
                <div>
                  <p className="text-xs uppercase tracking-[0.5em] text-gray-500">Years active</p>
                  <p className="text-2xl font-semibold text-white">{dj.yearsExperience}</p>
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.5em] text-gray-500">Genres</p>
                <p className="text-2xl font-semibold text-white">{dj.genre || 'Experimental'}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={handleFollowClick}
                disabled={followLoading || unfollowLoading || followStatusLoading}
                className={`px-8 py-3 rounded-full text-sm font-semibold tracking-[0.3em] uppercase ${
                  isFollowing ? 'bg-white text-black' : 'bg-gradient-to-r from-orange-400 to-pink-500 text-black'
                } disabled:opacity-60`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <Link
                to="/events"
                className="px-8 py-3 rounded-full border border-white/20 text-sm font-semibold tracking-[0.3em] uppercase hover:border-orange-400 transition"
              >
                Upcoming Sets
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {dj.longBio && (
            <div className="rounded-[32px] border border-white/10 p-8 bg-black/30 space-y-4">
              <p className="text-sm uppercase tracking-[0.5em] text-orange-400">Long Bio</p>
              <p className="text-gray-200 leading-relaxed whitespace-pre-line">{dj.longBio}</p>
            </div>
          )}

          <div className="rounded-[32px] border border-white/10 p-8 bg-black/30 space-y-6">
            <p className="text-sm uppercase tracking-[0.5em] text-orange-400">Top Tracks</p>
            {dj.topTracks.length === 0 ? (
              <p className="text-gray-500">Top 10 list coming soon.</p>
            ) : (
              <ol className="space-y-3 list-decimal list-inside text-gray-200">
                {dj.topTracks.map((track, index) => (
                  <li key={`${track}-${index}`} className="pl-2">
                    {track}
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dj.influencedBy && (
              <div className="rounded-[24px] border border-white/10 p-6 bg-black/30 space-y-2">
                <p className="text-xs uppercase tracking-[0.5em] text-gray-500">Influences</p>
                <p className="text-gray-200">{dj.influencedBy}</p>
              </div>
            )}
            {dj.equipmentUsed && (
              <div className="rounded-[24px] border border-white/10 p-6 bg-black/30 space-y-2">
                <p className="text-xs uppercase tracking-[0.5em] text-gray-500">Equipment</p>
                <p className="text-gray-200">{dj.equipmentUsed}</p>
              </div>
            )}
            {dj.specialties && (
              <div className="rounded-[24px] border border-white/10 p-6 bg-black/30 space-y-2">
                <p className="text-xs uppercase tracking-[0.5em] text-gray-500">Specialties</p>
                <p className="text-gray-200">{dj.specialties}</p>
              </div>
            )}
            {dj.achievements && (
              <div className="rounded-[24px] border border-white/10 p-6 bg-black/30 space-y-2">
                <p className="text-xs uppercase tracking-[0.5em] text-gray-500">Achievements</p>
                <p className="text-gray-200">{dj.achievements}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-[32px] border border-white/10 p-8 bg-black/30 space-y-4">
            <p className="text-sm uppercase tracking-[0.5em] text-orange-400">Connect</p>
            {socialEntries.length === 0 ? (
              <p className="text-gray-500">Social links coming soon.</p>
            ) : (
              <div className="space-y-3">
                {socialEntries.map(({ label, url }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-gray-200 hover:text-orange-300 transition"
                  >
                    <span>{label}</span>
                    <span className="text-xs uppercase tracking-[0.4em]">↗</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[32px] border border-white/10 p-8 bg-black/30 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm uppercase tracking-[0.5em] text-orange-400">Upcoming Sets</p>
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
                    {event.imageUrl ? (
                      <img src={event.imageUrl} alt={event.title} className="h-16 w-16 rounded-[16px] object-cover" />
                    ) : (
                      <div className="h-16 w-16 rounded-[16px] bg-white/5 flex items-center justify-center text-white/30">
                        {new Date(event.date).getDate()}
                      </div>
                    )}
                    <div>
                      <p className="text-white font-semibold">{event.title}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(event.date).toLocaleDateString()} · {event.venueName}
                        {event.city ? `, ${event.city}` : ''}
                      </p>
                    </div>
                    <div className="ml-auto text-right text-sm text-orange-300 font-semibold">${event.price}</div>
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
