class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id) {
    return this.model.findById(id);
  }

  async findOne(query) {
    return this.model.findOne(query);
  }

  async find(query, { sort = {}, skip = 0, limit = 0 } = {}) {
    return this.model.find(query).sort(sort).skip(skip).limit(limit);
  }

  async create(data) {
    return this.model.create(data);
  }

  async updateById(id, data) {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }

  async count(query) {
    return this.model.countDocuments(query);
  }
}

module.exports = BaseRepository;
