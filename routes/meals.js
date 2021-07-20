const { json } = require('express');
const express = require('express');
const router = express.Router();
const fs = require('fs');

var myMeals = fs.readFileSync('tempJson/myMeals.json', 'utf-8');

console.log(myMeals);

router.get('/API', function( req, res, next ) {
    res.render('API', { title: 'Meals API', header: 'Meals API:', text: myMeals });
});

module.exports = router;