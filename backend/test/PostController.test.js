import PostModel from '../models/PostModel';
import * as PostController from '../controllers/PostController';

describe('PostController', () => {
  let req, res, post;

  beforeEach(() => {
    req = {
      params: { id: '60d21b4667d0d8992e610c85' },
      body: { userId: '60d21b4667d0d8992e610c86', reaction: 'like' },
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    post = {
      _id: '60d21b4667d0d8992e610c85',
      reactions: { like: [], heart: [], fire: [] },
      save: jest.fn().mockResolvedValue(this),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('list', () => {
    it('should list all posts', async () => {
      const posts = [post];
      jest.spyOn(PostModel, 'aggregate').mockResolvedValue(posts);

      await PostController.list(req, res);

      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(posts);
    });

    it('should return 500 if there is an error', async () => {
      jest.spyOn(PostModel, 'aggregate').mockRejectedValue(new Error('Error'));

      await PostController.list(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error when getting Post.',
        error: new Error('Error'),
      });
    });
  });



 



  describe('remove', () => {
    

    it('should return 404 if post is not found', async () => {
      jest.spyOn(PostModel, 'findByIdAndDelete').mockResolvedValue(null);

      await PostController.remove(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No such post' });
    });

   
  });

  describe('addReaction', () => {
    it('should add a reaction to a post', async () => {
      jest.spyOn(PostModel, 'findById').mockResolvedValue(post);

      await PostController.addReaction(req, res);

      expect(post.reactions.like).toContain(req.body.userId);
      expect(post.save).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(post);
    });

    it('should return 404 if post is not found', async () => {
      jest.spyOn(PostModel, 'findById').mockResolvedValue(null);

      await PostController.addReaction(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No such post' });
    });
  });

  describe('removeReaction', () => {
    it('should remove a reaction from a post', async () => {
      post.reactions.like.push(req.body.userId);
      jest.spyOn(PostModel, 'findById').mockResolvedValue(post);

      await PostController.removeReaction(req, res);

      expect(post.reactions.like).not.toContain(req.body.userId);
      expect(post.save).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(post);
    });

    it('should return 404 if post is not found', async () => {
      jest.spyOn(PostModel, 'findById').mockResolvedValue(null);

      await PostController.removeReaction(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No such post' });
    });
  });
});
