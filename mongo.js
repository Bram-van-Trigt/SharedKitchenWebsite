const mongoose = require('mongoose');
const myRecipesSchema = require('./schemas/myRecipesSchema');
//const myMealsSchema = require('./schemas/myMealsSchema');

mongoose.connect('mongodb://localhost:27017/SharedKitchenDb', {
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

const sharedKitchenDb = mongoose.connection;
sharedKitchenDb.on('error', console.error.bind(console, 'connection error:'))
sharedKitchenDb.once('open', function(){
    myRecipesSchema.find({recipeName: /^Butter/}, function(err, result){
        if (err) return console.error(err);
        console.log(result);
    });
});
