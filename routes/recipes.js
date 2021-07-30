const { json } = require('express');
const express = require('express');
const router = express.Router();
const fs = require('fs');

// render routes
router.get('/', function( req, res, next ) {
    var myRecipes = JSON.parse(fs.readFileSync('tempJson/database.json', 'utf-8'));
    console.log(myRecipes);
    res.render('myRecipes', {title:'My recipes', header:'My recipes:', tableInput: myRecipes});
});

router.get('/API', function( req, res, next ) {
    var myRecipes = fs.readFileSync('tempJson/database.json', 'utf-8');
    res.render('API', { text: myRecipes });
});

module.exports = router;