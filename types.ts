export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  store: 'Amazon' | 'Wayfair' | 'West Elm' | 'CB2' | 'IKEA' | 'Lumina Exclusive' | 'Target' | 'Etsy';
  affiliateLink: string;
  category: 'sofa' | 'chair' | 'table' | 'lamp' | 'decor' | 'rug' | 'bed' | 'storage';
  style: 'modern' | 'boho' | 'industrial' | 'classic' | 'scandi' | 'glam';
  dimensions?: { width: number; depth: number; height: number }; // In inches
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