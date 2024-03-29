document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('/moviesV');
        const html = await response.text();
        
        // Create a temporary element to parse the received HTML
        const tempElement = document.createElement('div');
        tempElement.innerHTML = html;

        // Extract movie titles and links from the content
        const movieElements = tempElement.querySelectorAll('#movieList div');
        let movies = Array.from(movieElements).map(movieElement => {
            const title = movieElement.querySelector('h3').textContent;
            const link = movieElement.querySelector('a').getAttribute('href');
            return { title, link };
        });

        // Function to filter movies based on search query
        const filterMovies = (query) => {
            return movies.filter(movie =>
                movie.title.toLowerCase().includes(query.toLowerCase())
            );
        };

        // Function to update movie list based on search query
        const updateMovieList = (filteredMovies) => {
            // Sort filtered movies alphabetically by title
            filteredMovies.sort((a, b) => a.title.localeCompare(b.title));

            let movieListHTML = '';
            filteredMovies.forEach(movie => {
                movieListHTML += `
                    <div>
                        <h3>${movie.title}</h3>
                        <p><a href="${movie.link}" target="_blank">Watch Now</a></p>
                    </div>
                `;
            });
            const movieListDiv = document.getElementById("movieList");
            movieListDiv.innerHTML = movieListHTML;
        };

        // Initial rendering of movie list
        updateMovieList(movies);

        // Event listener for search input
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (event) => {
            const searchQuery = event.target.value;
            const filteredMovies = filterMovies(searchQuery);
            updateMovieList(filteredMovies);
        });
    } catch (error) {
        console.error('Error fetching movies:', error);
        alert("Error fetching movies. Please try again.");
    }
});
