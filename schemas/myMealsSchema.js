const mongoose = require('mongoose');

const myMealsSchema = mongoose.Schema({
    mealName: {type: String, required: true},
    recipeRef: {type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true}
});

module.exports = mongoose.model('mymeals', myMealsSchema);