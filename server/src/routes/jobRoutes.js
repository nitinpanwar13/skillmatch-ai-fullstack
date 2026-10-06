import express from 'express';import Job from '../models/Job.js';
const router=express.Router();
router.get('/',async(_req,res)=>res.json({jobs:await Job.find().sort({createdAt:-1})}));
router.get('/:id',async(req,res)=>{const job=await Job.findById(req.params.id);if(!job)return res.status(404).json({message:'Job not found'});res.json({job})});
router.post('/',async(req,res)=>{const job=await Job.create(req.body);res.status(201).json({job})});export default router;