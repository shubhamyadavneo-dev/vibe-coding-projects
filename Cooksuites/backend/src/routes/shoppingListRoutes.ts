import { Router } from 'express';
import { shoppingListController } from '../controllers/ShoppingListController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/generate', shoppingListController.generate);
router.get('/', shoppingListController.list);
router.get('/:id', shoppingListController.get);
router.patch('/items/:itemId/toggle', shoppingListController.toggleItem);
router.delete('/:id', shoppingListController.delete);

export default router;
