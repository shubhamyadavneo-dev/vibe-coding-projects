import { Router } from 'express';
import { categoryController } from '../controllers/CategoryController';

const router = Router();

router.get('/', categoryController.listCategories);

export default router;
