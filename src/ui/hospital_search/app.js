const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const { Keys } = require("./configuration/config");
const session = require("express-session");
const path = require('path');
const dotenv = require('dotenv');
const envFilePath = process.env.NODE_ENV || 'development' + '.env';
const envResult = dotenv.config({path : path.join(__dirname, '..', '..' , 'configuration', envFilePath)});
if(envResult.error) throw envResult.error;

const hospitals = require("./routes/Hospitals-search/SearchByLocation/search_by_location");

const app = express();
app.use(
	session({
		secret: "secret",
		resave: true,
		saveUninitialized: true,
	})
);
app.use(express.json());

//Connecting to MongoDB
mongoose.connect(process.env.MongodbURI, {
	//useNewUrlParser: true,
	//useUnifiedTopology: true,
});
const db = mongoose.connection;
mongoose.Promise = global.Promise;
db.once("open", function () {
	console.log("Connected to Database");
});

db.on("error", function (err) {
	if (err) console.log(err);
});

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());

// Routes
app.use("/hospitals", hospitals);

//module.exports = app;

// Start the server
const port = process.env.PORT || 7070;
app.listen(port);
console.log(`Server listening at ${port}`);
