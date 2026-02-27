import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_USER_TICKETS } from '../graphql/queries';
import { useAuth } from '../context/AuthContext';

type Ticket = {
  id: string;
  ticketNumber: string;
  price: number;
  purchaseDate: string;
  isCheckedIn: boolean;
  event: {
    id: string;
    title: string;
    date: string;
    venueName: string;
    city: string;
  };
};

const TicketsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { data, loading, error, refetch } = useQuery(GET_USER_TICKETS, {
    variables: { userId: user?.id ?? '' },
    skip: !user,
    fetchPolicy: 'cache-and-network',
  });

  const tickets = data?.ticketsByUser ?? [];

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [],
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-16 text-center space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.5em] text-orange-400">Tickets</p>
          <h1 className="text-3xl font-bold text-white">Sign in to view your passes</h1>
          <p className="text-gray-400 mt-2">
            <Link to="/login" className="text-orange-300 underline">
              Login
            </Link>{' '}
            or{' '}
            <Link to="/register" className="text-orange-300 underline">
              create an account
            </Link>{' '}
            to unlock your wallet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white px-6 lg:px-10 py-16">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-1 w-10 bg-gradient-to-r from-orange-400 to-transparent rounded-full" />
              <p className="text-xs uppercase tracking-[0.5em] text-orange-400 font-bold">Wallet</p>
            </div>
            <h1 className="font-display text-4xl lg:text-5xl font-black text-white tracking-tight">Your Tickets</h1>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={loading}
            className="px-6 py-3 rounded-full border border-white/20 text-sm uppercase tracking-[0.3em] hover:border-orange-400 disabled:opacity-60"
          >
            Refresh
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400" />
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-red-500/40 bg-red-500/10 px-6 py-4 text-sm text-red-300">
            Unable to load tickets: {error.message}
          </div>
        )}

        {!loading && !tickets.length && (
          <div className="tile px-8 py-16 text-center space-y-4">
            <p className="text-lg text-white font-semibold">No tickets yet</p>
            <p className="text-gray-400">Explore upcoming events and secure your next drop.</p>
            <Link
              to="/events"
              className="inline-flex items-center justify-center rounded-full bg-white text-black px-6 py-3 uppercase tracking-[0.3em] text-sm"
            >
              Browse Events
            </Link>
          </div>
        )}

        <div className="space-y-6">
          {tickets.map((ticket: Ticket) => (
            <div key={ticket.id} className="tile flex flex-col md:flex-row overflow-hidden">
              <div className="md:w-1/3 bg-gradient-to-b from-orange-500/20 to-[#5D1725]/20 border-r border-white/5 p-6 space-y-2">
                <p className="text-xs uppercase tracking-[0.5em] text-orange-300">Ticket</p>
                <p className="text-white text-lg font-semibold break-words">{ticket.ticketNumber}</p>
                <p className="text-sm text-gray-300">{ticket.isCheckedIn ? 'Checked In' : 'Active'}</p>
                <p className="text-sm text-gray-500">
                  Purchased {formatter.format(new Date(ticket.purchaseDate))}
                </p>
              </div>
              <div className="flex-1 p-6 flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-2">
                  <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Event</p>
                  <p className="text-2xl font-semibold text-white">{ticket.event.title}</p>
                  <p className="text-gray-400">
                    {formatter.format(new Date(ticket.event.date))} · {ticket.event.venueName}
                    {ticket.event.city ? `, ${ticket.event.city}` : ''}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Price</p>
                  <p className="text-2xl font-bold text-orange-300">${ticket.price.toFixed(2)}</p>
                  <Link
                    to={`/events/${ticket.event.id}`}
                    className="text-sm uppercase tracking-[0.3em] text-orange-200 underline"
                  >
                    View Event
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TicketsPage;
