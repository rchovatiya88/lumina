import { Product, ServiceTier, DesignProject } from './types';

export const MOCK_PRODUCTS: Product[] = [
  // SEATING
  {
    id: 'p1',
    name: 'Svelti Dining Chair',
    price: 89,
    image: 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&q=80&w=300&h=300',
    store: 'Amazon',
    affiliateLink: '#',
    category: 'chair',
    style: 'modern',
    dimensions: { width: 20, depth: 22, height: 34 }
  },
  {
    id: 'p2',
    name: 'Burrard Sofa',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=300&h=300',
    store: 'Wayfair',
    affiliateLink: '#',
    category: 'sofa',
    style: 'modern',
    dimensions: { width: 84, depth: 36, height: 32 }
  },
  {
    id: 'p6',
    name: 'Velvet Accent Chair',
    price: 350,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=300&h=300',
    store: 'Wayfair',
    affiliateLink: '#',
    category: 'chair',
    style: 'classic',
    dimensions: { width: 30, depth: 32, height: 36 }
  },
  {
    id: 'p7',
    name: 'Leather Lounge Chair',
    price: 850,
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=300&h=300',
    store: 'West Elm',
    affiliateLink: '#',
    category: 'chair',
    style: 'industrial',
    dimensions: { width: 28, depth: 34, height: 30 }
  },
  
  // TABLES
  {
    id: 'p3',
    name: 'Orbital Coffee Table',
    price: 450,
    image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=300&h=300',
    store: 'West Elm',
    affiliateLink: '#',
    category: 'table',
    style: 'classic',
    dimensions: { width: 36, depth: 36, height: 16 }
  },
  {
    id: 'p8',
    name: 'Marble Side Table',
    price: 120,
    image: 'https://images.unsplash.com/photo-1634712282287-14ed57b9cc89?auto=format&fit=crop&q=80&w=300&h=300',
    store: 'Amazon',
    affiliateLink: '#',
    category: 'table',
    style: 'glam',
    dimensions: { width: 18, depth: 18, height: 22 }
  },

  // LIGHTING
  {
    id: 'p5',
    name: 'Arc Floor Lamp',
    price: 220,
    image: 'https://images.unsplash.com/photo-1513506003011-3b03c8b512a4?auto=format&fit=crop&q=80&w=300&h=300',
    store: 'CB2',
    affiliateLink: '#',
    category: 'lamp',
    style: 'modern',
    dimensions: { width: 12, depth: 40, height: 72 }
  },
  {
    id: 'p9',
    name: 'Ceramic Table Lamp',
    price: 85,
    image: 'https://images.unsplash.com/photo-1507473888900-52a1b2d8f7d3?auto=format&fit=crop&q=80&w=300&h=300',
    store: 'Target',
    affiliateLink: '#',
    category: 'lamp',
    style: 'boho',
    dimensions: { width: 14, depth: 14, height: 24 }
  },

  // RUGS & DECOR
  {
    id: 'p4',
    name: 'Jute Rug Natural',
    price: 199,
    image: 'https://images.unsplash.com/photo-1575414003502-942740439466?auto=format&fit=crop&q=80&w=300&h=300',
    store: 'Amazon',
    affiliateLink: '#',
    category: 'rug',
    style: 'boho',
    dimensions: { width: 96, depth: 120, height: 1 }
  },
  {
    id: 'p10',
    name: 'Abstract Canvas Art',
    price: 150,
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=300&h=300',
    store: 'Etsy',
    affiliateLink: '#',
    category: 'decor',
    style: 'modern',
    dimensions: { width: 36, depth: 2, height: 48 }
  },
  {
    id: 'p11',
    name: 'Potted Fiddle Leaf',
    price: 99,
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=300&h=300',
    store: 'Lumina Exclusive',
    affiliateLink: '#',
    category: 'decor',
    style: 'boho',
    dimensions: { width: 24, depth: 24, height: 60 }
  }
];

export const SERVICE_TIERS: ServiceTier[] = [
  {
    id: 'mini',
    name: 'Mini Room Refresh',
    priceRange: '$149',
    description: 'Perfect for finishing touches or a quick style update.',
    features: ['Custom Mood Board', 'Shopping List with Links', '1 Revision Round', '2-Week Turnaround'],
    recommendedFor: 'Small spaces, entryways, or refreshers.'
  },
  {
    id: 'full',
    name: 'Full Room Design',
    priceRange: '$599',
    description: 'A complete transformation for your living, dining, or bedroom.',
    features: ['Floor Plan Layout', '3D Concept Rendering', 'Full Shopping List', '3 Revision Rounds', 'Styling Guide'],
    recommendedFor: 'Empty rooms or complete overhauls.'
  },
  {
    id: 'luxury',
    name: 'Whole Home / VIP',
    priceRange: '$1,500+',
    description: 'White-glove service for multi-room projects or entire homes.',
    features: ['Priority Support', 'Concierge Ordering', 'Contractor Coordination', 'Site Visits (Local)', 'Unlimited Revisions'],
    recommendedFor: 'New homeowners or renovations.'
  }
];

export const MOCK_PROJECTS: DesignProject[] = [
  {
    id: 'prj1',
    clientName: 'Sarah Miller',
    roomType: 'Living Room',
    status: 'In Progress',
    lastUpdated: '2 hours ago',
    thumbnail: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?auto=format&fit=crop&q=80&w=400&h=300'
  },
  {
    id: 'prj2',
    clientName: 'David Chen',
    roomType: 'Master Bedroom',
    status: 'Review',
    lastUpdated: '1 day ago',
    thumbnail: 'https://images.unsplash.com/photo-1616594039964-40891a909725?auto=format&fit=crop&q=80&w=400&h=300'
  },
  {
    id: 'prj3',
    clientName: 'Emily Davis',
    roomType: 'Home Office',
    status: 'Completed',
    lastUpdated: '1 week ago',
    thumbnail: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=400&h=300'
  }
];

export const MOCK_POSTS = [
  {
    id: 1,
    title: "The Art of Japandi: Where Scandi Meets Japan",
    excerpt: "Discover how to blend Scandinavian functionality with Japanese rustic minimalism to create a feeling of art, nature, and simplicity.",
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800",
    category: "Trends",
    date: "Oct 12, 2023"
  },
  {
    id: 2,
    title: "5 Lighting Mistakes You're Probably Making",
    excerpt: "Lighting can make or break a room. Here are the most common pitfalls we see in DIY designs and how to fix them instantly.",
    image: "https://images.unsplash.com/photo-1513506003011-3b03c8b512a4?auto=format&fit=crop&q=80&w=800",
    category: "Tips & Tricks",
    date: "Sep 28, 2023"
  },
  {
    id: 3,
    title: "Budget Luxury: Amazon Finds Under $100",
    excerpt: "You don't need to spend a fortune to make your home look expensive. We've curated the best hidden gems on Amazon this month.",
    image: "https://images.unsplash.com/photo-1550226891-ef816aed4a98?auto=format&fit=crop&q=80&w=800",
    category: "Shopping",
    date: "Sep 15, 2023"
  },
  {
    id: 4,
    title: "Small Space Solutions for City Living",
    excerpt: "Maximize every square inch of your apartment with these clever storage hacks and layout configurations.",
    image: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=800",
    category: "Guides",
    date: "Aug 30, 2023"
  }
];