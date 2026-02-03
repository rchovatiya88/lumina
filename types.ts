export interface Product {
  id: string;
  name: string;
  price: number;
  image: string; // The cutout or processed image
  originalImage?: string; // The user uploaded context image
  store: 'Amazon' | 'Wayfair' | 'West Elm' | 'CB2' | 'IKEA' | 'Lumina Exclusive' | 'Target' | 'Etsy' | 'Uploaded' | 'Google Search';
  affiliateLink?: string;
  buyUrl?: string; // Add this
  category: 'sofa' | 'chair' | 'table' | 'lamp' | 'decor' | 'rug' | 'bed' | 'storage' | 'scraped'; // Add scraped
  style: 'modern' | 'boho' | 'industrial' | 'classic' | 'scandi' | 'glam' | 'contemporary' | 'rustic' | 'minimalist';
  dimensions?: { width: number; depth: number; height: number }; // In inches
  colors?: string[];
  description?: string;
}

export interface RoomItem extends Product {
  uid: string; // unique id for the instance on canvas
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  isLocked?: boolean;
}

export interface ServiceTier {
  id: string;
  name: string;
  priceRange: string;
  description: string;
  features: string[];
  recommendedFor: string;
}

export interface DesignProject {
  id: string;
  clientName: string;
  roomType: string;
  status: 'In Progress' | 'Review' | 'Completed';
  lastUpdated: string;
  thumbnail: string;
}

export enum UserRole {
  CLIENT = 'CLIENT',
  DESIGNER = 'DESIGNER'
}