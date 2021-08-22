const express = require('express');
const router = express.Router();
const db = require('../database');

// render routes
router.get('/', function( req, res, next ) {
    db.allRecipes(renderRecipes);
    function renderRecipes(data){
        res.render('myRecipes', {title:'My recipes', header:'My recipes:', tableInput: data});
    }
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
    var form = req.body
    console.log(form)
    // var recipeName = req.body.recipeName;
    // var description = req.body.description;
    // console.log('Recipe: ' + recipeName + 'Description:' + description);
});

router.get('/confirmRecipe', function( req, res, next ){

});

module.exports = router;