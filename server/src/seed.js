import dotenv from 'dotenv';import mongoose from 'mongoose';import bcrypt from 'bcryptjs';import User from './models/User.js';import Job from './models/Job.js';
dotenv.config();
const jobs=[
{title:'React Developer',company:'Tech Solutions',location:'Delhi',skills:['React','JavaScript','CSS'],description:'Build modern user interfaces and collaborate with a product engineering team.'},
{title:'Node.js Developer',company:'Code Labs',location:'Gurgaon',skills:['Node.js','Express','MongoDB'],description:'Develop REST APIs and backend services for production applications.'},
{title:'Full Stack Developer',company:'Digital India',location:'Noida',skills:['React','Node.js','MongoDB'],description:'Own features across frontend, backend and database layers.'}
];
await mongoose.connect(process.env.MONGO_URI);await Job.deleteMany({});await Job.insertMany(jobs);const exists=await User.findOne({email:'demo@skillmatch.ai'});if(!exists)await User.create({name:'Demo User',email:'demo@skillmatch.ai',password:await bcrypt.hash('Demo123!',10),skills:['React','JavaScript','Node.js'],education:'B.Com',experience:'Fresher'});console.log('SkillMatch seed complete. Demo: demo@skillmatch.ai / Demo123!');await mongoose.disconnect();