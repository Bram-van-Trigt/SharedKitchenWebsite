const express = require('express');
const router = express.Router();
const db = require('../database');
const { json } = require('express');

//functions for database

// render routes
router.get('/', function( req, res, next ) {
    db.allMeals(renderMyMeals);
    function renderMyMeals(myMeals){
    res.render('myMeals', {title:'My meals', header:'AVAILABLE MEALS:', tableInput: myMeals});
    }
});

router.get('/API', function( req, res, next ) {
    db.allMeals(renderAPI);
    function renderAPI(data) {
        var myMeals = JSON.stringify(data)
        res.render('API', { text: myMeals });
    }
});

module.exports = router;