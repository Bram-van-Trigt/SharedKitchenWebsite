const express = require('express');
const router = express.Router();
const db = require('../database');


// render routes
router.get('/', function( req, res, next ) {
    db.allRecipes(renderRecipes)
    function renderRecipes(data){
        res.render('myRecipes', {title:'My recipes', header:'My recipes:', tableInput: data});
    }
});

router.get('/API', function( req, res, next ) {
    db.allRecipes(renderRecipes)
    function renderRecipes(data){
        res.render('API', { text: data });
    }
});

module.exports = router;