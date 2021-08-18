const mongoose = require('mongoose');

const myMealsSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    mealName: {type: String, required: true},
    recipeRef: {type: mongoose.Schema.Types.ObjectId, ref: 'myRecipes', required: true}
});

module.exports = mongoose.model('myMeals', myMealsSchema);