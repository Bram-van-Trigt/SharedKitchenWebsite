const { json } = require('express');
const express = require('express');
const router = express.Router();
const fs = require('fs');
const { stringify } = require('querystring');
const db = require('../database');
const myMealsSchema = require('../schemas/myMealsSchema');
const myRecipesSchema = require('../schemas/myRecipesSchema');

//functions for database

// render routes
router.get('/', function( req, res, next ) {
    var myMeals = JSON.parse(fs.readFileSync('tempJson/myMeals.json', 'utf-8'));
    res.render('myMeals', {title:'My meals', header:'AVAILABLE MEALS:', tableInput: myMeals});
});

router.get('/API', function( req, res, next ) {
    db.allMeals(renderAPI);
    function renderAPI(data) {
        res.render('API', { text: data });
    }
    // res.render('API', { text: myMeals });
    //console.log('routes log ' + myMeals);
});

module.exports = router;