const { json } = require('express');
const express = require('express');
const router = express.Router();
const fs = require('fs');

// read json file
var myMeals = fs.readFileSync('tempJson/myMeals.json', 'utf-8');

// console.log(myMeals);

// render routes
router.get('/', function( req, res, next ) {
    var meal_list = JSON.parse(myMeals);
    res.render('myMeals', { title: 'My meals', header: 'Available meals:', text: meal_list.recipe });
});

router.get('/API', function( req, res, next ) {
    res.render('API', { title: 'Meals API', header: 'Meals API:', text: myMeals });
});

module.exports = router;