import { 
    Box, Button, Heading, Input, Text, VStack, HStack,
    Tabs, TabList, useColorMode, useDisclosure, Modal, ModalOverlay, ModalContent, 
    ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl,
    Checkbox,
    Spinner,
    Alert,
    AlertIcon,
} from "@chakra-ui/react";

import { LuLightbulbOff, LuLightbulb, LuUsersRound, LuLogOut,
    LuSettings, LuFile, LuUserPen, LuEllipsisVertical } from "react-icons/lu";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { FileProp } from "./FileProp";
import { Profile } from "./Profile";
import { Friends } from "./Friends";
import { useDocuments } from "./useDocuments";

export const WaitingRoom = ({joinDocument, onLogout, onLogin}) => {
    const [userInfo, setUserInfo] = useState(null);
    const [documentName, setDocumentName] = useState("");
    const [isPrivateDocument, setIsPrivateDocument] = useState(false);
    const [filterProp, setFilterProp] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFileId, setActiveFileId] = useState(null);

    const {colorMode, toggleColorMode} = useColorMode();
    const {isOpen: isCreateFileOpen, onOpen: onCreateFileOpen, onClose: onCreateFileClose} = useDisclosure()
    const {isOpen: isProfileOpen, onOpen: onProfileOpen, onClose: onProfileClose} = useDisclosure()
    const {isOpen: isFriendsOpen, onOpen: onFriendOpen, onClose: onFriendClose} = useDisclosure()

    const { documents, setDocuments, totalCount, loading, error, fetchDocuments, loadMoreDocuments } = useDocuments();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try{
                const jwt = jwtDecode(token);
                const deathTime = Date.now() / 1000;

                if(jwt.exp && jwt.exp < deathTime){
                    console.log("Token time expired");
                    localStorage.removeItem("token");
                } else {
                    setUserInfo(jwt);
                    console.log(userInfo)
                    console.log(token)
                    fetchDocuments();
                    console.log(documents);
                }
            } catch (error) {
                console.error("Failed to decode token:", error);
                localStorage.removeItem("token");
            }
        }
    }, [fetchDocuments]);

    const handleCreateDocument = async (e) => {
        e.preventDefault();

        if (!documentName) {
            console.error("Document name is empty");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            
            const response = await fetch("api/Documents/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ title: documentName, isPrivate: isPrivateDocument })
            });
            
            console.log(isPrivateDocument);


            if(response.ok){
                const document = await response.json();
                console.log("Document ", document," created");
                setDocuments((prev) => [...prev, document]);
            }
            else(console.log("Creation doc failed"))
        } catch (error) {
            console.error("Error creation doc " + error);
        }
    }

    const handleImportDocument = async (e) => {
        const file = e.target.files[0];
        
        if(!file) return;

        const reader = new FileReader();

        reader.onload = async (e) => {
            const content = e.target.result;
            try {
                const token = localStorage.getItem("token");

                const response = await fetch("api/Documents/import", {
                    method: "POST",
                    headers: {
                        "Content-Type" : "application/json",
                        "Authorization" : `Bearer ${token}`,
                    },
                    body: JSON.stringify({title: file.name.replace(/\.[^/.]+$/, ""), content: content, userId: null}),
                });

                if (response.ok){
                    const newDoc = await response.json();
                    setDocuments((prev) => [...prev, newDoc]);
                    console.log("Document imported successfully:", newDoc);
                }
                else {
                    console.error("Import failed:", response.status, response.statusText);
                }
            } catch (error) {
                console.error("Error parsing document:", error);
            }
        };
        reader.readAsText(file);
    };

    const filteredDocuments = documents.filter((doc) => {
        if (doc == []) return false;
        if (filterProp === "public" && doc.private) return false;
        if (filterProp === "private" && !doc.private) return false;

        if (searchQuery && !doc.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

        return true;
    });

    return (
        <VStack 
            align="stretch" 
            p={[2, 4]} 
            w={window.innerWidth}
            h={window.innerHeight} 
            onClick={() => {setActiveFileId(null)}}
            spacing={[2, 4]}
        >
            {/* header */}
            <Tabs variant="enclosed"> 
                <TabList 
                    justifyContent={["center", "flex-end"]}
                    flexWrap="wrap" 
                    gap={[2, 0]} 
                >
                    {/* UserName */}
                    <Heading 
                        size={["md", "lg"]} 
                        pr={[0, 4]} 
                        textAlign={["center", "left"]} 
                    >
                        {userInfo ? userInfo.given_name : "Not logged in"}
                    </Heading>

                    {/* Profile */}
                    <Button variant="ghost" p={[1, 2]}> 
                        <LuUserPen size={[24, 32]} onClick={onProfileOpen}/> 
                        <Modal isOpen={isProfileOpen} onClose={onProfileClose} size={["xs", "md"]}>
                            <ModalOverlay />
                            <ModalContent>
                                <Profile userInfo={userInfo} setUserInfo={setUserInfo} login={onLogin} />
                            </ModalContent>
                        </Modal>
                    </Button>

                    {/* Friends */}
                    <Button variant="ghost" p={[1, 2]}>
                        <LuUsersRound size={[24, 32]} onClick={onFriendOpen}/>
                        <Modal isOpen={isFriendsOpen} onClose={onFriendClose} size={["xs", "md"]}>
                            <ModalOverlay />
                            <ModalContent>
                                <Friends/>
                            </ModalContent>
                        </Modal>
                    </Button>

                    {/* Settings */}
                    <Button variant="ghost" p={[1, 2]}>
                        <LuSettings size={[24, 32]}/>
                    </Button>

                    {/* Logout */}
                    <Button onClick={onLogout} variant="ghost" p={[1, 2]}>
                        <LuLogOut size={[24, 32]}/>
                    </Button>
                </TabList>
            </Tabs>

            <HStack 
                ml={[0, 8]} 
                flexWrap="wrap" 
                justifyContent={["center", "flex-start"]} 
                gap={[2, 0]} 
            >
                <Button variant="outline" size={["sm", "md"]} onClick={() => setFilterProp("all")}>Все</Button>
                <Button variant="outline" size={["sm", "md"]} onClick={() => setFilterProp("public")}>Публичные</Button>
                <Button variant="outline" size={["sm", "md"]} onClick={() => setFilterProp("private")}>Приватные</Button>
                <Input 
                    minW={[100, 100]} 
                    maxW={["100%", 320]} 
                    type="text" 
                    placeholder="Поиск документа..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size={["sm", "md"]}
                />
            </HStack>
            {/* documents */}
            <VStack align="stretch" spacing={[2, 4]} mt={[4, 6]}>
                {loading && <Spinner alignSelf="center" />}
                {error && (
                    <Alert status="error">
                        <AlertIcon />
                        Ошибка подключения: {error}
                    </Alert>
                )}
                {!loading && !error && (
                    <HStack 
                    align="stretch" 
                    spacing={[2, 4]} 
                    mt={[4, 6]} 
                    flexWrap="wrap" 
                    justifyContent={["center", "flex-start"]} 
                    >
                        {
                        filteredDocuments.map((doc) => (
                            <VStack 
                                key={doc.id}
                                position="relative"
                                p={[2, 4]} 
                                cursor="pointer"
                                onClick={() => joinDocument(doc.title)}
                                maxWidth={[150, 200]}
                                _hover={{ boxShadow: "lg" }}
                            >
                                <Box 
                                    position="absolute" 
                                    right={["4px", "8px"]} 
                                    top={["4px", "8px"]}
                                    p={[0.5, 1]}
                                    _hover={{border: "1px", borderRadius: "8px", borderColor: "gray"}}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveFileId(activeFileId === doc.id ? null : doc.id)
                                    }}
                                >
                                    <LuEllipsisVertical size={30}/>
                                </Box>
                                
                                {activeFileId === doc.id && (
                                    <Box
                                        position="absolute"
                                        top={["24px", "40px"]}
                                        right={["4px", "8px"]}
                                        bg={colorMode === "light" ? "white" : "gray.800"}
                                        borderRadius="md"
                                        boxShadow="lg"
                                        zIndex={10}
                                        width={["120px", "auto"]} // Уменьшаем ширину выпадашки
                                    >
                                        <FileProp 
                                            fileId={doc.id} 
                                            docIsPrivate={doc.private} 
                                            setActiveFileId={setActiveFileId}
                                            setDocuments={setDocuments}
                                        />
                                    </Box>
                                )}  
    
                                <LuFile size={[96, 128]} color={doc.private ? "red" : colorMode == "light" ? "black" : "white"} />
                                <Text fontSize={["sm", "md"]}>{doc.title}</Text>
                            </VStack>
                        ))
                    }
                </HStack>
                )}

            </VStack>

            {/* actions */}
            <HStack
                width="100%" 
                position="fixed" 
                bottom={0} 
                left={0}
                p={[2, 4]} 
                justifyContent={["space-around", "flex-start"]} 
                flexWrap={["wrap", "nowrap"]}
                gap={[2, 0]} 
            >
                <Button onClick={onCreateFileOpen} variant="outline" size={["sm", "md"]}>Create</Button>

                <Modal isOpen={isCreateFileOpen} onClose={onCreateFileClose} size={["xs", "md"]}>
                    <ModalOverlay />
                    <ModalContent>
                        <form onSubmit={handleCreateDocument}>
                            <ModalHeader fontSize={["md", "lg"]}>Создать новый документ</ModalHeader>
                            <ModalCloseButton />
                            
                            <ModalBody pb={6}>
                                <FormControl>
                                    <Input 
                                        type="text" 
                                        value={documentName} 
                                        name="documentName" 
                                        onChange={(e) => setDocumentName(e.target.value)} 
                                        placeholder="Название документа"
                                        size={["sm", "md"]}
                                    />
                                </FormControl>
                                <FormControl mt={0.5} mb={-8}>
                                    <Checkbox 
                                        isChecked={isPrivateDocument} 
                                        onChange={() => setIsPrivateDocument(!isPrivateDocument)}
                                        size={["sm", "md"]}
                                    >
                                        <Text fontSize={["sm", "md"]}>Личный документ</Text>
                                    </Checkbox>
                                </FormControl>
                            </ModalBody>

                            <ModalFooter>
                                <Button variant="outline" m={[0, 0, 0, 2]} type="submit" onClick={onCreateFileClose} size={["sm", "md"]}>
                                    Save
                                </Button>
                                <Button variant="outline" onClick={onCreateFileClose} size={["sm", "md"]}>Cancel</Button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </Modal>

                <VStack spacing={[2, 4]} align="center">
                    <Button as="label" htmlFor="import-file" variant="outline" size={["sm", "md"]}>
                        Импортировать файл
                    </Button>
                    <Input type="file" id="import-file" onChange={handleImportDocument} accept=".txt,.md,.json" hidden />
                </VStack>
                
                <Button 
                    variant="outline" 
                    onClick={toggleColorMode} 
                    position={["static", "fixed"]} // Убираем fixed на маленьких экранах
                    right={[0, 4]} 
                    m={[0, 4]}
                    size={["sm", "md"]}
                >
                    {colorMode === 'light' ? <LuLightbulbOff size={[24, 32]} /> : <LuLightbulb size={[24, 32]} />}
                </Button>
            </HStack>
        </VStack>
    );
};