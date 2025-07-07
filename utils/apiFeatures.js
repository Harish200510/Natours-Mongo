
class APIFeatures{
 
    constructor(query,queryString){
        this.query=query;
        this.queryString=queryString
    }
    filter(){
         //1A)Filtering
           //creating  a new object with new address which will not affect the original req.query
          const queryObj={...this.queryString}

          //Removing the fields that we don't want to filter these are like for pagination, sorting, limiting and selecting fields which was not a fields in database
          const excludedFields=['page','sort','limit','fields']        
        
          //Looping through the excludedFields and deleting them from the queryObj that are not required for filtering
          excludedFields.forEach(el=>delete queryObj[el])
          
          //1B)Advanced filtering
          let queryStr=JSON.stringify(queryObj)
          queryStr=queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match=>`$${match}`)
                  
        this.query.find(JSON.parse(queryStr))
        
         return this
        
    }
    sort(){

         //2)Sorting

         if(this.queryString.sort){
            //if there is a sort query then we will sort the data
            //we will split the sort query by comma and join it with space to make it a valid mongoose sort query
            const sortBy=this.queryString.sort.split(',').join(' ')
            this.query=this.query.sort(sortBy)
         }
         else{
            //if new data comes in that will at first 
            this.query=this.query.sort('-createdAt')
         }
        return this 
    }
    limitFields(){

        //3)Field Limiting
         if(this.queryString.fields){
            const fields=this.queryString.fields.split(',').join(' ');
            this.query=this.query.select(fields)
         }
         else{
            //-__v it will exculde __v field 
           this.query=this.query.select('-__v')
        }
        return this
    }
    paginate(){
       
         //4)Pagination

         const page=this.queryString.page*1 || 1;
         const limit=this.queryString.limit*1 || 100;
         const skip=(page-1)*limit

         //page=3&limit=10, 1-10 page 1, 11-20 page2 , 21-30 page3
         this.query=this.query.skip(skip).limit(limit)
   
         return this
       
    }
}

module.exports=APIFeatures