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
        find({}, null, {sort: {mealName: 1}}).
        populate('recipeRef').
        exec(function(err, data){
            if (err) return console.log(err);
            callback(data);
            console.log(data);
        });
}

function allRecipes(callback) {
    myRecipesSchema.
        find({}, null, {sort: {recipeName: 1}}).
        exec(function(err, data){
            if (err) return console.log(err);
            callback(data);
        });
}

function oneRecipe(search, parameter, callback) {
    if (parameter == '_id') {
        myRecipesSchema.findById(search, function (err, data){
            if (err) return console.error(err);
            callback(data);
        });
    }
}
//add recipe to mymeals database
function addMeal(recipeObject) {
    const id = mongoose.Types.ObjectId();
    const newMeal = new myMealsSchema({
        _id: id,
        mealName: recipeObject.recipeName,
        recipeRef: recipeObject._id
        });
    newMeal.save(function (err){
    if (err) return console.error(err);
    else{
        console.log('Meal Added');
    }
    });
}

//update meal, for cast to magic mirror module
function updateMeal(mealId, update, callback) {
    myMealsSchema.updateOne(mealId, update, function(err, result){
        if(err){
            console.log(err);
            callback(false)
        }
        else{
            console.log(result);
            callback(true) 
        }
    });
}

//remove meal from mymeals db
function removeMeal(mealId){
    console.log(mealId);
    myMealsSchema.deleteOne(mealId, function(err){
        if(err){
            console.log(err);
        }
        else{
            console.log('meal deleted');
        }
    });
}

//add new recipe to myrecipe db
function addRecipe(data) {
    console.log(data);
    const id = mongoose.Types.ObjectId();
    var allIngredients = {};
    for (var n in data.ingredient) {
       if(data.ingredient[n] != 'Ingredient'){
        allIngredients[data.ingredient[n]] = data.quantity[n];
       } 
    }
    const newRecipe = new myRecipesSchema({
        _id: id,
        recipeName: data.recipeName,
        description: data.description,
        preperationTime: data.preperationTime,
        cookingTime: data.cookingTime,
        persons: data.persons,
        instructions: data.instructions,
        ingredients: allIngredients,
        source: data.source
    });
    newRecipe.save(function (err){
        if (err) return console.error(err);
    });
}

//Database request to check if recipe is in meals database.
function existsInMeals(recipeId) {
    return myMealsSchema.exists({recipeRef : recipeId});
}

//Adds response from existInMeals and adds it to the recipe data.
function responseExistsInMeals(response, recipes, i){
    return new Promise((resolve, reject) => {
        console.log('processing response');
        resolve(recipes[i] = {"active" : response})
    })
}

//Check if a recipe is already in meals database.
function recipeInMeals(recipes, callback){ 
    for(let i =0; i<recipes.length; i++){
        existsInMeals(recipes[i]._id).then(response => {
            console.log('response recieved:' +  response);
            return responseExistsInMeals(response, recipes, i);
        }).then(processedResponse => {
            console.log(processedResponse)
        })
    }
    console.log(recipes);
    callback(recipes);    
}

//export of re-usable functions for use in routes.
exports.allMeals = allMeals;
exports.allRecipes = allRecipes;
exports.oneRecipe = oneRecipe;
exports.addMeal = addMeal;
exports.updateMeal = updateMeal;
exports.removeMeal = removeMeal;
exports.addRecipe = addRecipe;
exports.recipeInMeals = recipeInMeals;