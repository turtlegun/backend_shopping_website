var mongoose = require('mongoose');
var imageSchema = new mongoose.Schema({
    name: String,
    desc: String,
    img:
    {
        data: Buffer,
        contentType: String
    }
});
 

const image_model= mongoose.model('Image', imageSchema);
module.exports =image_model