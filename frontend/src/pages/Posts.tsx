import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Heading,
  Button,
  Stack,
  Text,
  Spinner,
  useDisclosure,
  useToast,
    Image,
} from '@chakra-ui/react';
import { UserContext } from '../userContext';
import AddPostModal from '../components/AddPostModal';
import { Post } from '../interfaces/Post';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

const Posts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null); // Track selected post for editing
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useContext(UserContext);
  const toast = useToast();

  dayjs.extend(relativeTime);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/post');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Napaka pri pridobivanju objav:', error);
    } finally {
      setLoading(false); // Poskrbi, da se `setLoading` vedno pokliče
    }
  };

  const getCategories = (categories: string): string[] => {
    return categories.split(',').map((category) => category.trim());
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handlePostAdded = () => {
    loadPosts();
    setSelectedPost(null); // Reset selected post after adding
  };

  const handleEditPost = (post: Post) => {
    setSelectedPost(post); // Set the selected post for editing
    onOpen(); // Open the modal
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


  return (
    <Box p={6} maxW="container.lg" mx="auto">
      <Heading as="h2" size="xl" mb={6} textAlign="center">
        Forum - Objave
      </Heading>
      {user && (
        <Button onClick={onOpen} colorScheme="blue" mb={6}>
          Dodaj novo objavo
        </Button>
      )}
      {loading ? (
        <Spinner size="xl" />
      ) : posts.length === 0 ? (
        <Text fontSize="lg" color="gray.500" textAlign="center" mt={8}>
          Trenutno ni nobenih objav.
        </Text>
      ) : (
        <Stack spacing={6}>
          {posts.map((post) => (
            <Box
              key={post._id}
              p={5}
              shadow="md"
              borderWidth="1px"
              borderRadius="lg"
              _hover={{ bg: 'gray.50' }}
            >
              <Heading fontSize="xl">{post.title}</Heading>
                {/* Display image if it exists */}
                {post.image && (
                <Image
                  src={`data:image/jpeg;base64,${post.image}`}
                  alt={post.title}
                  mt={4}
                  mb={4}
                  borderRadius="md"
                />
              )}
              {/* Categories */}
              <div className="d-flex gap-1">
                {getCategories(post.category).map((category: string) => (
                  <span key={category} className="badge text-bg-primary">
                    {category}
                  </span>
                ))}
              </div>
              {/* <Text mt={2} fontSize="md" color="gray.600">
                Kategorija: {post.category}
              </Text> */}
              <Box display="flex" alignItems="center" mt={2}>
                {/* Prikaz slike */}
                <Image
                    src={post?.userId?.avatar || '/avatars/hacker.png'}
                    boxSize="100px"
                    borderRadius="full"
                    mr={2} // Razmik desno
                />
                {/* Prikaz avtorjevega imena */}
                <Text fontSize="sm" color="gray.500">
                  Avtor: {post?.userId?.username || 'Neznan uporabnik'}
                </Text>
              </Box>
              <Link to={`/posts/${post._id}`}>
                <Button colorScheme="teal" mt={4}>
                  Preberi več
                </Button>
              </Link>
              <div className="d-flex justify-content-between">
                {user && post.userId && post.userId._id === user._id && (
                  <div className="d-flex align-items-center">
                    <Button
                      colorScheme="green"
                      mr={3}
                      onClick={() => handleEditPost(post)} // Edit post
                    >
                      Uredi
                    </Button>
                    <Button
                      colorScheme="red"
                      onClick={() => handleArchivePost(post._id)} // Delete post
                    >
                      Arhiviraj
                    </Button>
                  </div>
                )}
                <Text mt={4} fontSize="sm" color="gray.500">
                  Posted: {dayjs(post.createdAt).fromNow()}
                </Text>
              </div>
            </Box>
          ))}
        </Stack>
      )}
      <AddPostModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setSelectedPost(null); // Reset selected post when modal closes
        }}
        onPostAdded={handlePostAdded}
        post={selectedPost} // Pass selected post to the modal
      />
    </Box>
  );
};

export default Posts;
