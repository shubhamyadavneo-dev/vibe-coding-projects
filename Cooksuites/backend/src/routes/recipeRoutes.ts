import { Router } from 'express';
import { recipeController } from '../controllers/RecipeController';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', recipeController.listRecipes);
router.get('/:id', recipeController.getRecipe);

// Protected routes
router.post('/', authenticate, requirePermission('recipe:create'), upload.single('image'), recipeController.createRecipe);
router.put('/:id', authenticate, requirePermission('recipe:update'), upload.single('image'), recipeController.updateRecipe);
router.delete('/:id', authenticate, requirePermission('recipe:delete'), recipeController.deleteRecipe);

export default router;
