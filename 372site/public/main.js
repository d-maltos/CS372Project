function setFormMessage(formElement, type, message) {
    const messageElement = formElement.querySelector(".form__message");

    messageElement.textContent = message;
    messageElement.classList.remove("form__message--success", "form__message--error", "form--hidden");
    messageElement.classList.add(`form__message--${type}`);
}

// Function to validate password requirements
function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#Login");
    const all_buttons = document.querySelectorAll('.btn');
    let clickedButton = ""; 
    let LG = false;
    let SU = false;
    
    all_buttons.forEach(bt => {
        bt.addEventListener('mousedown', (a) => {
            clickedButton = a.target.innerHTML;
            console.log(clickedButton);
            if(clickedButton == "Login") {
                console.log("Successful login detection");
                LG = true;
                SU = false;
            } else {
                console.log("Successful Signup detection");
                LG = false;
                SU = true;
            }
        });
    });

    loginForm.addEventListener("submit", e => {
        e.preventDefault();

        var username = document.getElementById("user").value;
        var password = document.getElementById("pass").value;
        var xhr = new XMLHttpRequest();
        // Check if Username has at least 4 letters and exactly 1 underscore
        if (username.length >= 4 && username.split("_").length === 2) {
            // Username meets the criteria
            setFormMessage(loginForm, "success", "");
            // Check if Password meets requirements
            if(!validatePassword(password)) {
                setFormMessage(loginForm, "error", "Password must be at least 8 characters long, contain at least 1 capital letter, at least 1 lowercase letter, at least 1 number, and at least 1 special symbol.");
            } else {
                // Password meets requirements
                setFormMessage(loginForm, "success", "");
                if (LG) {
                    const userInfo = {
                        username:username,
                        password:password
                    }
                    $.post('/login', userInfo, (response) => {
                        if (response.success) {
                            // Successful login, redirect to another page
                            window.location.href = '/success';
                        } else {
                            if (response.message === 'Username not found') {
                                // Username not found
                                setFormMessage(loginForm, "error", "Username not found");
                            } else if (response.message.startsWith('Incorrect password')) {
                                // Incorrect password, display remaining attempts
                                const remainingAttempts = parseInt(response.message.split(':')[1]);
                                setFormMessage(loginForm, "error", `Incorrect password. Remaining attempts: ${5 - remainingAttempts}`);
                            }
                        }
                    });
                }

            }
            // setFormMessage(loginForm, "success", "Username is valid.");
            // You can proceed with further actions here
        } else {
            // Username does not meet the criteria
            setFormMessage(loginForm, "error", "Invalid username. Please make sure it has at least 4 letters and exactly 1 underscore.");
            // Add counter (WIP)
        }
        console.log(all_buttons);
    });
});
