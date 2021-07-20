const express = require('express');
const router = express.Router();


router.get('/API', function( req, res, next ) {
    res.render('index', { title: 'Hey', message: 'hello there!'});
});

module.exports = router;