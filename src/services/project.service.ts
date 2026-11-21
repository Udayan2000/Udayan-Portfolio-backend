import { PROJECTS_DATA, SERVICES_DATA } from '../data/projects.data';
import { Project, ProjectCategory, Service } from '../types/portfolio';

export interface ProjectQueryParams {
  category?: string;
  search?: string;
  featured?: boolean;
}

class ProjectService {
  async getAllProjects(params: ProjectQueryParams = {}): Promise<Project[]> {
    let results = [...PROJECTS_DATA];

    // Filter by Category
    if (params.category && params.category !== 'all') {
      const targetCategory = params.category.toLowerCase();
      results = results.filter((p) => p.category.toLowerCase() === targetCategory);
    }

    // Filter by Featured
    if (params.featured !== undefined) {
      results = results.filter((p) => !!p.featured === params.featured);
    }

    // Filter by Search Keyword
    if (params.search && params.search.trim().length > 0) {
      const query = params.search.trim().toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tagline.toLowerCase().includes(query) ||
          p.technologies.some((tech) => tech.toLowerCase().includes(query)) ||
          p.features.some((feat) => feat.toLowerCase().includes(query))
      );
    }

    return results;
  }

  async getProjectByIdOrSlug(identifier: string): Promise<Project | null> {
    const target = identifier.toLowerCase();
    return (
      PROJECTS_DATA.find(
        (p) => p.id.toLowerCase() === target || p.slug.toLowerCase() === target
      ) || null
    );
  }

  async getCategories(): Promise<{ category: ProjectCategory; label: string; count: number }[]> {
    const categories: { category: ProjectCategory; label: string }[] = [
      { category: 'all', label: 'All Projects' },
      { category: 'website-development', label: 'Website Development' },
      { category: 'ecommerce', label: 'Ecommerce Website' },
      { category: 'wordpress', label: 'Wordpress' },
      { category: 'app-development', label: 'App Development' },
      { category: 'product', label: 'Product' },
      { category: 'ai', label: 'Agentic AI' },
    ];

    return categories.map((cat) => {
      const count =
        cat.category === 'all'
          ? PROJECTS_DATA.length
          : PROJECTS_DATA.filter((p) => p.category === cat.category).length;

      return {
        ...cat,
        count,
      };
    });
  }

  async getAllServices(): Promise<Service[]> {
    return [...SERVICES_DATA];
  }

  async getServiceById(id: string): Promise<Service | null> {
    return SERVICES_DATA.find((s) => s.id.toLowerCase() === id.toLowerCase()) || null;
  }
}

export const projectService = new ProjectService();
