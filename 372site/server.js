const express = require("express");
const app = express();
const router = express.Router();
const path = require("path");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const crypto = require("crypto");

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public')); // Assuming your EJS files are in a directory named 'views'


const mongoURI = "mongodb://localhost:27017"; // MongoDB connection URI
const dbName = "MovieSite"; // Name of your MongoDB database
//const collectionName = "users"; // Name of the collection to store users

async function connectToMongoDB(collectionName) {
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

app.get('/movies', async (req, res) => {
    try {
        const moviesCollection = await connectToMongoDB("movies");
        const movies = await moviesCollection.find().toArray();
        res.render('contentMan', { movies });
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

async function getMovieDetails(title) {
    const moviesCollection = await connectToMongoDB("movies");
    const movie = await moviesCollection.findOne({ title: title });

    if (movie) {
        // Extract video ID from the YouTube link
        const videoId = extractVideoIdFromLink(movie.link);
        
        return {
            title: movie.title,
            description: movie.genre,
            videoId: videoId
        };
    } else {
        throw new Error("Movie not found");
    }
}

function extractVideoIdFromLink(link) {
    // Extract video ID from the YouTube link
    const urlParams = new URLSearchParams(new URL(link).search);
    return urlParams.get('v');
}




app.get('/movies/:title', async (req, res) => {
    try {
        const title = req.params.title;
        // Query the database or any other data source to get details of the movie
        const movieDetails = await getMovieDetails(title); // Implement this function to get details of the movie
        res.render('movieDetails', { movie: movieDetails }); // Render the movie details template with the data
    } catch (error) {
        console.error('Error fetching movie details:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


app.get('/addMovies', async (req, res) => {
    try {
        const moviesCollection = await connectToMongoDB("movies");
        const movies = await moviesCollection.find().toArray();
        res.sendFile(path.join(__dirname, "/public/contentManAdd.html"));
        //res.json(movies);
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/addMovie', async (req, res) => {
    const { title, genre, link } = req.body;

    console.log("Received movie data:");
    console.log("Title:", title);
    console.log("Genre:", genre);
    console.log("Link:", link);

    try {
        const moviesCollection = await connectToMongoDB("movies");
        // Assuming your movies collection has fields title, genre, and link
        await moviesCollection.insertOne({ title, genre, link });
        
        console.log("Movie added to the database successfully");
        res.json({ success: true, message: 'Movie added successfully' });
    } catch (error) {
        console.error('Error adding movie:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


app.get('/addMovies', async (req, res) => {
    try {
        const moviesCollection = await connectToMongoDB("movies");
        const movies = await moviesCollection.find().toArray();
        res.sendFile(path.join(__dirname, "/public/contentManAdd.html"));
        //res.json(movies);
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/deleteMovie', async (req, res) => {
    const { title } = req.body;

    console.log("Received movie data:");
    console.log("Title:", title);

    try {
        const moviesCollection = await connectToMongoDB("movies");
        // Delete the movie with the given title
        const deletionResult = await moviesCollection.deleteOne({ title: title });

        if (deletionResult.deletedCount === 1) {
            console.log("Movie removed from the database successfully");
            res.json({ success: true, message: 'Movie deleted successfully' });
        } else {
            console.log("Movie not found in the database");
            res.status(404).json({ success: false, message: 'Movie not found' });
        }
    } catch (error) {
        console.error('Error deleting movie:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


app.get('/deleteMovies', async (req, res) => {
    try {
        const moviesCollection = await connectToMongoDB("movies");
        const movies = await moviesCollection.find().toArray();
        res.sendFile(path.join(__dirname, "/public/contentManDelete.html"));
        //res.json(movies);
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
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
        const usersCollection = await connectToMongoDB("users");
        const user = await findUser(username, usersCollection);
        if (user) {
            const passwordCorrect = await checkPasswordAndUpdateAttempts(username, password, usersCollection);
            if (passwordCorrect) {
                res.json({ success: true, message: 'Login successful' });
            } else {
                const failedAttempts = await getFailedAttempts(username, usersCollection);
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
        const usersCollection = await connectToMongoDB("users");
        const userExists = await findUser(username, usersCollection);
        if (userExists) {
            res.json({ success: false, message: 'Username Taken' });
        } else {
            const success = await createUser(username, password, usersCollection);
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
