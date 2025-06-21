import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import ConnectionRequest from "../models/connections.model.js";
import crypto from "crypto";
import path from "path";
import PDFDocument from "pdfkit";
import bcrypt from "bcrypt";
import fs from "fs";
import { connections } from "mongoose";
import Post from "../models/posts.model.js";
import Comment from "../models/comments.model.js";
import mongoose from "mongoose"; 

const convertUserDataTOPDF = async (userData) => {
    const doc = new PDFDocument();

    const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
    const stream  = fs.createWriteStream("uploads/"+outputPath);

    doc.pipe(stream);

    if (userData.profilePicture) {
        const imagePath = path.join("uploads", userData.profilePicture);
        if (fs.existsSync(imagePath)) {
            doc.image(imagePath, { align: "center", width: 100 });
        } else {
            console.warn(`Profile picture not found at: ${imagePath}`);
        }
    }
    doc.fontSize(14).text(`Name: ${userData.userId.name}`);
    doc.fontSize(14).text(`Email: ${userData.userId.email}`);
    doc.fontSize(14).text(`Username: ${userData.userId.username}`);
    doc.fontSize(14).text(`Bio: ${userData.bio}`);
    doc.fontSize(14).text(`Current Position: ${userData.currentPosition}`);
    doc.fontSize(14).text("Past Work");
    userData.pastWork.forEach((work) => {
        doc.fontSize(14).text(`Company: ${work.company}`);
        doc.fontSize(14).text(`Position: ${work.position}`);
        doc.fontSize(14).text(`Duration: ${work.years}`);
    });

    doc.end();

    return outputPath;
}







export const register = async (req, res) => {
    try{
        const { name, email, password ,username } = req.body;

        if(!name || !email || !password || !username)  return res.status(400).json({message: "Please fill all the fields"}); 

        const user = await User.findOne({ email });

        if(user) return res.status(400).json({message: "User already exists"});
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            username,
        });

        await newUser.save();

        const profile = new Profile({
            userId: newUser._id,
        });

        // FIX: Save the profile to database
        await profile.save();

        return res.status(201).json({message: "User registered successfully"});
    }catch(error){
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

export const login = async (req, res) => {
    try{
        const { email, password } = req.body;

        if(!email || !password) return res.status(400).json({message: "Please fill all the fields"});

        const user = await User.findOne({
            email
        });

        if(!user) return res.status(404).json({message: "User not found"});

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) return res.status(400).json({message:"Invalid Crentials"})

        const token = crypto.randomBytes(32).toString("hex");

        await User.updateOne(
            { _id: user._id },
            { token }
        );

        return res.json({token: token});

    }catch(error){
        return res.status(500).json({ message: "Internal server error"})
    }
}

export const uploadProfilePicture = async (req, res) => {
    const { token } = req.body;

    try{
        const user = await User.findOne({token: token});

        if(!user) return res.status(400).json({message: "User not found"});

        user.profilePicture = req.file.filename;

        await user.save();
        
        return res.status(200).json({message: "Profile picture uploaded successfully"});
    }catch(error){
        return res.status(500).json({ message: "Internal server error"});
    }
}

export const updateUserProfile = async (req, res) => {
    try{
        const { token , ...newUserData} = req.body;
        
        const user = await User.findOne({token: token});

        if(!user) return res.status(400).json({message: "User not found"});

        const { username, email } = newUserData;

        const existingUser = await User.findOne({$or: [{ username }, { email }] });

        if(existingUser  && existingUser._id.toString() !== user._id.toString()) {
            return res.status(400).json({message: "Username or email already exists"});
        }

        Object.assign(user, newUserData);

        await user.save();

        return res.json({message: "User profile updated successfully", user});

    }catch(error){
        return res.status(500).json({ message:error.message });
    }
}

export const getUserAndProfile = async (req, res) => {
    try{
        const { token } = req.query;

        console.log(`Token:${token}`)

        const user = await User.findOne({ token: token })

        if(!user) return res.status(400).json({ message: "User not found" });

        const userProfile = await Profile.findOne({ userId: user._id })
        .populate('userId', 'name email username profilePicture');

        return res.json({userProfile})

    }catch(error){
        return res.status(500).json({ message: error.message });
    }
}

export const updateProfileData = async (req, res) => {
    try{
        const { token, ...newProfileData } = req.body;

        const user = await User.findOne({token: token});

        if(!user) return res.status(400).json({message: "User not found"});

        let profile = await Profile.findOne({userId: user._id});

        // FIX: Create profile if it doesn't exist
        if(!profile) {
            profile = new Profile({
                userId: user._id,
                ...newProfileData
            });
        } else {
            // Update existing profile
            Object.assign(profile, newProfileData);
        }

        await profile.save();

        return res.json({message: "Profile updated successfully", profile});

    }catch(error){
        return res.status(500).json({ message: error.message });
    }
}

export const getAllUserProfile = async (req, res) => {
    try{
        const profiles = await Profile.find().populate('userId', 'name email username profilePicture');

        if(!profiles || profiles.length === 0) return res.status(404).json({message: "No profiles found"});

        return res.json({profiles});
    }catch(error){
        return res.status(500).json({ message: error.message });
    }
}


export const downloadProfile = async (req, res) => {
    const user_id= req.query.id;

    const userProfile = await Profile.findOne({ userId: user_id })
    .populate('userId', 'name email username profilePicture');
    
    let outputPath = await convertUserDataTOPDF(userProfile);

    return res.json({"message": outputPath});

}

export const sendConnectionRequest = async (req, res) => {
    const { token, connectionId } = req.body;
    try{
        const user = await User.findOne({ token });

        if(!user) return res.status(400).json({ message: "User not found" });

        const connectionUser = await User.findOne({_id: connectionId});

        if(!connectionUser) return res.status(400).json({ message: "Connection user not found" });

        const existingRequest = await ConnectionRequest.findOne({
            userId: user._id,
            connectionId: connectionUser._id
        });

        if(existingRequest) {
            return res.status(400).json({ message: "Connection request already sent" });
        }

        const request = new ConnectionRequest({
            userId: user._id,
            connectionId: connectionUser._id,
        });

        await request.save();

        return res.json({ message: "Connection request sent successfully" });

    }catch(error){
        return res.status(500).json({ message: error.message });
    }
}

// Fixed getMyConnectionRequests function - corrected variable name
// ✅ Get connection requests I SENT (outgoing)
export const getMyConnectionRequests = async (req, res) => {
    const { token } = req.query;

    try{
        const user = await User.findOne({ token });

        if(!user) return res.status(404).json({ message: "User not found" });

        const connections = await ConnectionRequest.find({ userId: user._id })
        .populate('connectionId', 'name email username profilePicture');

        return res.json({connections});

    }catch(error) {
        console.error("Get my connection requests error:", error);
        return res.status(500).json({message:error.message});
    }
}

// ✅ Get connection requests I RECEIVED (incoming) - for accepting/rejecting
export const whatAreMyConnections = async (req, res) => {
    const { token } = req.query;

    try{
        const user = await User.findOne({token});

        if(!user) return res.status(404).json({ message: "User not found" });

        // ✅ Find requests where current user is the connectionId (receiver)
        const connections = await ConnectionRequest.find({ connectionId: user._id })
        .populate('userId', 'name email username profilePicture');

        return res.json(connections);

    }catch(error) {
        console.error("What are my connections error:", error);
        return res.status(500).json({message:error.message});
    }    
}


export const acceptConnectionRequest = async (req, res) => {
    const { token, requestId, action_type } = req.body;

    try{
        const user = await User.findOne({ token }); 
        
        if(!user) return res.status(404).json({ message: "User not found" });

        // ✅ FIXED: Find connection request by ID and verify user is the receiver
        const connection = await ConnectionRequest.findOne({ 
            _id: requestId,
            connectionId: user._id // ✅ Ensure current user is the receiver of the request
        });

        if(!connection) return res.status(404).json({ message: "Connection request not found" });

        if(action_type === "accept") {
            connection.status_accepted = true;
        } else {
            connection.status_accepted = false;
        }

        await connection.save();

        return res.json({ message: "Connection request updated successfully" });
        
    }catch(error) {
        console.error("Accept connection error:", error);
        return res.status(500).json({ message: error.message });
    }
}  


// In your user.controller.js - commentPost function:

// Simple fix - just remove the mongoose validation:

export const commentPost = async (req, res) => {
  const { token, post_id, commentBody } = req.body;

  try {
    // Validate user
    const user = await User.findOne({ token }).select("_id");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Validate post
    const post = await Post.findById(post_id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Create and save comment
    const comment = new Comment({
      userId: user._id,
      postId: post_id,
      body: commentBody,
    });

    await comment.save();

    return res.status(200).json({ message: "Comment added successfully" });
  } catch (error) {
    console.error("Comment error:", error);
    return res.status(500).json({ message: error.message });
  }
};




export const getUserProfileAndUserBasedOnUsername = async (req,res) => {
    const { username } = req.query;

    try{
       const user = await User.findOne({
        username
       });

       if(!user){
        return res.status(404).json({message:"User not found"})
       }

       const userProfile = await Profile.findOne({userId:user._id})
           .populate('userId','name username email profilePicture')
        
        // Fix: Return with userProfile key to match frontend expectation
        return res.json({"profile":userProfile})

    }catch(error){
        return res.status(500).json({message:error.message})
    }
}