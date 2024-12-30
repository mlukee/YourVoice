import React, { useState, useRef, useContext, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { UserContext } from '../userContext';
import { Post } from '../interfaces/Post';
import { MultiSelect, Option } from 'chakra-multiselect';

interface AddPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostAdded: () => void;
  post: Post | null;
}

const predefinedOptions = [
  { label: 'r/Reddit', value: 'r/reddit' },
  { label: 'r/Cars', value: 'r/cars' },
  { label: 'r/SLovenia', value: 'r/slovenia' },
  { label: 'r/React', value: 'r/react' },
  { label: 'r/JavaScript', value: 'r/javascript' },
  { label: 'r/Programming', value: 'r/programming' },
  { label: 'r/Python', value: 'r/python' },
  { label: 'r/Java', value: 'r/java' },
  { label: 'r/Node.js', value: 'r/node.js' },
  { label: 'r/TypeScript', value: 'r/typescript' },
];

const AddPostModal: React.FC<AddPostModalProps> = ({
  isOpen,
  onClose,
  onPostAdded,
  post,
}) => {
  const { user } = useContext(UserContext); // Get the currently logged-in user
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [options, setOptions] = useState<
    { label: string; value: string | number }[]
  >([]);
  const [selectedCategories, setSelectedCategories] = useState<
    { label: string; value: string | number }[]
  >([]);
  const [image, setImage] = useState<File | null>(null);

  const toast = useToast();
  const titleInputRef = useRef<HTMLInputElement>(null);

  const getCategories = (
    categories: string
  ): { label: string; value: string }[] => {
    return categories.split(',').map((category) => ({
      label: category.trim(),
      value: category.trim().toLocaleLowerCase(),
    }));
  };
  useEffect(() => {
    const parsedCategories = post ? getCategories(post.category) : [];
    setTitle(post?.title || '');
    setContent(post?.content || '');
    setCategory(post?.category || '');
    setOptions(predefinedOptions.concat(parsedCategories));
    setSelectedCategories(parsedCategories);
  }, [post]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: 'Napaka: Uporabnik ni prijavljen.', status: 'error' });
      return;
    }

    let categoryOptionsString = '';
    if (selectedCategories.length > 0) {
      categoryOptionsString = selectedCategories
        .map((option) => option.label)
        .join(', ');
      alert(categoryOptionsString);
      setCategory(categoryOptionsString);
    }

    if (!title || !content || !category) {
      toast({ title: 'Vsa polja morajo biti izpolnjena.', status: 'error' });
      return;
    }

    const url = post
      ? `http://localhost:3000/post/${post._id}`
      : 'http://localhost:3000/post';
    const method = post ? 'PUT' : 'POST';

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', categoryOptionsString);
    formData.append('userId', user!._id); // Include userId
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Network response was not ok');
      }

      toast({
        title: post ? 'Objava uspešno posodobljena!' : 'Objava uspešno dodana!',
        status: 'success',
      });

      setTitle('');
      setContent('');
      setCategory('');
      setOptions([]);
      setImage(null);
      setSelectedCategories([]);

      if (onPostAdded) onPostAdded();
      if (onClose) onClose();
    } catch (error) {
      toast({
        title: 'Napaka pri dodajanju/posodabljanju objave.',
        status: 'error',
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={titleInputRef}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{post ? 'Uredi objavo' : 'Dodaj novo objavo'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl mb={4}>
            <FormLabel>Naslov</FormLabel>
            <Input
              ref={titleInputRef}
              placeholder="Vnesite naslov"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Kategorije</FormLabel>
            <MultiSelect
              value={selectedCategories.length > 0 ? selectedCategories : []}
              options={options}
              placeholder="Select or create ..."
              searchPlaceholder="Search or create ..."
              create
              onChange={(
                value: Option | Option[],
                change?: { action: string; value: any }
              ) => {
                if (Array.isArray(value)) {
                  switch (change?.action) {
                    case 'multiCreate':
                      setSelectedCategories((prevCategories) => [
                        ...prevCategories,
                        {
                          label: change.value.label,
                          value: change.value.value,
                        },
                      ]);
                      break;

                    case 'multiSelect':
                      setSelectedCategories((prevCategories) => [
                        ...prevCategories,
                        {
                          label: change.value.label,
                          value: change.value.value,
                        },
                      ]);
                      break;

                    case 'multiRemove':
                      setSelectedCategories(value);
                      break;
                    case 'multiClear':
                      setSelectedCategories([]);
                      break;

                    default:
                      break;
                  }

                  const categoryOptionsString = value
                    .map((option) => option.label)
                    .join(', ');
                  setCategory(categoryOptionsString);
                } else {
                  alert(value.value);
                  setSelectedCategories([value]);
                }
              }}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Vsebina</FormLabel>
            <Textarea
              placeholder="Vnesite vsebino"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Slika</FormLabel>
            <Input type="file" accept="image/*" onChange={handleImageChange} />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSubmit} mr={3}>
            {post ? 'Shrani' : 'Dodaj'}
          </Button>
          <Button onClick={onClose}>Prekliči</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddPostModal;
