import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { Quiz } from '../components/Quiz'
import { MpesaPayment } from '../components/MpesaPayment'

export const CourseDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [course, setCourse] = useState(null)
  const [enrollment, setEnrollment] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  // REAL AUTH GUARD - Redirect if not logged in
  useEffect(() => {
    if (!user && !loading) {
      // Save intended destination
      sessionStorage.setItem('redirectAfterLogin', `/course/${id}`)
      navigate('/login', { replace: true })
    }
  }, [user, id, navigate, loading])

  useEffect(() => {
    if (!user) return

    const loadCourseData = async () => {
      setLoading(true)
      try {
        // Load course
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .single()

        if (courseError) throw courseError
        setCourse(courseData)

        // Check enrollment
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', id)
          .single()

        if (!enrollmentError && enrollmentData) {
          setEnrollment(enrollmentData)
          
          // Load progress
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('*')
            .eq('enrollment_id', enrollmentData.id)
          
          setProgress(progressData)
        }
      } catch (err) {
        console.error('Error loading course:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCourseData()
  }, [user, id])

  const handleEnroll = async (paymentMethod = 'mpesa') => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      // Create enrollment record
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: id,
          status: 'pending_payment',
          enrolled_at: new Date().toISOString()
        })
        .select()
        .single()

      if (enrollmentError) throw enrollmentError
      setEnrollment(enrollment)

      if (paymentMethod === 'mpesa') {
        // Trigger M-Pesa payment
        // Will be handled by MpesaPayment component
        return enrollment
      }

      // If free, mark as active
      if (course.price === 0) {
        await supabase
          .from('enrollments')
          .update({ status: 'active', payment_status: 'completed' })
          .eq('id', enrollment.id)
      }
    } catch (err) {
      console.error('Enrollment error:', err)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!course) {
    return <div className="text-center py-20">Course not found</div>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{course.name}</h1>
      <p className="text-gray-600 mb-6">{course.description}</p>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="font-semibold">Course Details</h2>
        <p>Duration: {course.duration}</p>
        <p>Level: {course.level}</p>
        <p className="text-2xl font-bold text-green-600">
          {course.price === 0 ? 'FREE' : `KES ${course.price.toLocaleString()}`}
        </p>
      </div>

      {!enrollment ? (
        <div className="text-center py-8">
          <button
            onClick={() => handleEnroll()}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700"
          >
            Enroll Now
          </button>
        </div>
      ) : enrollment.status === 'pending_payment' ? (
        <MpesaPayment
          amount={course.price}
          phoneNumber={profile?.phone}
          onSuccess={async () => {
            await supabase
              .from('enrollments')
              .update({ status: 'active', payment_status: 'completed' })
              .eq('id', enrollment.id)
            window.location.reload()
          }}
        />
      ) : enrollment.status === 'active' ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Course Content</h2>
          {course.has_quiz && <Quiz courseId={course.id} enrollmentId={enrollment.id} />}
        </div>
      ) : null}
    </div>
  )
}
