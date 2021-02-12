class APIFeatures {
    constructor(Model,reqQuery){
        this.Model = Model;
        this.reqQuery = reqQuery
        this.query = ""; 
    }

    filter(){
        // *Filtering
        // 1. Create copy 
        const queryCopy = {...this.reqQuery};
        const excludeFileds = ["page","sort","limit","fields"];
        
        // 1a. Remove fields that are not part of the filtering process 
        excludeFileds.forEach( el =>  delete queryCopy[el]);
        
        // 1b. Advance filtering
        let copyToString = JSON.stringify(queryCopy);
        // Regular expression replace {gte} with {$gte} so mongo understand it 
        // b = exactly that word
        // g = do it for every match not just once
        copyToString = copyToString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        // 1c. Create a query to chain things to 
        // this.query.find makes reference to the model Tour.find
        this.query = this.Model.find(JSON.parse(copyToString));

  
        return this;
    }

    sort(){
        if(this.reqQuery.sort){
            const sortBy = this.reqQuery.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        }
        else{
            this.query = this.query.sort("-createdAt")
        }

        // 3. Check if it has field limiting / specific fields to show
        if(this.reqQuery.fields){
            const fields = this.reqQuery.fields.split(",").join(" "); 
            this.query = this.query.select(fields);
        }
        else{
            this.query = this.query.select("-__v");
        }
        return this;
    }

    limitFields(){
        // 3. Check if it has field limiting / specific fields to show
        if(this.reqQuery.fields){
            const fields = this.reqQuery.fields.split(",").join(" "); 
            this.query = this.query.select(fields);
        }
        else{
            this.query = this.query.select("-__v");
        }

        return this;
    }

    paginate(){
        // 4. Pagination and limit 
        // DEFAULT PAGE= 1 DEFAULT LIMIT =100 
        // req.query.page * 1 This cast into a number
        const page = this.reqQuery.page * 1 || 1; 
        const limit = this.reqQuery.limit *1 || 100; 
        // ex: page 5 limit 3
        // page 5 - 1 = 4  * 3  = 12
        // skip 12 results and show only 5
        const skip = (page - 1) * limit; 

        this.query = this.query.skip(skip).limit(limit);

        return this;
  
    }

    
}

module.exports = APIFeatures;