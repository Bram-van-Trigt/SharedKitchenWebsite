const http = require('http');
const fs = require('fs');
const port = 3000;

const server = http.createServer((req, res) => {
    console.log(req.url, req.method);

    // set header content type
    res.setHeader('Content-Type', 'text/html');

    //url path configuration

    //send back requested html file
    

    // read json file
    fs.readFile('./myRecipes.json', (err, data) =>{
        if (err) {
            console.log(err);
            res.end('Something is going wrong')
        } else {
            console.log(JSON.parse(data));
            myRecipes = JSON.parse(data);
            res.write(data)
            res.write('<header>Available Meals:<header>');

            res.write('<p>' + myRecipes.recipe + '<p>');

            res.write(myRecipes.description);
            res.end();
        }
    })
});

server.listen(port, 'localhost', function(error) {
    if (error){
        console.log('Something went wrong', error);
    } else {
        console.log('Server is listening on port ' + port);
    }
});