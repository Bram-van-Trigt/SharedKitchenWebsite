const mongoose = require('mongoose');

const myRecipesSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    recipeName: {type: String, required: true},
    description: String,
    preperationTime: Number,
    cookingTime: Number,
    persons: Number,
    ingredients: {type: Object, required: true},
    instructions: {type: Array, required: true},
    source: String,
});

module.exports = mongoose.model('myRecipes', myRecipesSchema);