
// Import d3 to resolve d3 namespace for simulation data types
import * as d3 from 'd3';

export interface MindNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  category: NodeCategory;
  description?: string;
  expanded?: boolean;
}

export interface MindLink extends d3.SimulationLinkDatum<MindNode> {
  source: string | MindNode;
  target: string | MindNode;
}

export enum NodeCategory {
  CORE = 'CORE',
  TREATMENTS = 'TREATMENTS',
  BUSINESS = 'BUSINESS',
  SKINCARE_SCIENCE = 'SKINCARE_SCIENCE',
  TRENDS = 'TRENDS',
  WELLNESS = 'WELLNESS'
}

export interface GraphData {
  nodes: MindNode[];
  links: MindLink[];
}

export interface NodeInsights {
  summary: string;
  subTopics: string[];
  marketTrends: string[];
}

export interface InstagramTrend {
  topic: string;
  instagramWriteup: string;
  canvaPrompt: string;
  hashtags: string[];
}

export interface LinkedInTrend {
  topic: string;
  linkedinWriteup: string;
  canvaPrompt: string;
  hashtags: string[];
}

export interface CarouselSlide {
  slideNumber: number;
  type: 'HOOK' | 'CONTENT' | 'TIP' | 'CTA';
  imagePrompt: string;
  textOverlay: string;
}

export interface TikTokTrend {
  topic: string;
  tiktokScript: string;
  canvaPrompt: string;
  carouselSlides: CarouselSlide[];
  hashtags: string[];
}

export interface IndustryArticle {
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  date: string;
}

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
