import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../userContext';
import {
  Text,
  Link,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { Post } from '../interfaces/Post';
import { ArchiveIcon, ArchiveXIcon, Edit, Trash2 } from 'lucide-react';
import AddPostModal from './AddPostModal';
export default function UserPosts() {
  const { user } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const loadPosts = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/user/${user?._id}/posts`
      );
      if (!response.ok) {
        throw new Error('Failed to load posts');
      }
      const postsData = await response.json();
      setPosts(postsData);
    } catch (err) {
      toast({
        title: 'Napaka pri pridobivanju objav.',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnArchivePost = async (id: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/post/${id}/unarchive`,
        {
          method: 'PUT',
        }
      );

      if (response.ok) {
        loadPosts(); // Reload posts after unarchiving
        toast({
          title: 'Objava je bila uspešno odkrita.',
          status: 'success',
        });
      } else {
        toast({
          title: 'Napaka pri odkrivanju objave.',
          status: 'error',
        });
      }
    } catch (error) {
      toast({
        title: 'Napaka pri odkrivanju objave.',
        status: 'error',
      });
    }
  };

  const handleArchivePost = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/post/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadPosts(); // Reload posts after deletion
        toast({
          title: 'Objava je bila uspešno arhivirana.',
          status: 'info',
        });
      } else {
        toast({
          title: 'Napaka pri brisanju objave.',
          status: 'error',
        });
      }
    } catch (error) {
      toast({
        title: 'Napaka pri brisanju objave.',
        status: 'error',
      });
    }
  };

  useEffect(() => {
    loadPosts();
  }, []); // Runs when userId changes

  const handleDeletePost = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/post/${id}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadPosts(); // Reload posts after deletion
        toast({
          title: 'Objava je bila uspešno izbrisana.',
          status: 'success',
        });
      } else {
        toast({
          title: 'Napaka pri brisanju objave.',
          status: 'error',
        });
      }
    } catch (error) {
      toast({
        title: 'Napaka pri brisanju objave.',
        status: 'error',
      });
    }
  };

  if (loading) {
    return <div>Loading posts...</div>;
  }

  if (posts.length === 0) return <div>Nimate arhiviranih objav.</div>;
  return (
    <div>
      {posts.map((post: Post) => (
        <Card key={post._id} className="mb-4">
          <CardHeader className="align-items-center">
            <div className="d-flex justify-content-between align-items-center">
              {/* Title and archived status */}
              <div className="d-flex align-items-center  gap-3">
                <Link
                  href={`/posts/${post._id}`}
                  _hover={{ textDecoration: 'none', color: 'black' }}
                >
                  <Text
                    fontWeight="bold"
                    fontSize="xl"
                    className="text-truncate"
                  >
                    {post.title.length > 25
                      ? `${post.title.substring(0, 25)}...`
                      : post.title}
                  </Text>
                </Link>
                <Text className="text-muted">
                  {post.archived ? ' (arhivirana)' : ''}
                </Text>
              </div>
              {/* Edit icon to the right */}
              <Edit
                size={20}
                onClick={() => {
                  setSelectedPost(post);
                  onOpen();
                }}
              />
            </div>
            <Text className="text-muted">{post.category}</Text>
          </CardHeader>
          <CardBody>
            <Text className="text-truncate">{post.content}</Text>
          </CardBody>
          <CardFooter>
            <div className="d-flex justify-content-end align-items-center">
              {post.archived ? (
                <ArchiveXIcon
                  size={25}
                  onClick={() => {
                    handleUnArchivePost(post._id);
                  }}
                />
              ) : (
                <ArchiveIcon
                  size={25}
                  onClick={() => {
                    handleArchivePost(post._id);
                  }}
                />
              )}
              <Trash2
                size={25}
                onClick={() => {
                  handleDeletePost(post._id);
                }}
              />
            </div>
          </CardFooter>
        </Card>
      ))}
      <AddPostModal
        isOpen={isOpen}
        onClose={onClose}
        onPostAdded={() => loadPosts()}
        post={selectedPost}
      />
    </div>
  );
}
