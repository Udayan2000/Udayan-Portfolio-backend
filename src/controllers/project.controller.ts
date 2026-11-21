import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { projectService } from '../services/project.service';

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const { category, search, featured } = req.query;

  const projects = await projectService.getAllProjects({
    category: typeof category === 'string' ? category : undefined,
    search: typeof search === 'string' ? search : undefined,
    featured: featured !== undefined ? featured === 'true' : undefined,
  });

  return res.status(200).json(
    ApiResponse.success(
      projects,
      `Retrieved ${projects.length} project(s) successfully`,
      200,
      { count: projects.length }
    )
  );
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const paramId = req.params.id;
  const id = typeof paramId === 'string' ? paramId : Array.isArray(paramId) ? paramId[0] : '';

  if (!id) {
    throw ApiError.badRequest('Project identifier parameter is required');
  }

  const project = await projectService.getProjectByIdOrSlug(id);

  if (!project) {
    throw ApiError.notFound(`Project not found with identifier: ${id}`);
  }

  return res.status(200).json(ApiResponse.success(project, 'Project retrieved successfully'));
});

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await projectService.getCategories();
  return res.status(200).json(ApiResponse.success(categories, 'Categories retrieved successfully'));
});
