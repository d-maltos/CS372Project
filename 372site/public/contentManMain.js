document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('/movies');
        const movies = await response.json();
        const movieListDiv = document.getElementById("movieList");

        if (movies.length === 0) {
            movieListDiv.innerHTML = "<p>No movies found.</p>";
        } else {
            const movieListHTML = movies.map(movie => {
                return `
                <div>
                    <h3>${movie.title}</h3>
                    <p><a href="${movie.link}" target="_blank">Watch Now</a></p>
                </div>
                `;
            }).join("");

            movieListDiv.innerHTML = movieListHTML;
        }
    } catch (error) {
        console.error('Error fetching movies:', error);
        alert("Error fetching movies. Please try again.");
    }
    const addButton = document.getElementById("add");
    addButton.addEventListener("click", () => {
        window.location.href = '/addMovies';
        console.log("Successful Add detection");
    });
});
