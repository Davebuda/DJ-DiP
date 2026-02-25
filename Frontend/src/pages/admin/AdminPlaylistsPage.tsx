import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  CREATE_DJ_TOP10_ENTRY,
  CREATE_SONG,
  DELETE_DJ_TOP10_ENTRY,
  GET_DJ_TOP10_LISTS,
  GET_DJS,
  GET_SONGS,
} from '../../graphql/queries';

type PlaylistEntry = {
  id: string;
  djId: string;
  songId: string;
  songTitle: string;
};

type PlaylistGroup = {
  djId: string;
  djStageName: string;
  top10Songs: PlaylistEntry[];
};

type SongOption = {
  id: string;
  title: string;
  artist: string;
  album?: string | null;
  duration?: number | null;
};

interface PlaylistQueryData {
  djTop10Lists: PlaylistGroup[];
}

interface SongsQueryData {
  songs: SongOption[];
}

const formatDuration = (seconds?: number | null) => {
  if (!seconds || seconds <= 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const AdminPlaylistsPage = () => {
  const inputClass =
    'w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500';
  const selectClass = `${inputClass} appearance-none`;

  const { data: playlistsData, loading, error, refetch } =
    useQuery<PlaylistQueryData>(GET_DJ_TOP10_LISTS);
  const { data: djsData } = useQuery(GET_DJS);
  const { data: songsData, refetch: refetchSongs } = useQuery<SongsQueryData>(GET_SONGS);

  const [createEntry, { loading: creatingEntry }] = useMutation(CREATE_DJ_TOP10_ENTRY);
  const [deleteEntry, { loading: deletingEntry }] = useMutation(DELETE_DJ_TOP10_ENTRY);
  const [createSong, { loading: creatingSong }] = useMutation(CREATE_SONG);

  const playlists = useMemo(() => playlistsData?.djTop10Lists ?? [], [playlistsData]);
  const djs = useMemo(() => djsData?.dJs ?? [], [djsData]);
  const songs = useMemo(() => songsData?.songs ?? [], [songsData]);

  const [djId, setDjId] = useState('');
  const [songId, setSongId] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [songForm, setSongForm] = useState({
    title: '',
    artist: '',
    album: '',
    duration: '',
    spotifyId: '',
  });

  const handleAddEntry = async (event: FormEvent) => {
    event.preventDefault();
    setFeedback(null);

    if (!djId || !songId) {
      setFeedback({ type: 'error', text: 'Select both a DJ and a song before adding.' });
      return;
    }

    try {
      await createEntry({ variables: { input: { djId, songId } } });
      await refetch();
      setSongId('');
      setFeedback({ type: 'success', text: 'Track added to DJ Top 10.' });
    } catch (mutationError) {
      const message =
        mutationError instanceof Error ? mutationError.message : 'Failed to add track.';
      setFeedback({ type: 'error', text: message });
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Remove this track from the playlist?')) return;
    try {
      await deleteEntry({ variables: { id: entryId } });
      await refetch();
      setFeedback({ type: 'success', text: 'Track removed.' });
    } catch (mutationError) {
      const message =
        mutationError instanceof Error ? mutationError.message : 'Failed to delete track.';
      setFeedback({ type: 'error', text: message });
    }
  };

  const handleCreateSong = async (event: FormEvent) => {
    event.preventDefault();
    setFeedback(null);
    if (!songForm.title.trim() || !songForm.artist.trim()) {
      setFeedback({ type: 'error', text: 'Song title and artist are required.' });
      return;
    }

    try {
      const durationSeconds = parseInt(songForm.duration, 10);
      const response = await createSong({
        variables: {
          input: {
            title: songForm.title.trim(),
            artist: songForm.artist.trim(),
            album: songForm.album.trim() || null,
            duration: Number.isFinite(durationSeconds) && durationSeconds > 0 ? durationSeconds : 0,
            spotifyId: songForm.spotifyId.trim() || null,
          },
        },
      });

      await refetchSongs();
      const newSongId = response.data?.createSong;
      if (newSongId) {
        setSongId(newSongId);
      }
      setSongForm({ title: '', artist: '', album: '', duration: '', spotifyId: '' });
      setFeedback({ type: 'success', text: 'Song added to catalog.' });
    } catch (mutationError) {
      const message =
        mutationError instanceof Error ? mutationError.message : 'Failed to add song.';
      setFeedback({ type: 'error', text: message });
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-400">Loading DJ playlists…</div>;
  }

  if (error) {
    return (
      <div className="rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
        Failed to load playlists: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Curation</p>
        <h1 className="text-2xl font-semibold">DJ Top 10 Playlists</h1>
        <p className="text-sm text-gray-400">
          Connect DJs to their signature tracks. Use the song catalog builder below or pick an
          existing track, then assign it to any DJ&apos;s Top 10.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <form className="card space-y-4" onSubmit={handleAddEntry}>
          <div>
            <h2 className="text-lg font-semibold">Add Track to DJ</h2>
            <p className="text-sm text-gray-400">
              Select a DJ and a song to append to their Top 10 list.
            </p>
          </div>

          {feedback && (
            <div
              className={`rounded px-4 py-3 text-sm ${
                feedback.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/30 text-green-200'
                  : 'bg-red-500/10 border border-red-500/30 text-red-200'
              }`}
            >
              {feedback.text}
            </div>
          )}

          <label className="space-y-1 text-sm font-semibold text-gray-300">
            DJ
            <select className={selectClass} value={djId} onChange={(e) => setDjId(e.target.value)}>
              <option value="">Select DJ</option>
              {djs.map((dj: any) => (
                <option key={dj.id} value={dj.id}>
                  {dj.stageName || dj.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm font-semibold text-gray-300">
            Song
            <select
              className={selectClass}
              value={songId}
              onChange={(e) => setSongId(e.target.value)}
            >
              <option value="">Select song</option>
              {songs.map((song) => (
                <option key={song.id} value={song.id}>
                  {song.title} — {song.artist}
                  {song.duration ? ` (${formatDuration(song.duration)})` : ''}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="btn-primary"
            disabled={creatingEntry || !djId || !songId}
          >
            Add to Top 10
          </button>
        </form>

        <form className="card space-y-4" onSubmit={handleCreateSong}>
          <div>
            <h2 className="text-lg font-semibold">Add Song to Catalog</h2>
            <p className="text-sm text-gray-400">
              Missing a track? Capture it here, then attach it to any DJ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1 text-sm font-semibold text-gray-300">
              Title
              <input
                type="text"
                className={inputClass}
                value={songForm.title}
                onChange={(e) => setSongForm((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </label>
            <label className="space-y-1 text-sm font-semibold text-gray-300">
              Artist
              <input
                type="text"
                className={inputClass}
                value={songForm.artist}
                onChange={(e) => setSongForm((prev) => ({ ...prev, artist: e.target.value }))}
                required
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1 text-sm font-semibold text-gray-300">
              Album
              <input
                type="text"
                className={inputClass}
                value={songForm.album}
                onChange={(e) => setSongForm((prev) => ({ ...prev, album: e.target.value }))}
              />
            </label>
            <label className="space-y-1 text-sm font-semibold text-gray-300">
              Duration (seconds)
              <input
                type="number"
                min="0"
                className={inputClass}
                value={songForm.duration}
                onChange={(e) => setSongForm((prev) => ({ ...prev, duration: e.target.value }))}
              />
            </label>
          </div>

          <label className="space-y-1 text-sm font-semibold text-gray-300">
            Spotify ID
            <input
              type="text"
              className={inputClass}
              value={songForm.spotifyId}
              onChange={(e) => setSongForm((prev) => ({ ...prev, spotifyId: e.target.value }))}
              placeholder="Optional integration hook"
            />
          </label>

          <button type="submit" className="btn-outline" disabled={creatingSong}>
            Add Song
          </button>
        </form>
      </section>

      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Current Playlists</h2>
            <p className="text-sm text-gray-400">
              Each block represents a DJ&apos;s Top 10. Remove tracks as you refresh rotations.
            </p>
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-gray-400">
            {playlists.length} DJs
          </span>
        </div>

        {playlists.length === 0 && (
          <p className="py-6 text-center text-gray-500">
            No playlists yet. Add a song to a DJ to get started.
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {playlists.map((playlist) => (
            <div key={playlist.djId} className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{playlist.djStageName}</h3>
                  <p className="text-xs uppercase tracking-[0.35em] text-gray-400">
                    {playlist.top10Songs.length} tracks
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-3 text-sm">
                {playlist.top10Songs.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/30 px-3 py-2"
                  >
                    <div>
                      <p className="font-medium text-white">{entry.songTitle}</p>
                      <p className="text-[0.7rem] uppercase tracking-[0.3em] text-gray-500">
                        {entry.songId}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-xs uppercase tracking-widest text-red-400"
                      onClick={() => handleDeleteEntry(entry.id)}
                      disabled={deletingEntry}
                    >
                      Remove
                    </button>
                  </li>
                ))}
                {playlist.top10Songs.length === 0 && (
                  <li className="rounded-2xl border border-dashed border-white/10 px-3 py-2 text-center text-gray-500">
                    No tracks assigned yet.
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPlaylistsPage;
