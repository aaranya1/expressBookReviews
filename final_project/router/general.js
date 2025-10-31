const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

const BASE_URL = 'https://aniketaranya-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai'


public_users.post("/register", (req,res) => {
    let username = req.body.username;
    let password = req.body.password;
    if(username && password){
        if(!(isValid(username))){
            res.send("Username already exists!");
        }
        else{
            users.push({
                "username": username,
                "password": password,
            })
            res.send("User successfully registered!");
        }
    }
    else{
        res.send("Username and/or password not provided!");
    }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books, null, 4));  
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  let isbn = req.params.isbn;
  res.send(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let author = req.params.author;
  let bookDetails = Object.values(books).filter((book) => book.author === author);
  res.send(bookDetails);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let title = req.params.title;
  let bookDetails = Object.values(books).filter((book) => book.title === title);
  res.send(bookDetails);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  let isbn = req.params.isbn;
  res.send(books[isbn].reviews);
});

// Promise callback for getting list of books (Task 10)
axios.get(`${BASE_URL}/`)
  .then(response => {
    console.log("List of books available in the shop:");
    console.log(response.data);
  })
  .catch(error => {
    console.error("Error fetching book list:", error.message);
  });

async function getBookByISBN(isbn){
    try{
        const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
        console.log(`Book details for ISBN ${isbn}: `);
        console.log(response.data);
    }
    catch(error){
        console.error(`Error fetching book with ISBN ${isbn}:`, error.message);
    }
}

module.exports.general = public_users;
