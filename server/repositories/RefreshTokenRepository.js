const BaseRepository = require('./BaseRepository');
const RefreshToken = require('../models/RefreshToken');

class RefreshTokenRepository extends BaseRepository {
  constructor() {
    super(RefreshToken);
  }

  async findByTokenHash(tokenHash) {
    return this.findOne({ tokenHash });
  }

  async revokeToken(id) {
    return this.updateById(id, { revokedAt: new Date() });
  }

  async revokeAllForUser(userId) {
    return this.model.updateMany(
      { user: userId, revokedAt: { $exists: false } },
      { $set: { revokedAt: new Date() } }
    );
  }
}

module.exports = new RefreshTokenRepository();
