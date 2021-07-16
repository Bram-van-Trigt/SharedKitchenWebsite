const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {

    //url path configuration
    let  path = './views/';
    switch(req.url){
        case '/':
            path += 'index.html';
            break;
        case '/mealsAPI':
            //return json data from myRecipes.json
            path = './tempJson/myRecipes.json';
            break;
        default:
            path += '404.html';
            break
    }

    //send back requested html file.
    fs.readFile(path, (err, data) => {
        if (err) {
            console.log(err);
            res.end();
        } else {
            res.write(data);
            res.end();
        }
    });
});

app.listen(port, 'localhost', function(error) {
    if (error){
        console.log('Something went wrong', error);
    } else {
        console.log('Server is listening on port ' + port);
    }
});