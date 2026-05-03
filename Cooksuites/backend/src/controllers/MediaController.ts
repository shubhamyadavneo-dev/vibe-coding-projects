import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { mediaStorageService } from '../services/MediaStorageService';

export class MediaController {
  async uploadFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'No file uploaded' }
        });
      }

      const userId = req.user!.id;
      const url = await mediaStorageService.upload(req.file, `users/${userId}/media`);

      res.status(201).json({
        success: true,
        data: { url },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const mediaController = new MediaController();
