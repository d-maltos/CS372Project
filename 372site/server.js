const express = require("express");
const app = express();
const router = express.Router();
const path = require("path");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const crypto = require("crypto");

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const mongoURI = "mongodb://localhost:27017"; // MongoDB connection URI
const dbName = "MovieSite"; // Name of your MongoDB database
const collectionName = "users"; // Name of the collection to store users

async function connectToMongoDB() {
    const client = new MongoClient(mongoURI);
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        return client.db(dbName).collection(collectionName);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

async function findUser(username, collection) {
    const user = await collection.findOne({ username: username });
    return user;
}

async function checkPasswordAndUpdateAttempts(username, password, collection) {
    const user = await findUser(username, collection);

    if (user) {
        // Hash the provided password using SHA-256
        const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

        if (user.password === hashedPassword) {
            // Reset failed attempts upon successful login
            await collection.updateOne({ username: username }, { $set: { failedAttempts: 0 } });
            console.log(`Failed attempts for user '${username}' reset successfully.`);
            return true;
        } else {
            // Update failed attempts
            await collection.updateOne({ username: username }, { $inc: { failedAttempts: 1 } });
            console.log(`Failed attempts for user '${username}' incremented successfully.`);
            return false;
        }
    } else {
        return false;
    }
}


async function createUser(username, password, collection) {
    const userExists = await findUser(username, collection);

    if (userExists) {
        console.log(`User '${username}' already exists.`);
        return false;
    }

    // Hash the password using SHA-256
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    await collection.insertOne({ username: username, password: hashedPassword, failedAttempts: 0 });
    console.log(`User '${username}' created successfully.`);
    return true;
}

async function getFailedAttempts(username, collection) {
    const user = await findUser(username, collection);
    
    if (user) {
        return user.failedAttempts;
    } else {
        return null;
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "/public/login.html"));
});

app.get('/success', (req, res) => {
    res.json("Successful Login Credentials");
});

app.get('*', (req, res) => {
    res.json("Page not found");
});

app.listen(8080, () => {
    console.log("App is starting at port ", 8080);
});

app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const collection = await connectToMongoDB();
        const user = await findUser(username, collection);
        if (user) {
            const passwordCorrect = await checkPasswordAndUpdateAttempts(username, password, collection);
            if (passwordCorrect) {
                res.json({ success: true, message: 'Login successful' });
            } else {
                const failedAttempts = await getFailedAttempts(username, collection);
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
        const collection = await connectToMongoDB();
        const userExists = await findUser(username, collection);
        if (userExists) {
            res.json({ success: false, message: 'Username Taken' });
        } else {
            const success = await createUser(username, password, collection);
            if (success) {
                console.log("User created successfully!");
                res.json({ success: true, message: 'User Created' });
            } else {
                res.json({ success: false, message: 'Error creating user' });
            }
        }
    } catch (error) {
        console.error('Error processing signup:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
