const mongoose = require('mongoose');
const myRecipesSchema = require('./schemas/myRecipesSchema');
const myMealsSchema = require('./schemas/myMealsSchema');

mongoose.connect('mongodb://localhost:27017/SharedKitchenDb', {
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

/*todo: can we create a module in this file with the queries for routes to use?
Then we don't require have te same code multiple times.*/



const getMeals = function() {
    myMealsSchema.find(function (err, meals){
        if (err) return console.error(err);
        console.log(meals)
        return meals
    });
}

const test = function(){
    meals = 'test if we can give data back'
    return meals;
}

exports.getMeals = getMeals;
exports.test = test;