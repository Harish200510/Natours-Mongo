const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError('No  document found with that ID', 404));

    res.status(200).json({
      status: 'Success',
      data: null,
    });
    next();
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, //this will run the validator again to check the data to update
    });

    if (!doc) return next(new AppError('No document found with that ID', 404));

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
    next();
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
    next();
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    //creating a query,just storing it variable if popOptions are then we will attach it otherwise await the query to get the data
    let query = Model.findById(req.params.id);
    //if populate options are there then we will populate the data
    if (popOptions) query = query.populate(popOptions);
    //then await the query to get the data
    const doc = await query;

    if (!doc) return next(new AppError('No Document found with that ID', 404));
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
    next();
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //To allow for nested GET reviews on tour (hack)
    let filter = {};

    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    //Excecuting the query
    const doc = await features.query;

    //Sending the response
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
    next();
  });
