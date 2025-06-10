import { Button, Modal, ModalContent, ModalOverlay, useToast, VStack } from "@chakra-ui/react"
import { Friends} from "./Friends";

export const FileProp = ({fileId, docIsPrivate, setActiveFileId, setDocuments}) => {
    const toast = useToast();

    const handleDownloadDocument = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`/api/Documents/export/${fileId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error("Download failed:", response.statusText);
                if (response.status === 404) {
                    throw new Error("Document not found");
                }
                throw new Error("Failed to export document");
            }

            const blob = await response.blob();
            const contentDisposition = response.headers.get("Content-Disposition");
            let fileName = `document_${fileId}.txt`;
            if (contentDisposition) {
                const matches = /filename="([^"]+)"/.exec(contentDisposition);
                if (matches && matches[1]) {
                    fileName = matches[1]; // Используем имя файла из заголовка
                }
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            console.log("Document downloaded successfully");
        } catch (error) {
            console.error("Error downloading document:", error);
        }
    };

    const handleDeleteDocument = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("Token not found. Please log in.");
            return;
        }

        try {
            const response = await fetch(`api/Documents/delete/${fileId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
    
            if (response.ok) {
                setDocuments((prev) => prev.filter(doc => doc.id !== fileId));
                console.log(`File: ${fileId} has been deleted`);
            } else {
                console.error("Failed to delete document:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error deleting document:", error);
        }
    }

    const handleShareDocument = () => {
        localStorage.setItem("activeFileId", fileId);
        toast({
            title: "ShareCode",
            description: `Code selected ${fileId}`,
            status: "info",
            isClosable: true,
            duration: 1000
        });
    }

    return (
        <VStack 
            align="stretch" 
            p={{ base: 1, sm: 2 }} // Исходное с sm
            border="1px" 
            boxShadow="lg" 
            borderRadius="8px"
            onClick={(e) => {
                e.stopPropagation();
                setActiveFileId(null);
            }}
        >
            {docIsPrivate ? (
                <Button 
                    variant="ghost" 
                    size={{ base: "xs", sm: "sm" }} // Исходное с sm
                    onClick={handleShareDocument}
                >
                    Выбрать
                </Button>
            ) : (
                <></>
            )}
            
            <Button 
                variant="ghost" 
                size={{ base: "xs", sm: "sm" }} 
                onClick={handleDownloadDocument}
            >
                Скачать
            </Button>
            <Button 
                variant="ghost" 
                size={{ base: "xs", sm: "sm" }} 
                onClick={handleDeleteDocument}
            >
                Удалить
            </Button>
        </VStack>
    )
}