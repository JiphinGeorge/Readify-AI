document.addEventListener('DOMContentLoaded', () => {
    
    // UI Elements
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const fileNameDisplay = document.getElementById('file-name');
    const generateBtn = document.getElementById('generate-btn');
    const uploadForm = document.getElementById('upload-form');
    
    // Layout Wrappers
    const uploadContent = document.getElementById('upload-content');
    const statusSection = document.getElementById('status-section');
    
    // Status Elements
    const statusTitle = document.getElementById('status-title');
    const statusMessage = document.getElementById('status-message');
    const statPages = document.getElementById('stat-pages');
    const statChars = document.getElementById('stat-chars');
    const largeFileWarning = document.getElementById('large-file-warning');
    
    // Error Elements
    const errorAlert = document.getElementById('error-alert');
    const errorMessage = document.getElementById('error-message');
    const closeError = document.getElementById('close-error');

    let selectedFile = null;
    let pollInterval = null;

    // Drag and Drop Events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.add('border-primary');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.remove('border-primary');
        }, false);
    });

    dropArea.addEventListener('drop', (e) => {
        let dt = e.dataTransfer;
        let files = dt.files;
        handleFiles(files);
    });

    // Browse Button
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    // Handle File Selection
    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'application/pdf') {
                selectedFile = file;
                
                // Show file size
                const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
                fileNameDisplay.textContent = `${file.name} (${sizeInMB} MB)`;
                
                generateBtn.disabled = false;
            } else {
                showError('Please upload a valid PDF file.');
                resetFileInput();
            }
        }
    }

    function resetFileInput() {
        selectedFile = null;
        fileInput.value = '';
        fileNameDisplay.textContent = 'or click Browse above (Max 50MB)';
        generateBtn.disabled = true;
    }

    // Form Submission
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('pdf_file', selectedFile);
        formData.append('lang', document.getElementById('language-select').value);

        // UI Transition
        uploadContent.classList.add('hidden');
        statusSection.classList.remove('hidden');
        dropArea.classList.remove('cursor-pointer');
        dropArea.classList.remove('hover:border-primary');
        
        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to upload document');
            }

            // Update Stats
            statPages.textContent = data.pages;
            statChars.textContent = formatNumber(data.char_count);

            if (data.pages > 100) {
                largeFileWarning.classList.remove('hidden');
            }

            statusTitle.textContent = "Generating Audio...";
            statusMessage.textContent = "AI is synthesizing speech. This may take a while for large documents.";

            // Start Polling
            pollStatus(data.job_id);

        } catch (error) {
            handleProcessingError(error.message);
        }
    });

    // Poll Status
    function pollStatus(jobId) {
        pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`/status/${jobId}`);
                const data = await response.json();

                if (data.status === 'completed') {
                    clearInterval(pollInterval);
                    showSuccess(data);
                } else if (data.status === 'error') {
                    clearInterval(pollInterval);
                    handleProcessingError(data.message || 'Error generating audio');
                }
            } catch (error) {
                clearInterval(pollInterval);
                handleProcessingError('Lost connection to server while processing.');
            }
        }, 3000);
    }

    // Show Success Result and Redirect
    function showSuccess(data) {
        window.location.href = `/player/${data.audio_filename}`;
    }

    // Handle Errors
    function handleProcessingError(msg) {
        if (pollInterval) clearInterval(pollInterval);
        
        // Reset UI
        statusSection.classList.add('hidden');
        uploadContent.classList.remove('hidden');
        dropArea.classList.add('cursor-pointer');
        dropArea.classList.add('hover:border-primary');
        
        showError(msg);
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorAlert.classList.remove('hidden');
        setTimeout(() => {
            errorAlert.classList.add('hidden');
        }, 5000);
    }

    closeError.addEventListener('click', () => {
        errorAlert.classList.add('hidden');
    });

    function formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    }
});
