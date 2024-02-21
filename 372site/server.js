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
                return true;
            } else {
                user.failedAttempts++;
                await fs.writeFile(filePath, JSON.stringify(jsonData, null, 4), 'utf8');
                // console.log(`Failed attempts for user '${username}' incremented successfully.`);
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
