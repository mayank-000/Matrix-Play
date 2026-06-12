import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:3000/api"
})

export async function getQuestion() {
    const res = await api.get("/question");
    const { question, options } = res.data;
    return { question, options };
}

export async function submitVote(questionId: number, optionId: number) {
    const res = await api.post("/vote", { questionId, optionId })
    return res.data;
}

export async function getLeaderboard() {
    const res = await api.get("/leaderboard");
    return res.data;
}