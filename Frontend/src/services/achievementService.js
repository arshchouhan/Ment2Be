import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const getAuthToken = () => localStorage.getItem('token');

const achievementService = {
    getAchievements: async () => {
        try {
            const response = await axios.get(`${API_URL}/achievements`, {
                headers: { Authorization: `Bearer ${getAuthToken()}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching achievements:', error);
            throw error;
        }
    }
};

export default achievementService;
