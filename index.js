var express = require('express');
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var imgSchema = require('./model.js');
var fs = require('fs');
var path = require('path');

// This block should only be executed in a Node.js environment
if (typeof process !== 'undefined' && process.env) {
    // Code dependent on process object (like process.env) goes here
    require('dotenv').config();
}

app.set("view engine", "ejs");

app.use(express.static('public'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 30000, // 30 seconds
}).then(() => {
    console.log("DB Connected");
}).catch(err => {
    console.error("Error connecting to MongoDB:", err);
});

var multer = require('multer');
const image_model = require('./model.js');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now());
    }
});

var upload = multer({ storage: storage });

app.get('/', (req, res) => {
    image_model.find({})
        .then((data) => {
            res.render('imagepage',{items: data})
            
        })
        .catch((err) => {
            console.error("Error retrieving images:", err);
            res.status(500).send("Error retrieving images");
        });
});


app.get('/send_image', (req, res) => {
    image_model.find()
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            console.error("Error retrieving images:", err);
            res.status(500).send("Error retrieving images");
        });
});

app.get('/delete', (req, res) => {
    res.render('delete');
});

app.post('/delete', (req, res) => {
    var deleteImageName = req.body.delete;
    console.log(deleteImageName);
    image_model.deleteOne({ name: deleteImageName })
        .then(() => {
            console.log("Image deleted successfully");
            res.redirect('/');
        })
        .catch(err => {
            console.error("Error deleting image:", err);
            res.status(500).send("Error deleting image");
        });
});

app.post('/images', upload.single('image'), (req, res, next) => {
    var obj = new image_model({
        name: req.body.name,
        desc: req.body.desc,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
    });
    obj.save()
        .then((item) => {
            res.redirect('/');
        })
        .catch(err => {
            console.error("Error saving image:", err);
            res.status(500).send("Error saving image");
        });
});

// Check if process object exists before using it
var port = (typeof process !== 'undefined' && process.env && process.env.PORT) ? process.env.PORT : '3000';

app.listen(port, err => {
    if (err) {
        console.error("Error starting server:", err);
        throw err;
    }
    console.log('Server listening on port', port);
});
