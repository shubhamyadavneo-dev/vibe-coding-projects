import { Router } from 'express';
import { mediaController } from '../controllers/MediaController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/', authenticate, upload.single('file'), mediaController.uploadFile);

export default router;
