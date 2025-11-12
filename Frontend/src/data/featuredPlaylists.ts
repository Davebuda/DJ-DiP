export interface FeaturedPlaylist {
  id: string;
  title: string;
  genre: string;
  description: string;
  mood: string[];
  coverImage: string;
  spotifyId: string;
  curator: string;
}

export const featuredPlaylists: FeaturedPlaylist[] = [
  {
    id: 'afro-grooves',
    title: 'Afro Grooves To Dance',
    genre: 'Afrobeats / Amapiano',
    description:
      'Sunset-inspired rhythms mixing Lagos energy with Joburg pianos. Built for rooftop sessions and day parties.',
    mood: ['sunset', 'vibrant', 'dancefloor'],
    coverImage: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=1200',
    spotifyId: '37i9dQZF1DX0XUsuxWHRQd',
    curator: 'Lets Go KlubN Radio',
  },
  {
    id: 'neon-house',
    title: 'Neon House Frequencies',
    genre: 'House / Tech',
    description:
      'Progressive rollers, French touch basslines, and euphoric vocals for long-form journeys.',
    mood: ['late night', 'progressive', 'euphoric'],
    coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200',
    spotifyId: '37i9dQZF1DXbxdhVI2bVcp',
    curator: 'Resident DJ Nova',
  },
  {
    id: 'future-rnb',
    title: 'Future R&B Loveline',
    genre: 'R&B / Experimental',
    description:
      'Alt-R&B crooners blended with glitchy beats and synthwave textures—perfect for late-night scrolling.',
    mood: ['intimate', 'after hours'],
    coverImage: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?q=80&w=1200',
    spotifyId: '37i9dQZF1DWYmmr74INQlb',
    curator: 'Night Swim Collective',
  },
  {
    id: 'bass-rituals',
    title: 'Bass Rituals',
    genre: 'Bass / Experimental',
    description:
      'Sub-heavy club mutations that bend Jersey club into grime into halftime. For low-end seekers only.',
    mood: ['underground', 'sub bass'],
    coverImage: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1200',
    spotifyId: '37i9dQZF1DX82GYcclJ3Ug',
    curator: 'DJ DiP Residents',
  },
  {
    id: 'cosmic-downtempo',
    title: 'Cosmic Downtempo Lounging',
    genre: 'Downtempo / Organic',
    description:
      'Hand drums, modular pads, and vinyl hiss stitched together for Sunday recoveries and gallery pop-ups.',
    mood: ['chill', 'organic', 'lounge'],
    coverImage: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200',
    spotifyId: '37i9dQZF1DWUZ5bk6qqDSy',
    curator: 'KlubN Selectors',
  },
];
