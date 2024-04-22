# CS372 Software Construction - Project

Steps for installation:

1. Use git clone in your terminal using the HTTPS url (Ex: "git clone https://github.com/d-maltos/CS372Project.git")

2. Install MongoDB Compass
- First, navigate to the MongoDB Compass website - https://www.mongodb.com/try/download/compass 
- Next, scroll down to "MongoDB Compass Download (GUI)"
- Select the most recent version, select your operating system, and download the exe package
- Run the .exe installer
- Once this is setup, open MongoDBCompass (it does not need to be open while running the server, this is just to make sure there are no "first time running" installations)

Note: while the server should be able to automatically create the database and collections needed, if it fails to do so automatically please do the following:
- Open MongoDBCompass
- The URI text box should read "mongodb://localhost:27017" if it does not, replace the text inside
- Click "connect"
- Next to "Databases" press the + icon to create a database
- Name this database "MovieSite"
- Click the + icon next to "MovieSite" once the database is created to create a collection
- Create two collections, "movies" and "users"

While this server was designed using MongoDB Compass, it may still work if you use MongoSH or some other GUI. However, I will not be able to provide detailed instructions for using alternative softwares.

3. In your terminal, type "node -v"
- The version of your Node JS should appear. If Node JS is not installed, do the following:
- Navigate to https://nodejs.org/en 
- Download the latest version of Node JS
- Once again open a terminal and type "node -v"
- If it still does not work, restart your device

4. Navigate to CS372Project/372site/ using the cd command in your terminal

5. In your terminal, do the following to create a docker image and run it:
- While in CS372Project directory enter:
- docker build -t site-docker .
- docker run -p 8080:8080 site-docker

6. To access the webpage, go to "http://localhost:8080/"

7. From here you can access the login page and create an account or sign into an existing account

8. Accounts created will automatically be considered as a "Viewer" to give an account new permissions, navigate to the "users" collection in MongoDB Compass (or your preferred software), edit the account of your choosing and replace "Viewer" with either "Content Manager" or "Marketing Manager". To do this in MongoDB Compass:
- Open MongoDBCompass
- The URI text box should read "mongodb://localhost:27017" if it does not, replace the text inside
- Click "connect"
- Click on "MovieSite" then "users"
- Find the account you wish to edit
- While hovering over the object box that pertains to the account you with to edit with your mouse, a pencil icon will appear on the top right of the box. There will be four icons there, the button to edit the account will be the fourth from right to left and should say "Edit document" when you hover over it
- Press it, and replace the text after "Profile" with whatever account type you wish to grant it.

9. While all of the packages used in this project should automatically be downloaded, in the event this does not occur please enter the following commands in your terminal while in the 372site directory:
- npm install express
- npm install body-parser
- npm install ejs
- npm install mongodb