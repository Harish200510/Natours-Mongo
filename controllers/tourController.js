const { json } = require('express');
const Tour = require('./../models/tourModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.aliasTopTours = (req, res, next) => {
  req.url =
    '?limit=5&sort=-ratingsAverage,price&fields=name,price,ratingsAverage,difficulty';
  next();
};

exports.getAllTours=factory.getAll(Tour)
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // console.log(req.query)

//   //    //1A)Filtering
//   //    //creating  a new object with new address which will not affect the original req.query
//   //   const queryObj={...req.query}

//   //   //Removing the fields that we don't want to filter these are like for pagination, sorting, limiting and selecting fields which was not a fields in database
//   //   const excludedFields=['page','sort','limit','fields']

//   //   //Looping through the excludedFields and deleting them from the queryObj that are not required for filtering
//   //   excludedFields.forEach(el=>delete queryObj[el])

//   //   //1B)Advanced filtering
//   //   let queryStr=JSON.stringify(queryObj)
//   //   queryStr=queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match=>`$${match}`)

//   //  let query= Tour.find(JSON.parse(queryStr))

//   //  //2)Sorting

//   //  if(req.query.sort){
//   //     //if there is a sort query then we will sort the data
//   //     //we will split the sort query by comma and join it with space to make it a valid mongoose sort query
//   //     const sortBy=req.query.sort.split(',').join(' ')
//   //     query=query.sort(sortBy)
//   //  }
//   //  else{
//   //     //if new data comes in that will at first
//   //     query=query.sort('-createdAt')
//   //  }

//   //  //3)Field Limiting
//   //  if(req.query.fields){
//   //     const fields=req.query.fields.split(',').join(' ');
//   //     query=query.select(fields)
//   //  }
//   //  else{
//   //     //-__v it will exculde __v field
//   //    query=query.select('-__v')
//   // }

//   // //4)Pagination

//   //  const page=req.query.page*1 || 1;
//   //  const limit=req.query.limit*1 || 100;
//   //  const skip=(page-1)*limit

//   //  //page=3&limit=10, 1-10 page 1, 11-20 page2 , 21-30 page3
//   //  query=query.skip(skip).limit(limit)
//   //  if(req.query.page){
//   //     //gets the number of documents
//   //     const numTours=await Tour.countDocuments();
//   //     if(skip>=numTours) throw new Error('This page does not exist')
//   //  }

//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();

//   //Excecuting the query
//   const tours = await features.query;

//   //Sending the response
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
//   next();
// });

exports.getTour=factory.getOne(Tour,{path:'reviews'})
// exports.getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate('reviews');

//   if (!tour) return next(new AppError('No tour found with that ID', 404));
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
//   next();
// });

exports.createTour = factory.createOne(Tour);
// exports.createTour=catchAsync(
// async(req,res,next)=>{
//         const newTour=await  Tour.create(req.body)

//             res.status(201).json(
//                {
//                "status":"success",
//                data:{
//                    tour:newTour
//                }
//                })
//         next()
//        }
// )

exports.updateTour = factory.updateOne(Tour);
// exports.updateTour= catchAsync(async (req,res,next)=>{

//       const tour=await Tour.findByIdAndUpdate(req.params.id,req.body,{
//             new:true,
//             runValidators:true //this will run the validator again to check the data to update
//         })

//       if(!tour)return next(new AppError("No tour found with that ID",404))

//         res.status(200).json({
//             status:"success",
//             data:{
//                 tour
//             }
//         })
//         next()
//     })

exports.deleteTour = factory.deleteOne(Tour);
// exports.deletTour=catchAsync(async(req,res,next)=>{

//        const delTour=await Tour.findByIdAndDelete(req.params.id)

//       if(!delTour)return next(new AppError("No tour found with that ID",404))

//         res.status(200).json({
//             status:"Success",
//             data:null
//         })
//         next()
//    })

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    //   {
    //     $match:{_id:{$ne:'EASY'}}
    //   }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
  next();
});

//to get the number of tours in a given year
//By checking startdate of that year
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  //converting string to integer
  const year = req.params.year * 1;

  //if we not await it will simply return the aggregate function not the data
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    //addding the fields while displaying
    {
      $addFields: { month: '$_id' },
    },
    //Here _id won't displayed on the screen
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
  next();
});
