//load express functions
var express = require('express');
var path = require('path');
var port = 3000;
session = require('express-session');


// require route files
var mealsRouter = require('./routes/meals');

var app = express();


// view engine setup
// app.engine('handlebars', exphbs());                               outcomment to check what solved error
app.set('view engine', 'pug');
// app.use(express.static(path.join(__dirname , 'public')));         outcomment to check what solved error
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

module.exports = app;