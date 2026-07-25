const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

router.get('/', searchController.globalSearch);
router.get('/hot', searchController.getHotSearches);

module.exports = router;
