import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const usePolling = (url, interval = 5000) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const response = await axios.get(url, {
                withCredentials: true
            });
            setData(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching data');
            console.error('Polling error:', err);
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        // Initial fetch
        fetchData();

        // Set up polling
        const pollInterval = setInterval(fetchData, interval);

        // Cleanup
        return () => clearInterval(pollInterval);
    }, [fetchData, interval]);

    return { data, loading, error, refetch: fetchData };
};

export default usePolling; 