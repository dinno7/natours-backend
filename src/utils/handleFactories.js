const APIFeatures = require('./APIFeatures');
const catchError = require('./catchError');
const AppError = require('./appError');
const { sendSuccessResponse, getModelName } = require('./global');

module.exports = {
  deleteOne: Model =>
    catchError(async function(req, res, next) {
      let modelName = getModelName(Model);

      const deletedDoc = await Model.findByIdAndDelete(req.params.id);

      if (!deletedDoc)
        return next(
          new AppError(`The ${modelName} with this id is not exist`, 404)
        );

      return sendSuccessResponse(res, null);
    }),

  updateOne: Model =>
    catchError(async function(req, res, next) {
      let modelName = getModelName(Model);

      let params = JSON.parse(JSON.stringify(req.body));
      const updatedDoc = await Model.findByIdAndUpdate(
        req.params.id,
        {
          $set: params
        },
        { new: true, runValidators: true }
      );

      if (!updatedDoc)
        return next(
          new AppError(`Can not find ${modelName} with this id`, 404)
        );

      // Separate updated fields
      let updatedFields = {};
      Object.keys(params).forEach(field => {
        updatedFields[field] = updatedDoc[field];
      });

      const resData = { [modelName]: updatedDoc, updatedFields };
      return sendSuccessResponse(res, resData, 1);
    }),

  createOne: (Model, beforeCreateCB = null, afterCreateCB = null) =>
    catchError(async function(req, res, next) {
      let modelName = getModelName(Model);

      if (beforeCreateCB) beforeCreateCB?.(req, res, next);

      const newDoc = await Model.create(req.body);

      if (afterCreateCB) afterCreateCB?.(newDoc, req, res, next);

      const resData = { [modelName]: newDoc };
      return sendSuccessResponse(res, resData, 1, 200);
    }),

  getOneById: (Model, populateOptions = null) =>
    catchError(async function(req, res, next) {
      const modelName = getModelName(Model);
      const query = Model.findById(req.params.id);
      if (populateOptions) query.populate(populateOptions);
      const doc = await query;
      if (!doc)
        return next(new AppError(`There is no ${modelName} with sent id`, 404));
      return sendSuccessResponse(res, { [modelName]: doc }, 1);
    }),

  getAll: Model =>
    catchError(async function(req, res, next) {
      const modelName = getModelName(Model);

      let { query } = new APIFeatures(
        Model,
        req.query,
        req.initialFilters || {}
      )
        .filter()
        .sort()
        .limitFields()
        .paginate();
      const docs = await query;
      const responseObj = {
        [modelName + 's']: docs
      };

      if (req.query?.page && req.query?.limit) {
        allDocCountForPagination = await Model.estimatedDocumentCount();
        responseObj.allCounts = allDocCountForPagination;
      }

      return sendSuccessResponse(res, responseObj, docs.length);
    })
};
