import React, {useContext, useEffect, useState} from 'react';
import {
    Box,
    Heading,
    Text,
    Button,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    VStack,
    Image,
} from '@chakra-ui/react';
import { UserContext } from '../userContext';
import { useNavigate } from 'react-router-dom';
import UserArchivedPosts from '../components/UserPosts';

const Profile: React.FC = () => {
  const { user, setUserContext  } = useContext(UserContext);
  const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            if (!user?._id) return;
            try {
                const response = await fetch(`http://localhost:3000/user/${user._id}`);
                if (!response.ok) throw new Error('Failed to fetch user data.');
                const updatedUser = await response.json();
                setUserContext(updatedUser); // Posodobi UserContext
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUser();
    }, [user?._id]);

  if (!user) {
    return (
      <Box p={6} textAlign="center">
        <Heading as="h2" size="xl" mb={6}>
          Profil uporabnika
        </Heading>
        <Text>Za ogled profila se morate prijaviti.</Text>
        <Button mt={4} colorScheme="teal" onClick={() => navigate('/login')}>
          Prijava
        </Button>
      </Box>
    );
  }

  return (
    <Box p={6} maxW="container.md" mx="auto">
      <Heading as="h2" size="xl" mb={6} textAlign="center">
        Profil uporabnika
      </Heading>
      <Tabs isFitted variant="enclosed">
        <TabList mb="1em">
          <Tab>Osnovne informacije</Tab>
          <Tab>Moje objave</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <VStack spacing={4} align="stretch">
                <Box textAlign="center">
                    <Text fontSize="lg" fontWeight="bold">
                        Avatar:
                    </Text>
                    <Image
                        src={user.avatar}
                        alt="User Avatar"
                        boxSize="200px"
                        borderRadius="full"
                        mx="auto"
                        border="2px solid teal"
                    />
                </Box>
              <Box>
                <Text fontSize="lg" fontWeight="bold">
                  Ime:
                </Text>
                <Text fontSize="md">{user.username}</Text>
              </Box>
              <Box>
                <Text fontSize="lg" fontWeight="bold">
                  E-pošta:
                </Text>
                <Text fontSize="md">{user.email}</Text>
              </Box>
                <Box>
                    <Text fontSize="lg" fontWeight="bold">
                        Bio
                    </Text>
                    <Text fontSize="md">{user.bio}</Text>
                </Box>
              <Box>
                <Text fontSize="lg" fontWeight="bold">
                  Datum registracije:
                </Text>
                <Text fontSize="md">
                  {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </Box>
            </VStack>
          </TabPanel>
          <TabPanel>
            <UserArchivedPosts />
          </TabPanel>
        </TabPanels>
      </Tabs>
        <Box mt={6} display="flex" justifyContent="space-between">
            <Button colorScheme="teal" onClick={() => navigate('/')}>
                Domov
            </Button>
            <Button colorScheme="blue" onClick={() => navigate('/edit-profile')}>
                Uredi profil
            </Button>
        </Box>
    </Box>
  );
};

export default Profile;
