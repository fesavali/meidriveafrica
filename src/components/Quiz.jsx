import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export const Quiz = ({ courseId, enrollmentId }) => {
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [score, setScore] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuestions()
    loadProgress()
  }, [courseId])

  const loadQuestions = async () => {
    const { data } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('course_id', courseId)
      .order('order_number')
    
    if (data) setQuestions(data)
    setLoading(false)
  }

  const loadProgress = async () => {
    const { data } = await supabase
      .from('user_progress')
      .select('*')
      .eq('enrollment_id', enrollmentId)
      .eq('type', 'quiz')
      .single()
    
    if (data?.metadata?.answers) {
      setAnswers(data.metadata.answers)
      setScore(data.metadata.score)
    }
  }

  const saveProgress = async () => {
    const calculatedScore = calculateScore()
    
    await supabase
      .from('user_progress')
      .upsert({
        enrollment_id: enrollmentId,
        type: 'quiz',
        metadata: { answers, score: calculatedScore },
        completed_at: calculatedScore === 100 ? new Date().toISOString() : null,
        progress_percentage: calculatedScore
      })
    
    setScore(calculatedScore)
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) correct++
    })
    return Math.round((correct / questions.length) * 100)
  }

  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer })
  }

  const handleSubmit = async () => {
    await saveProgress()
    alert(`Quiz completed! Score: ${calculateScore()}%`)
  }

  if (loading) return <div>Loading quiz...</div>

  if (score !== null) {
    return (
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-xl font-bold mb-4">Quiz Results</h3>
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">{score}%</div>
          <p>{score >= 80 ? 'Passed! 🎉' : 'Keep practicing! 💪'}</p>
          <button
            onClick={() => {
              setAnswers({})
              setScore(null)
              setCurrentIndex(0)
            }}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return <div>No quiz available for this course</div>
  }

  const currentQuestion = questions[currentIndex]

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <div className="mb-4 flex justify-between">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <span>{Math.round((currentIndex / questions.length) * 100)}% Complete</span>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">{currentQuestion.question_text}</h3>
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => (
            <label key={idx} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name={`q${currentQuestion.id}`}
                value={option}
                checked={answers[currentQuestion.id] === option}
                onChange={() => handleAnswer(currentQuestion.id, option)}
                className="mr-3"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        
        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex(i => i + 1)}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}
