import { Box, Button, Divider, FormControl, FormLabel, HStack, Input, useColorMode, VStack } from "@chakra-ui/react"
import { useState } from "react";
import { GiPlagueDoctorProfile } from "react-icons/gi";
import { useNavigate } from "react-router";
import { jwtDecode } from "jwt-decode";

export const Profile = ({ userInfo, setUserInfo, login }) => {
    const [profilePicture, setProfilePicture] = useState(null);
    const [isReadOnly, setIsReadOnly] = useState(true);
    const [userName, setUserName] = useState(userInfo?.given_name || "");
    const [email, setEmail] = useState(userInfo?.sub || "");
    const navigate = useNavigate();

    const handleChangePicture = (e) => {
        const file = e.target.files[0];

        if(file){
            const reader = new FileReader();

            reader.onload = (e) => {
                setProfilePicture(e.target.result);
            }

            reader.readAsDataURL(file);
        }
    }

    const hadnleSaveProfile = async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("Token not found. Please log in.");
            navigate("login");
            return;
        }

        try {
            const response = await fetch(`api/Users/Update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({name: userName, email: email})
            });

            if (response.ok) {
                const { token } = await response.json();

                if (token) {
                    localStorage.removeItem("token");
                }
                localStorage.setItem("token", token);
                login(token);
            }else {
                console.error("Failed updated token:", response.status, response.statusText);
            }
        } catch (error) {
            console.log("An error occurred. Please try again.");
        }

        setIsReadOnly(true);
    }

    return (
        <VStack 
            borderRadius="md" 
            p={{ base: 2, sm: 4 }} // Исходное с sm
            spacing={6} 
            w="full"
        >
            <Box pos="relative" textAlign="center">
                <Box 
                    borderRadius="full" 
                    border="2px" 
                    overflow="hidden" 
                    boxSize={{ base: "96px", sm: "128px" }} // Исходное с sm
                > 
                    {profilePicture ?
                        (
                            <img src={profilePicture} alt="Profile"/>
                        ) : (
                            <GiPlagueDoctorProfile size={128}/>
                        )
                    }
                </Box>

                <Button 
                    mt={2} 
                    size={{ base: "xs", sm: "sm" }} // Исходное с sm
                    variant="outline" 
                    as="label" 
                    htmlFor="upload-profile-picture"
                >
                    Change picture
                </Button>
                <Input type="file" id="upload-profile-picture" onChange={handleChangePicture} accept="image/*" hidden />
            </Box>

            <Divider />

            <VStack spacing={4} width="full" alignItems="flex-start">
                <FormControl>
                    <FormLabel>Имя</FormLabel>
                    <Input 
                        type="text" 
                        value={userName} 
                        onChange={(e) => setUserName(e.target.value)} 
                        isReadOnly={isReadOnly}
                    />
                </FormControl>

                <FormControl>
                    <FormLabel>Почта</FormLabel>
                    <Input 
                        type="text" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        isReadOnly={isReadOnly}
                    />
                </FormControl>
            </VStack>
            
            <Divider />

            <HStack>
                {isReadOnly ? (
                        <Button variant="outline" onClick={() => setIsReadOnly(false)}>Изменить профиль</Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={hadnleSaveProfile}>Сохранить</Button>
                            <Button variant="outline" onClick={() => setIsReadOnly(true)}>Отменить</Button>
                        </>
                    )}
            </HStack>
        </VStack>
    )
}