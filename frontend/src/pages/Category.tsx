import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button,
  Heading,
  Image,
  Text,
  Tag,
  Avatar,
  Container,
  VStack,
  HStack,
  Divider,
  useColorModeValue,
  Skeleton,
  Alert,
  AlertIcon,
  LinkBox,
  LinkOverlay,
} from '@chakra-ui/react';
import { Post } from '../interfaces/Post';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function Category() {
  const { category } = useParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const getCategories = (categories: string): string[] => {
    return categories.split(',').map((category) => category.trim());
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (!category) {
          throw new Error('Category not found.');
        }
        const response = await fetch(
          `http://localhost:3000/category/${encodeURIComponent(category)}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch posts.');
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [category]);

  if (loading) {
    return (
      <Container maxW="4xl" py={8}>
        <VStack spacing={8}>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} height="200px" width="100%" />
          ))}
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="4xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          Error: {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="4xl" py={8}>
      <Heading as="h1" size="2xl" mb={8} textAlign="center">
        Posts in Category: {category}
      </Heading>

      {posts.length > 0 ? (
        <VStack spacing={8} align="stretch">
          {posts.map((post) => (
            <LinkBox
              key={post._id}
              as="article"
              p={6}
              shadow="md"
              borderWidth="1px"
              borderRadius="lg"
              bg={bgColor}
              borderColor={borderColor}
              _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
              transition="all 0.2s"
            >
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <HStack>
                    <Avatar
                      size="md"
                      name={post?.userId?.username || 'Unknown User'}
                      src={post?.userId?.avatar || '/avatars/hacker.png'}
                    />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold">
                        {post?.userId?.username || 'Unknown User'}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {dayjs(post.createdAt).fromNow()}
                      </Text>
                    </VStack>
                  </HStack>
                  <HStack>
                    {getCategories(post.category).map((cat: string) => (
                      <Tag key={cat} colorScheme="teal" size="sm">
                        {cat}
                      </Tag>
                    ))}
                  </HStack>
                </HStack>

                <Heading as="h2" size="xl">
                  <LinkOverlay as={Link} to={`/posts/${post._id}`}>
                    {post.title}
                  </LinkOverlay>
                </Heading>

                {post.image && (
                  <Image
                    src={`data:image/jpeg;base64,${post.image}`}
                    alt={post.title}
                    borderRadius="md"
                    objectFit="cover"
                    maxH="300px"
                    w="100%"
                  />
                )}

                <Text noOfLines={3}>{post.content}</Text>

                <Divider />

                <HStack justify="space-between">
                  <Button
                    as={Link}
                    to={`/posts/${post._id}`}
                    colorScheme="teal"
                    size="sm"
                  >
                    Read More
                  </Button>
                  {/* You can add more interactive elements here, like share or bookmark buttons */}
                </HStack>
              </VStack>
            </LinkBox>
          ))}
        </VStack>
      ) : (
        <Alert status="info">
          <AlertIcon />
          No posts found in this category.
        </Alert>
      )}
    </Container>
  );
}
