const express = require('express');
const router = express.Router();
const db = require('../databaseQueries');

// render routes
router.get('/', function( req, res, next ) {
    db.allRecipes(renderRecipes);
    function renderRecipes(data){
        res.render('myRecipes', {title:'Recipes', header:'Recipes', tableInput: data});
    }
});

router.post('/', function(req, res, next){
    var formData = req.body
    db.oneRecipe(formData.recipe_id, '_id', db.addMeal)
});

router.get('/API', function( req, res, next ) {
    db.allRecipes(renderRecipes);
    function renderRecipes(data){
        res.render('API', { text: data });
    }
});

router.get('/newRecipe', function( req, res, next ) {
    res.render('newRecipe');
});

router.post('/newRecipe', function(req, res, next){
    var formData = req.body
    db.addRecipe(formData);
});

module.exports = router;