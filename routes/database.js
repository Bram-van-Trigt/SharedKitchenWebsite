const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { json } = require('express');
const db = require('../databaseQueries');

//Routes for database calls
router.get('/recipes', function( req, res, next ) {
    db.allRecipes(sendRecipes);
    function sendRecipes(data){
        res.send(data);
    }
});

module.exports = router;