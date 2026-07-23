const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { requireAuth } = require('../middleware/auth');

router.get('/', categoryController.getCategories);
router.post('/', requireAuth, categoryController.createCategory);

module.exports = router;
