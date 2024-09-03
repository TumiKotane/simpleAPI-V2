import User from "../models/UserModel.js";

export const verifyUser = async (req, res, next) =>{
    if(!req.session.userId){ // checks if the user is logged in - stored in the session
        return res.status(401).json({msg: "Please log in to your account!"});
    }
    const user = await User.findOne({ // checks if the user exists in the database
        where: {
            uuid: req.session.userId
        }
    });
    if(!user) return res.status(404).json({msg: "User not found"});
    req.userId = user.id;
    req.role = user.role;
    console.log(user.id); // holds the session by userID
    console.log(user.role);//hold the session by role
    next(); // next middleware
}

export const adminOnly = async (req, res, next) =>{
    const user = await User.findOne({
        where: {
            uuid: req.session.userId
        }
    });
    if(!user) return res.status(404).json({msg: "User not found"});
    if(user.role !== "Admin") return res.status(403).json({msg: "Access Denied"});
    next();
} // adminOnly function