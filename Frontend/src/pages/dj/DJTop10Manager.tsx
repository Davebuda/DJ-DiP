import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '../../context/AuthContext';
import { GET_DJS, GET_SONGS, GET_DJ_TOP10_LISTS, CREATE_DJ_TOP10_ENTRY, DELETE_DJ_TOP10_ENTRY } from '../../graphql/queries';
import { Music, Plus, Trash2, Search, Star } from 'lucide-react';

const DJTop10Manager = () => {
  const { user } = useAuth();
  const [djId, setDjId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: djsData } = useQuery(GET_DJS);
  const { data: songsData } = useQuery(GET_SONGS);
  const { data: top10Data, refetch: refetchTop10 } = useQuery(GET_DJ_TOP10_LISTS);

  const [createEntry] = useMutation(CREATE_DJ_TOP10_ENTRY);
  const [deleteEntry] = useMutation(DELETE_DJ_TOP10_ENTRY);

  useEffect(() => {
    if (djsData?.dJs) {
      const profile = djsData.dJs.find((dj: any) =>
        dj.name?.toLowerCase() === user?.fullName?.toLowerCase()
      );
      if (profile) setDjId(profile.id);
    }
  }, [djsData, user]);

  const myTop10 = top10Data?.djTop10Lists?.find((list: any) => list.djId === djId);
  const myTop10Songs = myTop10?.top10Songs || [];

  const availableSongs = songsData?.songs?.filter((song: any) =>
    !myTop10Songs.some((entry: any) => entry.song?.id === song.id)
  ) || [];

  const filteredSongs = availableSongs.filter((song: any) =>
    song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSong = async (songId: string) => {
    if (!djId) return;
    try {
      await createEntry({
        variables: { input: { djId, songId } }
      });
      await refetchTop10();
      setShowAddModal(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Error adding song:', error);
      alert('Failed to add song. Please try again.');
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
            <p className="text-gray-400">Curate your signature sound and showcase your musical identity</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            disabled={myTop10Songs.length >= 10}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-semibold transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              {myTop10Songs.length === 10 ? 'Complete!' : `${10 - myTop10Songs.length} slots remaining`}
            </span>
          </div>

          {myTop10Songs.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 mb-2">Your Top 10 is empty</p>
              <p className="text-sm text-gray-500 mb-6">Start building your signature sound by adding tracks</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 text-pink-400 transition"
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
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center font-bold text-lg">
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
                    {entry.song?.duration && (
                      <span className="text-xs text-gray-500">
                        {Math.floor(entry.song.duration / 60)}:{String(entry.song.duration % 60).padStart(2, '0')}
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
            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Add Track to Top 10</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition"
                  >
                    <span className="text-2xl text-gray-400">×</span>
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tracks by title or artist..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:border-pink-500 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-2">
                {filteredSongs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No tracks found</p>
                    <p className="text-sm text-gray-500 mt-2">Try a different search term</p>
                  </div>
                ) : (
                  filteredSongs.map((song: any) => (
                    <button
                      key={song.id}
                      onClick={() => handleAddSong(song.id)}
                      className="w-full bg-black/30 hover:bg-black/50 border border-white/10 hover:border-pink-500/30 rounded-lg p-4 transition flex items-center gap-4 text-left"
                    >
                      {song.coverImageUrl && (
                        <img
                          src={song.coverImageUrl}
                          alt={song.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{song.title}</h3>
                        <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                      </div>
                      {song.duration && (
                        <span className="text-xs text-gray-500">
                          {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
                        </span>
                      )}
                    </button>
                  ))
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
