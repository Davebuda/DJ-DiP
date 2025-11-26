import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '../../context/AuthContext';
import { GET_DJS, GET_DJ_BY_ID, UPDATE_DJ } from '../../graphql/queries';
import { Camera, Save, X, Plus } from 'lucide-react';
import ImageUpload from '../../components/common/ImageUpload';

interface SocialLink {
  label: string;
  url: string;
}

const DJProfileEditor = () => {
  const { user, isDJ } = useAuth();
  const navigate = useNavigate();
  const [djId, setDjId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: djsData } = useQuery(GET_DJS);
  const { data: djData, loading: loadingDJ } = useQuery(GET_DJ_BY_ID, {
    variables: { id: djId },
    skip: !djId,
  });

  const [updateDJ] = useMutation(UPDATE_DJ, {
    refetchQueries: [{ query: GET_DJS }, { query: GET_DJ_BY_ID, variables: { id: djId } }],
  });

  // Form state
  const [formData, setFormData] = useState({
    stageName: '',
    bio: '',
    longBio: '',
    tagline: '',
    genre: '',
    profilePictureUrl: '',
    coverImageUrl: '',
    specialties: '',
    achievements: '',
    yearsExperience: 0,
    influencedBy: '',
    equipmentUsed: '',
    topTracks: [] as string[],
    socialLinks: [] as SocialLink[],
  });

  useEffect(() => {
    if (!isDJ) {
      navigate('/');
      return;
    }

    // Find DJ profile for logged-in user
    if (djsData?.dJs) {
      const profile = djsData.dJs.find((dj: any) =>
        dj.name?.toLowerCase() === user?.fullName?.toLowerCase()
      );
      if (profile) {
        setDjId(profile.id);
      }
    }
  }, [isDJ, navigate, djsData, user]);

  useEffect(() => {
    if (djData?.dj) {
      const dj = djData.dj;
      setFormData({
        stageName: dj.stageName || '',
        bio: dj.bio || '',
        longBio: dj.longBio || '',
        tagline: dj.tagline || '',
        genre: dj.genre || '',
        profilePictureUrl: dj.profilePictureUrl || '',
        coverImageUrl: dj.coverImageUrl || '',
        specialties: dj.specialties || '',
        achievements: dj.achievements || '',
        yearsExperience: dj.yearsExperience || 0,
        influencedBy: dj.influencedBy || '',
        equipmentUsed: dj.equipmentUsed || '',
        topTracks: dj.topTracks || [],
        socialLinks: dj.socialLinks || [],
      });
    }
  }, [djData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!djId) return;

    setSaving(true);
    try {
      await updateDJ({
        variables: {
          id: djId,
          input: {
            stageName: formData.stageName,
            bio: formData.bio,
            longBio: formData.longBio,
            tagline: formData.tagline,
            genre: formData.genre,
            profilePictureUrl: formData.profilePictureUrl,
            coverImageUrl: formData.coverImageUrl,
            specialties: formData.specialties,
            achievements: formData.achievements,
            yearsExperience: parseInt(formData.yearsExperience.toString()) || 0,
            influencedBy: formData.influencedBy,
            equipmentUsed: formData.equipmentUsed,
            topTracks: formData.topTracks.filter(t => t.trim()),
            socialLinks: JSON.stringify(formData.socialLinks),
          },
        },
      });
      alert('Profile updated successfully!');
      navigate('/dj-dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addSocialLink = () => {
    setFormData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { label: '', url: '' }],
    }));
  };

  const removeSocialLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  const updateSocialLink = (index: number, field: 'label' | 'url', value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ),
    }));
  };

  const addTopTrack = () => {
    setFormData(prev => ({
      ...prev,
      topTracks: [...prev.topTracks, ''],
    }));
  };

  const removeTopTrack = (index: number) => {
    setFormData(prev => ({
      ...prev,
      topTracks: prev.topTracks.filter((_, i) => i !== index),
    }));
  };

  const updateTopTrack = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      topTracks: prev.topTracks.map((track, i) => (i === index ? value : track)),
    }));
  };

  if (loadingDJ) {
    return (
      <div className="p-8">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Edit DJ Profile</h1>
            <p className="text-gray-400">Customize your profile to showcase your unique sound</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dj-dashboard')}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Cover & Profile Images */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Profile Images
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cover Image (Hero Background)
              </label>
              <ImageUpload
                currentImageUrl={formData.coverImageUrl}
                onImageUploaded={(url) => setFormData(prev => ({ ...prev, coverImageUrl: url }))}
                folder="dj-covers"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Profile Picture
              </label>
              <ImageUpload
                currentImageUrl={formData.profilePictureUrl}
                onImageUploaded={(url) => setFormData(prev => ({ ...prev, profilePictureUrl: url }))}
                folder="dj-profiles"
              />
            </div>
          </section>

          {/* Basic Info */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Stage Name *
              </label>
              <input
                type="text"
                value={formData.stageName}
                onChange={(e) => setFormData(prev => ({ ...prev, stageName: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white focus:border-pink-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tagline (Catchy one-liner)
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                placeholder="e.g., Bringing the underground to the main stage"
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Genre *
              </label>
              <input
                type="text"
                value={formData.genre}
                onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                placeholder="e.g., Techno, House, Trance"
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white focus:border-pink-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                value={formData.yearsExperience}
                onChange={(e) => setFormData(prev => ({ ...prev, yearsExperience: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white focus:border-pink-500 focus:outline-none"
                min="0"
              />
            </div>
          </section>

          {/* Bio */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white">Biography</h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Short Bio (Card Display) *
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                placeholder="A brief introduction shown on DJ cards..."
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white focus:border-pink-500 focus:outline-none resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Extended Bio (Profile Page)
              </label>
              <textarea
                value={formData.longBio}
                onChange={(e) => setFormData(prev => ({ ...prev, longBio: e.target.value }))}
                rows={6}
                placeholder="Your full story, musical journey, and what makes you unique..."
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white focus:border-pink-500 focus:outline-none resize-none"
              />
            </div>
          </section>

          {/* Creative DNA */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white">Creative DNA</h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Specialties
              </label>
              <textarea
                value={formData.specialties}
                onChange={(e) => setFormData(prev => ({ ...prev, specialties: e.target.value }))}
                rows={2}
                placeholder="e.g., Live mixing, vinyl sets, production"
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white focus:border-pink-500 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Achievements
              </label>
              <textarea
                value={formData.achievements}
                onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
                rows={2}
                placeholder="Awards, notable gigs, releases..."
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white focus:border-pink-500 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Influenced By
              </label>
              <textarea
                value={formData.influencedBy}
                onChange={(e) => setFormData(prev => ({ ...prev, influencedBy: e.target.value }))}
                rows={2}
                placeholder="Artists and DJs who inspire you..."
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white focus:border-pink-500 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Equipment Used
              </label>
              <textarea
                value={formData.equipmentUsed}
                onChange={(e) => setFormData(prev => ({ ...prev, equipmentUsed: e.target.value }))}
                rows={2}
                placeholder="CDJs, mixers, controllers, software..."
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white focus:border-pink-500 focus:outline-none resize-none"
              />
            </div>
          </section>

          {/* Top Tracks */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Top Tracks</h2>
              <button
                type="button"
                onClick={addTopTrack}
                className="px-3 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 text-pink-400 text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Track
              </button>
            </div>

            {formData.topTracks.map((track, index) => (
              <div key={index} className="flex gap-2">
                <span className="flex-shrink-0 w-8 h-10 flex items-center justify-center text-gray-400 font-semibold">
                  {index + 1}.
                </span>
                <input
                  type="text"
                  value={track}
                  onChange={(e) => updateTopTrack(index, e.target.value)}
                  placeholder="Track name"
                  className="flex-1 px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white focus:border-pink-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeTopTrack(index)}
                  className="flex-shrink-0 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {formData.topTracks.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No tracks added yet. Click "Add Track" to showcase your signature sound.
              </p>
            )}
          </section>

          {/* Social Links */}
          <section className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Social Links</h2>
              <button
                type="button"
                onClick={addSocialLink}
                className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Link
              </button>
            </div>

            {formData.socialLinks.map((link, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => updateSocialLink(index, 'label', e.target.value)}
                  placeholder="Platform (e.g., SoundCloud)"
                  className="w-1/3 px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white focus:border-pink-500 focus:outline-none"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white focus:border-pink-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  className="flex-shrink-0 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {formData.socialLinks.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                Add your social media and music platform links to expand your reach.
              </p>
            )}
          </section>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/dj-dashboard')}
              className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-semibold transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DJProfileEditor;
