var PostModel = require("../models/PostModel");
var CommentModel = require("../models/CommentModel");
var multer = require("multer");
var fs = require("fs");

var storage = multer.memoryStorage();
var upload = multer({ storage: storage });
/**
 * PostController.js
 *
 *
 * @description :: Server-side logic for managing Posts.
 */

module.exports = {
  list: async function (req, res) {
    try {
      const posts = await PostModel.aggregate([
        {
          $match: { archived: false },
        },
        {
          $addFields: {
            ratio: {
              $cond: {
                if: { $eq: ["$downvotes", 0] },
                then: "$upvotes",
                else: { $divide: ["$upvotes", "$downvotes"] },
              },
            },
          },
        },
        {
          $sort: { ratio: -1, createdAt: -1 }, // Sortiranje po razmerju in datumu
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userId",
          },
        },
        {
          $unwind: "$userId",
        },
        {
          $project: {
            title: 1,
            content: 1,
            category: 1,
            userId: { username: 1, avatar: 1 },
            upvotes: 1,
            downvotes: 1,
            comments: 1,
            image: 1,
            createdAt: 1,
            updatedAt: 1,
            archived: 1,
            ratio: 1,
          },
        },
      ]);

      res.json(posts);
    } catch (err) {
      res.status(500).json({
        message: "Error when getting Post.",
        error: err,
      });
    }
  },
  // Posodobljena metoda za prikaz posamezne objave
  show: async function (req, res) {
    const id = req.params.id;

    try {
      const post = await PostModel.findOne({ _id: id })
        .populate("userId", "username avatar") // Populacija za prikaz avtorja
        .populate({
          path: "comments",
          populate: { path: "userId", select: "username" }, // Populacija uporabnikov v komentarjih
        });

      if (!post) {
        return res.status(404).json({
          message: "No such Post",
        });
      }

      return res.json(post);
    } catch (err) {
      return res.status(500).json({
        message: "Error when getting Post.",
        error: err.message,
      });
    }
  },

  create: [
    upload.single("image"), 
    async function (req, res) {
      try {
        let image = null;

        if (req.file) {
          image = req.file.buffer.toString("base64"); 
        }

        // Ustvarjanje novega dokumenta
        const newPost = new PostModel({
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          userId: req.body.userId,
          image: image, 
        });

      // Shranjevanje dokumenta v bazo
      const savedPost = await newPost.save();
      return res.status(201).json(savedPost); // Vrne uspešno ustvarjen dokument
    } catch (err) {
      // Obvladovanje napak
      return res.status(500).json({
        message: "Error when creating Post",
        error: err.message,
      });
    }
  },
],

  update: [
    upload.single("image"),
    async function (req, res) {
      const id = req.params.id;

      try {
        let image = null;

        if (req.file) {
          image = req.file.buffer.toString("base64");
        }

        const updateData = {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
        };

        if (image) {
          updateData.image = image;
        }

        const updatedPost = await PostModel.findByIdAndUpdate(
          id,
          updateData,
          { new: true } // Return the updated document
        );

        if (!updatedPost) {
          return res.status(404).json({
            message: "No such post",
          });
        }

        return res.json(updatedPost);
      } catch (err) {
        return res.status(500).json({
          message: "Error when updating post.",
          error: err.message,
        });
      }
    },
  ],

  remove: async function (req, res) {
    const id = req.params.id;

    try {
      const deletedPost = await PostModel.findByIdAndDelete(id);

      if (!deletedPost) {
        return res.status(404).json({
          message: "No such post",
        });
      }

      return res.json(deletedPost);
    } catch (err) {
      return res.status(500).json({
        message: "Error when deleting post.",
        error: err.message,
      });
    }
  },

  unArchive: async function (req, res) {
    const id = req.params.id;

    try {
      const updatedPost = await PostModel.findByIdAndUpdate(
        { _id: id },
        {
          archived: false,
        },
        { new: true } // Vrne posodobljen dokument
      );

      if (!updatedPost) {
        return res.status(404).json({
          message: "No such post",
        });
      }

      return res.json(updatedPost);
    } catch (err) {
      return res.status(500).json({
        message: "Error when updating post.",
        error: err.message,
      });
    }
  },

  archive: async function (req, res) {
    const id = req.params.id;

    try {
      console.log("Got ID:", id);
      const post = await PostModel.findByIdAndUpdate(
        { _id: id },
        { archived: true }
      );

      if (!post) {
        return res.status(404).json({
          message: "No such Post",
        });
      }

      return res.status(204).send(); // Uporabimo `send` za 204 status brez vsebine
    } catch (err) {
      return res.status(500).json({
        message: "Error when deleting the Post.",
        error: err.message,
      });
    }
  },

  addComment: [
    upload.single("image"), 
    async function (req, res) {
      const postId = req.params.id;

      if (!req.body.content || !req.body.userId) {
        return res.status(400).json({
          message: "Content and userId are required",
        });
      }

      try {
        let image = null;

        if (req.file) {
          image = req.file.buffer.toString("base64"); 
        }

        // Ustvari in shrani nov komentar
        const newComment = new CommentModel({
          content: req.body.content,
          userId: req.body.userId,
          image: image, 
        });
        const comment = await newComment.save();

        // Dodaj ID komentarja v objavo
        const post = await PostModel.findByIdAndUpdate(
          postId,
          { $push: { comments: comment._id } },
          { new: true }
        ).populate({
          path: "comments",
          populate: { path: "userId", select: "username" }, // Populiramo tudi uporabnika komentarja
        });

        if (!post) {
          return res.status(404).json({
            message: "No such Post to add a comment",
          });
        }

        res.status(201).json(post);
      } catch (err) {
        res.status(500).json({
          message: "Error when adding comment",
          error: err.message,
        });
      }
    },
  ],

  removeComment: async function (req, res) {
    const postId = req.params.id;
    const commentId = req.params.commentId;

    try {
      // Odstranimo komentar
      const comment = await CommentModel.findByIdAndDelete(commentId);

      if (!comment) {
        return res.status(404).json({
          message: "No such comment",
        });
      }

      // Posodobimo objavo, da odstranimo ID komentarja
      const post = await PostModel.findByIdAndUpdate(
        postId,
        { $pull: { comments: commentId } },
        { new: true }
      ).populate({
        path: "comments",
        populate: { path: "userId", select: "username" },
      });

      if (!post) {
        return res.status(404).json({
          message: "No such Post to remove the comment",
        });
      }

      return res.status(200).json(post); // Posredujemo posodobljen objekt
    } catch (err) {
      return res.status(500).json({
        message: "Error when deleting comment or updating post",
        error: err.message,
      });
    }
  },

  upvote: async function (req, res) {
    const postId = req.params.id;
    const userId = req.body.userId;

    try {
      const post = await PostModel.findById(postId);

      if (!post) {
        return res.status(404).json({
          message: "No such post",
        });
      }

      if (post.upvotedBy.includes(userId)) {
        return res.status(400).json({
          message: "User has already upvoted this post",
        });
      }

      if (post.downvotedBy.includes(userId)) {
        post.downvotes -= 1;
        post.downvotedBy.pull(userId);
      }

      post.upvotes += 1;
      post.upvotedBy.push(userId);

      await post.save();

      return res.json(post);
    } catch (err) {
      return res.status(500).json({
        message: "Error when upvoting post.",
        error: err.message,
      });
    }
  },

  downvote: async function (req, res) {
    const postId = req.params.id;
    const userId = req.body.userId;

    try {
      const post = await PostModel.findById(postId);

      if (!post) {
        return res.status(404).json({
          message: "No such post",
        });
      }

      if (post.downvotedBy.includes(userId)) {
        return res.status(400).json({
          message: "User has already downvoted this post",
        });
      }

      if (post.upvotedBy.includes(userId)) {
        post.upvotes -= 1;
        post.upvotedBy.pull(userId);
      }

      post.downvotes += 1;
      post.downvotedBy.push(userId);

      await post.save();

      return res.json(post);
    } catch (err) {
      return res.status(500).json({
        message: "Error when downvoting post.",
        error: err.message,
      });
    }
  },

  upvoteComment: async function (req, res) {
    const commentId = req.params.commentId;
    const userId = req.body.userId;

    try {
      const comment = await CommentModel.findById(commentId);

      if (!comment) {
        return res.status(404).json({
          message: "No such comment",
        });
      }

      if (comment.upvotedBy.includes(userId)) {
        return res.status(400).json({
          message: "User has already upvoted this comment",
        });
      }

      if (comment.downvotedBy.includes(userId)) {
        comment.downvotes -= 1;
        comment.downvotedBy.pull(userId);
      }

      comment.upvotes += 1;
      comment.upvotedBy.push(userId);

      await comment.save();

      return res.json(comment);
    } catch (err) {
      return res.status(500).json({
        message: "Error when upvoting comment.",
        error: err.message,
      });
    }
  },

  downvoteComment: async function (req, res) {
    const commentId = req.params.commentId;
    const userId = req.body.userId;

    try {
      const comment = await CommentModel.findById(commentId);

      if (!comment) {
        return res.status(404).json({
          message: "No such comment",
        });
      }

      if (comment.downvotedBy.includes(userId)) {
        return res.status(400).json({
          message: "User has already downvoted this comment",
        });
      }

      if (comment.upvotedBy.includes(userId)) {
        comment.upvotes -= 1;
        comment.upvotedBy.pull(userId);
      }

      comment.downvotes += 1;
      comment.downvotedBy.push(userId);

      await comment.save();

      return res.json(comment);
    } catch (err) {
      return res.status(500).json({
        message: "Error when downvoting comment.",
        error: err.message,
      });
    }
  },

  getComments: async function (req, res) {
    const postId = req.params.id;

    try {
      const post = await PostModel.findById(postId).populate({
        path: "comments",
        populate: { path: "userId", select: "username" },
      });

      if (!post) {
        return res.status(404).json({
          message: "No such post",
        });
      }

      const comments = await CommentModel.aggregate([
        { $match: { _id: { $in: post.comments } } },
        {
          $addFields: {
            ratio: {
              $cond: {
                if: { $eq: ["$downvotes", 0] },
                then: "$upvotes",
                else: { $divide: ["$upvotes", "$downvotes"] },
              },
            },
          },
        },
        { $sort: { ratio: -1, createdAt: -1 } }, // Sortiranje po razmerju in datumu
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userId",
          },
        },
        { $unwind: "$userId" },
        {
          $project: {
            content: 1,
            userId: { username: 1 },
            upvotes: 1,
            downvotes: 1,
            image: 1,
            createdAt: 1,
            ratio: 1,
          },
        },
      ]);

      res.json(comments);
    } catch (err) {
      res.status(500).json({
        message: "Error when getting comments.",
        error: err.message,
      });
    }
  },
};
