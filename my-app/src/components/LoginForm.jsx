import { useState } from "react";
import { 
    Button, Input, Heading, Text, FormControl, FormLabel, VStack, Box, Link,
    useColorMode
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { nav } from "framer-motion/client";

export const LoginForm = ({ onLogin }) => {
    const location = useLocation();
    const [email, setEmail] = useState(location.state?.email || "");
    const [password, setPassword] = useState(location.state?.password || "");
    const { colorMode } = useColorMode();

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const { token } = await response.json();
                localStorage.setItem("token", token);
                onLogin(token);
                console.log(token + " :Login successful");
            } else {
                console.log("Login failed : " + await response.text());
            }
        } catch (err) {
            console.log("An error occurred. Please try again.");
        }
    };

    return (
        <Box 
            minH="100vh" 
            h={window.innerHeight}
            w={window.innerWidth}
            display="flex" 
            justifyContent="center" 
            alignItems="center"
        >
            <Box 
                bg={colorMode === "light" ? "whiteAlpha.900" : "gray.700"}
                p={{ base: 4, sm: 6 }} // Исходное с sm
                border="1px"
                borderRadius="md" 
                boxShadow="lg"
                w={{ base: "90%", sm: "400px" }} // Исходное с sm
                textAlign="center"
            >
                <Heading 
                    size={{ base: "md", sm: "lg" }} // Исходное с sm
                    mb={6} 
                    color = {colorMode === "light" ? "gray.700" : "white"}
                >
                    Login
                </Heading>
                <form onSubmit={onSubmit}>
                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel color={colorMode === "light" ? "gray.700" : "white"}> Email </FormLabel>
                            <Input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="Input your email"
                                bg={colorMode === "light" ? "whitesmoke" : "gray.800"}
                                color={colorMode === "light" ? "grey.700" : "white"}
                                _placeholder={{ color: "gray.400" }}
                            />
                        </FormControl>
                        
                        <FormControl>
                            <FormLabel color={colorMode === "light" ? "gray.700" : "white"}> Password </FormLabel>
                            <Input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="Input your password"
                                bg={colorMode === "light" ? "whitesmoke" : "gray.800"}
                                color={colorMode === "light" ? "grey.700" : "white"}
                                _placeholder={{ color: "gray.400" }}
                            />
                        </FormControl>
                        
                        <Button type="submit" colorScheme="blue" w="full">Login</Button>
                        
                        <Text color={colorMode === "light" ? "gray.700" : "blue.400"}>
                            Don't have an account? <Link href="/register" color={colorMode === "light" ? "gray.400" : "blue.400"}>Register</Link>
                        </Text>
                    </VStack>
                </form>
            </Box>
        </Box>
    );    
};