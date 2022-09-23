var express = require('express');
const { render } = require('pug/lib');
var router = express.Router();
const Book = require('../models').Book
const { Op } = require('sequelize');
const db = require('../models/index').db;

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      next(error);
      // res.status(500).send(error);
    }
  }
}
/* GET home page. */
router.get('/', asyncHandler(async (req, res) => { 
  // res.render('index', { title: 'Express' });
    // const allBooks = await Book.findAll();
    // res.json(allBooks)
    res.redirect('books');
}));

router.get('/books', asyncHandler(async (req, res) => {
  const allBooks = await Book.findAll();
  res.render('index', {allBooks, title: 'Books'})
}));

router.get('/books/new', asyncHandler(async (req, res) => {
  res.render('new-book', {title: 'New Book'})
}));

router.post('/books/new', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    console.log(req.body)
    res.redirect("/books");  //+ book.id);
  } catch (error) {
    if (error.name === "SequelizeValidationError") { // checking the error
      //Returns a non-persistent (or unsaved) model instance.
      //Holds the propertes/values of the book being created via req.body.
      //Will get stored in the database by ther create() method on user submits
      //the valid form information.
      book = await Book.build(req.body); 
      res.render('new-book', { book, errors: error.errors, title: "New Book" })
    } else {
        throw error; // error caught in the asyncHandler's catch block
    }  
  }
}));

router.get('/books/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  console.log(book)
  if (book) {
    res.render("update-book", { book, title: book.title }); 
  } else {
    throw error;
  }
}));

router.post('/books/:id/update', asyncHandler(async (req, res) => {
  let book;
  try {
    console.log(req.params.body)
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect("/books/"); 
    } else {
      throw error;
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id; // make sure correct book gets updated
      res.render("update-book", { book, title: book.title })
    } else {
      throw error;
    }
  }
}));

router.post('/books/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect("/books");
  } else {
    throw error
  }
}))

module.exports = router;
