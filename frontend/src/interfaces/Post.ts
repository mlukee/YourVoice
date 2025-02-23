export interface Post {
  _id: string;
  title: string;
  content: string;
  category: string;
  //userId: string;
  userId: {
    _id: string;
    username: string;
    avatar?: string
  };
  upvotes: number;
  downvotes: number;
  upvotedBy: string[]; 
  downvotedBy: string[]; 
  comments?: {
    _id: string;
    content: string;
    image?: string;
    createdAt: string;
    userId: {
      _id: string;
      username: string;
    };
  }[];
  image?: string
  archived: boolean;
  createdAt: string;
  reactions: {
    like: string[];
    heart: string[];
    fire: string[];
  };
}
