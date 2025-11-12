import { ReactNode, createContext, useContext } from 'react';
import { ApolloError, useQuery } from '@apollo/client';
import { GET_SITE_SETTINGS } from '../graphql/queries';

export interface SiteSettings {
  id: string;
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroBackgroundImageUrl: string;
  heroBackgroundVideoUrl: string;
  heroOverlayOpacity: number;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  youTubeUrl: string;
  tikTokUrl: string;
  soundCloudUrl: string;
  defaultEventImageUrl: string;
  defaultDjImageUrl: string;
  defaultVenueImageUrl: string;
  enableNewsletter: boolean;
  enableNotifications: boolean;
  enableReviews: boolean;
  enableGamification: boolean;
  enableSubscriptions: boolean;
  metaDescription: string;
  metaKeywords: string;
  footerText: string;
  copyrightText: string;
}

export const defaultSiteSettings: SiteSettings = {
  id: '',
  siteName: 'Lets Go KlubN',
  tagline: 'High life sound system',
  logoUrl: '/icons/lets-go-klubn-320.png',
  faviconUrl: '/icons/lets-go-klubn-32.png',
  primaryColor: '#FF0080',
  secondaryColor: '#00FF9F',
  accentColor: '#000000',
  heroTitle: "Let's Go KlubN",
  heroSubtitle:
    'Culture-forward bookings, immersive visuals, and the club technology powering tomorrow’s dance floors.',
  heroCtaText: 'Discover Events',
  heroCtaLink: '/events',
  heroBackgroundImageUrl: '/media/sections/hero/KlubN12.07 screen (1) copy.png',
  heroBackgroundVideoUrl: '',
  heroOverlayOpacity: 0.6,
  contactEmail: 'hello@djdip.com',
  contactPhone: '+1 (555) 555-5555',
  contactAddress: 'Worldwide',
  facebookUrl: 'https://facebook.com',
  instagramUrl: 'https://instagram.com',
  twitterUrl: 'https://twitter.com',
  youTubeUrl: 'https://youtube.com',
  tikTokUrl: 'https://tiktok.com',
  soundCloudUrl: 'https://soundcloud.com',
  defaultEventImageUrl: '/media/defaults/event.jpg',
  defaultDjImageUrl: '/media/defaults/dj.jpg',
  defaultVenueImageUrl: '/media/defaults/venue.jpg',
  enableNewsletter: true,
  enableNotifications: true,
  enableReviews: true,
  enableGamification: true,
  enableSubscriptions: true,
  metaDescription: '',
  metaKeywords: '',
  footerText: 'Nightlife technology for the selectors, venues, and fans pushing culture forward.',
  copyrightText: `© ${new Date().getFullYear()} Lets Go KlubN. Crafted for the culture.`,
};

type SiteSettingsContextValue = {
  siteSettings: SiteSettings;
  loading: boolean;
  error?: ApolloError;
  refetch: () => void;
};

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  siteSettings: defaultSiteSettings,
  loading: true,
  refetch: () => undefined,
});

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const { data, loading, error, refetch } = useQuery(GET_SITE_SETTINGS);
  const siteSettings = data?.siteSettings ?? defaultSiteSettings;

  return (
    <SiteSettingsContext.Provider
      value={{
        siteSettings,
        loading,
        error,
        refetch: () => {
          refetch();
        },
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
