getRecipes();

function getRecipes(){
    $.ajax({
        type: 'GET',
        url: './database/recipes',
        datatype: 'json'
    })
    .done(function (data){
        drawProducts(data[0], data[1]);
        console.log("ajax call succesfull")
    })
}

//Draws the recipe cards
function drawProducts(returnRecipes, returnMeals) {
    console.log(returnMeals)
    for(let i = 0; i<returnRecipes.length; i++)
    {   //Create the recipeCard class for recipe.
        product = new RecipeCard(
        returnRecipes[i]._id, returnRecipes[i].recipeName, returnRecipes[i].description, returnRecipes[i].preperationTime, returnRecipes[i].cookingTime, returnRecipes[i].persons,
        );
        product.draw();
    }
}

//Class that is used to make the product boxes
var RecipeCard = class {
    constructor(_id, name, description, prepTime, cookTime, persons){
        this.draw = function () {
            //create card
            var columns = document.createElement("div");
            columns.setAttribute("class","col-sm-6 col-md-4 mt-4");
            var box = document.createElement("recipeCard");
            box.setAttribute("class", "card h-100");
            columns.appendChild(box);

            //Recipe name as header
            var header = document.createElement("h3");
            header.setAttribute("class", "card-header");
            var textNode = document.createTextNode(name);
            header.appendChild(textNode);
            box.appendChild(header);

            // card body for description and text
            var cardBody = document.createElement("div");
            cardBody.setAttribute("class", "card-body");
            box.appendChild(cardBody);

            //Recipe description in card title
            var cardTitle = document.createElement("h5");
            cardTitle.setAttribute("class", "card-title");
            var textNode = document.createTextNode(description);
            cardTitle.appendChild(textNode);
            cardBody.appendChild(cardTitle);

            //Lay-out text in columns and rows
            var cardText = document.createElement("div");
            cardText.setAttribute("class", "card-text");
            cardBody.appendChild(cardText);
            var cardTextRow = document.createElement("div");
            cardTextRow.setAttribute("class", "row");
            cardText.appendChild(cardTextRow);
            
            //Preperation Time
            var cardTextPreperation = document.createElement("div");
            cardTextPreperation.setAttribute("class", "col-sm-6");
            var textNode = document.createTextNode("Preperation: " + prepTime + "min");
            cardTextPreperation.appendChild(textNode);
            cardTextRow.appendChild(cardTextPreperation);

            //Cooking Time
            var cardTextCooking = document.createElement("div");
            cardTextCooking.setAttribute("class", "col-sm-6");
            var textNode = document.createTextNode("Cooking: " + cookTime + "min");
            cardTextCooking.appendChild(textNode);
            cardTextRow.appendChild(cardTextCooking);

            // New row in text lay-out
            cardText.appendChild(cardTextRow);

            //persons 
            var cardTextPersons = document.createElement("div");
            cardTextPersons.setAttribute("class", "col-sm-6");
            var textNode = document.createTextNode("Persons: " + persons);
            cardTextPersons.appendChild(textNode);
            cardTextRow.appendChild(cardTextPersons);

            //card-footer for buttons
            var cardFooter = document.createElement("div");
            cardFooter.setAttribute("class", "card-footer");
            box.appendChild(cardFooter);

            //will show the buy button of the product
            var button = document.createElement('button');
            button.setAttribute("id", _id);
            button.setAttribute("class", "btn btn-light btn-sm")
            button.addEventListener("click", function(e){
                addToMeals(e.target.id);
            });
            button.appendChild(document.createTextNode("Add to meals"));
            cardFooter.appendChild(button);
            $(".row")[0].appendChild(columns);
        };
    };
};

//Adds recipe to meals database, function related to button.
function addToMeals(id) {
    $.ajax({
        type: 'post',
        url: './recipes',
        dataType: 'json',
        data: {"recipe_id": id}
    })
        .done(function (data) {
            console.log(data)
        })
        .fail(function (jqXHR, textStatus, err) {
            console.log('AJAX error response:', textStatus);
        });
}