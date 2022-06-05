const searchForm = document.getElementById("search-bar")
const userInput = document.getElementById("search-input")
const mainContainer = document.getElementById("main-container")
const watchlistContainers = document.getElementsByClassName("watchlist")


// Save watchlist to local storage
// localStorage.clear() // clear local storage
let watchlistLocalStorage = localStorage.getItem("myMovieWatchlist") ? JSON.parse(localStorage.getItem("myMovieWatchlist")) : []
const apiKey = "72aa78df"
const starIcon = "imgs/icons8-star-48.png"
const plusIcon = "imgs/icons8-plus-+-30.png"
const minusIcon = "imgs/icons8-minus-30.png"
const missingImg = "imgs/icons8-unavailable-100.png"


// Search bar interactions
searchForm.addEventListener("submit", function(event) {
    event.preventDefault()
    search()
})

searchForm.addEventListener("keypress", function(event) {
    if (event.key==="Enter") {
        event.preventDefault()
        search()
    }
})

async function search() {
    let movieHtml = ""
    let searchUrl = `https://www.omdbapi.com/?apikey=${apiKey}&s=${userInput.value}`
    
    let res = await fetch(searchUrl)

    // display mesage while fetching from API
    mainContainer.innerHTML = `
        <div id="initial-state">
            <img src="imgs/film.png">
            <h2>Searching...</h2>
        </div>
        `
    let data = await res.json()
    
    if(data.Response === "True") {
        const movieIds = data.Search.map(movie => movie.imdbID)
        
        // Loop through each movie Id
        let movieSearchHtmlArray = []
        for(id of movieIds) {
            let url = `https://www.omdbapi.com/?apikey=${apiKey}&i=${id}`
            res = await fetch(url)
            data = await res.json()
            let movie = {
                posterUrl: data.Poster === "N/A" ? missingImg : data.Poster,
                title: data.Title,
                rating: data.Ratings.length > 0 ? data.Ratings[0].Value.slice(0, 3) : "",
                duration: data.Runtime,
                genre: data.Genre,
                description: data.Plot       
                }
            movieHtml += getMovieHtml(movie)
            movieSearchHtmlArray.push(getMovieHtml(movie, "remove") )     
        }
        
        mainContainer.innerHTML = movieHtml
        
        // Add event listener to each watchlist btn
        Object.values(watchlistContainers).forEach( (item, index) => {
            item.addEventListener("click", function() {
                watchlistLocalStorage.push(movieSearchHtmlArray[index])
                localStorage.setItem("myMovieWatchlist", JSON.stringify(watchlistLocalStorage))
                // console.log("Added to watchlist!")
            })
        })
    } else {
        mainContainer.innerHTML = `<p class="bad-search">Unable to find what you’re looking for. Please try another search.</p>`
    }
}

function getMovieHtml(data, btnType = "add") {
    const {posterUrl, title, rating, duration, genre, description} = data
    
    const addBtnHtml = `<img class="icon" src="${plusIcon}">
                            <p class="p2">Watchlist</p>`
    const removeBtnHtml = `<img class="icon" src="${minusIcon}">
                            <p class="p2">Remove</p>`
    
    return `<div class='card'>
                <img id="poster" src="${posterUrl}">
                <div class="card-text">
                    
                    <div class="card-header">
                        <p class="movie-title">${title}</p>
                        <div class="icon-text">
                            <img class="icon" src="${starIcon}">
                            <p class="p2">${rating}</p>
                        </div>
                    </div>
                    
                    <div class="card-details">
                        <p class="movie-dur p2">${duration}</p>
                        <p class="movie-genre p2">${genre}</p>
                        <div class="icon-text watchlist">
                            ${btnType === "add" ? addBtnHtml : btnType === "remove" ? removeBtnHtml : ""}
                        </div>
                    </div>
                    
                   
                    <p class="movie-desc">${description}</p>
                     
                </div>
            </div> <hr>`
}