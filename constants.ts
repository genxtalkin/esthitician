
import { NodeCategory, GraphData } from './types';

export const INITIAL_DATA: GraphData = {
  nodes: [
    { id: 'esthetician', label: 'Esthetician Industry', category: NodeCategory.CORE, expanded: true },
    
    // Level 1: Main Branches
    { id: 'treatments', label: 'Advanced Treatments', category: NodeCategory.TREATMENTS },
    { id: 'business', label: 'Business & Ethics', category: NodeCategory.BUSINESS },
    { id: 'science', label: 'Skincare Science', category: NodeCategory.SKINCARE_SCIENCE },
    { id: 'trends', label: 'Industry Trends', category: NodeCategory.TRENDS },
    { id: 'wellness', label: 'Holistic Wellness', category: NodeCategory.WELLNESS },

    // Level 2: Treatment Sub-nodes
    { id: 'facials', label: 'Clinical Facials', category: NodeCategory.TREATMENTS },
    { id: 'microneedling', label: 'Microneedling', category: NodeCategory.TREATMENTS },
    { id: 'chemical_peels', label: 'Chemical Peels', category: NodeCategory.TREATMENTS },
    { id: 'lasers', label: 'Laser Therapy', category: NodeCategory.TREATMENTS },

    // Level 2: Business Sub-nodes
    { id: 'marketing', label: 'Digital Marketing', category: NodeCategory.BUSINESS },
    { id: 'crm', label: 'Client Management', category: NodeCategory.BUSINESS },
    { id: 'retail', label: 'Retail Sales', category: NodeCategory.BUSINESS },
    { id: 'licensing', label: 'Licensing & Compliance', category: NodeCategory.BUSINESS },

    // Level 2: Science Sub-nodes
    { id: 'ingredients', label: 'Active Ingredients', category: NodeCategory.SKINCARE_SCIENCE },
    { id: 'skin_barrier', label: 'Skin Barrier Health', category: NodeCategory.SKINCARE_SCIENCE },
    { id: 'ph_balance', label: 'pH Optimization', category: NodeCategory.SKINCARE_SCIENCE },

    // Level 2: Trends Sub-nodes
    { id: 'k_beauty', label: 'K-Beauty Influence', category: NodeCategory.TRENDS },
    { id: 'bio_hacking', label: 'Skincare Bio-hacking', category: NodeCategory.TRENDS },
    { id: 'sustainability', label: 'Eco-Ethical Beauty', category: NodeCategory.TRENDS }
  ],
  links: [
    { source: 'esthetician', target: 'treatments' },
    { source: 'esthetician', target: 'business' },
    { source: 'esthetician', target: 'science' },
    { source: 'esthetician', target: 'trends' },
    { source: 'esthetician', target: 'wellness' },

    { source: 'treatments', target: 'facials' },
    { source: 'treatments', target: 'microneedling' },
    { source: 'treatments', target: 'chemical_peels' },
    { source: 'treatments', target: 'lasers' },

    { source: 'business', target: 'marketing' },
    { source: 'business', target: 'crm' },
    { source: 'business', target: 'retail' },
    { source: 'business', target: 'licensing' },

    { source: 'science', target: 'ingredients' },
    { source: 'science', target: 'skin_barrier' },
    { source: 'science', target: 'ph_balance' },

    { source: 'trends', target: 'k_beauty' },
    { source: 'trends', target: 'bio_hacking' },
    { source: 'trends', target: 'sustainability' }
  ]
};

export const CATEGORY_COLORS: Record<string, string> = {
  [NodeCategory.CORE]: '#7c2d12', // Warm Earth
  [NodeCategory.TREATMENTS]: '#881337', // Deep Rose
  [NodeCategory.BUSINESS]: '#1e3a8a', // Deep Blue
  [NodeCategory.SKINCARE_SCIENCE]: '#065f46', // Sage Green
  [NodeCategory.TRENDS]: '#581c87', // Rich Purple
  [NodeCategory.WELLNESS]: '#92400e' // Terracotta
};
