const express = require("express");
const app = express();
const router = express.Router();
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs").promises;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const jsonFilePath = 'users.json';

async function getFailedAttempts(username, filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        const user = jsonData.user.find(user => user.username === username);
        return user ? user.failedAttempts : null;
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return null;
    }
}

async function findUser(username, filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        const user = jsonData.user.find(user => user.username === username);
        return !!user;
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return false;
    }
}

async function checkPasswordAndUpdateAttempts(username, password, filePath) {
    try {
        let data = await fs.readFile(filePath, 'utf8');
        let jsonData = JSON.parse(data);
        let user = jsonData.user.find(user => user.username === username);

        if (user) {
            if (user.password === password) {
                // Reset failed attempts upon successful login
                user.failedAttempts = 0;
                await fs.writeFile(filePath, JSON.stringify(jsonData, null, 4), 'utf8');
                console.log(`Failed attempts for user '${username}' reset successfully.`);
                return true;
            } else {
                user.failedAttempts++;
                if (user.failedAttempts >= 5) {
                    // Delete user if failedAttempts reach 5
                    jsonData.user = jsonData.user.filter(u => u.username !== username);
                    await fs.writeFile(filePath, JSON.stringify(jsonData, null, 4), 'utf8');
                    console.log(`User '${username}' deleted due to excessive failed attempts.`);
                } else {
                    // Update failed attempts
                    await fs.writeFile(filePath, JSON.stringify(jsonData, null, 4), 'utf8');
                    console.log(`Failed attempts for user '${username}' incremented successfully.`);
                }
                return false;
            }
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error reading/writing JSON file:', error);
        return false;
    }
}

async function createUser(username, password, filePath) {
    try {
        let data = await fs.readFile(filePath, 'utf8');
        let jsonData = JSON.parse(data);

        // Check if the username already exists
        const userExists = jsonData.user.some(user => user.username === username);
        if (userExists) {
            console.log(`User '${username}' already exists.`);
            return false;
        }

        // Create a new user object
        const newUser = {
            username: username,
            password: password,
            failedAttempts: 0
        };

        // Add the new user to the JSON data
        jsonData.user.push(newUser);

        // Write the updated JSON data to the file
        await fs.writeFile(filePath, JSON.stringify(jsonData, null, 4), 'utf8');
        console.log(`User '${username}' created successfully.`);
        return true;
    } catch (error) {
        console.error('Error reading/writing JSON file:', error);
        return false;
    }
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

app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const userFound = await findUser(username, jsonFilePath);
        if (userFound) {
            const passwordCorrect = await checkPasswordAndUpdateAttempts(username, password, jsonFilePath);
            if (passwordCorrect) {
                res.json({ success: true, message: 'Login successful' });
            } else {
                const failedAttempts = await getFailedAttempts(username, jsonFilePath);
                res.json({ success: false, message: `Incorrect password: ${failedAttempts}` });
            }
        } else {
            res.json({ success: false, message: 'Username not found' });
        }
    } catch (error) {
        console.error('Error processing login:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/signup', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const userFound = await findUser(username, jsonFilePath);
        if (userFound) {
            res.json({ success: false, message: 'Username Taken' });
        } else {
            createUser(username, password, jsonFilePath)
                .then(success => {
                    if (success) {
                        console.log("User created successfully!");
                        res.json({ success: true, message: 'User Created' });
                    } else {
                        // console.log("Username Taken");
                        res.json({ success: false, message: 'Username Taken' });
                    }
                })
                .catch(error => {
                    console.error("Error creating user:", error);
                    res.json({ success: false, message: 'Error creating user' });
                });
        }
    } catch (error) {
        console.error('Error processing signup:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
