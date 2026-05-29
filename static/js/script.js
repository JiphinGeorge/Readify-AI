document.addEventListener('DOMContentLoaded', function() {
    var dropArea = document.getElementById('drop-area');
    var fileInput = document.getElementById('file-input');
    var fileNameDisplay = document.getElementById('file-name');
    var generateBtn = document.getElementById('generate-btn');
    var uploadForm = document.getElementById('upload-form');
    var uploadContent = document.getElementById('upload-content');
    var statusSection = document.getElementById('status-section');
    var statusTitle = document.getElementById('status-title');
    var statusMessage = document.getElementById('status-message');
    var statPages = document.getElementById('stat-pages');
    var statChars = document.getElementById('stat-chars');
    var largeFileWarning = document.getElementById('large-file-warning');
    var errorAlert = document.getElementById('error-alert');
    var errorMessage = document.getElementById('error-message');
    var closeError = document.getElementById('close-error');

    var selectedFile = null;
    var pollInterval = null;

    // Drag and Drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function(eventName) {
        dropArea.addEventListener(eventName, function(e) {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    ['dragenter', 'dragover'].forEach(function(eventName) {
        dropArea.addEventListener(eventName, function() {
            dropArea.classList.add('drag-over');
        }, false);
    });

    ['dragleave', 'drop'].forEach(function(eventName) {
        dropArea.addEventListener(eventName, function() {
            dropArea.classList.remove('drag-over');
        }, false);
    });

    dropArea.addEventListener('drop', function(e) {
        handleFiles(e.dataTransfer.files);
    });

    // Click on upload card to browse
    dropArea.addEventListener('click', function(e) {
        if (e.target.tagName !== 'LABEL' && e.target.tagName !== 'SELECT' &&
            e.target.tagName !== 'OPTION' && e.target.tagName !== 'BUTTON' &&
            !e.target.closest('label') && !e.target.closest('select') &&
            !e.target.closest('button')) {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (files.length > 0) {
            var file = files[0];
            if (file.type === 'application/pdf') {
                selectedFile = file;
                var sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
                fileNameDisplay.textContent = file.name + ' (' + sizeInMB + ' MB)';
                fileNameDisplay.style.color = '#7C3AED';
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
        fileNameDisplay.textContent = 'or click below to browse files (Max 50MB)';
        fileNameDisplay.style.color = '';
        generateBtn.disabled = true;
    }

    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!selectedFile) return;

        var formData = new FormData();
        formData.append('pdf_file', selectedFile);
        formData.append('lang', document.getElementById('language-select').value);

        uploadContent.classList.add('hidden');
        statusSection.classList.remove('hidden');

        fetch('/upload', { method: 'POST', body: formData })
            .then(function(response) {
                return response.json().then(function(data) {
                    if (!response.ok) throw new Error(data.error || 'Upload failed');
                    return data;
                });
            })
            .then(function(data) {
                statPages.textContent = data.pages;
                statChars.textContent = formatNumber(data.char_count);
                if (data.pages > 100) {
                    largeFileWarning.classList.remove('hidden');
                }
                statusTitle.textContent = 'Generating Audio...';
                statusMessage.textContent = 'AI is synthesizing speech. This may take a while for large documents.';
                pollStatus(data.job_id);
            })
            .catch(function(error) {
                handleProcessingError(error.message);
            });
    });

    function pollStatus(jobId) {
        pollInterval = setInterval(function() {
            fetch('/status/' + jobId)
                .then(function(r) { return r.json(); })
                .then(function(data) {
                    if (data.status === 'completed') {
                        clearInterval(pollInterval);
                        window.location.href = '/player/' + data.audio_filename;
                    } else if (data.status === 'error') {
                        clearInterval(pollInterval);
                        handleProcessingError(data.message || 'Error generating audio');
                    }
                })
                .catch(function() {
                    clearInterval(pollInterval);
                    handleProcessingError('Lost connection to server.');
                });
        }, 3000);
    }

    function handleProcessingError(msg) {
        if (pollInterval) clearInterval(pollInterval);
        statusSection.classList.add('hidden');
        uploadContent.classList.remove('hidden');
        showError(msg);
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorAlert.classList.remove('hidden');
        setTimeout(function() { errorAlert.classList.add('hidden'); }, 5000);
    }

    closeError.addEventListener('click', function() {
        errorAlert.classList.add('hidden');
    });

    function formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    }
});
