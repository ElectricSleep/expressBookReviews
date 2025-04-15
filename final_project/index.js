const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const PORT =5001;

app.use(express.json());

app.use(session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

app.use("/customer/auth/*", function auth(req,res,next){
    // Updating the authentication mechanism
    if (!req.session || !req.session.authorization || !req.session.authorization.accessToken) {
        return res.status(401).json({ message: "Unauthorized: No session token found: "});
    }

    jwt.verify(req.session.authorization.accessToken, "your_secret_key", (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden: Invalid token" });
        }

        req.user = decoded; // Store decoded user information in request object
        next();
    });
});

// Register routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
