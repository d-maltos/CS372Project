document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('/movies');
        const html = await response.text();
        
        // Create a temporary element to parse the received HTML
        const tempElement = document.createElement('div');
        tempElement.innerHTML = html;

        // Extract only the content within the movieList element
        const movieListContent = tempElement.querySelector('#movieList').innerHTML;

        // Replace the content of movieListDiv with the extracted content
        const movieListDiv = document.getElementById("movieList");
        movieListDiv.innerHTML = movieListContent;
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