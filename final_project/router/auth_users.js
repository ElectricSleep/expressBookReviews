const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
    // Check if username exists in users
    return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{
    // Check if username and password match a user
    return users.find(user => user.username === username && user.password === password);
}

// Only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username || req.query.username;
    const password = req.body.password || req.query.password;

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and Password are required." });
    }

    // Authenticate the user
    const user = authenticatedUser(username, password);

    if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate the JWT token
    const accessToken = jwt.sign({ username }, "your_secret_key", { expiresIn: "1h" });

    // Save the token to session
    req.session.authorization = {
        accessToken,
        username
    };

    return res.status(200).json({ message: "Login successful", token: accessToken });    
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    // Check if review text is provided
    if (!review) {
        return res.status(400).json({ message: "Review text is required." });
    }

    // Get the username from the session
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(401).json({ message: "Unauthorized: User not logged in." });
    }

    // Search through books to find matching ISBN
    const bookKey = Object.keys(books).find(key => books[key].isbn === isbn);

    if (!bookKey) {
        return res.status(404).json({ message: "Book not found for given ISBN." });
    }

    const book = books[bookKey];

    // Initialize reviews if missing
    if (!book.reviews) {
        book.reviews = {};
    }

    // Add or update review
    book.reviews[username] = review;

    return res.status(200).json({
        message: `Review by '${username}' for book '${book.title}' has been added/updated.`,
        reviews: book.reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
