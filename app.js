const express=require('express')
const morgan=require('morgan');
const rateLimit=require('express-rate-limit')
const qs=require('qs')
const helmet=require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const xss=require('xss-clean')
const hpp=require('hpp')


const AppError=require('./utils/appError')
const globalErrorHandler=require('./controllers/errorController')
const tourRouter=require('./Routes/tourRoutes')
const userRouter=require('./Routes/userRoutes');
const ExpressMongoSanitize = require('express-mongo-sanitize');



const app=express();

app.set('query parser',(str)=>qs.parse(str))

//1)Global Middleware 

//set Security HTTP headers
 app.use(helmet())

 
 //Development Logging
if(process.env.NODE_ENV==='development'){
  app.use(morgan('dev'))
}

//Limit requests from same API
//we basically set that 100 times only a user can access in per hour 
const limiter=rateLimit({
  max:100,
  windowMs:60*60*1000,
  message:'Too many requests from this IP, Please try again in an hour'//error message
})


//This middleware will be applied whose api will starts wit api
 app.use('/api',limiter)


//Body Parser, reading data from body into req.body
app.use(express.json({limit:'10kb'}))//only 10 kilo byte we will allow data to be in req.body


//Data Sanitization aganist NoSQL query injection  ("email":{"$gt":""})
//app.use(mongoSanitize())

//Data Sanitization against XSS
//this middleware will clean anu user input from the malicious HTML
//app.use(xss())

//prevent parameter pollution
app.use(hpp({
  whitelist:['duration','ratingsQuantity','ratingsAverage','difficulty','maxGroupSize','price']
}))

//Serving static File
app.use(express.static(`${__dirname}/public`))


//Test Middleware
app.use((req, res, next) => {
  req.requestTime=new Date().toISOString();
  next(); // Continue
});


//3)Routes
 app.use('/api/v1/tours',tourRouter)
 app.use('/api/v1/users',userRouter)


//any route that are not handeled that are return error 
app.all('/{*any}',(req,res,next)=>{
  
   next(new AppError(`can't find ${req.originalUrl} on this server!`,404))

})

//When there is four parameter i n the middleware express will understand it is an error handling middleware
app.use(globalErrorHandler)

module.exports=app;