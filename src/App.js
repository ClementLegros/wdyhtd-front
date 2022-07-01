import React, { useCallback } from 'react';
import UsersDataService from './Services/Users.service';
import NoteDataService from './Services/Note.service';
import {
  ChakraProvider,
  Box,
  Text,
  Grid,
  theme,
  Input,
  Button,
  Center,
  Heading,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Tooltip,
} from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';

function App() {
  const [notes, setNotes] = React.useState([]);
  const [connected, setConnected] = React.useState(false);
  const [user, setUser] = React.useState(null);

  //we need to create ref for the input
  const inputTitle = React.createRef();
  const inputContent = React.createRef();
  const inputUsername = React.createRef();
  const inputPassword = React.createRef();

  const getNote = useCallback(() => {
    NoteDataService.getNoteFromUser(user)
      .then(response => {
        setNotes(response.data);
      })
      .catch(err => {
        console.log(err);
      });
  }, [user]);


  React.useEffect(() => {
    //Check if there are a connection in the localstorage
    if (localStorage.getItem('connection')) {
      setConnected(true);

      //retrieve the user from the localstorage
      setUser(JSON.parse(localStorage.getItem('user')));
      getNote();
      //Get all the note from the user
    }
  }, [getNote]);

  React.useEffect(() => {
    if (connected) {
      getNote();
    }
  }, [connected, getNote]);

  
  function addNote() {
    //get title and content from ref
    const title = inputTitle.current.value;
    const content = inputContent.current.value;

    if (!title && !content) {
      return;
    }

    //Saving the note in the database
    NoteDataService.createNote(user, title, content);

    var newNote = {
      title: title,
      content: content,
    };

    notes.push(newNote);
    setNotes(notes);
    localStorage.setItem('notes', JSON.stringify(notes));
    onNoteClose();
  }

  function removeNote(note) {
    setNotes(notes.filter(n => n !== note));
    localStorage.setItem(
      'notes',
      JSON.stringify(notes.filter(n => n !== note))
    );
    //Delete the note in the database
    NoteDataService.deleteNote(note.id);
  }

  function testCredentials() {
    const username = inputUsername.current.value;
    const password = inputPassword.current.value;

    UsersDataService.testUserLogin(username, password)
      .then(response => {
        if (response.data.message === 'User found') {
          setConnected(true);
          setUser(response.data.user);
          //save these information to local storage
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('connected', true);
          onLoginClose();
          return;
        }
        alert('User not found');
      })
      .catch(error => {
        console.log(error);
      });
  }

  function disconnect() {
    setConnected(false);
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('connected');
    setNotes([]);
  }

  const {
    isOpen: isNoteOpen,
    onOpen: onNoteOpen,
    onClose: onNoteClose,
  } = useDisclosure();

  const {
    isOpen: isLoginOpen,
    onOpen: onLoginOpen,
    onClose: onLoginClose,
  } = useDisclosure();

  const initialRef = React.useRef(null);
  const finalRef = React.useRef(null);

  return (
    <ChakraProvider theme={theme}>
      <>
        <Modal
          initialFocusRef={initialRef}
          finalFocusRef={finalRef}
          isOpen={isNoteOpen}
          onClose={onNoteClose}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add a note</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input
                  ref={inputTitle}
                  placeholder="ex: Make dinner"
                  id="title"
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Content</FormLabel>
                <Textarea
                  placeholder="ex: prepare all the tools"
                  id="content"
                  ref={inputContent}
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button
                onClick={addNote}
                form="formAddNote"
                colorScheme="blue"
                mr={3}
              >
                Save
              </Button>
              <Button onClick={onNoteClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
      <>
        <Modal
          initialFocusRef={initialRef}
          finalFocusRef={finalRef}
          isOpen={isLoginOpen}
          onClose={onLoginClose}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Login</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl>
                <FormLabel>Username</FormLabel>
                <Input
                  ref={inputUsername}
                  placeholder="username"
                  id="username"
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Password</FormLabel>
                <Input
                  placeholder="********"
                  type={'password'}
                  id="password"
                  ref={inputPassword}
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button
                onClick={testCredentials}
                form="formLogin"
                colorScheme="blue"
                mr={3}
              >
                Save
              </Button>
              <Button onClick={onLoginClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
      <Box textAlign="center" fontSize="xl">
        <Flex justifyContent={'space-between'}>
          <ColorModeSwitcher />
          {connected ? (
            <>
              <Tooltip label="Logout" placement="bottom">
                <Button onClick={disconnect} variant="ghost" colorScheme="blue">
                  Logout
                </Button>
              </Tooltip>
            </>
          ) : (
            <Tooltip label="Login" placement="bottom">
              <Button onClick={onLoginOpen} variant="ghost" colorScheme="blue">
                Login
              </Button>
            </Tooltip>
          )}
        </Flex>
        <Box alignItems={'center'} textAlign="center" fontSize="xl">
          <Heading marginBottom={4}>What do you have to do ?</Heading>
          <Button onClick={onNoteOpen} colorScheme={'twitter'}>
            Or do you want to add a note ?
          </Button>
        </Box>
      </Box>
      <Box>
        <Center>
          <Grid
            templateColumns={[
              'repeat(1, 1fr)',
              'repeat(2, 1fr)',
              'repeat(3, 1fr)',
              'repeat(4, 1fr)',
            ]}
            gap={2}
          >
            {notes.map((note, index) => (
              <Box
                position={'relative'}
                p={3}
                marginTop={'5'}
                marginBottom={'5'}
                borderColor="blackAlpha.100"
                borderRadius={'lg'}
                bg="whiteAlpha.200"
                shadow={'xl'}
                height={'auto'}
                width={'56'}
                key={index}
              >
                <Button
                  width={1}
                  height={5}
                  position={'absolute'}
                  top={0}
                  right={0}
                  onClick={() => removeNote(note)}
                  colorScheme={'red'}
                >
                  X
                </Button>
                <Heading marginBottom={1} marginTop={'2'} fontSize={'lg'}>
                  {note.title}
                </Heading>
                <Text>{note.content}</Text>
              </Box>
            ))}
          </Grid>
        </Center>
      </Box>
    </ChakraProvider>
  );
}

export default App;
