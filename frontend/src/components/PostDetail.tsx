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
  Heading,
  Text,
  Spinner,
  Button,
  Divider,
  Flex,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure,
  useToast,
  Image,
  Input,
} from '@chakra-ui/react';
import { UserContext } from '../userContext';
import { PlusIcon } from 'lucide-react';

interface User {
  username: string;
  _id: string;
}

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  userId: User;
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

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { isOpen: isImageOpen, onOpen: onImageOpen, onClose: onImageClose } = useDisclosure();

  // Ustvarite ref za textarea
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const fetchPost = useCallback(() => {
    setLoading(true);
    fetch(`http://localhost:3000/post/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Napaka pri pridobivanju objave:', error);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleCommentSubmit = async () => {
    // Check if the comment is empty
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
    <Box
      p={8}
      maxW="container.md"
      mx="auto"
      borderWidth="1px"
      borderRadius="lg"
      shadow="lg"
    >
      <Button onClick={() => navigate('/posts')} colorScheme="teal" mb={6}>
        Nazaj na objave
      </Button>
      {loading ? (
        <Spinner size="xl" />
      ) : post ? (
        <>
          <Heading as="h2" size="xl" mb={4} textAlign="center" color="teal.600">
            {post.title}
          </Heading>
          <Divider mb={4} />
          <Flex justify="space-between" color="gray.500" fontSize="sm" mb={6}>
            <Text>
              Kategorija: <strong>{post.category}</strong>
            </Text>
            <Text>
              Datum: <b>{new Date(post.createdAt).toLocaleDateString()}</b>
            </Text>
          </Flex>
          <Text color="gray.500" fontSize="sm" mb={4}>
            Avtor:{' '}
            <strong>{post.userId?.username || 'Neznan uporabnik'}</strong>
          </Text>
          {/* Display image if it exists */}
          {post.image && (
            <Flex justifyContent="center" alignItems="center">
              <Image
                src={`data:image/jpeg;base64,${post.image}`}
                alt={post.title}
                mt={4}
                mb={4}
                borderRadius="md"
                cursor="pointer"
                onClick={() => handleImageClick(post.image!)}
              />
            </Flex>
          )}
          <Text fontSize="md" lineHeight="tall" mt={4} color="gray.700">
            {post.content}
          </Text>
          <Divider my={6} />
          <div className="d-flex flex-row align-items-center justify-content-between">
            <Heading as="h3" size="md" mb={4}>
              Komentarji
            </Heading>
            <Button mb={4} colorScheme="teal" onClick={onOpen}>
              <PlusIcon size={20} className="mr-2" />
              Dodaj komentar
            </Button>
          </div>

          {post.comments && post.comments.length > 0 ? (
            <VStack spacing={4} align="start">
              {post.comments
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((comment) => (
                  <Box
                    key={comment._id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    w="full"
                  >
                    <Text fontSize="sm" color="gray.500">
                      {comment.userId.username} -{' '}
                      {new Date(comment.createdAt).toLocaleString()}
                    </Text>
                    {/* Display comment image if it exists */}
                    {comment.image && (
                      <Flex justifyContent="center" alignItems="center">
                        <Image
                          src={`data:image/jpeg;base64,${comment.image}`}
                          alt="Comment Image"
                          mt={4}
                          mb={4}
                          borderRadius="md"
                          boxSize="150px"
                          cursor="pointer"
                          onClick={() => handleImageClick(comment.image!)}
                        />
                      </Flex>
                    )}
                    <Text>{comment.content}</Text>
                    {(user?._id === comment.userId._id ||
                      user?._id === post.userId?._id) && (
                      <Button
                        colorScheme="red"
                        size="sm"
                        mt={2}
                        onClick={() => handleCommentDelete(comment._id)}
                      >
                        Izbriši
                      </Button>
                    )}
                  </Box>
                ))}
            </VStack>
          ) : (
            <Text color="gray.500">
              Ni komentarjev. Bodite prvi, ki komentirate!
            </Text>
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

          <Modal
            isOpen={isOpen}
            onClose={onClose}
            initialFocusRef={textareaRef}
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Dodaj komentar</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Textarea
                  ref={textareaRef} // Povezava referenc
                  placeholder="Vnesite svoj komentar..."
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
                <Button colorScheme="teal" onClick={handleCommentSubmit}>
                  Objavi
                </Button>
                <Button onClick={onClose} ml={3}>
                  Prekliči
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      ) : (
        <Text color="red.500">Objava ni najdena.</Text>
      )}
    </Box>
  );
};

export default PostDetail;