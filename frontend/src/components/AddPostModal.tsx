import React, { useState, useRef, useContext, useEffect, FC } from 'react';
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
import {
  MultiSelect,
  MultiSelectProps,
  useMultiSelect,
} from 'chakra-multiselect';

interface AddPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostAdded: () => void;
  post: Post | null;
}

const StatefulMultiSelect: FC<
  Omit<MultiSelectProps, 'onChange' | 'value'> &
    Partial<Pick<MultiSelectProps, 'onChange' | 'value'>>
> = ({ onChange: _onChange, value: _value, options: __options, ...props }) => {
  const { value, options, onChange } = useMultiSelect({
    value: _value ?? (props.single ? '' : []),
    options: __options!,
    onChange: _onChange,
  });

  return (
    <MultiSelect
      value={value}
      options={options}
      onChange={onChange}
      {...props}
    />
  );
};

const AddPostModal: React.FC<AddPostModalProps> = ({
  isOpen,
  onClose,
  onPostAdded,
  post,
}) => {
  const { user } = useContext(UserContext); // Get the currently logged-in user
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    []
  );
  const [image, setImage] = useState<File | null>(null);
  const toast = useToast();
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getCategories = (
      categories: string
    ): { label: string; value: string }[] => {
      return categories.split(',').map((category) => ({
        label: category.trim(),
        value: category.trim(),
      }));
    };

    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setCategory(post.category);
      setOptions(getCategories(post.category)); // Initialize options
    } else {
      setTitle('');
      setContent('');
      setCategory('');
      setOptions([]);
    }
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
    if (options.length > 0) {
      categoryOptionsString = options.map((option) => option.value).join(', ');
      setCategory(categoryOptionsString); // Update categoryOptionsString;
    }

    // Preverjanje, če so vsi potrebni podatki prisotni
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

      // Clear form fields
      setTitle('');
      setContent('');
      setCategory('');
      setOptions([]);
      setImage(null);

      // Notify parent components
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      initialFocusRef={titleInputRef} // Set focus on the first input field
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{post ? 'Uredi objavo' : 'Dodaj novo objavo'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl mb={4}>
            <FormLabel>Naslov</FormLabel>
            <Input
              ref={titleInputRef} // Ref for focus
              placeholder="Vnesite naslov"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Kategorija</FormLabel>
            <Input
              placeholder="Vnesite kategorijo"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <StatefulMultiSelect
              options={options}
              label="Choose or create multiple items"
              placeholder="Select or create ..."
              searchPlaceholder="Search or create ..."
              create
              onChange={(newValue) => {
                // Ensure newValue is always treated as an array
                const selectedValues = Array.isArray(newValue)
                  ? newValue
                  : [newValue];

                // Normalize values to ensure 'value' is a string
                const normalizedValues = selectedValues.map((option) => ({
                  label: option.label,
                  value: String(option.value), // Force value to be a string
                }));

                // Update the state
                setOptions(normalizedValues);

                // Extract and join the values for the category
                const selectedCategories = selectedValues
                  .map((option) => option.value)
                  .join(', ');
                setCategory(selectedCategories);
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
