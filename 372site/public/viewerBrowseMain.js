document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('/moviesC');
        const html = await response.text();
        
        // Create a temporary element to parse the received HTML
        const tempElement = document.createElement('div');
        tempElement.innerHTML = html;

        // Extract only the content within the movieList element
        const movieListContent = tempElement.querySelector('#movieList').innerHTML;

        // Replace the content of movieListDiv with the extracted content
        const movieListDiv = document.getElementById("movieList");
        movieListDiv.innerHTML = movieListContent;

        // Add event listeners to movie title links to navigate to movie details page
        const movieTitleLinks = document.querySelectorAll('#movieList [data-movie-title]');
        movieTitleLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent default link behavior
                const movieTitle = link.dataset.movieTitle;
                console.log("Movie title:", movieTitle);
                window.location.href = `/movies/${encodeURIComponent(movieTitle)}`;
            });
        });
    } catch (error) {
        console.error('Error fetching movies:', error);
        alert("Error fetching movies. Please try again.");
    }
});
