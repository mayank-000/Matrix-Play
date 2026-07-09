import api from "./api";

const authService = {
    signUp: async (userData) => {
        try {
            const response = await api.post('/auth/signup', userData);
            return response.data;
        } catch (err) {
            throw err.response?.data || err;
        }
    },

    signIn: async (userData) => {
        try {
            const res = await api.post("/auth/signin", userData);
            return res.data; 
        } catch (err) {
            throw err.response?.data || err;
        }
    },
};

export default authService;

