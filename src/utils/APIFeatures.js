class APIFeatures {
  constructor(Model, queryStr) {
    this.Model = Model;
    this.query = Model.find();
    this.queryStr = queryStr;
  }
  filter() {
    const reqQuery = { ...this.queryStr };
    const excludeQuery = ['sort', 'page', 'limit', 'fields'];
    excludeQuery.forEach(item => delete reqQuery[item]);

    // >> This is for when you wanna get for ex duration[gt] and convert gt to $gt
    // let filters = JSON.stringify(reqQuery);
    // filters = filters.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    // filters = JSON.parse(filters);
    // this.query = this.query.find(filters);

    this.query = this.query.find(reqQuery);
    return this;
  }
  sort() {
    let sortStr = this.queryStr.sort;
    if (sortStr) {
      sortStr = sortStr.replace(/\,/g, ' ');
      this.query = this.query.sort(sortStr);
    }
    return this;
  }
  limitFields() {
    let fieldsStr = this.queryStr.fields;
    if (fieldsStr) {
      fieldsStr = fieldsStr.replace(/\,/g, ' ');
      this.query = this.query.select(fieldsStr);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate(defaultPage = 1, defaultLimit = 20) {
    let page = +this.queryStr.page || defaultPage;
    let limit = +this.queryStr.limit || defaultLimit;
    let skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
