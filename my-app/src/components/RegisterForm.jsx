import { useState } from "react";
import { 
    Button, Input, Heading, Text, FormControl, FormLabel, VStack, Box, Link, 
    useColorMode,
    useToast
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export const RegisterForm = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("USER");
    const navigate = useNavigate();
    const { colorMode } = useColorMode();
    const toast = useToast();

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role: role })
            });

            if (response.ok) {
                navigate("/login", { state: { name: name, email: email, password: password, role: role } });
                console.log("Registration successful");
                toast({
                    title: "Ok",
                    description: "",
                    status: "error",
                    isClosable: true,
                    duration: 4000
                });
            } else {
                console.log("Registration failed : " + await response.text());
                toast({
                    title: "notOk",
                    description: "",
                    status: "error",
                    isClosable: true,
                    duration: 4000
                });
            }
        } catch (err) {
            console.log("An error occurred. Please try again.");
            toast({
                title: err.name,
                description: "",
                status: "error",
                isClosable: true,
                duration: 4000
            });
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
                    Register
                </Heading>
                <form onSubmit={onSubmit}>
                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel color={colorMode === "light" ? "gray.700" : "white"}>Name</FormLabel>
                            <Input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                placeholder="Input your name"
                                bg={colorMode === "light" ? "whitesmoke" : "gray.800"}
                                color={colorMode === "light" ? "grey.700" : "white"}
                                _placeholder={{ color: "gray.400" }}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel color={colorMode === "light" ? "gray.700" : "white"}>Email</FormLabel>
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
                            <FormLabel color={colorMode === "light" ? "gray.700" : "white"}>Password</FormLabel>
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
                        
                        <Button type="submit" colorScheme="blue" w="full">Register</Button>
                        
                        <Text color={colorMode === "light" ? "gray.700" : "blue.400"}>
                            Already have an account? <Link href="/login" color={colorMode === "light" ? "gray.400" : "blue.400"}>Login</Link>
                        </Text>
                    </VStack>
                </form>
            </Box>
        </Box>
    );
};