import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PLAYLISTS } from '../graphql/queries';
import { ScrollReveal } from '../components/effects/ScrollReveal';

type PlaylistSong = {
  id: string;
  songId: string;
  position: number;
  title: string;
  artist: string;
  genre?: string | null;
  coverImageUrl?: string | null;
  spotifyUrl?: string | null;
  soundCloudUrl?: string | null;
};

type Playlist = {
  id: string;
  title: string;
  description?: string | null;
  genre?: string | null;
  coverImageUrl?: string | null;
  curator?: string | null;
  songs: PlaylistSong[];
};

const PlaylistDiscoveryPage = () => {
  const { data, loading, error } = useQuery(GET_PLAYLISTS);
  const playlists: Playlist[] = useMemo(() => data?.playlists ?? [], [data]);

  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const genres = useMemo(
    () => ['All', ...new Set(playlists.map((p) => p.genre).filter(Boolean) as string[])],
    [playlists],
  );

  const filtered = useMemo(() => {
    if (selectedGenre === 'All') return playlists;
    return playlists.filter((p) => p.genre === selectedGenre);
  }, [selectedGenre, playlists]);

  return (
    <div className="min-h-screen text-white">
      {/* ═══ Hero ═══ */}
      <section className="relative overflow-clip">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-orange-950/15" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(147,51,234,0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(255,107,53,0.08),transparent_55%)]" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-28 space-y-8">
          <div className="max-w-3xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-1 w-10 bg-gradient-to-r from-purple-400 to-transparent rounded-full" />
              <p className="text-xs uppercase tracking-[0.5em] text-purple-300/70 font-bold">Playlist Explorer</p>
            </div>
            <h1 className="font-display text-5xl lg:text-6xl font-black leading-tight tracking-tight">
              Curated playlists,{' '}
              <span className="bg-gradient-to-r from-orange-400 to-[#FF6B35] bg-clip-text text-transparent">
                powered by our DJs
              </span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
              Explore genre-specific playlists curated by the DJs shaping the KlubN universe.
              Each track links directly to Spotify or SoundCloud for instant listening.
            </p>
          </div>

          {/* Genre filters */}
          {genres.length > 1 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {genres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.2em] transition-all ${
                    selectedGenre === genre
                      ? 'bg-gradient-to-r from-orange-500 to-[#FF6B35] text-black shadow-lg shadow-orange-600/25'
                      : 'border border-white/[0.10] bg-white/[0.04] text-gray-300 hover:border-orange-400/40 hover:text-white'
                  }`}
                  onClick={() => setSelectedGenre(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══ Playlists Grid ═══ */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-20 space-y-8">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Curated Drops</p>
            <h2 className="text-2xl font-bold">Featured Playlists</h2>
          </div>
          <p className="text-xs text-gray-500 hidden sm:block max-w-xs text-right">
            Click any playlist to see its tracks with Spotify and SoundCloud links.
          </p>
        </div>

        {loading && (
          <div className="text-center py-16">
            <p className="text-gray-400">Loading playlists...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className="text-red-300">Failed to load playlists.</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <p className="text-xl font-semibold text-gray-400">
              {playlists.length === 0 ? 'No playlists yet' : 'No playlists in this genre'}
            </p>
            <p className="text-gray-500 text-sm">
              {playlists.length === 0
                ? 'Check back soon for curated playlists.'
                : 'Try selecting a different genre.'}
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {filtered.map((playlist, idx) => (
            <ScrollReveal key={playlist.id} delay={idx * 0.08}>
              <article className="liquid-glass rounded-[32px] border border-white/[0.10] bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl overflow-hidden hover:border-orange-400/20 transition-all duration-300">
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex gap-4">
                    {playlist.coverImageUrl && (
                      <div className="relative overflow-hidden rounded-2xl shrink-0 w-28 h-28">
                        <img
                          src={playlist.coverImageUrl}
                          alt={playlist.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold">{playlist.title}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {playlist.genre && (
                              <span className="px-3 py-0.5 rounded-full bg-black/30 border border-white/10 text-[0.6rem] uppercase tracking-wider text-gray-300">
                                {playlist.genre}
                              </span>
                            )}
                            {playlist.curator && (
                              <span className="text-xs text-gray-500">by {playlist.curator}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {playlist.songs.length} tracks
                        </span>
                      </div>
                      {playlist.description && (
                        <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
                          {playlist.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Expand/collapse toggle */}
                  <button
                    type="button"
                    className="w-full text-center py-2 text-xs uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-colors border-t border-white/5"
                    onClick={() => setExpandedId(expandedId === playlist.id ? null : playlist.id)}
                  >
                    {expandedId === playlist.id ? 'Hide tracks' : 'Show tracks'}
                  </button>

                  {/* Track list */}
                  {expandedId === playlist.id && (
                    <ul className="space-y-1.5">
                      {playlist.songs.map((song, i) => (
                        <li
                          key={song.id}
                          className="flex items-center justify-between rounded-xl bg-black/20 border border-white/5 px-4 py-2.5"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs text-gray-600 w-5 text-right shrink-0">{i + 1}</span>
                            {song.coverImageUrl && (
                              <img
                                src={song.coverImageUrl}
                                alt=""
                                className="w-8 h-8 rounded-md object-cover shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">{song.title}</p>
                              <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            {song.spotifyUrl && (
                              <a
                                href={song.spotifyUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="Listen on Spotify"
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/20 text-[#1DB954] text-[0.6rem] font-bold uppercase tracking-wider hover:bg-[#1DB954]/20 transition"
                              >
                                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                                Spotify
                              </a>
                            )}
                            {song.soundCloudUrl && (
                              <a
                                href={song.soundCloudUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="Listen on SoundCloud"
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/20 text-[#FF5500] text-[0.6rem] font-bold uppercase tracking-wider hover:bg-[#FF5500]/20 transition"
                              >
                                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.05-.1-.1-.1m-.899.828c-.06 0-.091.037-.104.094L0 14.479l.172 1.308c.013.06.045.094.104.094.057 0 .09-.035.104-.094l.2-1.308-.2-1.332c-.015-.057-.047-.094-.104-.094m1.8-1.143c-.066 0-.118.053-.118.12l-.213 2.449.213 2.379c0 .066.052.119.118.119.065 0 .118-.053.118-.119l.241-2.379-.24-2.449c0-.067-.054-.12-.12-.12m.899-.166c-.08 0-.14.063-.14.14l-.197 2.615.197 2.56c0 .077.06.14.14.14.078 0 .139-.063.139-.14l.222-2.56-.222-2.614c0-.078-.06-.141-.14-.141m.899-.254c-.09 0-.159.073-.159.16l-.18 2.869.18 2.637c0 .088.07.16.159.16.089 0 .16-.072.16-.16l.204-2.637-.204-2.87c0-.087-.071-.159-.16-.159m.9-.36c-.1 0-.179.08-.179.18l-.163 3.23.163 2.7c0 .1.08.18.18.18.098 0 .178-.08.178-.18l.186-2.7-.186-3.23c0-.1-.08-.18-.18-.18m.899-.182c-.11 0-.198.09-.198.2l-.145 3.412.145 2.742c0 .11.088.2.198.2.11 0 .2-.09.2-.2l.166-2.742-.166-3.412c0-.11-.09-.2-.2-.2m1.098-.28c-.12 0-.218.098-.218.22l-.127 3.692.127 2.768c0 .122.097.22.218.22.12 0 .219-.098.219-.22l.145-2.768-.145-3.693c0-.122-.098-.22-.22-.22m.899.11c-.133 0-.237.107-.237.24l-.109 3.342.109 2.779c0 .133.104.24.237.24.132 0 .237-.107.237-.24l.125-2.779-.125-3.342c0-.133-.105-.24-.237-.24m1.099-.36c-.143 0-.257.117-.257.26l-.092 3.702.092 2.788c0 .144.114.261.257.261.144 0 .258-.117.258-.26l.104-2.789-.104-3.702c0-.143-.114-.26-.258-.26m1.174-.546c-.065-.007-.133-.01-.2-.01-.144 0-.283.018-.42.05-.152 0-.271.12-.271.28l-.074 4.009.074 2.772c0 .157.12.28.27.28.15 0 .272-.123.272-.28l.084-2.772-.084-4.01c0-.157-.12-.279-.272-.279m1.07.527c-.154 0-.278.126-.278.28l-.056 3.481.056 2.759c0 .156.124.28.278.28s.28-.124.28-.28l.063-2.759-.063-3.48c0-.155-.126-.281-.28-.281m.899.16c-.164 0-.298.136-.298.3l-.038 3.321.038 2.737c0 .166.134.3.298.3.165 0 .3-.134.3-.3l.044-2.737-.044-3.322c0-.164-.135-.3-.3-.3m4.137-.467c-.27-.087-.556-.135-.854-.135-1.483 0-2.693 1.19-2.726 2.664l-.023 1.258.023 2.699c.005.167.142.3.31.3h3.27c1.318 0 2.386-1.067 2.386-2.386V12.9c0-1.318-1.068-2.386-2.386-2.386"/></svg>
                                SoundCloud
                              </a>
                            )}
                            {!song.spotifyUrl && !song.soundCloudUrl && (
                              <span className="text-[0.6rem] text-gray-600 uppercase tracking-wider">No links</span>
                            )}
                          </div>
                        </li>
                      ))}
                      {playlist.songs.length === 0 && (
                        <li className="text-center py-4 text-sm text-gray-500">
                          This playlist is being curated. Check back soon.
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PlaylistDiscoveryPage;
