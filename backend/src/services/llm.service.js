import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function generateQuestion() {
    const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
            {
                role: "user",
                content: `Generate 1 multiple choice question on any programming topic.
                Return ONLY a JSON object, no extra text, no markdown:
                {
                    "question": "question text here",
                    "options": [
                        { "id": 1, "text": "option 1" },
                        { "id": 2, "text": "option 2" },
                        { "id": 3, "text": "option 3" },
                        { "id": 4, "text": "option 4" }
                    ],
                    "answer": 2
                }`
            }
        ]
    })

    const raw = response.choices[0].message.content
    return JSON.parse(raw)
}