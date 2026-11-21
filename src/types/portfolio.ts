export type ProjectCategory =
  | 'all'
  | 'website-development'
  | 'ecommerce'
  | 'wordpress'
  | 'app-development'
  | 'product'
  | 'ai';

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  categoryLabel: string;
  year: string;
  role: string;
  tagline: string;
  description: string;
  features: string[];
  outcome: string;
  technologies: string[];
  demoUrl?: string;
  slug: string;
  featured?: boolean;
}

export interface Service {
  id: string;
  title: string;
  tagline: string;
  description: string;
  idealFor: string;
  deliverables: string[];
  technologies: string[];
  turnaround: string;
  highlight?: string;
}

export interface ContactInquiry {
  name: string;
  email: string;
  message: string;
  budget?: string;
  timeline?: string;
  service?: string;
}

export interface ContactSubmission extends ContactInquiry {
  id: string;
  createdAt: string;
  ipAddress?: string;
  status: 'received' | 'reviewed' | 'contacted';
}
