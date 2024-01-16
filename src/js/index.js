// Global app controller 

import Search from "./modules/Search.js";
import { clearLoader, elements, renderLoader } from "./views/base.js"
import * as searchView from "./views/searchView.js";
/*
- Search object
- Current recipe object
- Shopping List object
- Liked recipes
*/
const state = {};


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