var PostModel = require("../models/PostModel");
var CommentModel = require("../models/CommentModel");

module.exports = {
  list: async function (req, res) {
    try {
      const category = req.params.category;

      const posts = await PostModel.find({
        category: { $regex: `\\b${category}\\b`, $options: "i" },
        archived: false,
      })
        .populate("userId", "username avatar")
        .sort({ createdAt: -1 });

      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
