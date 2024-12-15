var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
    content: { type: String, required: true },
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'users', 
        required: true },
    image: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('comments', CommentSchema);