//load modules
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cors = require('cors');
var port = 3000;
session = require('express-session');

// mongo database
/*todo: database.js is executed this way. 
It seems that this is only necessary in the route files that use the monge db data.*/
const database = require('./databaseQueries')

// Routing files
var homepage = require('./routes/homepage')
var mealsRouter = require('./routes/meals');
var recipesRouter = require('./routes/recipes');
var databaseRouter = require('./routes/database');
//const { use } = require('./routes/recipes');

var app = express();
app.use(cors());
app.use(express.urlencoded());
// app.use(express.json());

// view engine setup
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname , 'public')));
app.set('views',path.join(__dirname , 'views'));


// execute routes from adress
app.use('/', homepage);
app.use('/meals', mealsRouter);
app.use('/recipes', recipesRouter);
app.use('/database', databaseRouter);

// Server and Port
app.listen(port, 'localhost', function(error) {
    if (error){
        console.log('Something went wrong', error);
    } else {
        console.log('Server is listening on port ' + port);
    }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;