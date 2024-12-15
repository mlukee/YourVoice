var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var PostSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: Schema.Types.ObjectId, ref: "users" }], 
  downvotedBy: [{ type: Schema.Types.ObjectId, ref: "users" }],
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "comments",
    },
  ],
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  archived: { type: Boolean, default: false },
});

module.exports = mongoose.model("posts", PostSchema);
