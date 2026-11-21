import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { projectService } from '../services/project.service';

export const getServices = asyncHandler(async (_req: Request, res: Response) => {
  const services = await projectService.getAllServices();
  return res.status(200).json(
    ApiResponse.success(services, `Retrieved ${services.length} services successfully`, 200, {
      count: services.length,
    })
  );
});

export const getService = asyncHandler(async (req: Request, res: Response) => {
  const paramId = req.params.id;
  const id = typeof paramId === 'string' ? paramId : Array.isArray(paramId) ? paramId[0] : '';

  if (!id) {
    throw ApiError.badRequest('Service ID parameter is required');
  }

  const service = await projectService.getServiceById(id);

  if (!service) {
    throw ApiError.notFound(`Service not found with ID: ${id}`);
  }

  return res.status(200).json(ApiResponse.success(service, 'Service retrieved successfully'));
});
