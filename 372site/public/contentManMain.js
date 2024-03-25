document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('/movies');
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            const movies = await response.json();
            displayMovies(movies);
        } else {
            const html = await response.text();
            const movieListDiv = document.getElementById("movieList");
            movieListDiv.innerHTML = ''; // Clear existing content
            movieListDiv.innerHTML = html; // Display fetched HTML
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

    const deleteButton = document.getElementById("delete");
    deleteButton.addEventListener("click", () => {
        window.location.href = '/deleteMovies';
        console.log("Successful Delete detection");
    });
});

function displayMovies(movies) {
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
}
