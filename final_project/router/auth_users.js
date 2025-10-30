const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return !(users.some((user) => user.username === username));
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  let username = req.body.username;
  let password = req.body.password;

  if(!username || !password){
    return res.status(404).json({message: "Error logging in; missing username/password!"});
  }

  if(authenticatedUser(username, password)){
    let accessToken = jwt.sign({
        data: password
    },  'access',  {expiresIn: 60 * 60});

    req.session.authorization = {
        accessToken, username
    }
    return res.status(200).json({message: "User successfully logged in!"});
  }
  return res.status(208).json({message: "Invalid login; check username and/or password"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let isbn = req.params.isbn;
  let reviewText = req.query.review;

  if(!books[isbn]){
    return res.status(404).json({message: "Book not found!"});
  }

  if(authenticatedUser(username, password)){
    if(!books[isbn].reviews){
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = reviewText;
    if(books[isbn].reviews.hasOwnProperty(username)){        
        return res.send("Review successfully updated!");
    }
    else{
        return res.send("Review successfully added!")
    }
  }
  else{
    return res.send("You must be logged in to post a review!");
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let isbn = req.params.isbn;

    if(!books[isbn]){
        return res.status(404).json({message: "Book not found!"});
    }

    if(authenticatedUser(username, password)){
        if(books[isbn].reviews[username]){
            delete books[isbn].reviews[username];
            return res.send("Review successfully deleted!");
        }
        else{
            return res.send("No review found for this book!");
        }
    }
    else{
        return res.send("You must be logged in to delete a review!");
    }

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
