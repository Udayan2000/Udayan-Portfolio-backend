import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { contactService } from '../services/contact.service';
import { ContactInquiryInput } from '../validations/contact.validation';

export const submitInquiry = asyncHandler(async (req: Request, res: Response) => {
  const inquiryData = req.body as ContactInquiryInput;
  const clientIp = req.ip || req.socket.remoteAddress;

  const submission = await contactService.createSubmission(inquiryData, clientIp);

  return res.status(201).json(
    ApiResponse.created(
      {
        id: submission.id,
        createdAt: submission.createdAt,
      },
      'Thank you! Your project inquiry has been received. I will review it and reply within 24 hours.'
    )
  );
});

export const getSubmissions = asyncHandler(async (_req: Request, res: Response) => {
  const submissions = await contactService.getAllSubmissions();
  return res.status(200).json(ApiResponse.success(submissions, 'Submissions retrieved successfully'));
});
