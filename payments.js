// =====================================================
// MEI DRIVE AFRICA - FRONTEND PAYMENT HANDLER
// PRODUCTION READY
// =====================================================

// Backend API URL - Your Render.com backend address
const API_URL = 'https://meidriveafrica-backend.onrender.com';

// Payment state
let currentPayment = {
    courseId: null,
    courseName: null,
    amount: null,
    userId: null,
    checkoutRequestID: null,
    status: 'pending'
};

let paymentInterval = null;

// Initialize payment system
function initPaymentSystem() {
    console.log('💳 Payment system initialized - PRODUCTION MODE');
    console.log('📍 Backend URL:', API_URL);
    
    // Add event listener to payment button
    const payBtn = document.getElementById('processPaymentBtn');
    if (payBtn) {
        payBtn.removeEventListener('click', processMpesaPayment);
        payBtn.addEventListener('click', processMpesaPayment);
    }
    
    // Check backend health
    checkBackendHealth();
    setInterval(checkBackendHealth, 30000);
}

// Check backend health
async function checkBackendHealth() {
    try {
        const response = await fetch(`${API_URL}/api/health`);
        const data = await response.json();
        
        const statusDiv = document.getElementById('backendStatus');
        if (statusDiv) {
            if (response.ok) {
                statusDiv.innerHTML = '🟢 Backend: Online - Production Mode';
                statusDiv.className = 'status-badge online';
                console.log('✅ Backend connected:', data);
            } else {
                throw new Error('Backend not responding');
            }
        }
        return true;
    } catch (error) {
        console.error('❌ Backend offline:', error);
        const statusDiv = document.getElementById('backendStatus');
        if (statusDiv) {
            statusDiv.innerHTML = '🔴 Backend: Offline - Please try again later';
            statusDiv.className = 'status-badge offline';
        }
        return false;
    }
}

// Open payment modal
function openPaymentModal(courseId, courseName, amount, userId) {
    // Validate minimum payment (49 KES)
    const MINIMUM_PAYMENT = 49;
    if (amount < MINIMUM_PAYMENT) {
        showToast(`Minimum payment amount is ${MINIMUM_PAYMENT} KES`, true);
        return;
    }
    
    currentPayment = {
        courseId: courseId,
        courseName: courseName,
        amount: amount,
        userId: userId,
        checkoutRequestID: null,
        status: 'pending'
    };
    
    // Update modal content
    const courseNameEl = document.getElementById('paymentCourseName');
    const amountEl = document.getElementById('paymentAmount');
    const phoneInput = document.getElementById('mpesaPhone');
    const statusDiv = document.getElementById('paymentStatus');
    
    if (courseNameEl) courseNameEl.innerHTML = `<strong>${escapeHtml(courseName)}</strong>`;
    if (amountEl) amountEl.innerHTML = `KES ${amount.toLocaleString()}`;
    if (phoneInput) phoneInput.value = '';
    if (statusDiv) {
        statusDiv.className = 'payment-status';
        statusDiv.style.display = 'none';
    }
    
    // Show modal
    const modal = document.getElementById('mpesaModal');
    if (modal) modal.classList.add('active');
}

// Process M-Pesa payment
async function processMpesaPayment() {
    const phoneInput = document.getElementById('mpesaPhone');
    const phone = phoneInput ? phoneInput.value : '';
    
    // Validate phone number
    if (!phone || phone.length < 10) {
        showToast('Please enter a valid M-Pesa phone number (e.g., 0712345678)', true);
        return;
    }
    
    // Validate minimum payment
    if (currentPayment.amount < 49) {
        showToast('Minimum payment amount is 49 KES', true);
        return;
    }
    
    const payBtn = document.getElementById('processPaymentBtn');
    const originalText = payBtn ? payBtn.innerHTML : 'Pay with M-Pesa';
    
    if (payBtn) {
        payBtn.innerHTML = '<span class="loading-spinner"></span> Initiating payment...';
        payBtn.disabled = true;
    }
    
    try {
        // Check backend
        const backendOnline = await checkBackendHealth();
        if (!backendOnline) {
            throw new Error('Backend server is not responding. Please try again later.');
        }
        
        // Initiate payment
        const response = await fetch(`${API_URL}/api/payments/mpesa/initiate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phoneNumber: phone,
                amount: currentPayment.amount,
                courseId: currentPayment.courseId,
                courseName: currentPayment.courseName,
                userId: currentPayment.userId
            })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Payment initiation failed');
        }
        
        currentPayment.checkoutRequestID = result.checkoutRequestID;
        
        showToast('📱 Check your phone for M-Pesa prompt. Enter PIN to complete payment.', false);
        
        const statusDiv = document.getElementById('paymentStatus');
        if (statusDiv) {
            statusDiv.innerHTML = '<div class="status success">📱 Payment initiated! Check your phone for M-Pesa prompt.</div>';
            statusDiv.style.display = 'block';
        }
        
        // Start polling for payment status
        startPollingPaymentStatus(payBtn, originalText);
        
    } catch (error) {
        console.error('Payment error:', error);
        showToast(error.message || 'Payment failed. Please try again.', true);
        if (payBtn) {
            payBtn.innerHTML = originalText;
            payBtn.disabled = false;
        }
    }
}

// Poll payment status
function startPollingPaymentStatus(payBtn, originalText) {
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max
    
    if (paymentInterval) clearInterval(paymentInterval);
    
    paymentInterval = setInterval(async () => {
        attempts++;
        
        try {
            const response = await fetch(`${API_URL}/api/payments/mpesa/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ checkoutRequestID: currentPayment.checkoutRequestID })
            });
            
            const status = await response.json();
            
            if (status.status === 'completed') {
                clearInterval(paymentInterval);
                showToast(`✅ Payment successful! You are now enrolled in ${currentPayment.courseName}`, false);
                
                const statusDiv = document.getElementById('paymentStatus');
                if (statusDiv) {
                    statusDiv.innerHTML = '<div class="status success">✅ Payment completed successfully!</div>';
                }
                
                if (payBtn) {
                    payBtn.innerHTML = originalText;
                    payBtn.disabled = false;
                }
                
                // Close modal and refresh after 2 seconds
                setTimeout(() => {
                    closeMpesaModal();
                    location.reload();
                }, 2000);
                
            } else if (status.status === 'failed') {
                clearInterval(paymentInterval);
                showToast(`❌ Payment failed: ${status.resultDesc || 'Unknown error'}`, true);
                
                const statusDiv = document.getElementById('paymentStatus');
                if (statusDiv) {
                    statusDiv.innerHTML = `<div class="status error">❌ Payment failed: ${status.resultDesc}</div>`;
                }
                
                if (payBtn) {
                    payBtn.innerHTML = originalText;
                    payBtn.disabled = false;
                }
            }
            
            if (attempts >= maxAttempts && status.status !== 'completed') {
                clearInterval(paymentInterval);
                showToast('⏰ Payment timeout. Please check your M-Pesa messages.', true);
                if (payBtn) {
                    payBtn.innerHTML = originalText;
                    payBtn.disabled = false;
                }
            }
            
        } catch (err) {
            console.error('Status check error:', err);
            if (attempts >= maxAttempts) {
                clearInterval(paymentInterval);
                if (payBtn) {
                    payBtn.innerHTML = originalText;
                    payBtn.disabled = false;
                }
            }
        }
    }, 2000);
}

// Show toast notification
function showToast(msg, isError = false) {
    const toast = document.getElementById('paymentToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.background = isError ? '#8b0000' : '#1a472a';
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 3000);
}

// Escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Close M-Pesa modal
function closeMpesaModal() {
    if (paymentInterval) clearInterval(paymentInterval);
    const modal = document.getElementById('mpesaModal');
    if (modal) modal.classList.remove('active');
}

// Export to global scope
window.openPaymentModal = openPaymentModal;
window.closeMpesaModal = closeMpesaModal;
window.processMpesaPayment = processMpesaPayment;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initPaymentSystem();
});
