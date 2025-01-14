import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Heading,
  Image,
  Text,
  VStack,
  HStack,
  IconButton,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
  Input,
  Badge,
  Avatar,
  useToast,
} from '@chakra-ui/react';
import { UserContext } from '../userContext';
import {
  PlusIcon,
  ArrowDownLeft,
  Trash2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface User {
  username: string;
  avatar: string;
  _id: string;
}

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  userId: User;
  upvotes: number;
  downvotes: number;
  upvotedBy?: string[];
  downvotedBy?: string[];
  image?: string; // Add the image property
}

interface Post {
  title: string;
  content: string;
  category: string;
  createdAt: string;
  userId?: User;
  comments?: Comment[];
  image?: string; // Add the image property
}

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [commentImage, setCommentImage] = useState<File | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const toast = useToast();
  const [comments, setComments] = useState<Comment[]>([]);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const {
    isOpen: isImageOpen,
    onOpen: onImageOpen,
    onClose: onImageClose,
  } = useDisclosure();

  // Ustvarite ref za textarea
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const fetchPost = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/post/${id}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setPost(data);

      // Fetch sorted comments
      const commentsResponse = await fetch(
        `http://localhost:3000/post/${id}/comments`
      );
      if (!commentsResponse.ok) {
        throw new Error('Network response was not ok');
      }
      const commentsData = await commentsResponse.json();
      setComments(commentsData);
    } catch (error) {
      console.error('Napaka pri pridobivanju objave:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleCommentSubmit = async () => {
    if (newComment.trim() === '') {
      toast({
        title: 'Komentar ne more biti prazen.',
        status: 'warning',
      });
      return;
    }

    if (!user) {
      alert('Prijavite se za dodajanje komentarja.');
      return;
    }

    const formData = new FormData();
    formData.append('content', newComment);
    formData.append('userId', user._id);
    if (commentImage) {
      formData.append('image', commentImage);
    }

    try {
      const response = await fetch(`http://localhost:3000/post/${id}/comment`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Napaka pri dodajanju komentarja');
      }

      setNewComment('');
      setCommentImage(null);
      onClose();

      fetchPost();

      toast({
        title: 'Komentar dodan',
        status: 'success',
      });
    } catch (error) {
      toast({
        title: 'Napaka pri dodajanju komentarja',
        status: 'error',
      });
      console.error(error);
    }
  };

  const handleCommentUpvote = async (commentId: string) => {
    if (!user) {
      toast({
        title: 'Napaka: Uporabnik ni prijavljen.',
        status: 'error',
      });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/post/${id}/comment/${commentId}/upvote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user._id }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Napaka pri glasovanju');
      }

      fetchPost();
    } catch (error) {
      toast({
        title: 'Napaka pri glasovanju',
        status: 'error',
      });
      console.error(error);
    }
  };

  const handleCommentDownvote = async (commentId: string) => {
    if (!user) {
      toast({
        title: 'Napaka: Uporabnik ni prijavljen.',
        status: 'error',
      });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/post/${id}/comment/${commentId}/downvote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user._id }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Napaka pri glasovanju');
      }

      fetchPost();
    } catch (error) {
      toast({
        title: 'Napaka pri glasovanju',
        status: 'error',
      });
      console.error(error);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!user) {
      toast({
        title: 'Prijavite se za brisanje komentarja.',
        status: 'warning',
      });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/post/${id}/comment/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // Assuming the API may return an error message, use it if available
        throw new Error(errorData.message || 'Napaka pri brisanju komentarja');
      }

      toast({
        title: 'Komentar je bil uspešno izbrisan.',
        status: 'success',
      });

      // Reload the post and its comments after deletion
      fetchPost(); // You could add a loading indicator here to improve UX
    } catch (error: any) {
      console.error('Napaka pri brisanju komentarja:', error);

      toast({
        title: error.message || 'Napaka pri brisanju komentarja.',
        status: 'error',
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCommentImage(e.target.files[0]);
    }
  };

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
    onImageOpen();
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Button
        leftIcon={<ArrowDownLeft />}
        onClick={() => navigate('/posts')}
        colorScheme="teal"
        mb={6}
      >
        Back to Posts
      </Button>
      {loading ? (
        <Flex justify="center" align="center" minH="50vh">
          <Spinner size="xl" color="teal.500" />
        </Flex>
      ) : post ? (
        <Box
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          boxShadow="lg"
          bg="white"
        >
          <Box p={6}>
            <Heading as="h2" size="xl" mb={4} color="teal.600">
              {post.title}
            </Heading>
            <Flex justify="space-between" align="center" mb={6}>
              <HStack spacing={4}>
                <Badge colorScheme="teal">{post.category}</Badge>
                <Text color="gray.500" fontSize="sm">
                  {new Date(post.createdAt).toLocaleDateString()}
                </Text>
              </HStack>
              <HStack>
                <Avatar
                  size="sm"
                  name={post.userId?.username || 'Unknown User'}
                  src={post?.userId?.avatar || '/avatars/hacker.png'}
                />
                <Text color="gray.500" fontSize="sm">
                  {post.userId?.username || 'Unknown User'}
                </Text>
              </HStack>
            </Flex>
            {post.image && (
              <Box mb={6}>
                <Image
                  src={`data:image/jpeg;base64,${post.image}`}
                  alt={post.title}
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => handleImageClick(post.image!)}
                  mx="auto"
                />
              </Box>
            )}
            <Text fontSize="md" lineHeight="tall" color="gray.700">
              {post.content}
            </Text>
          </Box>
          <Divider />
          <Box p={6}>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading as="h3" size="md">
                Comments
              </Heading>
              <Button
                leftIcon={<PlusIcon />}
                colorScheme="teal"
                onClick={onOpen}
              >
                Dodaj komentar
              </Button>
            </Flex>
            {comments.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {comments.map((comment) => (
                  <Box
                    key={comment._id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    bg="gray.50"
                  >
                    <Flex justify="space-between" align="center" mb={2}>
                      <HStack>
                        <Avatar size="sm" name={comment.userId.username} />
                        <Text fontWeight="bold">{comment.userId.username}</Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </Text>
                    </Flex>
                    {comment.image && (
                      <Image
                        src={`data:image/jpeg;base64,${comment.image}`}
                        alt="Comment Image"
                        borderRadius="md"
                        maxH="200px"
                        cursor="pointer"
                        onClick={() => handleImageClick(comment.image!)}
                        my={2}
                      />
                    )}
                    <Text mb={2}>{comment.content}</Text>
                    <Flex justify="space-between" align="center">
                      <HStack>
                        <IconButton
                          aria-label="Upvote"
                          icon={<ArrowUp />}
                          onClick={() => handleCommentUpvote(comment._id)}
                          colorScheme={
                            comment.upvotedBy?.includes(user?._id!)
                              ? 'green'
                              : 'gray'
                          }
                          size="sm"
                        />
                        <Text>{comment.upvotes}</Text>
                        <IconButton
                          aria-label="Downvote"
                          icon={<ArrowDown />}
                          onClick={() => handleCommentDownvote(comment._id)}
                          colorScheme={
                            comment.downvotedBy?.includes(user?._id!)
                              ? 'red'
                              : 'gray'
                          }
                          size="sm"
                        />
                        <Text>{comment.downvotes}</Text>
                      </HStack>
                      {(user?._id === comment.userId._id ||
                        user?._id === post.userId?._id ||
                        user?.role === 'admin') && (
                        <IconButton
                          aria-label="Delete comment"
                          icon={<Trash2 />}
                          colorScheme="red"
                          size="sm"
                          onClick={() => handleCommentDelete(comment._id)}
                        />
                      )}
                    </Flex>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Text color="gray.500">
                Ni komentarjev. Bodite prvi, ki komentirate!
              </Text>
            )}
          </Box>
        </Box>
      ) : (
        <Box textAlign="center" p={8}>
          <Heading as="h2" size="xl" color="red.500">
            Objava ni najdena
          </Heading>
        </Box>
      )}

      <Modal isOpen={isImageOpen} onClose={onImageClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            {selectedImage && (
              <Image
                src={`data:image/jpeg;base64,${selectedImage}`}
                alt="Selected Image"
                borderRadius="md"
                width="100%"
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={textareaRef}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Comment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea
              ref={textareaRef}
              placeholder="Enter your comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              mt={4}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleCommentSubmit}>
              Post
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default PostDetail;
