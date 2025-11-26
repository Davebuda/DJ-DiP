import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_EVENTS, GET_GENRES } from '../graphql/queries';
import { useSiteSettings } from '../context/SiteSettingsContext';

type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  price: number;
  imageUrl?: string;
  genres: string[];
  venue: {
    id: string;
    name: string;
    city: string;
  };
};

type Genre = {
  id: string;
  name: string;
};

const EventsPage = () => {
  const { data: eventsData, loading: eventsLoading, error: eventsError } = useQuery(GET_EVENTS);
  const { data: genresData } = useQuery(GET_GENRES);
  const { siteSettings } = useSiteSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date');

  const events: Event[] = eventsData?.events ?? [];
  const genres: Genre[] = genresData?.genres ?? [];
  const defaultEventImage = siteSettings.defaultEventImageUrl ?? '/media/defaults/event.svg';

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = events.filter((event) => {
      // Search filter
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGenre =
        selectedGenre === 'all' ||
        event.genres.some((genre) => genre.toLowerCase() === selectedGenre.toLowerCase());

      // Price filter
      const matchesPrice = event.price >= priceRange[0] && event.price <= priceRange[1];

      return matchesSearch && matchesPrice && matchesGenre;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return a.price - b.price;
      }
    });

    return filtered;
  }, [events, searchQuery, selectedGenre, priceRange, sortBy]);

  if (eventsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400" />
      </div>
    );
  }

  if (eventsError) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center space-y-2 px-6">
        <p className="text-orange-400 text-lg">Unable to load events</p>
        <p className="text-gray-500 text-sm">{eventsError.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1c0b02] via-[#080505] to-black text-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 space-y-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.6em] text-orange-500">Discover</p>
          <h1 className="text-5xl md:text-6xl font-black leading-tight">
            Upcoming <span className="text-orange-200">Events</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            Find your next unforgettable night. Browse curated events, filter by genre, and secure your tickets.
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-8 pt-4">
          <div>
            <p className="text-3xl font-bold text-white">{events.length}</p>
            <p className="text-xs uppercase tracking-[0.5em] text-orange-200">Live Events</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">{genres.length}</p>
            <p className="text-xs uppercase tracking-[0.5em] text-orange-200">Genres</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">{filteredEvents.length}</p>
            <p className="text-xs uppercase tracking-[0.5em] text-orange-200">Results</p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-8">
        <div className="rounded-[32px] border border-white/10 bg-gradient-to-b from-[#140707] to-[#060303] p-8 space-y-6">
          {/* Search Bar */}
          <div>
            <label className="block text-sm uppercase tracking-[0.4em] text-gray-400 mb-3">Search Events</label>
            <input
              type="text"
              placeholder="Search by title, venue, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-full bg-black/50 border border-white/20 text-white placeholder-gray-500 focus:border-orange-400 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Genre Filter */}
            <div>
              <label className="block text-sm uppercase tracking-[0.4em] text-gray-400 mb-3">Genre</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-6 py-4 rounded-full bg-black/50 border border-white/20 text-white focus:border-orange-400 focus:outline-none transition appearance-none cursor-pointer"
              >
                <option value="all">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm uppercase tracking-[0.4em] text-gray-400 mb-3">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'price')}
                className="w-full px-6 py-4 rounded-full bg-black/50 border border-white/20 text-white focus:border-orange-400 focus:outline-none transition appearance-none cursor-pointer"
              >
                <option value="date">Date (Earliest First)</option>
                <option value="price">Price (Low to High)</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm uppercase tracking-[0.4em] text-gray-400 mb-3">
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full h-2 bg-black/50 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #ff7c30 0%, #ff7c30 ${(priceRange[1] / 200) * 100}%, #1a1a1a ${
                      (priceRange[1] / 200) * 100
                    }%, #1a1a1a 100%)`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || selectedGenre !== 'all' || priceRange[1] !== 200) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('all');
                setPriceRange([0, 200]);
              }}
              className="px-6 py-2 rounded-full border border-white/30 text-white text-sm hover:border-orange-400 transition"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </section>

      {/* Events Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-16">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-2xl font-semibold text-gray-400">No events found</p>
            <p className="text-gray-500">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="rounded-[32px] border border-white/10 bg-gradient-to-b from-[#140707] to-[#060303] transition-all duration-300 group overflow-hidden hover:scale-[1.02] neon-red-hover"
              >
                {/* Event Image */}
                <div className="relative overflow-hidden aspect-[3/2] min-h-[220px]">
                  <img
                    src={event.imageUrl || defaultEventImage}
                    alt={event.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.35),transparent_60%)]" />
                </div>

                {/* Event Info */}
                <div className="p-6 space-y-3">
                  <p className="text-xs uppercase tracking-[0.5em] text-gray-500">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <h3 className="text-2xl font-semibold group-hover:text-orange-200 transition">{event.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2">{event.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Venue</p>
                      <p className="text-sm text-white">{event.venue.name}</p>
                      <p className="text-xs text-gray-500">{event.venue.city}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Price</p>
                      <p className="text-2xl font-bold text-orange-400">${event.price}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Link
                      to={`/events/${event.id}`}
                      className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/15 text-white text-sm font-semibold text-center hover:border-orange-400 transition"
                    >
                      Details
                    </Link>
                    <Link
                      to={`/checkout?eventId=${event.id}`}
                      className="flex-1 px-4 py-3 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 text-black font-semibold text-sm tracking-wide text-center hover:from-orange-300 hover:to-pink-400 transition"
                    >
                      Buy Ticket
                    </Link>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default EventsPage;
