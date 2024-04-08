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

            if (user.failedAttempts >= 4) {
                // Delete user from MongoDB
                await collection.deleteOne({ username: username });
                console.log(`User '${username}' deleted due to exceeding failed login attempts.`);
            }

            return false;
        }
    } else {
        return false;
    }
}

async function getRole(username, collection) {
    const user = await collection.findOne({ username: username });
    return user.profile;
}


async function createUser(username, password, collection) {
    const userExists = await findUser(username, collection);

    if (userExists) {
        console.log(`User '${username}' already exists.`);
        return false;
    }

    // Hash the password using SHA-256
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    await collection.insertOne({ username: username, password: hashedPassword, failedAttempts: 0, profile: "Viewer" });
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

app.get('/moviesC', async (req, res) => {
    try {
        const moviesCollection = await connectToMongoDB("movies");
        const movies = await moviesCollection.find().toArray();
        res.render('contentMan', { movies });
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/moviesV', async (req, res) => {
    try {
        const moviesCollection = await connectToMongoDB("movies");
        const movies = await moviesCollection.find().toArray();
        res.render('viewerBrowse', { movies });
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/moviesM', async (req, res) => {
    try {
        const moviesCollection = await connectToMongoDB("movies");
        const movies = await moviesCollection.find().toArray();
        res.render('marketMan', { movies });
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
            videoId: videoId,
            likes: movie.likes,
            views: movie.views,
            comments: movie.comments
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




app.get('/moviesV/:title', async (req, res) => {
    try {
        const title = req.params.title;
        // Query the database or any other data source to get details of the movie
        const movieDetailsV = await getMovieDetails(title); // Implement this function to get details of the movie
        res.render('movieDetailsV', { movie: movieDetailsV }); // Render the movie details template with the data
    } catch (error) {
        console.error('Error fetching movie details:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/moviesC/:title', async (req, res) => {
    try {
        const title = req.params.title;
        // Query the database or any other data source to get details of the movie
        const movieDetailsC = await getMovieDetails(title); // Implement this function to get details of the movie
        res.render('movieDetailsC', { movie: movieDetailsC }); // Render the movie details template with the data
    } catch (error) {
        console.error('Error fetching movie details:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/moviesM/:title', async (req, res) => {
    try {
        const title = req.params.title;
        // Query the database or any other data source to get details of the movie
        const movieDetailsM = await getMovieDetails(title); // Implement this function to get details of the movie
        res.render('movieDetailsM', { movie: movieDetailsM }); // Render the movie details template with the data
    } catch (error) {
        console.error('Error fetching movie details:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/likeMovie', async (req, res) => {
    const title = req.body.title;

    try {
        const moviesCollection = await connectToMongoDB("movies");
        const movie = await moviesCollection.findOne({ title: title });

        if (movie) {
            // Increment the likes by 1
            await moviesCollection.updateOne({ title: title }, { $inc: { likes: 1 } });
            // console.log(`Likes for movie '${title}' incremented successfully.`);
            res.json({ success: true, message: 'Likes incremented successfully' });
        } else {
            console.log(`Movie '${title}' not found`);
            res.status(404).json({ success: false, message: 'Movie not found' });
        }
    } catch (error) {
        console.error('Error increasing likes:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/incrementView', async (req, res) => {
    const title = req.body.title;

    try {
        const moviesCollection = await connectToMongoDB("movies");
        const movie = await moviesCollection.findOne({ title: title });

        if (movie) {
            // Increment the views by 1
            await moviesCollection.updateOne({ title: title }, { $inc: { views: 1 } });
            // console.log(`Likes for movie '${title}' incremented successfully.`);
            res.json({ success: true, message: 'Likes incremented successfully' });
        } else {
            console.log(`Movie '${title}' not found`);
            res.status(404).json({ success: false, message: 'Movie not found' });
        }
    } catch (error) {
        console.error('Error increasing likes:', error);
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
    const { title, genre, link, comments } = req.body;
    const likes = parseInt(req.body.likes);
    const views = parseInt(req.body.views);

    //console.log("Received movie data:");
    //console.log("Title:", title);
    //console.log("Genre:", genre);
    //console.log("Link:", link);
    try {
        const moviesCollection = await connectToMongoDB("movies");
        // Assuming your movies collection has fields title, genre, and link
        await moviesCollection.insertOne({ title, genre, link, likes, views, comments: [] });
        
        //console.log("Movie added to the database successfully");
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

app.post('/addComment', async (req, res) => {
    const { title, comment } = req.body;

    try {
        const moviesCollection = await connectToMongoDB("movies");
        const result = await moviesCollection.updateOne({ title: title }, { $push: { comments: comment } });

        if (result.modifiedCount === 1) {
            console.log(`Comment added to movie '${title}' successfully.`);
            res.json({ success: true, message: 'Comment added successfully' });
        } else {
            console.log(`Movie '${title}' not found`);
            res.status(404).json({ success: false, message: 'Movie not found' });
        }
    } catch (error) {
        console.error('Error adding comment:', error);
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
                const role = await getRole(username, usersCollection);
                if (role === "Viewer") {
                    res.json({ success: true, message: 'Viewer' });
                }
                if (role === "Content Manager") {
                    res.json({ success: true, message: 'Content Manager' });
                }
                if (role === "Marketing Manager") {
                    res.json({ success: true, message: 'Marketing Manager' });
                }
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
