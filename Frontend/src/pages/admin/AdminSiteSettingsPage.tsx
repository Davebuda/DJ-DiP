import { FormEvent, useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_SITE_SETTINGS } from '../../graphql/queries';
import { SiteSettings, defaultSiteSettings, useSiteSettings } from '../../context/SiteSettingsContext';

const AdminSiteSettingsPage = () => {
  const inputClass =
    'w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF0080]';
  const textareaClass = `${inputClass} min-h-[120px]`;

  const { siteSettings, loading, error, refetch } = useSiteSettings();
  const [updateSettings, { loading: saving }] = useMutation(UPDATE_SITE_SETTINGS);
  const [form, setForm] = useState<SiteSettings>({ ...defaultSiteSettings });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (siteSettings) {
      setForm(siteSettings);
    }
  }, [siteSettings]);

  const handleChange = (field: keyof SiteSettings, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggle = (field: keyof SiteSettings, value: boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFeedback(null);
    try {
      const response = await updateSettings({
        variables: {
          input: {
            ...form,
            heroOverlayOpacity: Number(form.heroOverlayOpacity),
          },
        },
      });
      if (response.data?.updateSiteSettings) {
        await refetch();
        setFeedback({ type: 'success', text: 'Site settings updated.' });
      }
    } catch (mutationError) {
      const message = mutationError instanceof Error ? mutationError.message : 'Failed to save settings.';
      setFeedback({ type: 'error', text: message });
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-400">Loading site settings…</div>;
  }

  if (error) {
    return (
      <div className="rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
        Failed to load settings: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Brand System</p>
        <h1 className="text-2xl font-semibold">Site Settings</h1>
        <p className="text-sm text-gray-400">
          Control hero media, brand colors, default imagery, and feature toggles. These values drive the
          marketing site and admin previews.
        </p>
      </header>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {feedback && (
          <div
            className={`rounded px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'bg-green-500/10 border border-green-500/30 text-green-200'
                : 'bg-red-500/10 border border-red-500/30 text-red-200'
            }`}
          >
            {feedback.text}
          </div>
        )}

        <section className="card space-y-4">
          <h2 className="text-lg font-semibold">Branding</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1 text-sm font-semibold text-gray-300">
              Site Name
              <input
                type="text"
                className={inputClass}
                value={form.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm font-semibold text-gray-300">
              Tagline
              <input
                type="text"
                className={inputClass}
                value={form.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm font-semibold text-gray-300">
              Logo URL
              <input
                type="url"
                className={inputClass}
                value={form.logoUrl}
                onChange={(e) => handleChange('logoUrl', e.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm font-semibold text-gray-300">
              Favicon URL
              <input
                type="url"
                className={inputClass}
                value={form.faviconUrl}
                onChange={(e) => handleChange('faviconUrl', e.target.value)}
              />
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['primaryColor', 'secondaryColor', 'accentColor'] as const).map((field) => (
              <label key={field} className="space-y-1 text-sm font-semibold text-gray-300">
                {field === 'primaryColor' && 'Primary Color'}
                {field === 'secondaryColor' && 'Secondary Color'}
                {field === 'accentColor' && 'Accent Color'}
                <input
                  type="text"
                  className={inputClass}
                  value={form[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                />
              </label>
            ))}
          </div>
        </section>

        <section className="card space-y-4">
          <h2 className="text-lg font-semibold">Hero Section</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1 text-sm font-semibold text-gray-300">
              Hero Title
              <input
                type="text"
                className={inputClass}
                value={form.heroTitle}
                onChange={(e) => handleChange('heroTitle', e.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm font-semibold text-gray-300">
              CTA Text
              <input
                type="text"
                className={inputClass}
                value={form.heroCtaText}
                onChange={(e) => handleChange('heroCtaText', e.target.value)}
              />
            </label>
          </div>
          <label className="space-y-1 text-sm font-semibold text-gray-300">
            Hero Subtitle
            <textarea
              className={textareaClass}
              value={form.heroSubtitle}
              onChange={(e) => handleChange('heroSubtitle', e.target.value)}
            />
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="space-y-1 text-sm font-semibold text-gray-300">
              CTA Link
              <input
                type="text"
                className={inputClass}
                value={form.heroCtaLink}
                onChange={(e) => handleChange('heroCtaLink', e.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm font-semibold text-gray-300">
              Background Image
              <input
                type="url"
                className={inputClass}
                value={form.heroBackgroundImageUrl}
                onChange={(e) => handleChange('heroBackgroundImageUrl', e.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm font-semibold text-gray-300">
              Background Video
              <input
                type="url"
                className={inputClass}
                value={form.heroBackgroundVideoUrl}
                onChange={(e) => handleChange('heroBackgroundVideoUrl', e.target.value)}
              />
            </label>
          </div>
          <label className="space-y-1 text-sm font-semibold text-gray-300">
            Hero Overlay Opacity
            <input
              type="number"
              step="0.05"
              min="0"
              max="1"
              className={inputClass}
              value={form.heroOverlayOpacity}
              onChange={(e) => handleChange('heroOverlayOpacity', e.target.value)}
            />
          </label>
        </section>

        <section className="card space-y-4">
          <h2 className="text-lg font-semibold">Contact & Social</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="space-y-1 text-sm font-semibold text-gray-300">
              Contact Email
              <input
                type="email"
                className={inputClass}
                value={form.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm font-semibold text-gray-300">
              Contact Phone
              <input
                type="text"
                className={inputClass}
                value={form.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm font-semibold text-gray-300">
              Contact Address
              <input
                type="text"
                className={inputClass}
                value={form.contactAddress}
                onChange={(e) => handleChange('contactAddress', e.target.value)}
              />
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(
              [
                'facebookUrl',
                'instagramUrl',
                'twitterUrl',
                'youTubeUrl',
                'tikTokUrl',
                'soundCloudUrl',
              ] as const
            ).map((field) => (
              <label key={field} className="space-y-1 text-sm font-semibold text-gray-300">
                {field.replace('Url', '').replace(/([A-Z])/g, ' $1')}
                <input
                  type="url"
                  className={inputClass}
                  value={form[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                />
              </label>
            ))}
          </div>
        </section>

        <section className="card space-y-4">
          <h2 className="text-lg font-semibold">Default Media</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(
              [
                'defaultEventImageUrl',
                'defaultDjImageUrl',
                'defaultVenueImageUrl',
              ] as const
            ).map((field) => (
              <label key={field} className="space-y-1 text-sm font-semibold text-gray-300">
                {field.replace('default', '').replace('ImageUrl', '')} Image
                <input
                  type="url"
                  className={inputClass}
                  value={form[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                />
              </label>
            ))}
          </div>
        </section>

        <section className="card space-y-4">
          <h2 className="text-lg font-semibold">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-200">
            {(
              [
                'enableNewsletter',
                'enableNotifications',
                'enableReviews',
                'enableGamification',
                'enableSubscriptions',
              ] as const
            ).map((field) => (
              <label key={field} className="flex items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/30 bg-black/40"
                  checked={form[field]}
                  onChange={(e) => handleToggle(field, e.target.checked)}
                />
                {field.replace('enable', '')}
              </label>
            ))}
          </div>
        </section>

        <section className="card space-y-4">
          <h2 className="text-lg font-semibold">SEO & Footer</h2>
          <label className="space-y-1 text-sm font-semibold text-gray-300">
            Meta Description
            <textarea
              className={textareaClass}
              value={form.metaDescription}
              onChange={(e) => handleChange('metaDescription', e.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm font-semibold text-gray-300">
            Meta Keywords
            <input
              type="text"
              className={inputClass}
              value={form.metaKeywords}
              onChange={(e) => handleChange('metaKeywords', e.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm font-semibold text-gray-300">
            Footer Text
            <textarea
              className={textareaClass}
              value={form.footerText}
              onChange={(e) => handleChange('footerText', e.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm font-semibold text-gray-300">
            Copyright Text
            <input
              type="text"
              className={inputClass}
              value={form.copyrightText}
              onChange={(e) => handleChange('copyrightText', e.target.value)}
            />
          </label>
        </section>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            Save Settings
          </button>
          {saving && <span className="text-xs text-gray-400">Saving…</span>}
        </div>
      </form>
    </div>
  );
};

export default AdminSiteSettingsPage;
