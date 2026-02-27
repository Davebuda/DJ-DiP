import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { FOLLOW_DJ, GET_DJ_BY_ID, GET_DJ_TOP10_LISTS, IS_FOLLOWING_DJ, UNFOLLOW_DJ, GET_DJ_REVIEWS, CREATE_DJ_REVIEW } from '../graphql/queries';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { Star, Send } from 'lucide-react';

type EventSummary = {
  eventId: string;
  title: string;
  date: string;
  venueName: string;
  city?: string;
  price: number;
  imageUrl?: string;
};

type SocialLink = {
  label: string;
  url: string;
};

type Song = {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  duration: number;
  coverImageUrl?: string;
  audioPreviewUrl?: string;
};

type Top10Entry = {
  id: string;
  djId: string;
  songId: string;
  songTitle: string;
  song?: Song;
};

type DJProfile = {
  id: string;
  name: string;
  stageName: string;
  bio: string;
  longBio?: string;
  genre: string;
  profilePictureUrl?: string;
  coverImageUrl?: string;
  tagline?: string;
  specialties?: string;
  achievements?: string;
  yearsExperience?: number;
  influencedBy?: string;
  equipmentUsed?: string;
  topTracks: string[];
  followerCount: number;
  upcomingEvents: EventSummary[];
  socialLinks: SocialLink[];
};

const DJProfilePage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { siteSettings } = useSiteSettings();

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

  const { data, loading, error } = useQuery(GET_DJ_BY_ID, {
    variables: { id },
    skip: !id,
  });

  const { data: top10Data } = useQuery(GET_DJ_TOP10_LISTS);

  const {
    data: followStatus,
    refetch: refetchFollowStatus,
    loading: followStatusLoading,
  } = useQuery(IS_FOLLOWING_DJ, {
    variables: { userId: resolvedUserId, djId: id },
    skip: !(id && resolvedUserId),
  });

  const [followDj, { loading: followLoading }] = useMutation(FOLLOW_DJ);
  const [unfollowDj, { loading: unfollowLoading }] = useMutation(UNFOLLOW_DJ);

  // Reviews
  const { data: reviewsData, refetch: refetchReviews } = useQuery(GET_DJ_REVIEWS, {
    variables: { djId: id },
    skip: !id,
  });
  const [createReview, { loading: submittingReview }] = useMutation(CREATE_DJ_REVIEW);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const reviews = reviewsData?.djReviews ?? [];
  const averageRating = reviews.length > 0
    ? Math.round(reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length * 10) / 10
    : 0;

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      setReviewStatus({ type: 'error', message: 'Please select a rating' });
      return;
    }
    try {
      await createReview({
        variables: {
          input: {
            djId: id,
            rating: reviewRating,
            comment: reviewComment.trim() || null,
          },
        },
      });
      setReviewRating(0);
      setReviewComment('');
      setReviewStatus({ type: 'success', message: 'Review submitted!' });
      refetchReviews();
      setTimeout(() => setReviewStatus(null), 3000);
    } catch (err: any) {
      setReviewStatus({ type: 'error', message: err.message || 'Failed to submit review' });
    }
  };

  const dj: DJProfile | undefined = data?.dj;
  const isFollowing = Boolean(followStatus?.isFollowingDj);

  // Get Top 10 tracks for this DJ from the relationship
  const myTop10 = top10Data?.djTop10Lists?.find((list: any) => list.djId === id);
  const top10Tracks: Top10Entry[] = myTop10?.top10Songs || [];

  const handleFollowClick = async () => {
    if (!dj || !id || !resolvedUserId) return;
    if (!isAuthenticated) {
      alert('Following as guest. Create an account later to sync your lineup.');
    }

    const variables = { input: { userId: resolvedUserId, djId: id } };
    if (isFollowing) {
      await unfollowDj({ variables });
    } else {
      await followDj({ variables });
    }
    await refetchFollowStatus();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400" />
      </div>
    );
  }

  if (error || !dj) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center space-y-3 px-6">
        <p className="text-orange-400 text-lg">Unable to load DJ profile</p>
        <p className="text-gray-500 text-sm">{error?.message ?? 'Profile not found'}</p>
      </div>
    );
  }

  const heroBackground = dj.coverImageUrl ?? siteSettings.defaultDjImageUrl ?? '/media/defaults/dj.jpg';
  const defaultEventImage = siteSettings.defaultEventImageUrl ?? '/media/defaults/event.jpg';
  const genreTags = (dj.genre ?? '')
    .split(',')
    .map((genre) => genre.trim())
    .filter(Boolean);
  const creativeTiles = [
    { label: 'Specialties', value: dj.specialties },
    { label: 'Achievements', value: dj.achievements },
    { label: 'Influences', value: dj.influencedBy },
    { label: 'Equipment', value: dj.equipmentUsed },
  ].filter((tile) => Boolean(tile.value));
  const socialEntries = dj.socialLinks?.filter((link) => Boolean(link.url)) ?? [];

  return (
    <div className="text-white min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBackground} alt={dj.stageName} className="h-[540px] w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/90 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,107,53,0.20),transparent_50%)] mix-blend-screen" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_80%,rgba(93,23,37,0.25),transparent_50%)]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)_260px] gap-10 items-center">
            {/* Left rail */}
            <div className="space-y-8 border-l border-white/10 pl-6">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.6em] text-orange-300">Featured DJ</p>
                <h1 className="font-display text-5xl font-black leading-tight tracking-tight">{dj.stageName}</h1>
                {dj.tagline && <p className="text-lg text-gray-300">{dj.tagline}</p>}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{dj.bio}</p>
              <div className="flex flex-wrap gap-2">
                {genreTags.slice(0, 4).map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full border border-white/20 px-3 py-1 text-[0.65rem] uppercase tracking-[0.35em] text-gray-200"
                  >
                    {genre}
                  </span>
                ))}
                {genreTags.length === 0 && (
                  <span className="rounded-full border border-white/20 px-3 py-1 text-[0.65rem] uppercase tracking-[0.35em] text-gray-200">
                    genre blend
                  </span>
                )}
              </div>
              <div className="text-sm space-y-2">
                <div className="flex gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.5em] text-gray-500">Followers</p>
                    <p className="text-3xl font-semibold text-white">{dj.followerCount.toLocaleString()}</p>
                  </div>
                  {dj.yearsExperience && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.5em] text-gray-500">Years Active</p>
                      <p className="text-3xl font-semibold text-white">{dj.yearsExperience}</p>
                    </div>
                  )}
                </div>
                {dj.specialties && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.5em] text-gray-500">Specialties</p>
                    <p className="text-gray-200">{dj.specialties}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Center hero portrait */}
            <div className="relative">
              <div className="absolute -left-12 -right-12 -top-6 -bottom-6 bg-gradient-to-b from-white/10 to-transparent opacity-40 blur-[120px]" />
              <div className="relative h-[460px] rounded-[60px] border border-white/10 overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80" />
                <img
                  src={dj.profilePictureUrl ?? heroBackground}
                  alt={dj.stageName}
                  className="h-full w-full object-cover object-top"
                />
              </div>
            </div>

            {/* Right rail */}
            <div className="space-y-5">
              <button
                type="button"
                onClick={handleFollowClick}
                disabled={followLoading || unfollowLoading || followStatusLoading}
                className={`w-full px-8 py-3 rounded-full text-xs font-semibold tracking-[0.3em] uppercase transition-all ${
                  isFollowing
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-gradient-to-r from-orange-500 to-[#FF6B35] text-white hover:shadow-[0_0_30px_rgba(255,107,53,0.5)] hover:scale-105'
                } disabled:opacity-60`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <Link
                to="/events"
                className="block w-full text-center px-8 py-3 rounded-full border border-white/20 text-xs font-semibold tracking-[0.3em] uppercase hover:border-orange-400 transition"
              >
                Upcoming Sets
              </Link>
              {socialEntries.length > 0 && (
                <div className="space-y-2 text-sm">
                  {socialEntries.map((entry) => (
                    <a
                      key={entry.label}
                      href={entry.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-2 text-gray-200 hover:border-orange-400 transition"
                    >
                      <span>{entry.label}</span>
                      <span className="text-xs uppercase tracking-[0.4em]">↗</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-20 space-y-16">
        {dj.longBio && (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.5em] text-orange-400">Storyline</p>
            <p className="text-gray-200 leading-relaxed whitespace-pre-line">{dj.longBio}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-10">
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.5em] text-orange-400">Top Tracks</p>
                <span className="text-xs uppercase tracking-[0.3em] text-gray-500">
                  {top10Tracks.length.toString().padStart(2, '0')}
                </span>
              </div>
              {top10Tracks.length === 0 ? (
                <p className="text-gray-500">Top 10 list coming soon.</p>
              ) : (
                <div className="space-y-2">
                  {top10Tracks.map((entry, index) => {
                    const song = entry.song;
                    const title = song?.title || entry.songTitle || 'Unknown Track';
                    const artist = song?.artist || 'Unknown Artist';
                    const duration = song?.duration || 0;
                    const minutes = Math.floor(duration / 60);
                    const seconds = duration % 60;

                    return (
                      <div
                        key={entry.id}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-white/10 to-transparent px-4 py-3 text-sm hover:border-orange-400/30 transition"
                      >
                        <span className="text-xs font-semibold text-orange-300 w-6">{String(index + 1).padStart(2, '0')}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{title}</p>
                          <p className="text-xs text-gray-400 truncate">{artist}</p>
                        </div>
                        {duration > 0 && (
                          <span className="text-xs text-gray-500">{minutes}:{String(seconds).padStart(2, '0')}</span>
                        )}
                        <span className="text-[0.65rem] uppercase tracking-[0.3em] text-gray-500">♫</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.5em] text-orange-400">Creative DNA</p>
              {creativeTiles.length === 0 ? (
                <p className="text-gray-500 text-sm">More details coming soon.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {creativeTiles.map((tile) => (
                    <div
                      key={tile.label}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-200 space-y-2"
                    >
                      <p className="text-xs uppercase tracking-[0.4em] text-gray-500">{tile.label}</p>
                      <p>{tile.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews & Ratings Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.5em] text-orange-400">Reviews</p>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= Math.round(averageRating) ? 'fill-orange-400 text-orange-400' : 'text-gray-600'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-orange-300">{averageRating}</span>
                    <span className="text-xs text-gray-500">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                  </div>
                )}
              </div>

              {/* Submit Review */}
              {isAuthenticated ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                  <p className="text-sm font-semibold text-gray-300">Rate this DJ</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            star <= (hoverRating || reviewRating)
                              ? 'fill-orange-400 text-orange-400'
                              : 'text-gray-600 hover:text-gray-400'
                          }`}
                        />
                      </button>
                    ))}
                    {reviewRating > 0 && (
                      <span className="ml-2 text-sm text-orange-300 font-semibold">{reviewRating}/5</span>
                    )}
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience (optional)..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none resize-none text-sm transition"
                  />
                  {reviewStatus && (
                    <p className={`text-sm ${reviewStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                      {reviewStatus.message}
                    </p>
                  )}
                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview || reviewRating === 0}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-[#FF6B35] text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(255,107,53,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                  <p className="text-sm text-gray-400">
                    <Link to="/login" className="text-orange-400 hover:text-orange-300 transition-colors">Sign in</Link>
                    {' '}to leave a review
                  </p>
                </div>
              )}

              {/* Existing Reviews */}
              {reviews.length > 0 && (
                <div className="space-y-3">
                  {reviews.slice(0, 10).map((review: any) => (
                    <div key={review.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{review.userName || 'Anonymous'}</span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${star <= review.rating ? 'fill-orange-400 text-orange-400' : 'text-gray-600'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-300">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {reviews.length === 0 && (
                <p className="text-gray-500 text-sm">No reviews yet. Be the first to rate this DJ!</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.5em] text-orange-400">Upcoming Sets</p>
              <Link to="/events" className="text-xs uppercase tracking-[0.3em] text-gray-400 hover:text-white">
                View all
              </Link>
            </div>
            {dj.upcomingEvents.length === 0 ? (
              <p className="text-gray-500">No scheduled performances yet.</p>
            ) : (
              <div className="space-y-4">
                {dj.upcomingEvents.map((event) => (
                  <Link
                    key={event.eventId}
                    to={`/events/${event.eventId}`}
                    className="flex gap-4 items-center rounded-[20px] border border-white/10 p-4 hover:border-orange-400 transition"
                  >
                    <img
                      src={event.imageUrl ?? defaultEventImage}
                      alt={event.title}
                      className="h-16 w-16 rounded-[16px] object-cover border border-white/10"
                    />
                    <div className="flex-1">
                      <p className="text-white font-semibold">{event.title}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(event.date).toLocaleDateString()} · {event.venueName}
                        {event.city ? `, ${event.city}` : ''}
                      </p>
                      <p className="text-sm text-gray-300">{event.price ? `$${event.price}` : 'Free entry'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DJProfilePage;
