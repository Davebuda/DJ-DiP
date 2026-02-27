import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '../../context/AuthContext';
import {
  GET_DJS,
  GET_SONGS,
  GET_DJ_TOP10_LISTS,
  CREATE_DJ_TOP10_ENTRY,
  DELETE_DJ_TOP10_ENTRY,
  CREATE_SONG,
} from '../../graphql/queries';
import { Music, Plus, Trash2, Search, Star, Disc3 } from 'lucide-react';

const DJTop10Manager = () => {
  const { user } = useAuth();
  const [djId, setDjId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [creating, setCreating] = useState(false);

  const { data: djsData } = useQuery(GET_DJS);
  const { data: songsData, refetch: refetchSongs } = useQuery(GET_SONGS);
  const { data: top10Data, refetch: refetchTop10 } = useQuery(GET_DJ_TOP10_LISTS);

  const [createEntry] = useMutation(CREATE_DJ_TOP10_ENTRY);
  const [deleteEntry] = useMutation(DELETE_DJ_TOP10_ENTRY);
  const [createSong] = useMutation(CREATE_SONG);

  useEffect(() => {
    if (djsData?.dJs) {
      const profile = djsData.dJs.find(
        (dj: any) => dj.name?.toLowerCase() === user?.fullName?.toLowerCase(),
      );
      if (profile) setDjId(profile.id);
    }
  }, [djsData, user]);

  const myTop10 = top10Data?.djTop10Lists?.find((list: any) => list.djId === djId);
  const myTop10Songs = myTop10?.top10Songs || [];

  const availableSongs =
    songsData?.songs?.filter(
      (song: any) => !myTop10Songs.some((entry: any) => entry.song?.id === song.id),
    ) || [];

  const filteredSongs = availableSongs.filter(
    (song: any) =>
      song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddSong = async (songId: string) => {
    if (!djId) return;
    try {
      await createEntry({
        variables: { input: { djId, songId } },
      });
      await refetchTop10();
      setShowAddModal(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Error adding song:', error);
      alert('Failed to add song. Please try again.');
    }
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!djId || !newTitle.trim() || !newArtist.trim()) return;

    setCreating(true);
    try {
      // Parse duration from MM:SS or just seconds
      let durationSeconds = 0;
      if (newDuration.includes(':')) {
        const [mins, secs] = newDuration.split(':').map(Number);
        durationSeconds = (mins || 0) * 60 + (secs || 0);
      } else if (newDuration) {
        durationSeconds = parseInt(newDuration) || 0;
      }

      // Create the song
      const { data } = await createSong({
        variables: {
          input: {
            title: newTitle.trim(),
            artist: newArtist.trim(),
            album: null,
            duration: durationSeconds,
            spotifyId: null,
          },
        },
      });

      const songId = data?.createSong;
      if (!songId) throw new Error('Song creation failed');

      // Add it to top 10
      await createEntry({
        variables: { input: { djId, songId } },
      });

      await refetchSongs();
      await refetchTop10();

      // Reset form
      setNewTitle('');
      setNewArtist('');
      setNewGenre('');
      setNewDuration('');
      setShowCreateForm(false);
      setShowAddModal(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Error creating song:', error);
      alert('Failed to create song. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleRemoveSong = async (entryId: string) => {
    if (!confirm('Remove this track from your Top 10?')) return;
    try {
      await deleteEntry({ variables: { id: entryId } });
      await refetchTop10();
    } catch (error) {
      console.error('Error removing song:', error);
      alert('Failed to remove song. Please try again.');
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Top 10 Tracks</h1>
            <p className="text-gray-400">
              Curate your signature sound and showcase your musical identity
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            disabled={myTop10Songs.length >= 10}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF6B35] to-orange-500 hover:from-orange-600 hover:to-orange-600 text-white font-semibold transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Track
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="text-3xl font-bold text-white mb-1">{myTop10Songs.length}/10</div>
            <div className="text-sm text-gray-400">Tracks Added</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="text-3xl font-bold text-white mb-1">{availableSongs.length}</div>
            <div className="text-sm text-gray-400">Available Tracks</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="text-3xl font-bold text-white mb-1">--</div>
            <div className="text-sm text-gray-400">Total Plays</div>
          </div>
        </div>

        {/* Current Top 10 */}
        <section className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Music className="w-5 h-5" />
              Your Top 10
            </h2>
            <span className="text-sm text-gray-400">
              {myTop10Songs.length === 10
                ? 'Complete!'
                : `${10 - myTop10Songs.length} slots remaining`}
            </span>
          </div>

          {myTop10Songs.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 mb-2">Your Top 10 is empty</p>
              <p className="text-sm text-gray-500 mb-6">
                Start building your signature sound by adding tracks
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-orange-500/30 text-orange-400 transition"
              >
                Add Your First Track
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myTop10Songs.map((entry: any, index: number) => (
                <div
                  key={entry.id}
                  className="bg-black/30 border border-white/10 rounded-lg p-4 hover:bg-black/40 transition flex items-center gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF6B35] to-orange-500 flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>

                  {entry.song?.coverImageUrl && (
                    <img
                      src={entry.song.coverImageUrl}
                      alt={entry.song.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">
                      {entry.song?.title || 'Unknown Track'}
                    </h3>
                    <p className="text-sm text-gray-400 truncate">
                      {entry.song?.artist || 'Unknown Artist'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {entry.song?.duration > 0 && (
                      <span className="text-xs text-gray-500">
                        {Math.floor(entry.song.duration / 60)}:
                        {String(entry.song.duration % 60).padStart(2, '0')}
                      </span>
                    )}
                    <button
                      onClick={() => handleRemoveSong(entry.id)}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Tips */}
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-6">
          <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Pro Tips
          </h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• Your Top 10 is displayed prominently on your public profile</li>
            <li>• Update regularly to keep your profile fresh and engaging</li>
            <li>• Choose tracks that represent your signature sound and style</li>
            <li>• Mix classics with current favorites for a well-rounded showcase</li>
          </ul>
        </div>

        {/* Add Song Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Add Track to Top 10</h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setShowCreateForm(false);
                      setSearchQuery('');
                    }}
                    className="p-2 rounded-lg hover:bg-white/10 transition"
                  >
                    <span className="text-2xl text-gray-400">&times;</span>
                  </button>
                </div>

                {/* Toggle between search and create */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
                      !showCreateForm
                        ? 'bg-orange-500/20 border border-orange-500/40 text-orange-300'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    Search Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(true)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
                      showCreateForm
                        ? 'bg-orange-500/20 border border-orange-500/40 text-orange-300'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Plus className="w-4 h-4" />
                      Add New Song
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {showCreateForm ? (
                  /* ─── Create New Song Form ─── */
                  <form onSubmit={handleCreateAndAdd} className="space-y-5">
                    <div className="flex items-center gap-3 mb-2">
                      <Disc3 className="w-8 h-8 text-orange-400" />
                      <div>
                        <p className="text-white font-semibold">Create a New Track</p>
                        <p className="text-xs text-gray-500">
                          Add a song that isn't in the library yet
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Song Title *
                      </label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. Strobe"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:border-orange-500 focus:outline-none"
                        required
                        autoFocus
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Artist *</label>
                      <input
                        type="text"
                        value={newArtist}
                        onChange={(e) => setNewArtist(e.target.value)}
                        placeholder="e.g. deadmau5"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:border-orange-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Genre</label>
                        <input
                          type="text"
                          value={newGenre}
                          onChange={(e) => setNewGenre(e.target.value)}
                          placeholder="e.g. Progressive House"
                          className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Duration (MM:SS)
                        </label>
                        <input
                          type="text"
                          value={newDuration}
                          onChange={(e) => setNewDuration(e.target.value)}
                          placeholder="e.g. 3:45"
                          className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={creating || !newTitle.trim() || !newArtist.trim()}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-[#FF6B35] text-white font-bold uppercase tracking-wider hover:shadow-[0_0_25px_rgba(255,107,53,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creating ? 'Creating...' : 'Create & Add to Top 10'}
                    </button>
                  </form>
                ) : (
                  /* ─── Search Existing Songs ─── */
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tracks by title or artist..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white focus:border-orange-500 focus:outline-none"
                        autoFocus
                      />
                    </div>

                    <div className="space-y-2">
                      {filteredSongs.length === 0 ? (
                        <div className="text-center py-12 space-y-3">
                          <Music className="w-12 h-12 mx-auto text-gray-600" />
                          <p className="text-gray-400">
                            {availableSongs.length === 0
                              ? 'No songs in the library yet'
                              : 'No tracks match your search'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Switch to "Add New Song" to create a track
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowCreateForm(true)}
                            className="px-5 py-2.5 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-300 text-sm font-semibold hover:bg-orange-500/30 transition"
                          >
                            <span className="flex items-center gap-1.5">
                              <Plus className="w-4 h-4" />
                              Add New Song
                            </span>
                          </button>
                        </div>
                      ) : (
                        filteredSongs.map((song: any) => (
                          <button
                            key={song.id}
                            onClick={() => handleAddSong(song.id)}
                            className="w-full bg-black/30 hover:bg-black/50 border border-white/10 hover:border-orange-500/30 rounded-xl p-4 transition flex items-center gap-4 text-left"
                          >
                            {song.coverImageUrl ? (
                              <img
                                src={song.coverImageUrl}
                                alt={song.title}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                                <Music className="w-5 h-5 text-gray-600" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white truncate">{song.title}</h3>
                              <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                            </div>
                            {song.duration > 0 && (
                              <span className="text-xs text-gray-500">
                                {Math.floor(song.duration / 60)}:
                                {String(song.duration % 60).padStart(2, '0')}
                              </span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DJTop10Manager;
