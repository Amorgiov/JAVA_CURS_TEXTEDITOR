import { Box, Button, Center, HStack, VStack } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router";

export const Friends = ({}) => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllUsers = async() => {
            const token = localStorage.getItem("token");
                
            if (!token) {
                console.error("Token not found. Please log in.");
                navigate("/login");
                return;
            }
    
            try {
                const response = await fetch("api/Users/GetUsers", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });
    
                if (response.ok) {
                    const users = await response.json();
                    setUsers(users);
                    console.log("Fetched users:", users);
                } else if (response.status === 401) {
                    console.error("Unauthorized: Please log in again.");
                    navigate("/login");
                }
                else {
                    console.error("Failed to fetch documents:", response.status, response.statusText);
                }
            } catch (error) {
                console.error("Error fetching documents:", error);
            }
        }
    
        fetchAllUsers();
    }, [])

    const handleShareDocument = async (userId) => {
        const token = localStorage.getItem("token");
                
        if (!token) {
            console.error("Token not found. Please log in.");
            return;
        }

        const activeFileId = localStorage.getItem("activeFileId");
        console.log(activeFileId);
        if(!activeFileId){
            console.error("No active file selected for sharing.");
            return;
        }

        console.log("Sharing document with ID:", activeFileId, "to user:", userId);

        try {
            const response = await fetch("api/Documents/ShareDocument", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({userId: userId, documentId: activeFileId}),
            });

            if (response.ok) {
                console.log("Document shared successfully");
            } else {
                const errorText = await response.text();
                console.error("Failed to share document:", response.status, response.statusText, errorText);
            }
        } catch (error) {
            console.error("Error sharing document:", error);
        }
    }

    return <Box>
        <VStack m={{ base: 2, sm: 4 }}>
            {users.map((user) => (
                <HStack 
                    key={user.id} 
                    border="solid" 
                    borderColor="gray.600" 
                    borderWidth={1} 
                    borderRadius={18} 
                    justifyContent="space-between"
                    w={{ base: "90%", sm: "60%" }} // Исходное с sm
                    p={1}
                    pos="relative"
                >
                    <Box 
                        m={{ base: 2, sm: 3 }} // Исходное с sm
                        textAlign="center"
                    >
                        {user.name}
                    </Box>

                    <Button 
                        pos="absolute"
                        mr={2}
                        right={0}
                        variant="outline"
                        borderRadius={14} 
                        onClick={() => handleShareDocument(user.id)}
                    >
                        Поделиться
                    </Button>
                </HStack>
            ))}
        </VStack>
    </Box>
}