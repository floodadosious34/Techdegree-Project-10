var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//Import Instance of sequelize from index
const sequelize  = require('./models').sequelize;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error();
  err.status = 404;
  err.message = 'Sorry! Page Not Found';
  message = "Sorry! We couldn't find the page you were looking for!"
  console.log(err.message);
  res.render('page-not-found', {err, title: 'Page Not Found'});
});

// global error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if(err.status = 404) {
    console.log('Global error handler', err)
    message = "Sorry! We couldn't find the page you were looking for!"
    res.render('page-not-found', { err, message, title: 'Page not Found' });
  } else {
    err.message = err.message || `Oops! it look something went wrong on the server.`;
    res.status(err.status || 500)
  }


  // render the error page
  // res.status(err.status || 500);
  // res.render('error', { err });
});

// test database connection and sync
( async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await sequelize.sync();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();


module.exports = app;
