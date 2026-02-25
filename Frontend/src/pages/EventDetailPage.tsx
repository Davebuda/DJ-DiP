import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { GET_EVENT_BY_ID } from '../graphql/queries';
import { useAuth } from '../context/AuthContext';
import { useCartStore } from '../stores/cartStore';

const EventDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const [addedToCart, setAddedToCart] = useState(false);
  const { data, loading, error } = useQuery(GET_EVENT_BY_ID, {
    variables: { id },
    skip: !id,
  });

  if (!id) {
    return <div className="text-center text-white py-20">Missing event id.</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400" />
      </div>
    );
  }

  if (error || !data?.event) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-16 text-center">
        <div>
          <p className="text-sm uppercase tracking-[0.5em] text-orange-400">Event</p>
          <h1 className="text-3xl font-bold text-white">Unable to load this event.</h1>
          <p className="text-gray-400 mt-2">{error?.message ?? 'It may have been removed.'}</p>
        </div>
      </div>
    );
  }

  const event = data.event;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0805] via-[#0a0505] to-black text-white px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.6em] text-orange-400">Event</p>
          <h1 className="font-display text-5xl font-black tracking-tight">{event.title}</h1>
          <p className="text-gray-300 max-w-3xl">{event.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-8">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-black/40 p-6 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.5em] text-gray-500">Date</p>
                <p className="text-xl font-semibold">
                  {new Date(event.date).toLocaleString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.5em] text-gray-500">Venue</p>
                <p className="text-lg font-semibold">{event.venue.name}</p>
                <p className="text-gray-400">
                  {event.venue.address}, {event.venue.city}, {event.venue.country}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-black/60 p-6 space-y-4">
            <p className="text-xs uppercase tracking-[0.5em] text-gray-500">Tickets</p>
            <p className="text-3xl font-bold text-white">${event.price.toFixed(2)}</p>

            {isAuthenticated ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    addItem({
                      eventId: event.id,
                      eventTitle: event.title,
                      eventDate: event.date,
                      venueName: event.venue.name,
                      price: event.price,
                      imageUrl: event.imageUrl,
                    });
                    setAddedToCart(true);
                    setTimeout(() => setAddedToCart(false), 2000);
                  }}
                  className={`w-full rounded-full px-6 py-3 font-semibold tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2 ${
                    addedToCart
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-r from-orange-500 to-[#FF6B35] text-white hover:shadow-[0_0_25px_rgba(255,107,53,0.5)] hover:scale-[1.02]'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{addedToCart ? 'Added to Cart!' : 'Add to Cart'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    addItem({
                      eventId: event.id,
                      eventTitle: event.title,
                      eventDate: event.date,
                      venueName: event.venue.name,
                      price: event.price,
                      imageUrl: event.imageUrl,
                    });
                    navigate('/checkout?eventIds=' + event.id);
                  }}
                  className="w-full rounded-full border border-white/20 px-6 py-3 text-white font-semibold tracking-[0.2em] uppercase hover:border-orange-400 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Buy Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm uppercase tracking-[0.3em] hover:border-orange-400 transition"
              >
                Login to Purchase
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
