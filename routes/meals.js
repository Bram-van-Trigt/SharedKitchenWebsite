const { json } = require('express');
const express = require('express');
const router = express.Router();
const fs = require('fs');

var meals = fs.readFile('tempJson/myMeals.json', 'utf-8', (err, data) =>{
    if (err) {
        console.error(err);
        return
    }
    else console.log(data);
});

router.get('/API', function( req, res, next ) {
    res.render('API', { title: 'Meals API', header: 'Meals API:', text: meals });
});

module.exports = router;