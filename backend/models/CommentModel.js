var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
    content: { type: String, required: true },
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'users', 
        required: true },
    image: { type: String },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: Schema.Types.ObjectId, ref: 'users' }], 
    downvotedBy: [{ type: Schema.Types.ObjectId, ref: 'users' }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('comments', CommentSchema);