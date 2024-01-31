// Global app controller 

import Recipe from "./modules/Recipe.js";
import Search from "./modules/Search.js";
import { clearLoader, elements, renderLoader } from "./views/base.js"
import * as searchView from "./views/searchView.js";
import * as recipeView from "./views/recipeViews.js";
import * as ListView from "./views/listView.js";
import * as likeView from "./views/likeView.js";
import List from "./modules/List.js";
import Likes from "./modules/Like.js";
/*
- Search object
- Current recipe object
- Shopping List object
- Liked recipes
*/
const state = {};
window.state = state;

/* Search */
const controlSearch = async (e) => {
    e.preventDefault()
    
 //Get Query

    const query = searchView.getInput();

    if (query){
        // 2. New Search object  generate
        state.search = new Search (query)

        // 3. Prepare UI for result 
        searchView.clearInput()
        searchView.clearResults();
        renderLoader(elements.searchResList)

        try {
            // 4 Search API
            await state.search.getResults()
        } catch (error) {
            alert("Seach  Error")
        }
        
        // 5.render result om UI
        searchView.renderResult(state.search.result)
        clearLoader()

        console.log(state)
    }
   
}

elements.searchForm.addEventListener("submit", controlSearch);

elements.searchResPage.addEventListener("click", e => {
    const btn = (e.target.closest(".btn-inline"))

    if (btn){
        const goto = +btn.dataset.goto;
        searchView.clearResults()
        searchView.renderResult(state.search.result, goto)
    }
})

const controlRecipe = async () => {
    //get id
    const id = window.location.hash.replace("#","")

    if(id){

        //Prepare UI and add loader
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        if(state.search)searchView.highlitedSelected(id);

        //Create new Object
        state.recipe = new Recipe(id)

        //Get recipe
  
        await state.recipe.getRecipe();
        state.recipe.calcTime();
        state.recipe.calcServing();
        state.recipe.parseIngredients();


        //Clear loader and Recipe
        clearLoader();
        recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));


    }
    
   
}

//like controller

const controllerLike = () => {
    if(state.like) state.likes = new Likes()

    const currentID = state.recipe.id;
    if(!state.likes.isLiked(currentID)){
        //add like
        const newLike = state.likes.addLike(currentID, state.recipe.title, state.recipe.img, state.recipe.author);
   
        // Toggle the button
        likeView.toggleLikeBtn(true)

        // Add like to UI list
        likeView.renderLike(newLike);

    }else{
        //delete like
        state.likes.deleteLike(currentID);


        //toggle like Button
        likeView.toggleLikeBtn(false);

        //Delete UI
        likeView.deleteLike(currentID);
    }

    likeView.toggleLikeMenu(state.likes.getNumLikes());
}


/* window.addEventListener("hashchange", controlRecipe)
window.addEventListener("Load", controlRecipe) */
["hashchange","load"].forEach(event => window.addEventListener(event, controlRecipe));

const controllerList = () => {
    if(!state.list) {
        state.list = new List(); 
    
            //Add items
        state.recipe.ingredients.forEach(el => {
            const item = state.list.addItems(el.count, el.unit, el.ingredient);
            ListView.renderItem(item)
        })
    }
}

// Handling recipe button click
elements.recipe.addEventListener("click", e =>{
    if(e.target .matches(".btn-dec, .btn-dec *")){
        // dec
        if(state.recipe.servings > 1){
            state.recipe.updateServings("dec");
            recipeView.updateServingsIngredients(state.recipe);
        }
        
    }if(e.target.matches(".btn-inc, .btn-inc *")){
        // inc
        state.recipe.updateServings("inc");
        recipeView.updateServingsIngredients(state.recipe)
    }else if(e.target.matches(".recipe__btn__add, .recipe__btn__add *")){
        //list
        controllerList()
    }else if(e.target.matches(".recipe__love, .recipe__love *")){
        //like button
        controllerLike();

    }
})

//Handle dele and update list item events

elements.shopping.addEventListener("click", (e) => {
    const id =  e.target.closest(".shopping__item").dataset.itemid;

    if(e.target.matches(".shopping__delete, .shopping__delete *")){
        //delete
        state.list.deleteItem(id)
        //delete ui
        ListView.deleteItem(id);
    }else if (e.target.matches(".shopping__count-value")){
        //update
        const val = parseInt(e.target.value,10)
        state.list.updateCount(id, val);

    }
})

window.addEventListener("load", () =>{
    state.likes = new Likes();

    //restore liks 
    state.likes.readStorage()

    //toggle likes menu

    likeView.toggleLikeMenu(state.likes.getNumLikes());

    // Render
    state.likes.likes.forEach(like => likeView.renderLike(like))
 })