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
    var formData = req.body
    console.log(formData);
    db.addRecipe(formData);
    function confirmation(){
        res.render('confirmRecipe', {});
    }
});

router.get('/confirmRecipe', function( req, res, next ){

});

module.exports = router;