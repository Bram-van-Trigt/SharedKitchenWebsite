//load express functions
var express = require('express');
var exphbs = require('express-handlebars');
var path = require('path');
var port = 3000;
session = require('express-session');


// require routes
var mealsRouter = require('./routes/meals');

var app = express();


// view engine setup
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname , 'public')));
app.set('views',path.join(__dirname , 'views'));



//app.use to execute the routes
app.use('/meals', mealsRouter);

// Simple test case for engine
app.get('/', (req, res) =>{
    res.render('index');
});

app.listen(port, 'localhost', function(error) {
    if (error){
        console.log('Something went wrong', error);
    } else {
        console.log('Server is listening on port ' + port);
    }
});

module.exports = app;