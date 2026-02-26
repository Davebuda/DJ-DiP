import { useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { GET_EVENT_BY_ID } from '../graphql/queries';

const EventDetailPage = () => {
  const { id } = useParams();
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

            {event.ticketingUrl ? (
              <a
                href={event.ticketingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full rounded-full px-6 py-3 font-semibold tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-[#FF6B35] text-white hover:shadow-[0_0_25px_rgba(255,107,53,0.5)] hover:scale-[1.02]"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Get Tickets</span>
              </a>
            ) : (
              <p className="text-gray-400 text-sm text-center py-3">
                Tickets coming soon
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
