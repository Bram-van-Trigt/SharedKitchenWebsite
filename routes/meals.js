const { json } = require('express');
const express = require('express');
const router = express.Router();
const fs = require('fs');
const database = require('../database');
const myMealsSchema = require('../schemas/myMealsSchema');

// render routes
router.get('/', function( req, res, next ) {
    var myMeals = JSON.parse(fs.readFileSync('tempJson/myMeals.json', 'utf-8'));
    res.render('myMeals', {title:'My meals', header:'AVAILABLE MEALS:', tableInput: myMeals});
});

router.get('/API', function( req, res, next ) {
    var myMeals = database.getMeals();
    res.render('API', { text: myMeals });
    console.log('routes log ' + myMeals);
});

router.get('/test', function( req, res, next ) {
    var myMeals = myMealsSchema.find(function (err, meals){
        if (err) return console.error(err);
        console.log(meals)
        return meals
    });
    res.render('API', { text: myMeals });
    console.log('routes log ' + myMeals);
});

module.exports = router;

