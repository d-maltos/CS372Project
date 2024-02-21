const express = require("express");
const app = express();
const router = express.Router();
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");

app.use(express.static('public'));
app.use(bodyParser());

const jsonFilePath = 'users.json';


function getFailedAttempts(username, filePath, callback) {
    // Read the JSON file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            callback(null); // Call the callback with null indicating an error
            return;
        }

        try {
            // Parse the JSON data
            const jsonData = JSON.parse(data);
            
            // Search for the username in the JSON data
            const user = jsonData.user.find(user => user.username === username);

            if (user) {
                callback(user.failedAttempts); // Call the callback with the number of failed attempts
            } else {
                callback(null); // Call the callback with null indicating username not found
            }
        } catch (error) {
            console.error('Error parsing JSON data:', error);
            callback(null); // Call the callback with null indicating an error
        }
    });
}

function findUser(username, filePath, callback) {
    // Read the JSON file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            callback(false); // Call the callback with false indicating an error
            return;
        }

        try {
            // Parse the JSON data
            const jsonData = JSON.parse(data);
            
            // Search for the username in the JSON data
            const user = jsonData.user.find(user => user.username === username);

            if (user) {
                callback(true); // Call the callback with true indicating the user was found
            } else {
                callback(false); // Call the callback with false indicating user not found
            }
        } catch (error) {
            console.error('Error parsing JSON data:', error);
            callback(false); // Call the callback with false indicating an error
        }
    });
}


function checkPasswordAndUpdateAttempts(username, password, filePath, callback) {
    // Read the JSON file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            callback(false); // Call the callback with false indicating an error
            return;
        }

        try {
            // Parse the JSON data
            const jsonData = JSON.parse(data);
            
            // Search for the username in the JSON data
            const user = jsonData.user.find(user => user.username === username);

            if (user) {
                if (user.password === password) {
                    callback(true); // Call the callback with true indicating correct password
                } else {
                    // Update failed attempts
                    user.failedAttempts += 1;
                    // Rewrite the JSON file with updated data
                    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
                        if (err) {
                            console.error('Error writing JSON file:', err);
                        }
                    });
                    callback(false); // Call the callback with false indicating incorrect password
                }
            } else {
                callback(false); // Call the callback with false indicating username not found
            }
        } catch (error) {
            console.error('Error parsing JSON data:', error);
            callback(false); // Call the callback with false indicating an error
        }
    });
}


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "/public/login.html"));
});

app.get('/success', (req, res) => {
    res.json("Successful Login Credentials");
});

app.get('*', (req, res) => {
    res.json("page not found");
});

app.listen(8080, () => {
    console.log("App is starting at port ", 8080);
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if the username exists
    findUser(username, jsonFilePath, (userFound) => {
        if (userFound) {
            // If username is found, check password
            checkPasswordAndUpdateAttempts(username, password, jsonFilePath, (passwordCorrect) => {
                if (passwordCorrect) {
                    // Password correct
                    res.json({ success: true, message: 'Login successful' });
                } else {
                    // Incorrect password
                    findUser(username, jsonFilePath, (userFound) => {
                        if (userFound) {
                            // If the user exists, send the failed attempts
                            getFailedAttempts(username, jsonFilePath, (failedAttempts) => {
                                res.json({ success: false, message: `Incorrect password: ${failedAttempts}` });
                            });
                        } else {
                            // Username not found
                            res.json({ success: false, message: 'Username not found' });
                        }
                    });
                }
            });
        } else {
            // Username not found
            res.json({ success: false, message: 'Username not found' });
        }
    });
});