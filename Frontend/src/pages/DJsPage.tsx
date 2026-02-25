import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { FOLLOW_DJ, GET_DJS, GET_FOLLOWED_DJS, UNFOLLOW_DJ, GET_DJ_APPLICATION_BY_USER } from '../graphql/queries';
import { useAuth } from '../context/AuthContext';
import DJApplicationForm from '../components/DJApplicationForm';
import { useSiteSettings } from '../context/SiteSettingsContext';

type DJ = {
  id: string;
  name: string;
  stageName: string;
  bio: string;
  genre: string;
  profilePictureUrl?: string;
  coverImageUrl?: string;
  tagline?: string;
  followerCount: number;
};

const sortOptions = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'name', label: 'Name (A-Z)' },
];

const DJsPage = () => {
  const { user, isAuthenticated, isDJ, isAdmin } = useAuth();
  const { siteSettings } = useSiteSettings();
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'name'>('popularity');
  const [ctaMessage, setCtaMessage] = useState<string | null>(null);
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

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

  const { data, loading, error } = useQuery(GET_DJS);
  const {
    data: followedData,
    refetch: refetchFollowed,
    loading: followLoading,
  } = useQuery(GET_FOLLOWED_DJS, {
    variables: { userId: resolvedUserId },
    skip: !resolvedUserId,
  });

  const [followDjMutation, { loading: followMutationLoading }] = useMutation(FOLLOW_DJ);
  const [unfollowDjMutation, { loading: unfollowMutationLoading }] = useMutation(UNFOLLOW_DJ);

  const { data: applicationData, refetch: refetchApplication } = useQuery(GET_DJ_APPLICATION_BY_USER, {
    variables: { userId: user?.id || '' },
    skip: !user?.id,
  });

  const userApplication = applicationData?.djApplicationByUser;
  const isAlreadyDJ = isDJ || isAdmin;
  const defaultDjImage = siteSettings.defaultDjImageUrl ?? '/media/defaults/dj.svg';
  const defaultCoverImage = siteSettings.heroBackgroundImageUrl ?? defaultDjImage;

  const followedIds = useMemo(() => {
    if (!followedData?.followedDjs) return new Set<string>();
    return new Set<string>(followedData.followedDjs.map((dj: DJ) => dj.id));
  }, [followedData]);

  const genreOptions = useMemo(() => {
    if (!data?.dJs) return [];
    const genres = new Set<string>();
    data.dJs.forEach((dj: DJ) =>
      dj.genre
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean)
        .forEach((g) => genres.add(g)),
    );
    return Array.from(genres).sort();
  }, [data]);

  const filteredDjs: DJ[] = useMemo(() => {
    if (!data?.dJs) return [];
    return [...data.dJs]
      .filter((dj: DJ) => {
        const matchesSearch =
          dj.stageName.toLowerCase().includes(search.toLowerCase()) ||
          dj.bio.toLowerCase().includes(search.toLowerCase());
        const matchesGenre =
          genreFilter === 'all' ||
          dj.genre
            .split(',')
            .map((g) => g.trim().toLowerCase())
            .includes(genreFilter.toLowerCase());
        return matchesSearch && matchesGenre;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.stageName.localeCompare(b.stageName);
        }
        return b.followerCount - a.followerCount;
      });
  }, [data, search, genreFilter, sortBy]);

  const handleFollowToggle = async (dj: DJ, currentlyFollowing: boolean) => {
    if (!isAuthenticated) {
      setCtaMessage('Following as a guest — create an account later to sync across devices.');
    } else {
      setCtaMessage(null);
    }

    const variables = { input: { userId: resolvedUserId, djId: dj.id } };
    if (currentlyFollowing) {
      await unfollowDjMutation({ variables });
    } else {
      await followDjMutation({ variables });
    }

    await refetchFollowed();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center space-y-2 px-6">
        <p className="text-orange-400 text-lg">Unable to load DJ roster</p>
        <p className="text-gray-500 text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero with orange-burgundy gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#5D1725]/30 via-transparent to-orange-950/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,107,53,0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_80%,rgba(93,23,37,0.15),transparent_55%)]" />

        <section className="relative max-w-7xl mx-auto px-6 lg:px-10 py-20 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-1 w-12 bg-gradient-to-r from-orange-400 to-transparent rounded-full" />
              <p className="text-sm uppercase tracking-[0.6em] text-orange-400 font-bold">Digital Residency</p>
            </div>
            <h1 className="font-display text-6xl md:text-7xl font-black leading-tight tracking-tight">
              Curated{' '}
              <span className="bg-gradient-to-r from-orange-400 via-orange-300 to-[#FF6B35] bg-clip-text text-transparent">
                DJ Roster
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
              Deep dives into the selectors shaping nightlife. Explore full bios, sonic influences, and follow the artists
              powering the KlubN ecosystem.
            </p>
          </div>

          <div className="flex flex-wrap gap-10 pt-6">
            {[
              { value: data?.dJs?.length ?? 0, label: 'Profiles' },
              { value: genreOptions.length, label: 'Genres' },
              { value: followedIds.size, label: 'You Follow' },
            ].map(({ value, label }) => (
              <div key={label} className="group">
                <p className="text-4xl font-black bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent group-hover:from-orange-400 group-hover:to-orange-300 transition-all duration-300">
                  {value}
                </p>
                <p className="text-xs uppercase tracking-[0.5em] text-gray-500 group-hover:text-orange-400 transition-colors">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Apply as DJ */}
          {isAuthenticated && !isAlreadyDJ && (
            <div className="pt-8">
              {userApplication ? (
                <div className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-950/50 to-orange-950/50 border border-amber-900/30">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    <div>
                      <p className="text-sm font-bold text-amber-300">
                        Application{' '}
                        {userApplication.status === 0
                          ? 'Pending Review'
                          : userApplication.status === 2
                          ? 'Rejected'
                          : 'Approved'}
                      </p>
                      <p className="text-xs text-amber-500/70">
                        Submitted {new Date(userApplication.submittedAt).toLocaleDateString()}
                      </p>
                      {userApplication.rejectionReason && (
                        <p className="text-xs text-red-400 mt-1">Reason: {userApplication.rejectionReason}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : applicationSuccess ? (
                <div className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-green-950/50 to-emerald-950/50 border border-green-900/30">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm font-bold text-green-300">Application Submitted Successfully!</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsApplicationFormOpen(true)}
                  className="group px-8 py-4 rounded-2xl font-bold text-sm tracking-wide bg-gradient-to-r from-orange-500 to-[#FF6B35] text-white hover:shadow-[0_0_40px_rgba(255,107,53,0.5)] hover:scale-105 transition-all duration-300 flex items-center gap-3"
                >
                  <svg
                    className="w-5 h-5 group-hover:rotate-12 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Apply as a DJ
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-12">
        <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-zinc-900/50 via-zinc-950/50 to-black/50 backdrop-blur-sm p-8 space-y-6 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm uppercase tracking-[0.4em] text-gray-500 mb-3 font-bold">Search</label>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, style, or bio..."
                className="w-full px-6 py-4 rounded-2xl bg-black/60 border border-white/10 text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm uppercase tracking-[0.4em] text-gray-500 mb-3 font-bold">Genre</label>
              <select
                value={genreFilter}
                onChange={(event) => setGenreFilter(event.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-black/60 border border-white/10 text-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Styles</option>
                {genreOptions.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm uppercase tracking-[0.4em] text-gray-500 mb-3 font-bold">Sort</label>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as 'popularity' | 'name')}
                className="w-full px-6 py-4 rounded-2xl bg-black/60 border border-white/10 text-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all appearance-none cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {ctaMessage && <p className="text-sm text-orange-300">{ctaMessage}</p>}
        </div>
      </section>

      {/* DJ Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-20">
        {filteredDjs.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-2xl font-semibold text-gray-400">No profiles match those filters yet.</p>
            <p className="text-gray-500">Try another genre or reset your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-auto">
            {filteredDjs.map((dj, index) => {
              const isFollowing = followedIds.has(dj.id);
              const spanTwo = index % 5 === 0 || index % 7 === 0;

              return (
                <div key={dj.id} className={`relative group ${spanTwo ? 'md:col-span-2' : 'md:col-span-1'}`}>
                  {/* Orange glow on hover */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-[#FF6B35] to-[#5D1725] rounded-3xl opacity-0 group-hover:opacity-60 blur-xl transition-all duration-500" />

                  <Link
                    to={`/djs/${dj.id}`}
                    className="relative block rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black overflow-hidden transition-all duration-300 hover:border-orange-500/40"
                  >
                    <div className={`flex ${spanTwo ? 'flex-row' : 'flex-col'}`}>
                      {/* Cover image */}
                      <div className={`relative overflow-hidden ${spanTwo ? 'w-1/2' : 'w-full h-56'}`}>
                        <img
                          src={dj.coverImageUrl || dj.profilePictureUrl || defaultCoverImage}
                          alt={dj.stageName}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 to-[#5D1725]/10" />

                        {/* Avatar badge */}
                        <div className="absolute bottom-4 left-4">
                          <div className="h-16 w-16 rounded-full border-2 border-orange-400/40 overflow-hidden bg-black/50 backdrop-blur-sm shadow-2xl ring-4 ring-black/30">
                            <img
                              src={dj.profilePictureUrl || dj.coverImageUrl || defaultDjImage}
                              alt={dj.stageName}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>
                      </div>

                      {/* DJ info */}
                      <div className={`p-6 flex flex-col justify-between ${spanTwo ? 'w-1/2' : 'w-full'}`}>
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-1 w-8 bg-gradient-to-r from-orange-400 to-transparent rounded-full" />
                              <p className="text-xs uppercase tracking-[0.4em] text-gray-600 font-bold">DJ</p>
                            </div>
                            <h3 className="text-3xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent group-hover:from-orange-400 group-hover:to-orange-300 transition-all duration-300">
                              {dj.stageName}
                            </h3>
                            {dj.tagline && <p className="text-sm text-gray-500 italic mt-1">{dj.tagline}</p>}
                          </div>

                          <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{dj.bio}</p>

                          <div className="flex flex-wrap gap-2">
                            {dj.genre
                              .split(',')
                              .slice(0, 3)
                              .map((genre) => (
                                <span
                                  key={genre}
                                  className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider bg-orange-950/40 text-orange-300 border border-orange-900/30"
                                >
                                  {genre.trim()}
                                </span>
                              ))}
                          </div>
                        </div>

                        <div className="space-y-4 mt-6">
                          <div className="flex items-center justify-between p-4 rounded-2xl bg-black/30 border border-white/5">
                            <div>
                              <p className="text-xs uppercase tracking-[0.3em] text-gray-600 font-bold">Followers</p>
                              <p className="text-2xl font-black text-orange-400">{dj.followerCount}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleFollowToggle(dj, isFollowing);
                              }}
                              disabled={followMutationLoading || unfollowMutationLoading || followLoading}
                              className={`px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 ${
                                isFollowing
                                  ? 'bg-white text-black hover:bg-gray-200'
                                  : 'bg-gradient-to-r from-orange-500 to-[#FF6B35] text-white hover:shadow-[0_0_30px_rgba(255,107,53,0.5)] hover:scale-105'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {isFollowing ? 'Following' : 'Follow'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* DJ Application Form Modal */}
      <DJApplicationForm
        isOpen={isApplicationFormOpen}
        onClose={() => setIsApplicationFormOpen(false)}
        onSuccess={() => {
          setApplicationSuccess(true);
          refetchApplication();
          setTimeout(() => setApplicationSuccess(false), 5000);
        }}
      />
    </div>
  );
};

export default DJsPage;
