const BaseRepository = require('./BaseRepository');
const Alert = require('../models/Alert');

class AlertRepository extends BaseRepository {
  constructor() {
    super(Alert);
  }
}

module.exports = new AlertRepository();
