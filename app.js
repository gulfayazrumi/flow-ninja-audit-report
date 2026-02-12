// Configuration
const API_URL = 'http://localhost:3000/api/generate-audit';

// DOM Elements
const auditForm = document.getElementById('auditForm');
const loadingState = document.getElementById('loadingState');
const successState = document.getElementById('successState');
const errorState = document.getElementById('errorState');
const submitBtn = document.getElementById('submitBtn');
const downloadBtn = document.getElementById('downloadBtn');
const newReportBtn = document.getElementById('newReportBtn');
const retryBtn = document.getElementById('retryBtn');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const errorMessage = document.getElementById('errorMessage');
const urlError = document.getElementById('urlError');

// State
let pdfBlob = null;
let progressInterval = null;

// Form Validation
function validateURL(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (e) {
        return false;
    }
}

function validateForm(formData) {
    const url = formData.get('websiteUrl');
    
    if (!validateURL(url)) {
        urlError.textContent = 'Please enter a valid URL (e.g., https://example.com)';
        return false;
    }
    
    urlError.textContent = '';
    return true;
}

// UI State Management
function showLoading() {
    auditForm.classList.add('hidden');
    successState.classList.add('hidden');
    errorState.classList.add('hidden');
    loadingState.classList.remove('hidden');
    
    // Simulate progress
    let progress = 0;
    const stages = [
        { progress: 10, text: 'Initializing scan...' },
        { progress: 25, text: 'Analyzing website structure...' },
        { progress: 40, text: 'Evaluating performance metrics...' },
        { progress: 55, text: 'Checking SEO optimization...' },
        { progress: 70, text: 'Assessing accessibility...' },
        { progress: 85, text: 'Generating comprehensive report...' },
        { progress: 95, text: 'Finalizing PDF document...' }
    ];
    
    let currentStage = 0;
    
    progressInterval = setInterval(() => {
        if (currentStage < stages.length) {
            progress = stages[currentStage].progress;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = stages[currentStage].text;
            currentStage++;
        }
    }, 15000); // Update every 15 seconds (total ~105 seconds for 7 stages)
}

function showSuccess() {
    clearInterval(progressInterval);
    loadingState.classList.add('hidden');
    successState.classList.remove('hidden');
    progressFill.style.width = '100%';
}

function showError(message) {
    clearInterval(progressInterval);
    loadingState.classList.add('hidden');
    errorState.classList.remove('hidden');
    errorMessage.textContent = message || 'Unable to generate the audit report. Please try again.';
}

function resetForm() {
    auditForm.classList.remove('hidden');
    loadingState.classList.add('hidden');
    successState.classList.add('hidden');
    errorState.classList.add('hidden');
    progressFill.style.width = '0%';
    pdfBlob = null;
}

// API Communication
async function generateAuditReport(formData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                websiteUrl: formData.get('websiteUrl'),
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                position: formData.get('position'),
                industry: formData.get('industry'),
                goal: formData.get('goal')
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate report');
        }

        // Get PDF blob
        pdfBlob = await response.blob();
        showSuccess();
    } catch (error) {
        console.error('Error generating report:', error);
        
        if (error.message.includes('fetch')) {
            showError('Unable to connect to the server. Please ensure the backend is running.');
        } else {
            showError(error.message);
        }
    }
}

// Download Handler
function downloadPDF() {
    if (!pdfBlob) {
        showError('PDF not available. Please try generating the report again.');
        return;
    }

    const url = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `website-audit-report-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Event Listeners
auditForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(auditForm);
    
    if (!validateForm(formData)) {
        return;
    }
    
    showLoading();
    await generateAuditReport(formData);
});

downloadBtn.addEventListener('click', downloadPDF);

newReportBtn.addEventListener('click', resetForm);

retryBtn.addEventListener('click', resetForm);

// Real-time URL validation
document.getElementById('websiteUrl').addEventListener('blur', (e) => {
    const url = e.target.value;
    if (url && !validateURL(url)) {
        urlError.textContent = 'Please enter a valid URL (e.g., https://example.com)';
    } else {
        urlError.textContent = '';
    }
});

// Clear error on input
document.getElementById('websiteUrl').addEventListener('input', () => {
    urlError.textContent = '';
});
