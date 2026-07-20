const BaseRepository = require('./BaseRepository');
const Retailer = require('../models/Retailer');

class RetailerRepository extends BaseRepository {
  constructor() {
    super(Retailer);
  }
}

module.exports = new RetailerRepository();
