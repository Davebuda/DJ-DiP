import { FormEvent, useMemo, useState } from 'react';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import {
  CREATE_EVENT,
  DELETE_EVENT,
  GET_DJS,
  GET_EVENTS,
  GET_GENRES,
  GET_EVENT_BY_ID,
  GET_VENUES,
  UPDATE_EVENT,
} from '../../graphql/queries';
import ImageUpload from '../../components/common/ImageUpload';

interface EventFormState {
  title: string;
  description: string;
  date: string;
  price: string;
  venueId: string;
  imageUrl: string;
  videoUrl: string;
  genreIds: string[];
  djIds: string[];
}

const emptyForm: EventFormState = {
  title: '',
  description: '',
  date: '',
  price: '0',
  venueId: '',
  imageUrl: '',
  videoUrl: '',
  genreIds: [],
  djIds: [],
};

const AdminEventsPage = () => {
  const inputClass =
    'w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF0080]';
  const textareaClass = `${inputClass} min-h-[120px]`;
  const [form, setForm] = useState<EventFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data, loading, error, refetch } = useQuery(GET_EVENTS);
  const { data: venuesData } = useQuery(GET_VENUES);
  const { data: genresData } = useQuery(GET_GENRES);
  const { data: djsData } = useQuery(GET_DJS);
  const [fetchEventDetail, { loading: detailLoading }] = useLazyQuery(GET_EVENT_BY_ID);

  const [createEvent, { loading: creating }] = useMutation(CREATE_EVENT);
  const [updateEvent, { loading: saving }] = useMutation(UPDATE_EVENT);
  const [deleteEvent, { loading: deleting }] = useMutation(DELETE_EVENT);

  const venues = venuesData?.venues ?? [];
  const genres = genresData?.genres ?? [];
  const djs = djsData?.dJs ?? [];

  const events = useMemo(() => data?.events ?? [], [data]);

  const handleEdit = async (eventId: string) => {
    const response = await fetchEventDetail({ variables: { id: eventId } });
    const detail = response.data?.event;
    if (!detail) return;

    setEditingId(eventId);
    setForm({
      title: detail.title ?? '',
      description: detail.description ?? '',
      date: detail.date ? detail.date.slice(0, 16) : '',
      price: detail.price?.toString() ?? '0',
      venueId: detail.venueId ?? '',
      imageUrl: detail.imageUrl ?? '',
      videoUrl: detail.videoUrl ?? '',
      genreIds: detail.genreIds ?? [],
      djIds: detail.djIds ?? [],
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      date: new Date(form.date).toISOString(),
      price: parseFloat(form.price) || 0,
      venueId: form.venueId,
      imageUrl: form.imageUrl || null,
      videoUrl: form.videoUrl || null,
      genreIds: form.genreIds,
      djIds: form.djIds,
    };

    if (editingId) {
      await updateEvent({ variables: { id: editingId, input: payload } });
    } else {
      await createEvent({ variables: { input: payload } });
    }

    await refetch();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    await deleteEvent({ variables: { id } });
    await refetch();
  };

  if (loading) {
    return <div className="text-sm text-gray-400">Loading events…</div>;
  }

  if (error) {
    return (
      <div className="rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
        Failed to load events: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Events</h1>
        <p className="text-sm text-gray-400">
          Create, update, or remove events. Use the form to add a new one or select an existing row to edit.
        </p>
      </header>

      <form className="card space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1 text-sm font-semibold text-gray-300">
            Title
            <input
              type="text"
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </label>
          <label className="space-y-1 text-sm font-semibold text-gray-300">
            Date / Time
            <input
              type="datetime-local"
              className={inputClass}
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              required
            />
          </label>
          <label className="space-y-1 text-sm font-semibold text-gray-300">
            Price
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
            />
          </label>
          <label className="space-y-1 text-sm font-semibold text-gray-300">
            Venue
            <select
              className={inputClass}
              value={form.venueId}
              onChange={(e) => setForm((prev) => ({ ...prev, venueId: e.target.value }))}
              required
            >
              <option value="">Select a venue</option>
              {venues.map((venue: any) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} – {venue.city}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="space-y-1 text-sm font-semibold text-gray-300">
          Description
          <textarea
            className={textareaClass}
            rows={3}
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1 text-sm font-semibold text-gray-300">
            Genres
            <select
              className={`${inputClass} h-32`}
              multiple
              value={form.genreIds}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  genreIds: Array.from(e.target.selectedOptions, (opt) => opt.value),
                }))
              }
            >
              {genres.map((genre: any) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-gray-300">
            DJs
            <select
              className={`${inputClass} h-32`}
              multiple
              value={form.djIds}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  djIds: Array.from(e.target.selectedOptions, (opt) => opt.value),
                }))
              }
            >
              {djs.map((dj: any) => (
                <option key={dj.id} value={dj.id}>
                  {dj.stageName || dj.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ImageUpload
          currentImageUrl={form.imageUrl}
          onImageUploaded={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
          folder="events"
          label="Event Image"
          aspectRatio="aspect-video"
        />

        <label className="space-y-1 text-sm font-semibold text-gray-300">
          Video URL (Optional)
          <input
            type="url"
            className={inputClass}
            value={form.videoUrl}
            onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
            placeholder="https://youtube.com/..."
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="btn-primary"
            disabled={creating || saving || detailLoading}
          >
            {editingId ? 'Save Changes' : 'Create Event'}
          </button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          )}
          {detailLoading && (
            <span className="text-xs text-gray-400">Loading event details…</span>
          )}
        </div>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-400">
              <th className="py-3">Title</th>
              <th className="py-3">Date</th>
              <th className="py-3">Venue</th>
              <th className="py-3">Price</th>
              <th className="py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event: any) => (
              <tr key={event.id} className="border-t border-white/5">
                <td className="py-3 font-medium text-white">{event.title}</td>
                <td className="py-3 text-gray-400">
                  {new Date(event.date).toLocaleString()}
                </td>
                <td className="py-3 text-gray-400">{event.venue?.name}</td>
                <td className="py-3 text-gray-400">${event.price}</td>
                <td className="py-3 text-right space-x-2">
                  <button
                    type="button"
                    className="text-xs uppercase tracking-wide text-[#FF0080]"
                    onClick={() => handleEdit(event.id)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-xs uppercase tracking-wide text-red-400"
                    disabled={deleting}
                    onClick={() => handleDelete(event.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminEventsPage;
