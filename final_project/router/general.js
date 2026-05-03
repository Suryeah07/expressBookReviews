const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const getBooks = () => {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
};

const getBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject(new Error("Book not found"));
    }
  });
};

const getBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    let booksByAuthor = [];
    let isbns = Object.keys(books);
    isbns.forEach((isbn) => {
      if (books[isbn].author === author) {
        let book = {};
        book[isbn] = books[isbn];
        booksByAuthor.push(book);
      }
    });
    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    } else {
      reject(new Error("No books found by this author"));
    }
  });
};

const getBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
    let booksByTitle = [];
    let isbns = Object.keys(books);
    isbns.forEach((isbn) => {
      if (books[isbn].title === title) {
        let book = {};
        book[isbn] = books[isbn];
        booksByTitle.push(book);
      }
    });
    if (booksByTitle.length > 0) {
      resolve(booksByTitle);
    } else {
      reject(new Error("No books found with this title"));
    }
  });
};

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (isValid(username)) {
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const bookList = await getBooks();
    res.send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    res.status(500).json({message: "Error fetching books"});
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const book = await getBookByISBN(isbn);
    res.send(book);
  } catch (error) {
    res.status(404).json({message: error.message});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const booksByAuthor = await getBooksByAuthor(author);
    res.send(booksByAuthor);
  } catch (error) {
    res.status(404).json({message: error.message});
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const booksByTitle = await getBooksByTitle(title);
    res.send(booksByTitle);
  } catch (error) {
    res.status(404).json({message: error.message});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn].reviews);
});

module.exports.general = public_users;
