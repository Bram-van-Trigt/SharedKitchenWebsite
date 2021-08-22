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

//Re-usable database queries.
function allMeals(callback) {
    myMealsSchema.
        find({}).
        populate('recipeRef').
        exec(function(err, data){
            if (err) return console.log(err);
            callback(data);
        });
}

function allRecipes(callback) {
    myRecipesSchema.
        find({}).
        exec(function(err, data){
            if (err) return console.log(err);
            callback(data);
        });
}

function oneRecipe(search, parameter, callback) {
    if (parameter == '_id') {
        myRecipesSchema.findById(search, function (err, data){
            if (err) return console.error(err);
            // console.log(data);
            // console.log(data.recipeName);
            return data;
            // callback(data);
        });
    }
}

function addMeal(recipeObject) {
    const newMeal = new myMealsSchema({
        mealName: result.recipeName,
        recipeRef: result._id
        });
    newMeal.save(function (err){
    if (err) return console.error(err);
    });
}

function addRecipe(Data) {
    console.log(Data);
    const newRecipe = new myRecipesSchema({
        recipeName: Data.recipeName,
        description: data.description,
        preperationTime: data.preperationTime,
        cookingTime: data.cookingTime,
        persons: data.persons,
        instructions: data.instructions,
        ingredients: data.ingredients,
        source: data.source
    });
    newRecipe.save(function (err){
        if (err) return console.error(err);
        else confirmation(data);
    });
}

//export of re-usable functions for use in routes.
exports.allMeals = allMeals;
exports.allRecipes = allRecipes;
exports.oneRecipe = oneRecipe;
exports.addMeal = addMeal;
exports.addRecipe = addRecipe;