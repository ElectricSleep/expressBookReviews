const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req,res) => {
  //Task 6
  const username = req.query.username;
  const password = req.query.password;

  // Check if username & password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and Password are required." });
  }

  // Check if the username already exists
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username " + req.query.username + " already exists." });
  }
  
  // Push a new user object into the users array based on query parameters from the request
  users.push({ username, password });

  // Send a success message as the response, indicuating the user has been added
  res.status(201).send("The user " + req.query.username + " has been added!")
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // Task 1
  // res.send(JSON.stringify(books,null,4));

  // Task 10
  axios.get('http://localhost:5000/').then(response => {
    res.status(200).json(response.data);
  }).catch(error => {
    res.status(500).json({ message: "Error fetching books", error: error.message });
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    //Task 2
    // Extract the ISBN parameter from the request URL
    const isbn = req.params.isbn;
    // Convert books object to an array before using find
    const book = Object.values(books).find(book => book.isbn ===isbn);
    
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  // Task 3
  // Extract the author from the request parameter
  const author = req.params.author;

  // Convert the books object into an array of books
  const book = Object.values(books);

  // Filter books that match the provided author
  const booksByAuthor = book.filter(book => book.author.toLowerCase() === author.toLowerCase());

  if (booksByAuthor.length === 0) {
    return res.status(404).json({ message: "No books found by this author: "});
  }

  res.json(booksByAuthor);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    // Task 4
    // Extract the title from the request parameter
    const title = req.params.title;

    // Convert the books object into an array of books
    const book = Object.values(books);

    // Filter books that match the provided title
    const booksByTitle = book.filter(book => book.title.toLowerCase() === title.toLowerCase());

    if (booksByTitle.length === 0) {
        return res.status(404).json({ message: "No books found with this title: "});
    }

    res.json(booksByTitle);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    // Task 5
    // Extract the ISBN paramber from the request URL
    const isbn = req.params.isbn;

    // Find the book with the matching ISBN
    const book = Object.values(books).find(book => book.isbn === isbn);

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    res.json(book.reviews);
});

module.exports.general = public_users;
