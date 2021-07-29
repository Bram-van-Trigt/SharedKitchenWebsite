//load express functions
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cors = require('cors');
var port = 3000;
session = require('express-session');


// require route files
var mealsRouter = require('./routes/meals');

var app = express();
app.use(cors())

// view engine setup
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname , 'public')));
app.set('views',path.join(__dirname , 'views'));


// execute routes from adress
app.use('/meals', mealsRouter);

// Simple test case for engine
// app.get('/', (req, res) =>{
//     res.render('index');
// });

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