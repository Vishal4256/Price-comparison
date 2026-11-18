const express = require('express');
const router = express.Router();
const AlertRepository = require('../../repositories/AlertRepository');
const { successResponse } = require('../../utils/response');
const { requireAuth } = require('../../middlewares/auth');

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const alerts = await AlertRepository.model.find({ user: req.user.id }).populate('product').sort('-createdAt');
    successResponse(res, alerts, req.id);
  } catch (error) {
    next(error);
  }
});

// Delete alert
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const alert = await AlertRepository.findById(req.params.id);
    if (!alert || alert.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    await AlertRepository.delete(req.params.id);
    successResponse(res, { message: 'Alert deleted' }, req.id);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
