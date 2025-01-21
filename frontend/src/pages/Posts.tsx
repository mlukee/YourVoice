import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Container,
  Heading,
  Input,
  Button,
  Spinner,
  Text,
  VStack,
  HStack,
  Flex,
  Image,
  Badge,
  IconButton,
  useDisclosure,
  Divider,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import {
  ArchiveIcon,
  SquarePen,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  ThumbsUp,
  Heart,
  Flame,
} from 'lucide-react';

import { UserContext } from '../userContext';
import AddPostModal from '../components/AddPostModal';
import { Post } from '../interfaces/Post';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

type ReactionType = 'like' | 'heart' | 'fire';

const Posts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [originalPosts, setOriginalPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null); // Track selected post for editing
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useContext(UserContext);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');

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
      setOriginalPosts(data);
    } catch (error) {
      console.error('Napaka pri pridobivanju objav:', error);
    } finally {
      setLoading(false); // Ensure loading state is always updated
    }
  };

  const handleUpvote = async (postId: string) => {
    if (!user) {
      toast({
        title: 'Napaka: Uporabnik ni prijavljen.',
        status: 'error',
      });
      return;
    }
  
    try {
      const response = await fetch(
        `http://localhost:3000/post/${postId}/upvote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user._id }), // Include user ID in the request body
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Napaka pri glasovanju');
      }
  
      const updatedPost = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? updatedPost : post
        )
      );
    } catch (error) {
      toast({
        title: 'Napaka pri glasovanju',
        status: 'error',
      });
      console.error(error);
    }
  };

  const handleDownvote = async (postId: string) => {
    if (!user) {
      toast({
        title: 'Napaka: Uporabnik ni prijavljen.',
        status: 'error',
      });
      return;
    }
  
    try {
      const response = await fetch(
        `http://localhost:3000/post/${postId}/downvote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user._id }), // Include user ID in the request body
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Napaka pri glasovanju');
      }
  
      const updatedPost = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? updatedPost : post
        )
      );
    } catch (error) {
      toast({
        title: 'Napaka pri glasovanju',
        status: 'error',
      });
      console.error(error);
    }
  };
  
  const handleReaction = async (
    event: React.MouseEvent<HTMLButtonElement>,
    postId: string,
    reaction: ReactionType
  ) => {
    event.preventDefault();
    if (!user) {
      toast({
        title: 'Napaka: Uporabnik ni prijavljen.',
        status: 'error',
      });
      return;
    }
  
    const post = posts.find((p) => p._id === postId);
    if (!post) return;
  
    const hasReacted = post.reactions[reaction].includes(user._id);
  
    try {
      const response = await fetch(
        `http://localhost:3000/post/${postId}/reaction`,
        {
          method: hasReacted ? 'DELETE' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user._id, reaction }), // Include user ID and reaction in the request body
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Napaka pri upravljanju reakcije');
      }
  
      const updatedPost = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? updatedPost : post
        )
      );
    } catch (error) {
      toast({
        title: 'Napaka pri upravljanju reakcije',
        status: 'error',
      });
      console.error(error);
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
    setSelectedPost(null);
  };

  const filterPosts = (search: string) => {
    if (search === '') {
      setPosts(originalPosts);
      return;
    }

    const normalizedSearch = search.toLowerCase();

    const filteredPosts = posts.filter((post) => {
      const titleMatches = post.title.toLowerCase().includes(normalizedSearch);
      const categoryMatches = post.category
        ? post.category.toLowerCase().includes(normalizedSearch)
        : false;
      const authorMatches = post.userId?.username
        ? post.userId.username.toLowerCase().includes(normalizedSearch)
        : false;

      return titleMatches || categoryMatches || authorMatches;
    });

    setPosts(filteredPosts);
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
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="2xl" textAlign="center">
          Forum - Objave
        </Heading>

        <HStack>
          <Input
            placeholder="Poišči objavo..."
            onChange={(e) => filterPosts(e.target.value)}
            flex={1}
          />
          {user && (
            <Button onClick={onOpen} colorScheme="blue">
              Dodaj novo objavo
            </Button>
          )}
        </HStack>

        {loading ? (
          <Flex justify="center" align="center" minH="50vh">
            <Spinner size="xl" />
          </Flex>
        ) : posts.length === 0 ? (
          <Text fontSize="xl" color="gray.500" textAlign="center" mt={8}>
            Trenutno ni nobenih objav.
          </Text>
        ) : (
          <VStack spacing={6} align="stretch">
            {posts.map((post) => (
              <Box
                key={post._id}
                p={6}
                shadow="md"
                borderWidth="1px"
                borderRadius="lg"
                bg={bgColor}
                borderColor={borderColor}
                _hover={{ bg: hoverBgColor }}
                transition="all 0.2s"
              >
                <Flex>
                  <VStack mr={4} align="center" minW="60px">
                    <IconButton
                      aria-label="Upvote"
                      icon={<ArrowUp size={15} />}
                      onClick={() => handleUpvote(post._id)}
                      colorScheme={
                        post.upvotedBy?.includes(user?._id!) ? 'green' : 'gray'
                      }
                      size="sm"
                    />
                    <Text fontWeight="bold">
                      {post.upvotes - post.downvotes}
                    </Text>
                    <IconButton
                      aria-label="Downvote"
                      icon={<ArrowDown size={15} />}
                      onClick={() => handleDownvote(post._id)}
                      colorScheme={
                        post.downvotedBy?.includes(user?._id!) ? 'red' : 'gray'
                      }
                      size="sm"
                    />
                  </VStack>
                  <VStack align="start" flex={1} spacing={3}>
                    <Heading fontSize="xl">{post.title}</Heading>
                    {post.image && (
                      <Image
                        src={`data:image/jpeg;base64,${post.image}`}
                        alt={post.title}
                        borderRadius="md"
                        maxH="200px"
                        objectFit="cover"
                      />
                    )}
                    <HStack wrap="wrap" spacing={2}>
                      {getCategories(post.category).map((category: string) => (
                        <Link
                          to={`/category/${encodeURIComponent(category)}`}
                          key={category}
                        >
                          <Badge colorScheme="blue">{category}</Badge>
                        </Link>
                      ))}
                    </HStack>
                    <Flex align="center" width="100%">
                      <Image
                        src={post?.userId?.avatar || '/avatars/hacker.png'}
                        boxSize="30px"
                        borderRadius="full"
                        mr={2}
                      />
                      <Text fontSize="sm" color="gray.500">
                        {post?.userId?.username || 'Neznan uporabnik'}
                      </Text>
                      <Text fontSize="sm" color="gray.500" ml="auto">
                        {dayjs(post.createdAt).fromNow()}
                      </Text>
                    </Flex>
                    <Divider />
                    <HStack justify="space-between" width="100%">
                      <Link to={`/posts/${post._id}`}>
                        <Button
                          leftIcon={<MessageSquare />}
                          colorScheme="teal"
                          size="sm"
                        >
                          Preberi več
                        </Button>
                      </Link>
                      {user &&
                        post.userId &&
                        (post.userId._id === user._id ||
                          user.role === 'admin') && (
                          <HStack>
                            <IconButton
                              aria-label="Edit post"
                              icon={<SquarePen />}
                              onClick={() => handleEditPost(post)}
                              colorScheme="green"
                              size="sm"
                            />
                            <IconButton
                              aria-label="Archive post"
                              icon={<ArchiveIcon />}
                              onClick={() => handleArchivePost(post._id)}
                              colorScheme="red"
                              size="sm"
                            />
                          </HStack>
                        )}
                    </HStack>
                    <HStack mt={4}>
                      <IconButton
                        aria-label="Like"
                        icon={<ThumbsUp />}
                        onClick={(e) => handleReaction(e, post._id, 'like')}
                        colorScheme={
                          post.reactions?.like.includes(user?._id!)
                            ? 'blue'
                            : 'gray'
                        }
                        size="sm"
                      />
                      <Text>{post.reactions?.like.length || 0}</Text>
                      <IconButton
                        aria-label="Heart"
                        icon={<Heart />}
                        onClick={(e) => handleReaction(e, post._id, 'heart')}
                        colorScheme={
                          post.reactions?.heart.includes(user?._id!)
                            ? 'pink'
                            : 'gray'
                        }
                        size="sm"
                      />
                      <Text>{post.reactions?.heart.length || 0}</Text>
                      <IconButton
                        type="submit"
                        aria-label="Fire"
                        icon={<Flame />}
                        onClick={(e) => handleReaction(e, post._id, 'fire')}
                        colorScheme={
                          post.reactions?.fire.includes(user?._id!)
                            ? 'orange'
                            : 'gray'
                        }
                        size="sm"
                      />
                      <Text>{post.reactions?.fire.length || 0}</Text>
                    </HStack>
                  </VStack>
                </Flex>
              </Box>
            ))}
          </VStack>
        )}
      </VStack>

      <AddPostModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setSelectedPost(null);
        }}
        onPostAdded={handlePostAdded}
        post={selectedPost}
      />
    </Container>
  );
};
export default Posts;
