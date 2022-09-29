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
    }
  }
}
/* GET home page. */
router.get('/', asyncHandler(async (req, res) => { 
    res.redirect('books');
}));

// Function for appending the proper amount of buttons to page
function addButtons (pages) {
  const buttons = []
  for (let i=1; i<= pages; i++) {
    buttons.push({
      buttonNumber: i,
      className: "button"
    })
  }
  return buttons
}

router.get('/books', asyncHandler(async (req, res) => {
  const pageNumber = Number.parseInt(req.query.page);
  let { searchTerm } = req.query
  let size = 5;
  let page = 0;

  // sets page number based on page numer passed into req.query
  if (!Number.isNaN(pageNumber) && pageNumber > 0) {
    page = pageNumber
  } else {
    page = 0
  }
  
  // searchTerm passed in is checked and used for setting up sequel query.
  if (!searchTerm) {
    const { count, rows } = await Book.findAndCountAll({
      limit: size,
      offset: page * size
    });
    const totalNumOfBooks= count;
    const allBooks = rows;
  
    let totalPages = Math.ceil(totalNumOfBooks / size)
    let buttons = addButtons(totalPages)
    res.render('index', {allBooks, buttons, title: 'Books'})
  } else {
    const { count, rows }= await Book.findAndCountAll({
      where: { 
        [Op.or]: { // SELECT * FROM GET WHERE title is like searchTerm OR author is like searchTerm...;
        title: { [Op.like]: `%${searchTerm}%`}, //WHERE title LIKE '%${searchTerm}%'	Finds any values that have "searchTerm" in any position
        author: { [Op.like]: `%${searchTerm}%`},
        genre: { [Op.like]: `%${searchTerm}%`},
        year: { [Op.like]: `%${searchTerm}%`}
        }
    }})
    const allBooks = rows;
    const totalNumOfBooks = count;
    const totalPages = Math.ceil(totalNumOfBooks/size);
    const buttons = addButtons(totalPages)

    let message;
    if (buttons.length === 0) {
      message = `Sorry! No match for "${searchTerm}"`;
    } else {
      message = `We found ${totalNumOfBooks} matches for "${searchTerm}"`
    }
    res.render('index', { allBooks, buttons, message, title: 'Books'})
  }
 
}));

router.get('/books/new', asyncHandler(async (req, res) => {
  res.render('new-book', {title: 'New Book'})
}));

router.post('/books/new', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
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
  if (book) {
    res.render("update-book", { book, title: book.title }); 
  } else {
    throw error;
  }
}));

router.post('/books/:id/update', asyncHandler(async (req, res) => {
  let book;
  try {
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
