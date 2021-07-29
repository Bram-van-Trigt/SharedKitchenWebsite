const { json } = require('express');
const express = require('express');
const router = express.Router();
const fs = require('fs');

// render routes
router.get('/', function( req, res, next ) {
    var myMeals = JSON.parse(fs.readFileSync('tempJson/myMeals.json', 'utf-8'));
    console.log(myMeals);
    res.render('myMeals', {title:'My meals', header:'AVAILABLE MEALS:', tableInput: myMeals.meals});
});

router.get('/API', function( req, res, next ) {
    var myMeals = fs.readFileSync('tempJson/myMeals.json', 'utf-8');
    res.render('API', { text: myMeals });
});

module.exports = router;