const express = require('express');
const router = express.Router();
const db = require('../database');
const { json } = require('express');

//functions for database

// render routes
router.get('/', function( req, res, next ) {
    db.allMeals(renderMyMeals);
    function renderMyMeals(myMeals){
    res.render('myMeals', {title:'My meals', header:'Meals', tableInput: myMeals});
    }
});

router.post('/', function( req, res, next ){
    //Check button function and start button action
    var action = req.body;
    console.log(action);
    if ('cast' in action){
        const updateId = {'id': action.cast};
        db.updateMeal(updateId, {'cast': true});
    }
    if ('remove' in action){
        const removeId = { '_id' : action.remove};
        db.removeMeal(removeId);
    }
});

router.get('/API', function( req, res, next ) {
    db.allMeals(renderAPI);
    function renderAPI(data){
        var myMeals = JSON.stringify(data)
        res.render('API', { text: myMeals });
    }
});

router.get('/casting', function ( req, res, next){
    res.render('casting')
});

module.exports = router;