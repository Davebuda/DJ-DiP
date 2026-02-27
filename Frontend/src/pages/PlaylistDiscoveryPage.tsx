import { useMemo, useState } from 'react';
import { featuredPlaylists } from '../data/featuredPlaylists';
import { ScrollReveal } from '../components/effects/ScrollReveal';

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
    <div className="min-h-screen text-white">
      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden">
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
              Dive into genre stories,{' '}
              <span className="bg-gradient-to-r from-orange-400 to-[#FF6B35] bg-clip-text text-transparent">
                powered by Spotify
              </span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
              We curate living, breathing playlists with the DJs shaping the KlubN universe. Expect
              genre blends, mood-based DJ notes, and direct Spotify playback so you can preview sets
              before stepping into a venue.
            </p>
          </div>

          {/* Genre filters */}
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
            Embedded straight from Spotify. Hit play or open in the Spotify app for full playback.
          </p>
        </div>

        {filteredPlaylists.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-xl font-semibold text-gray-400">No playlists in this genre yet</p>
            <p className="text-gray-500 text-sm">Try selecting a different genre or check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredPlaylists.map((playlist, idx) => (
              <ScrollReveal key={playlist.id} delay={idx * 0.08}>
                <article className="liquid-glass rounded-[32px] border border-white/[0.10] bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl overflow-hidden hover:border-orange-400/20 transition-all duration-300">
                  <div className="grid gap-6 p-6 lg:grid-cols-5">
                    {/* Info side */}
                    <div className="space-y-4 lg:col-span-2">
                      <div className="relative overflow-hidden rounded-2xl">
                        <img
                          src={playlist.coverImage}
                          alt={playlist.title}
                          className="h-48 w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[0.6rem] uppercase tracking-wider text-white/80 border border-white/10">
                          {playlist.genre}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-xl font-bold">{playlist.title}</h3>
                        <p className="text-xs uppercase tracking-[0.35em] text-gray-500">
                          Curated by {playlist.curator}
                        </p>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">{playlist.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {playlist.mood.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 px-3 py-1 text-[0.6rem] uppercase tracking-wider text-gray-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <a
                        href={`https://open.spotify.com/playlist/${playlist.spotifyId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/30 text-[#1DB954] text-xs font-bold uppercase tracking-wider hover:bg-[#1DB954]/30 transition"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                        Open on Spotify
                      </a>
                    </div>

                    {/* Spotify embed */}
                    <div className="lg:col-span-3">
                      <iframe
                        title={`${playlist.title} Spotify embed`}
                        src={`https://open.spotify.com/embed/playlist/${playlist.spotifyId}?utm_source=generator&theme=0`}
                        width="100%"
                        height="352"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="min-h-[352px] rounded-2xl border border-white/10 bg-black"
                      />
                    </div>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PlaylistDiscoveryPage;
