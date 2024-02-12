function setFormMessage(formElement, type, message) {
    const messageElement = formElement.querySelector(".form__message");

    messageElement.textContent = message;
    messageElement.classList.remove("form__message--success", "form__message--error");
    messageElement.classList.add(`form__message--${type}`);
}

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#Login");
/*
    loginForm.addEventListener("submit", e => {
        e.preventDefault();
    
        // Info Search, AJAX/Fetch (will look into what those two terms mean)
    
        setFormMessage(loginForm, "error", "Invalid username/password");
    });
*/
    loginForm.getElementById("sign").addEventListener("click", e => {
        e.preventDefault();

        var Username = document.getElementById("user").value;
        const messageElement = document.querySelector(".form__message");
        // Check if Username has at least 4 letters and exactly 1 underscore
        if (username.length >= 4 && username.split("_").length === 2) {
            // Username meets the criteria
            setFormMessage(messageElement, "success", "Username is valid.");
            // You can proceed with further actions here
        } else {
            // Username does not meet the criteria
            setFormMessage(messageElement, "error", "Invalid username. Please make sure it has at least 4 letters and exactly 1 underscore.");
            // Add counter (WIP)
        }
    });

    document.querySelectorAll(".form__input").forEach(inputElement => {
        inputElement.addEventListener("blur", e => {
            if (e.target.id === "signup" && e.target.value.length > 0 && e.target.value.length < 10) {
                setInputError(inputElement, "Username must be at least 10 characters in length");
            }
        });

        inputElement.addEventListener("input", e => {
            clearInputError(inputElement);
        });
    });

});

