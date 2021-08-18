const mongoose = require('mongoose');
const { json } = require('express');

//Mongoose schema's.
const myRecipesSchema = require('./schemas/myRecipesSchema');
const myMealsSchema = require('./schemas/myMealsSchema');

//Connection to mongodb.
mongoose.connect('mongodb://localhost:27017/SharedKitchenDb', {
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

//Functions to retrieve info from databases.
function allMeals() {
    myMealsSchema.find(function (err, data){
        if (err) return console.error(err);
        console.log(data);
        idLoop(data);
    });
}

function oneRecipe(id, callback) {
    myRecipesSchema.findOne(function (err, data){
        if (err) return console.error(err);
        console.log(data);
        console.log(data.mealName);
        callback(data);
    });
}

function idLoop(data){
    console.log(data);
    for (let x in data) {
        meal = x
        console.log(meal._id)
    }
};




//loop through data from all meals and send to oneRecipe with callback.
//where do I list the item? Is this another callback? Or async call?

/*todo: can we create a module in this file with the queries for routes to use?
Then we don't require have te same code multiple times.*/

//export of functions for use in routes.
exports.allMeals = allMeals;
exports.oneRecipe = oneRecipe;
exports.idLoop = idLoop;
