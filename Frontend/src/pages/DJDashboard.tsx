import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { GET_DJS, GET_DJ_TOP10_LISTS } from '../graphql/queries';
import { Calendar, Music, Users, Edit, Star } from 'lucide-react';

const DJDashboard = () => {
  const { user, isDJ } = useAuth();
  const navigate = useNavigate();
  const [djProfile, setDjProfile] = useState<any>(null);

  const { data: djsData } = useQuery(GET_DJS);
  const { data: top10Data } = useQuery(GET_DJ_TOP10_LISTS);

  useEffect(() => {
    if (!isDJ) {
      navigate('/');
      return;
    }

    // Find the DJ profile for the logged-in user
    if (djsData?.dJs) {
      // In a real app, you'd query by userId
      // For now, we'll match by email or name
      const profile = djsData.dJs.find((dj: any) =>
        dj.name?.toLowerCase() === user?.fullName?.toLowerCase()
      );
      setDjProfile(profile);
    }
  }, [isDJ, navigate, djsData, user]);

  if (!djProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#140603] via-[#050202] to-black text-white px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold mb-4">Loading Dashboard...</h1>
            <p className="text-gray-400">
              {!isDJ && "You don't have DJ access."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const upcomingEvents = djProfile.upcomingEvents || [];
  const followerCount = djProfile.followerCount || 0;
  const djTop10 = top10Data?.djTop10Lists?.find((list: any) => list.djId === djProfile.id);
  const topTracksCount = djTop10?.top10Songs?.length || 0;

  const profileCompletionScore = calculateProfileCompletion(djProfile);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#140603] via-[#050202] to-black text-white px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FF6B35] to-orange-500 bg-clip-text text-transparent">
              DJ Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Welcome back, {djProfile.stageName || djProfile.name}!</p>
          </div>
          <Link
            to={`/djs/${djProfile.id}`}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition text-sm"
          >
            View Public Profile
          </Link>
        </div>

        {/* Profile Completion Banner */}
        {profileCompletionScore < 100 && (
          <div className="bg-gradient-to-r from-orange-500/20 to-[#FF6B35]/20 border border-orange-500/30 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">Complete Your Profile</h3>
                <p className="text-sm text-gray-300">
                  Your profile is {profileCompletionScore}% complete. A complete profile gets more visibility!
                </p>
              </div>
              <span className="text-3xl font-bold text-orange-400">{profileCompletionScore}%</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-[#FF6B35] h-2 rounded-full transition-all duration-500"
                style={{ width: `${profileCompletionScore}%` }}
              />
            </div>
            <div className="mt-4">
              <Link
                to="/dj-dashboard/edit-profile"
                className="text-sm text-orange-400 hover:text-orange-300 font-medium"
              >
                Complete Profile →
              </Link>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Followers"
            value={followerCount}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            label="Upcoming Events"
            value={upcomingEvents.length}
            color="from-[#FF6B35] to-orange-500"
          />
          <StatCard
            icon={<Music className="w-6 h-6" />}
            label="Top Tracks"
            value={topTracksCount}
            color="from-purple-500 to-[#FF6B35]"
          />
          <StatCard
            icon={<Star className="w-6 h-6" />}
            label="Profile Views"
            value="--"
            color="from-yellow-500 to-orange-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionCard
            icon={<Edit className="w-5 h-5" />}
            title="Edit Profile"
            description="Update your bio, photos, and details"
            to="/dj-dashboard/edit-profile"
            gradient="from-[#FF6B35]/20 to-orange-500/20"
            borderColor="border-orange-500/30"
          />
          <ActionCard
            icon={<Music className="w-5 h-5" />}
            title="Manage Top 10"
            description="Curate your signature sound"
            to="/dj-dashboard/top10"
            gradient="from-purple-500/20 to-[#FF6B35]/20"
            borderColor="border-purple-500/30"
          />
          <ActionCard
            icon={<Calendar className="w-5 h-5" />}
            title="My Events"
            description="View all your scheduled gigs"
            to="/dj-dashboard/events"
            gradient="from-blue-500/20 to-cyan-500/20"
            borderColor="border-blue-500/30"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Upcoming Events */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Upcoming Events</h2>
              <Link
                to="/dj-dashboard/events"
                className="text-sm text-orange-400 hover:text-orange-300"
              >
                View All
              </Link>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400 mb-4">No upcoming events scheduled</p>
                <p className="text-sm text-gray-500">Contact event organizers to get booked!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 5).map((event: any) => (
                  <EventCard key={event.eventId} event={event} />
                ))}
              </div>
            )}
          </div>

          {/* Profile Preview */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Profile Preview</h2>

            <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
              {djProfile.coverImageUrl && (
                <div className="h-32 overflow-hidden">
                  <img
                    src={djProfile.coverImageUrl}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  {djProfile.profilePictureUrl ? (
                    <img
                      src={djProfile.profilePictureUrl}
                      alt={djProfile.stageName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-orange-500"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6B35] to-orange-500 flex items-center justify-center text-2xl font-bold">
                      {djProfile.stageName?.[0] || djProfile.name?.[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{djProfile.stageName || djProfile.name}</h3>
                    <p className="text-sm text-gray-400">{djProfile.genre}</p>
                  </div>
                </div>

                {djProfile.tagline && (
                  <p className="text-sm text-gray-300 italic">"{djProfile.tagline}"</p>
                )}

                {djProfile.bio && (
                  <p className="text-sm text-gray-400 line-clamp-3">{djProfile.bio}</p>
                )}

                <div className="pt-4 border-t border-white/10">
                  <Link
                    to="/dj-dashboard/edit-profile"
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-gradient-to-r from-[#FF6B35] to-orange-500 hover:from-orange-600 hover:to-orange-600 transition text-sm font-semibold"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400">Quick Stats</h3>
              <div className="space-y-3">
                <QuickStat label="Total Events" value={upcomingEvents.length} />
                <QuickStat label="Followers" value={followerCount} />
                <QuickStat label="Top Tracks" value={topTracksCount} />
                <QuickStat label="Member Since" value="2024" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ icon, label, value, color }: any) => (
  <div className="bg-white/5 border border-white/10 rounded-lg p-6">
    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} bg-opacity-20 flex items-center justify-center mb-4`}>
      {icon}
    </div>
    <div className="text-3xl font-bold mb-1">{value}</div>
    <div className="text-sm text-gray-400">{label}</div>
  </div>
);

const ActionCard = ({ icon, title, description, to, gradient, borderColor }: any) => (
  <Link
    to={to}
    className={`bg-gradient-to-br ${gradient} border ${borderColor} rounded-lg p-6 hover:scale-105 transition-transform`}
  >
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-gray-300">{description}</p>
      </div>
    </div>
  </Link>
);

const EventCard = ({ event }: any) => (
  <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition">
    <div className="flex gap-4">
      {event.imageUrl && (
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-20 h-20 rounded-lg object-cover"
        />
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{event.title}</h3>
        <p className="text-sm text-gray-400">{event.venueName}, {event.city}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <span>{new Date(event.date).toLocaleDateString()}</span>
          <span>•</span>
          <span>{event.price} NOK</span>
        </div>
      </div>
    </div>
  </div>
);

const QuickStat = ({ label, value }: any) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-400">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

const calculateProfileCompletion = (profile: any) => {
  let score = 0;
  const checks = [
    profile.profilePictureUrl,
    profile.coverImageUrl,
    profile.bio,
    profile.longBio,
    profile.tagline,
    profile.genre,
    profile.specialties,
    profile.achievements,
    profile.yearsExperience,
    profile.topTracks?.length > 0,
  ];

  checks.forEach(check => {
    if (check) score += 10;
  });

  return score;
};

export default DJDashboard;
