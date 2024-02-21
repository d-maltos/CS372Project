const express = require("express");
const app = express();
const router = express.Router();
const path = require("path");

app.use(express.static('public'));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "/public/login.html"));
});

app.get('*', (req, res) => {
    res.json("page not found");
});

app.listen(8080, () => {
    console.log("App is starting at port ", 8080);
});