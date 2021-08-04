const mongoose = require('mongoose');

const myMealsSchema = mongoose.Schema({
recipeReference = {type: ObjectId, required: true},
mealName = {type: String, required: true}
});

module.exports = mongoose.model('myMeals', myMealsSchema);