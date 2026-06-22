import { useEffect, useState, useRef } from "react"
import { getQuestion, submitVote, getLeaderboard } from "../services/api"

function Home() {
    const [question, setQuestion] = useState()
    const [options, setOptions] = useState([])
    const [questionId, setQuestionId] = useState()
    const [selected, setSelected] = useState(null)
    const [result, setResult] = useState(null)   // true | false 
    const [timeLeft, setTimeLeft] = useState(30)
    const [quotaLeft, setQuotaLeft] = useState(5)
    const [leaderboard, setLeaderboard] = useState([])
    const [quotaExhausted, setQuotaExhausted] = useState(false)
    const [loading, setLoading] = useState(false)

    const quotaExhaustedRef = useRef(false)
    const timerRef = useRef(null)

    function clearTimer() {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }

    function startTimer() {
        clearTimer()
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === 1) {
                    clearTimer()
                    if (!quotaExhaustedRef.current) loadQuestion()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    function loadQuestion() {
        setLoading(true)
        setSelected(null) // clears chosen option
        setResult(null) // clears result message
        setTimeLeft(30) // reset timer display

        getQuestion()
        .then((data) => {
            if (data.quotaExhausted) {
                quotaExhaustedRef.current = true
                setQuotaExhausted(true)
                setLoading(false)
                return
            }
            setQuestion(data.question)
            setOptions(data.options)
            setQuestionId(data.id)
            setQuotaLeft(data.quotaLeft)
            setLoading(false)
            startTimer()
        })
    }

    function loadLeaderboard() {
        getLeaderboard()
        .then(setLeaderboard)
    }

    useEffect(() => {
        loadQuestion()
        return () => clearTimer()
    }, [])

    useEffect(() => {
        loadLeaderboard()
        const interval = setInterval(loadLeaderboard, 10000)
        return () => clearInterval(interval)
    }, [])

    async function handleSubmit() {
        if (!selected || result !== null) return
        clearTimer()

        const data = await submitVote(questionId, selected)

        if (data.timeout) {
            loadQuestion()
            return
        }

        setResult(data.correct)
        setTimeout(() => loadQuestion(), 1500)
    }

    // timer color: green → yellow → red
    function timerColor() {
        if (timeLeft > 15) return "#22c55e"
        if (timeLeft > 7) return "#eab308"
        return "#ef4444"
    }

    if (quotaExhausted) {
        return (
          <div className="game-layout">
            <div className="exhausted">
                <h2>You've used all 5 questions for today.</h2>
                <p>Come back tomorrow!</p>
            </div>

            <div className="leaderboard-panel">
                <h2>Leaderboard</h2>
                {leaderboard.length === 0 && <p className="empty">No scores yet</p>}
                {leaderboard.map((entry, index) => (
                    <div key={entry.userId} className="leaderboard-row">
                        <span className="rank">#{index + 1}</span>
                        <span className="username">{entry.username}</span>
                        <span className="score">{entry.score} pts</span>
                    </div>
                ))}
            </div>
        </div>  
        )
    }

    return (
        <div className="game-layout">

            {/* LEFT: Question panel */}
            <div className="question-panel">
                <div className="meta">
                    <span className="quota">Questions left: {quotaLeft}</span>
                    <span className="timer" style={{ color: timerColor() }}>
                        {timeLeft}s
                    </span>
                </div>

                {/* (condition ? do this if true : if false) */}
                {loading ? (
                    <p className="loading">Generating question...</p>
                ) : (
                    <>
                        <h1 className="question-text">{question}</h1>

                        <div className="options">
                            {options.map((option) => (
                                <label
                                    key={option.id}
                                    className={`option ${selected === option.id ? "selected" : ""}`}
                                >
                                    <input
                                        type="radio"
                                        name="poll"
                                        value={option.id}
                                        checked={selected === option.id}
                                        onChange={() => setSelected(option.id)}
                                    />
                                    {option.text}
                                </label>
                            ))}
                        </div>

                        <button
                            className="submit-btn"
                            onClick={handleSubmit}
                            disabled={!selected || result !== null}
                        >
                            Submit
                        </button>

                        {result === true && <p className="result correct">✓ Correct! +4</p>}
                        {result === false && <p className="result wrong">✗ Wrong! Still +1</p>}
                    </>
                )}
            </div>

            {/* RIGHT: Leaderboard */}
            <div className="leaderboard-panel">
                <h2>Leaderboard</h2>
                {leaderboard.length === 0 && <p className="empty">No scores yet</p>}
                {leaderboard.map((entry, index) => (
                    <div key={entry.userId} className="leaderboard-row">
                        <span className="rank">#{index + 1}</span>
                        <span className="username">{entry.username}</span>
                        <span className="score">{entry.score} pts</span>
                    </div>
                ))}
            </div>

        </div>
    )
}

export default Home