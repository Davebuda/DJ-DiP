import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { FOLLOW_DJ, GET_DJS, GET_FOLLOWED_DJS, UNFOLLOW_DJ } from '../graphql/queries';
import { useAuth } from '../context/AuthContext';

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
  const { user, isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'name'>('popularity');
  const [ctaMessage, setCtaMessage] = useState<string | null>(null);

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
    <div className="min-h-screen bg-gradient-to-b from-[#130602] via-[#050202] to-black text-white">
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 space-y-6">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.6em] text-orange-500">Digital Residency</p>
          <h1 className="text-5xl md:text-6xl font-black leading-tight">
            Curated <span className="text-orange-200">DJ Roster</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl">
            Deep dives into the selectors shaping nightlife. Explore full bios, sonic influences, and follow the artists
            powering the KlubN ecosystem.
          </p>
        </div>

        <div className="flex flex-wrap gap-8 pt-4">
          <div>
            <p className="text-3xl font-bold text-white">{data?.dJs?.length ?? 0}</p>
            <p className="text-xs uppercase tracking-[0.5em] text-orange-200">Profiles</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">{genreOptions.length}</p>
            <p className="text-xs uppercase tracking-[0.5em] text-orange-200">Genres</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">{followedIds.size}</p>
            <p className="text-xs uppercase tracking-[0.5em] text-orange-200">You Follow</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-12">
        <div className="rounded-[32px] border border-white/10 bg-gradient-to-b from-[#140707] to-[#060303] p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm uppercase tracking-[0.4em] text-gray-400 mb-3">Search</label>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, style, or bio..."
                className="w-full px-6 py-4 rounded-full bg-black/50 border border-white/20 text-white placeholder-gray-500 focus:border-orange-400 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm uppercase tracking-[0.4em] text-gray-400 mb-3">Genre</label>
              <select
                value={genreFilter}
                onChange={(event) => setGenreFilter(event.target.value)}
                className="w-full px-6 py-4 rounded-full bg-black/50 border border-white/20 text-white focus:border-orange-400 focus:outline-none transition appearance-none cursor-pointer"
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
              <label className="block text-sm uppercase tracking-[0.4em] text-gray-400 mb-3">Sort</label>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as 'popularity' | 'name')}
                className="w-full px-6 py-4 rounded-full bg-black/50 border border-white/20 text-white focus:border-orange-400 focus:outline-none transition appearance-none cursor-pointer"
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

      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-20">
        {filteredDjs.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-2xl font-semibold text-gray-400">No profiles match those filters yet.</p>
            <p className="text-gray-500">Try another genre or reset your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDjs.map((dj) => {
              const isFollowing = followedIds.has(dj.id);
              return (
                <div
                  key={dj.id}
                  className="rounded-[32px] border border-white/10 bg-gradient-to-b from-[#1a0903] to-[#050303] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.45)] flex flex-col"
                >
                  {dj.coverImageUrl && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <img src={dj.coverImageUrl} alt={dj.stageName} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full border border-white/20 overflow-hidden bg-black/30">
                        {dj.profilePictureUrl ? (
                          <img src={dj.profilePictureUrl} alt={dj.stageName} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xl font-semibold text-white/50">
                            {dj.stageName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-gray-500">DJ</p>
                        <p className="text-2xl font-semibold text-white">{dj.stageName}</p>
                        <p className="text-sm text-gray-400">{dj.tagline ?? dj.genre}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Followers</p>
                        <p className="text-lg font-semibold text-orange-300">{dj.followerCount}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-3 flex-1">{dj.bio}</p>
                    <div className="flex items-center gap-3">
                      {dj.genre
                        .split(',')
                        .slice(0, 2)
                        .map((genre) => (
                          <span key={genre} className="px-3 py-1 rounded-full text-xs tracking-[0.2em] bg-white/5 text-gray-300">
                            {genre.trim()}
                          </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 pt-2">
                      <Link
                        to={`/djs/${dj.id}`}
                        className="flex-1 px-6 py-3 rounded-full border border-white/20 text-white text-sm tracking-[0.3em] uppercase text-center hover:border-orange-400 transition"
                      >
                        Profile
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleFollowToggle(dj, isFollowing)}
                        disabled={followMutationLoading || unfollowMutationLoading || followLoading}
                        className={`px-6 py-3 rounded-full text-sm font-semibold tracking-[0.2em] uppercase ${
                          isFollowing
                            ? 'bg-white text-black'
                            : 'bg-gradient-to-r from-orange-400 to-pink-500 text-black'
                        } disabled:opacity-60`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default DJsPage;
