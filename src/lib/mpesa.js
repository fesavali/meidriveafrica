import axios from 'axios'

// Backend endpoint for M-Pesa (create a Supabase Edge Function or your own backend)
const MPESA_API_URL = import.meta.env.VITE_MPESA_API_URL || '/api/mpesa'

export const initiateMpesaPayment = async (phoneNumber, amount, reference) => {
  try {
    const response = await axios.post(`${MPESA_API_URL}/stkpush`, {
      phoneNumber: phoneNumber.replace(/^0/, '254'), // Convert to 254 format
      amount,
      reference,
      callbackUrl: `${import.meta.env.VITE_APP_URL}/api/mpesa/callback`
    })
    
    return { success: true, data: response.data }
  } catch (error) {
    console.error('M-Pesa error:', error)
    return { success: false, error: error.response?.data?.message || 'Payment failed' }
  }
}

export const checkPaymentStatus = async (checkoutRequestId) => {
  try {
    const response = await axios.post(`${MPESA_API_URL}/status`, {
      checkoutRequestId
    })
    return { success: true, status: response.data.status }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
