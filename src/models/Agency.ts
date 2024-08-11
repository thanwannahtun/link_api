// import { Schema , model , Types } from "mongoose"
// import { IAgency } from "../interfaces/agency.js";



// const agencySchema = new Schema<IAgency>(
//     {
//         user_id:{type:Schema.Types.ObjectId, ref:"User",required:true},
//         name:{type:String,required:true},
//         profile_description:{type:String},
//         profile_image:{type:String},
//         location:{type:{lat:Number,long:Number}},
//         email:{type:String,unique:true,required:true},
//         password:{type:String,required:true}
//     }
// );

// const Agency = model<IAgency>("Agency",agencySchema);

// export default Agency;