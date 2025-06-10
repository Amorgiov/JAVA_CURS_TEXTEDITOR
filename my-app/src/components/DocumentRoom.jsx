import { Box, Button, Heading, Textarea, HStack, VStack, CloseButton, useColorMode, useToast } from "@chakra-ui/react";
import { debounce } from "lodash";
import { useCallback, useEffect } from "react";

export const DocumentRoom = ({stompClient, documentName, content, setContent, closeDocument}) => {
    const { colorMode } = useColorMode();
    const toast = useToast();

    const sendContent = async (updatedContent) => {
        try {
            stompClient.publish({
                destination: "/app/update",
                body: JSON.stringify({
                    documentName: documentName,
                    content: updatedContent,
                    type: "update"
                })
            });
        } catch (error) {
            console.error("Error sending: ", error);
            toast({
                title: "Error",
                description: "Failed to send updated doc content to others",
                status: "error",
                isClosable: true,
                duration: 4000
            });
        }
    }

    const saveContent = async (updatedContent) => {
        if (!stompClient || !stompClient.connected) {
            console.warn("STOMP client not ready");
            return;
        }
        try {
            console.log("Saving:", updatedContent);
            stompClient.publish({
                destination: "/app/save",
                body: JSON.stringify({
                    documentName: documentName,
                    content: updatedContent,
                    type: "save"
                })
            });
            toast({
                title: "Data saved",
                description: "The modified data has been saved",
                status: "info",
                isClosable: true,
                duration: 4000
            });
        } catch (err) {
            console.error("Error saving:", err);
            toast({
                title: "Error",
                description: "Failed to save updated doc content",
                status: "error",
                isClosable: true,
                duration: 4000
            });
        }
    }

    const debouncedSave = useCallback(debounce(saveContent, 1200), []);

    const handleContentChange = (e) => {
        const updatedContent = e.target.value;
        setContent(updatedContent);

        sendContent(updatedContent)
        debouncedSave(updatedContent);
    };

    const handleClose = async () => {
        await saveContent(content);
        stompClient.publish({
            destination: "/app/leave",
            body: JSON.stringify({
                documentName: documentName,
                type: "leave"
            })
        });
        toast({
            title: "Doc closed",
            description: `Left the document ${documentName}`,
            status: "info",
            isClosable: true,
            duration: 4000
        });
        closeDocument();
    };

    useEffect(() => {
        if (!stompClient || !documentName) return;
        const messageSubscription = stompClient.subscribe(`/topic/document/${documentName}`, (message) => {
            const data = JSON.parse(message.body);
            toast({
                title: "Info",
                description: data.type === "locked" ? "Document is locked by another user" : `Document ${data.type}`,
                status: "info",
                duration: 4000,
                isClosable: true
            });
        });
        return () => {
            messageSubscription.unsubscribe();
        };
    }, [stompClient, documentName]);
    

    return (
        <Box 
            display="flex" 
            flexDirection="column"
            minH="100vh" 
            p={{ base: 2, sm: 6 }} // Уменьшаем padding только на телефонах
            h={window.innerHeight}
            w={window.innerWidth}
            justifyContent="center" 
            alignItems="center"
        >
            <VStack 
                bg={colorMode === "light" ? "#F5F7F8" : "gray.700"}
                p={{ base: 4, sm: 6 }} // Уменьшаем padding только на телефонах
                w={{ base: "95%", sm: "70%", md: "50%", lg: "30%" }} // Исходные значения с sm
                h={{ base: "90%", sm: "85%" }} // Исходное с sm
            >
                <Box 
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="center" 
                    w="full"
                >
                    <Heading 
                        size={{ base: "md", sm: "lg" }} // Исходное с sm
                        color={colorMode === "light" ? "gray.700" : "white"}
                    >
                        {documentName}
                    </Heading>
                    <CloseButton onClick={handleClose} color={colorMode === "light" ? "black" : "white"} />
                </Box>

                <Textarea
                    value={content}
                    onChange={handleContentChange}
                    rows={{ base: 15, sm: 25 }} // Исходное с sm
                    placeholder="Type your document content here..."
                    bg={colorMode === "light" ? "whiteAlpha.900" : "gray.700"}
                    color={colorMode === "light" ? "black" : "white"}
                    _placeholder={{ color: "gray.400" }}
                    w="full"
                    h="100%"
                    resize="none"
                    borderRadius="md"
                    border="1px"
                    p={{ base: 2, sm: 4 }} // Исходное с sm
                />
            </VStack>
        </Box>
    );
}