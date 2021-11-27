const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { json } = require('express');
const db = require('../databaseQueries');

//Routes for database calls
router.get('/recipes', async function( req, res, next ) {
    const recipes = await db.testRecipes();
    const meals = await db.testMeals();   
    Promise.all([recipes,meals]).then(data => {
        res.send(data);
    });
});

module.exports = router;