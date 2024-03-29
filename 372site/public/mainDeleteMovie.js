document.addEventListener("DOMContentLoaded", () => {
    const deleteMovieForm = document.querySelector("#deleteMovieForm");

    deleteMovieForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("title").value;

        console.log("button clicked, title: " + title);

        const movieInfo = {
            title: title
        };

        $.post('/deleteMovie', movieInfo, (response) => {
            if (response.success) {
                alert("Movie deleted successfully!");
                // Successful addition, redirect to another page
                window.location.href = '/moviesC';
            } else {
                alert("Error deleting movie. Please try again.");
            }
        }).fail(() => {
            alert("Error deleting movie. Please try again.");
        });
    });
});
