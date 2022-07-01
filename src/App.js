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
  CloseButton,
} from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';

function App() {
  const [notes, setNotes] = React.useState([]);
  const [connected, setConnected] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [register, setRegister] = React.useState(false);
  const [loginError, setLoginError] = React.useState(false);

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
    if (localStorage.getItem('connected')) {
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
        //Throw an error if the user is not found
        setLoginError(true);
      });
  }

  function registerUser() {
    const username = inputUsername.current.value;
    const password = inputPassword.current.value;
    const confirmpassword = inputPassword.current.value;

    if (!username || !password || !confirmpassword) {
      alert('Please fill all the fields');
      return;
    }
    if (password !== confirmpassword) {
      alert('Password does not match');
      return;
    }
    UsersDataService.registerUser(username, password)
      .then(response => {
        setConnected(true);
        setUser(response.data.user);
        onLoginClose();
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

  /*
   * Modal for Note
   */
  const {
    isOpen: isNoteOpen,
    onOpen: onNoteOpen,
    onClose: onNoteClose,
  } = useDisclosure();

  /*
   * Modal for login
   */
  const {
    isOpen: isLoginOpen,
    onOpen: onLoginOpen,
    onClose: onLoginClose,
  } = useDisclosure();

  /*
   * Ref for Modal
   */
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
            {!register ? (
              <ModalHeader>Login</ModalHeader>
            ) : (
              <ModalHeader>Register</ModalHeader>
            )}
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
              {register ? (
                <FormControl mt={4}>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input
                    placeholder="********"
                    type={'password'}
                    id="confirmpassword"
                    ref={inputPassword}
                  />
                </FormControl>
              ) : null}
              {loginError ? (
                <Text fontSize="sm" color="red.500">
                  The username or password is incorrect
                </Text>
              ) : null}
              <FormControl mt={4}>
                {!register ? (
                  <FormLabel
                    onClick={() => {
                      setRegister(true);
                    }}
                    cursor={'pointer'}
                    color={'twitter.500'}
                    colorScheme={'twitter'}
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Don't have an account?
                  </FormLabel>
                ) : (
                  <FormLabel
                    onClick={() => {
                      setRegister(false);
                    }}
                    cursor={'pointer'}
                    color={'twitter.500'}
                    colorScheme={'twitter'}
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Already Have an account? Login here
                  </FormLabel>
                )}
              </FormControl>
            </ModalBody>
            <ModalFooter>
              {!register ? (
                <Button
                  onClick={testCredentials}
                  form="formLogin"
                  colorScheme="twitter"
                  mr={3}
                >
                  Login
                </Button>
              ) : (
                <Button
                  onClick={registerUser}
                  form="formLogin"
                  colorScheme="twitter"
                  mr={3}
                >
                  Register
                </Button>
              )}
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
                <Button
                  onClick={disconnect}
                  variant="ghost"
                  colorScheme="twitter"
                >
                  Logout
                </Button>
              </Tooltip>
            </>
          ) : (
            <Tooltip label="Login" placement="bottom">
              <Button
                onClick={onLoginOpen}
                variant="ghost"
                colorScheme="twitter"
              >
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
            ]}
            gap={2}
          >
            {notes.map((note, index) => (
              <Box
                position={'relative'}
                p={3}
                marginTop={'5'}
                marginBottom={'5'}
                borderRadius={'lg'}
                bg="whiteAlpha.200"
                shadow={'xl'}
                height={'auto'}
                width={'80'}
                key={index}
              >
                <CloseButton
                  position={'absolute'}
                  top={0}
                  right={0}
                  size="sm"
                  onClick={() => removeNote(note)}
                />
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
