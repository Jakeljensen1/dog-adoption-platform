const { Router } = require('express');
const dogControllers = require('../controllers/dogControllers');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = Router();

router.get('/dogs', requireAuth, dogControllers.dogSignup_get);

router.get('/profile', requireAuth, dogControllers.profile_get);

router.post('/dogs', requireAuth, dogControllers.dogSignup_post);

router.post('/dogs/:id', requireAuth, dogControllers.dog_delete);

router.post('/dogs/:id/adopt', requireAuth, dogControllers.adoptDog_post);


module.exports = router;