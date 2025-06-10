import { useEffect, useState } from "react";
import { Navigate, Routes, Route } from "react-router";

import { DocumentRoom } from "./components/DocumentRoom";
import { WaitingRoom } from "./components/WaitingRoom";
import { RegisterForm } from "./components/RegisterForm";
import { LoginForm } from "./components/LoginForm";

import { Box, Flex, ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import theme from "./themes";
import { Client } from "@stomp/stompjs";

function App() {
  const [documentRoom, setDocumentRoom] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [token, setToken] = useState();
  const [message, setMessage] = useState("");
  const [stompClient, setStompClient] = useState(null);

  const joinDocument = async (documentRoom) => {
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token);

    if (!token) {
      console.error("User is not authenticated.");
      return;
    }

    const client = new Client({
      brokerURL: 'ws://localhost:5029/ws',
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,

      onConnect: () => {
        console.log("Connected to WebSocket");
        console.log("Connect headers sent:", { Authorization: `Bearer ${token}` });

        client.subscribe(`/topic/document/${documentRoom}`, (message) => {
          const body = JSON.parse(message.body);
          setDocumentContent(body.content);
        });

        client.subscribe(`/user/queue/document/${documentRoom}`, (message) => {
          const { content } = JSON.parse(message.body);
          setDocumentContent(content); // инициализируем
        });
  
        client.publish({
          destination: "/app/join",
          body: JSON.stringify({
            documentName: documentRoom,
            type: "join"
          }),
        });
  
        setDocumentRoom(documentRoom);
        setStompClient(client);
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers['message']);
        console.error("Additional details: " + frame.body);
        console.error("Full frame:", frame);
      }
    });

    client.activate();
  };

  const closeDocument = async () => {
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: "/app/leave",
        body: JSON.stringify({ documentRoom })
      });
  
      await stompClient.deactivate();
    }
    setStompClient(null);
  };

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null)
    setStompClient(null);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <Routes>
        {
          token ? (
            <>
              {stompClient ? (
                <Route path="/:documentName" element={
                  <Flex>
                      <Box>
                        <DocumentRoom
                          stompClient={stompClient}
                          documentName={documentRoom}
                          content={documentContent}
                          setContent={setDocumentContent}
                          closeDocument={closeDocument}/>
                      </Box>
                  </Flex>
                }/> 
              ) : (
                  <Route path="/*" element={
                    <Flex>
                      <Box>
                        <WaitingRoom joinDocument={joinDocument} onLogout={handleLogout} onLogin={handleLogin} />
                      </Box>
                    </Flex>
                  }/>
              )}
              
            </>
          ) : (
            <>
                <Route path="/login" element = {
                  <Flex>
                    <Box>
                      <LoginForm onLogin={handleLogin}/>
                    </Box>
                  </Flex>
                }/>
                <Route path="/register" element={
                  <Flex>
                    <Box>
                      <RegisterForm />
                    </Box>
                  </Flex>
                }/>
                <Route path="/*" element={
                  <Flex>
                    <Box>
                      <Navigate to="/login"/>
                    </Box>
                  </Flex>
                }/>
            </>
          )
        }
      </Routes>
  </ChakraProvider>
  );
}

export default App;