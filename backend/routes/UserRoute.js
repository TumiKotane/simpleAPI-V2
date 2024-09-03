import express from "express";
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} from "../controllers/Users.js";
import { verifyUser, adminOnly } from "../middleware/AuthUser.js";

const router = express.Router();

router.get('/users', verifyUser, adminOnly, getUsers); // add verifyUser, adminOnly
router.get('/users/:id',verifyUser, adminOnly, getUserById); //add verifyUser, adminOnly
router.post('/users',verifyUser, adminOnly, createUser); //add verifyUser, adminOnly
router.patch('/users/:id', verifyUser, adminOnly, updateUser);
router.delete('/users/:id', verifyUser, adminOnly, deleteUser);

export default router;

// verifyUser, adminOnly,