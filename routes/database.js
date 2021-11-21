const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { json } = require('express');
const db = require('../databaseQueries');

//Routes for database calls
router.get('/recipes', function( req, res, next ) {
    db.allRecipes(CompareData);
    function CompareData(data){
        console.log("start:", data)
        db.recipeInMeals(data, sendRecipes);
    }
    function sendRecipes(data){
        console.log(data);
        res.send(data);
    }
});

module.exports = router;