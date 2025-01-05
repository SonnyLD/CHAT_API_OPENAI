import { Router } from 'express';
import { callChatGpt, callImageGpt} from '../controllers/chat.controller.js';

const router = Router();

router.post('/', callChatGpt);
router.post('/image', callImageGpt);

export default router;
