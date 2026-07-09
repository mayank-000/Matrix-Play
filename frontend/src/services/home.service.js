import api from "./api";

const homeService = {
    getQuestion: async () => {
        try {
            const res = await api.get('/home/question')
            return res.data;
        } catch (err) {
            throw err.response?.data || err
        }
    },

    submitVote: async (questionId, optionId) => {
        try {
            const res = await api.post('/home/vote', { questionId, optionId });
            return res.data;
        } catch (err) {
            throw err.response?.data || err;
        }
    },

    getLeaderboard: async () => {
        try {
            const res = await api.get('/home/leaderboard')
            return res.data;
        } catch (err) {
            throw err.response?.data || err;
        }
    },
};

export default homeService;



