import { useMemo, useState } from 'react';
import { featuredPlaylists } from '../data/featuredPlaylists';

const PlaylistDiscoveryPage = () => {
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  const genres = useMemo(
    () => ['All', ...new Set(featuredPlaylists.map((playlist) => playlist.genre))],
    [],
  );

  const filteredPlaylists = useMemo(() => {
    if (selectedGenre === 'All') {
      return featuredPlaylists;
    }
    return featuredPlaylists.filter((playlist) => playlist.genre === selectedGenre);
  }, [selectedGenre]);

  return (
    <div className="min-h-screen text-white space-y-12 py-8 px-6 lg:px-10">
      <section className="liquid-glass relative overflow-hidden rounded-3xl border border-white/[0.10] bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl px-6 py-12 md:px-10">
        <div className="max-w-4xl space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-purple-300/70">Playlist Explorer</p>
          <h1 className="text-4xl font-semibold leading-tight">
            Dive into genre stories, <span className="text-orange-400">powered by Spotify</span>
          </h1>
          <p className="text-sm text-gray-300">
            We curate living, breathing playlists with the DJs shaping the KlubN universe. Expect
            genre blends, mood-based DJ notes, and direct Spotify playback so you can preview sets
            before stepping into a venue.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {genres.map((genre) => (
            <button
              key={genre}
              type="button"
              className={[
                'rounded-full border px-4 py-2 text-xs uppercase tracking-[0.35em] transition',
                selectedGenre === genre
                  ? 'border-white bg-white text-black'
                  : 'border-white/20 text-gray-300 hover:border-white/50',
              ].join(' ')}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Curated Drops</p>
            <h2 className="text-2xl font-semibold">Featured playlists</h2>
          </div>
          <p className="text-xs text-gray-500">
            Embedded straight from Spotify. Hit play or open in the Spotify app for full playback.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {filteredPlaylists.map((playlist) => (
            <article
              key={playlist.id}
              className="liquid-glass rounded-3xl border border-white/[0.10] bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.10),_0_8px_32px_rgba(0,0,0,0.4)]"
            >
              <div className="grid gap-6 p-6 lg:grid-cols-5">
                <div className="space-y-3 lg:col-span-2">
                  <img
                    src={playlist.coverImage}
                    alt={playlist.title}
                    className="h-48 w-full rounded-2xl object-cover"
                  />
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold">{playlist.title}</h3>
                    <p className="text-sm text-gray-400">{playlist.genre}</p>
                    <p className="text-xs uppercase tracking-[0.35em] text-gray-500">
                      Curated by {playlist.curator}
                    </p>
                  </div>
                  <p className="text-sm text-gray-300">{playlist.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {playlist.mood.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.35em] text-gray-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`https://open.spotify.com/playlist/${playlist.spotifyId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-outline text-[0.65rem]"
                    >
                      Open on Spotify
                    </a>
                  </div>
                </div>
                <div className="lg:col-span-3">
                  <iframe
                    title={`${playlist.title} Spotify embed`}
                    src={`https://open.spotify.com/embed/playlist/${playlist.spotifyId}?utm_source=generator`}
                    width="100%"
                    height="352"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="min-h-[352px] rounded-2xl border border-white/10 bg-black"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PlaylistDiscoveryPage;
