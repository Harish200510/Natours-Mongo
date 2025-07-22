const express=require('express')
const morgan=require('morgan');

const AppError=require('./utils/appError')
const globalErrorHandler=require('./controllers/errorController')
const tourRouter=require('./Routes/tourRoutes')
const userRouter=require('./Routes/userRoutes')
const qs=require('qs')

const app=express();

app.set('query parser',(str)=>qs.parse(str))

//Middleware 
if(process.env.NODE_ENV==='development'){
  app.use(morgan('dev'))
}

app.use(express.json())

app.use(express.static(`${__dirname}/public`))

app.use((req, res, next) => {
  req.requestTime=new Date().toISOString();
  next(); // Continue
});

 app.use('/api/v1/tours',tourRouter)

 app.use('/api/v1/users',userRouter)


//any route that are not handeled that are return error 
app.all('/{*any}',(req,res,next)=>{

   next(new AppError(`can't find ${req.originalUrl} on this server!`,404))

})

//When there is four parameter i n the middleware express will understand it is an error handling middleware
app.use(globalErrorHandler)

module.exports=app;