import { Router } from 'express';
import { cookbookController } from '../controllers/CookbookController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All cookbook routes require authentication
router.use(authenticate);

router.post('/', cookbookController.create);
router.get('/', cookbookController.list);
router.get('/:id', cookbookController.get);
router.patch('/:id', cookbookController.update);
router.delete('/:id', cookbookController.delete);

// Recipe association routes
router.post('/:id/recipes', cookbookController.addRecipe);
router.delete('/:id/recipes/:recipeId', cookbookController.removeRecipe);

export default router;
