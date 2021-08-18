const express = require('express');
const router = express.Router();
const db = require('../database');

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
        res.render('API', { text: data });
    }
});

module.exports = router;