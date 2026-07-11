const express = require('express');
const { protect } = require('../middleware/auth');
const { 
    getProfile, 
    updateProfile, 
    changePassword, 
    logoutAll, 
    deleteAccount,
    getUserPriceHistory,
    deletePriceHistory,
    getSearchHistory,
    deleteSearchHistory,
    clearSearchHistory
} = require('../controllers/userController');

const router = express.Router();

router.use(protect); // Apply protect middleware to all user routes

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/logout-all', logoutAll);
router.delete('/account', deleteAccount);

router.get('/price-history', getUserPriceHistory);
router.delete('/price-history/:id', deletePriceHistory);

router.get('/search-history', getSearchHistory);
router.delete('/search-history/:id', deleteSearchHistory);
router.delete('/search-history', clearSearchHistory);

module.exports = router;
