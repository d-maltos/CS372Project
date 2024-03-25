document.addEventListener("DOMContentLoaded", () => {
    const addMovieForm = document.querySelector("#addMovieForm");

    addMovieForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("title").value;
        const genre = document.getElementById("genre").value;
        const link = document.getElementById("link").value;

        const movieInfo = {
            title:title,
            genre:genre,
            link:link
        }

        $.post('/addMovie', movieInfo, (response) => {
            if (response.success) {
                alert("Movie added successfully!");
                // Successful addition, redirect to another page
                window.location.href = '/movies';
            } else {
                alert("Error adding movie. Please try again.");
            }
        });
    });
});
