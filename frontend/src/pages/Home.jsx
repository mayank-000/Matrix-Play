"use client";

import { useEffect, useState, useRef } from "react"
import { getQuestion, submitVote, getLeaderboard } from "../services/api"

// outside component — stable references, no dependency issues
async function fetchQuestionAPI() {
    return await getQuestion()
}

async function fetchLeaderboardAPI() {
    return await getLeaderboard()
}

function Home() {
    const [question, setQuestion] = useState(null)
    const [options, setOptions] = useState([])
    const [questionId, setQuestionId] = useState(null)
    const [selected, setSelected] = useState(null)
    const [result, setResult] = useState(null)
    const [timeLeft, setTimeLeft] = useState(30)
    const [quotaLeft, setQuotaLeft] = useState(100)
    const [leaderboard, setLeaderboard] = useState([])
    const [quotaExhausted, setQuotaExhausted] = useState(false)
    const quotaExhaustedRef = useRef(false)

    function loadQuestion() {
        fetchQuestionAPI().then((data) => {
            if (data.quotaExhausted) {
                quotaExhaustedRef.current = true
                setQuotaExhausted(true)
                return
            }
            setQuestion(data.question)
            setOptions(data.options)
            setQuestionId(data.id)
            setQuotaLeft(data.quotaLeft)
            setSelected(null)
            setResult(null)
            setTimeLeft(30)
        })
    }

    function loadLeaderboard() {
        fetchLeaderboardAPI().then((data) => {
            setLeaderboard(data)
        })
    }

    // fetch first question on mount
    useEffect(() => {
        loadQuestion()
    }, [])

    // poll leaderboard every 10 seconds
    useEffect(() => {
        loadLeaderboard()
        const interval = setInterval(loadLeaderboard, 10000)
        return () => clearInterval(interval)
    }, [])

    // timer
    useEffect(() => {
        if (!question) return

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === 1) {
                    clearInterval(timer)
                    if (!quotaExhaustedRef.current) {
                        setTimeout(() => loadQuestion(), 0);
                    }
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [question])

    async function handleSubmit() {
        if (!selected) return

        const data = await submitVote(questionId, selected)

        if (data.timeout) {
            loadQuestion()
            return
        }

        setResult(data.correct)
        setTimeout(() => loadQuestion(), 1500)
    }

    if (quotaExhausted) return <p>You have used all 100 questions for today. Come back tomorrow!</p>
    if (!question) return <p>Loading...</p>

    return (
        <div>
            <p>Quota left: {quotaLeft} / 100</p>
            <p>Time left: {timeLeft}s</p>

            <h1>{question}</h1>

            {options.map((option) => (
                <div key={option.id}>
                    <input
                        type="radio"
                        id={option.id}
                        name="poll"
                        value={option.id}
                        checked={selected === option.id}
                        onChange={() => setSelected(option.id)}
                    />
                    <label htmlFor={option.id}>{option.text}</label>
                </div>
            ))}

            <button onClick={handleSubmit}>Submit</button>

            {result === true && <p>Correct!</p>}
            {result === false && <p>Wrong!</p>}

            <div>
                <h2>Live Leaderboard</h2>
                {leaderboard.map((entry, index) => (
                    <div key={entry.userId}>
                        <span>#{index + 1}</span>
                        <span>{entry.username}</span>
                        <span>{entry.score} pts</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Home