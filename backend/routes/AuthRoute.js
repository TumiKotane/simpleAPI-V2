import express from "express";
import {Login, logOut, Me} from "../controllers/Auth.js";

const router = express.Router(); 

router.get('/me', Me); // current user
router.post('/login', Login); //user login
router.delete('/logout', logOut); //user logout

export default router; // export router to be used in backend/index.js