import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import db from "./config/Database.js";
import SequelizeStore from "connect-session-sequelize";
import UserRoute from "./routes/UserRoute.js";
import ProductRoute from "./routes/ProductRoute.js";
import AuthRoute from "./routes/AuthRoute.js";

dotenv.config();

const app = express();

const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({
    db: db
});

// Initialize database sync
// (async()=>{
//      await db.sync();
// })();

app.use(session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
        secure: 'auto' // Adjust security settings for production
    }
}));

// Modify CORS settings for React Native frontend
app.use(cors({
    credentials: true,
    origin: '*' // Allow requests from any frontend (adjust for production)
}));

app.use(express.json());
app.use(UserRoute);
app.use(ProductRoute);
app.use(AuthRoute);

// Sync session store with database
// store.sync();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
});

// import express from "express";
// import cors from "cors";
// import session from "express-session";
// import dotenv from "dotenv";
// import db from "./config/Database.js";
// import SequelizeStore from "connect-session-sequelize";
// import UserRoute from "./routes/UserRoute.js";
// import ProductRoute from "./routes/ProductRoute.js";
// import AuthRoute from "./routes/AuthRoute.js";
// dotenv.config();

// const app = express();

// const sessionStore = SequelizeStore(session.Store);

// const store = new sessionStore({
//     db: db
// });

// // (async()=>{
// //      await db.sync();
// //  })();

// app.use(session({
//     secret: process.env.SESS_SECRET,
//     resave: false,
//     saveUninitialized: true,
//     store: store,
//     cookie: {
//         secure: 'auto'
//     }
// }));

// app.use(cors({
//     credentials: true,
//     origin: ['http://localhost:3000', 'http://localhost:8081'] // frontend url (was port 5000)
// }));
// app.use(express.json());
// app.use(UserRoute);
// app.use(ProductRoute);
// app.use(AuthRoute);

// // store.sync();
// const PORT = process.env.PORT ;
// app.listen(PORT, ()=> {
//     console.log(`Server up and running on ${PORT}...`);
// });
