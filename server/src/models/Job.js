import mongoose from 'mongoose';
const schema=new mongoose.Schema({title:{type:String,required:true},company:{type:String,required:true},location:{type:String,required:true},description:{type:String,default:''},skills:{type:[String],default:[]}},{timestamps:true});
export default mongoose.model('Job',schema);