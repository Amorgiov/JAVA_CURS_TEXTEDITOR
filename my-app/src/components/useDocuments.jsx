// useDocuments.js
import { useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { AlertDialog } from "@chakra-ui/react";

export const useDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [skip, setSkip] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const take = 10;

    const fetchDocuments = useCallback(async (skipValue, userId, append = false) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `/api/Documents/getDocuments`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error(`Failed to fetch documents: ${response.statusText}`);

            const data = await response.json();
            console.log(data);

            if (append) {
                setDocuments((prev) => [...prev, ...data]);
            } else {
                setDocuments(data);
            }
        } catch (err) {
            setError(err.message);          
        } finally {
            setLoading(false);
        }
    }, []);

    const loadMoreDocuments = useCallback(async (userId) => {
        const newSkip = skip + take;
        await fetchDocuments(newSkip, userId, true);
    }, [skip, fetchDocuments]);

    return {
        documents,
        setDocuments,
        totalCount,
        loading,
        error,
        fetchDocuments,
        loadMoreDocuments,
    };
};