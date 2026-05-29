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

    // --- Add Tailwind Config Injector ---
    const tailwindConfig = document.createElement('script');
    tailwindConfig.innerHTML = `
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                      "primary-fixed": "#e9ddff",
                      "surface-tint": "#6d3bd7",
                      "background": "#f7f9fb",
                      "surface-container-low": "#f2f4f6",
                      "tertiary-fixed-dim": "#ffb783",
                      "on-primary": "#ffffff",
                      "secondary": "#006591",
                      "on-secondary-fixed-variant": "#004c6e",
                      "surface-dim": "#d8dadc",
                      "on-tertiary-container": "#fffbff",
                      "on-primary-fixed-variant": "#5516be",
                      "on-tertiary-fixed": "#301400",
                      "error-container": "#ffdad6",
                      "on-error": "#ffffff",
                      "surface": "#f7f9fb",
                      "surface-container-lowest": "#ffffff",
                      "primary-container": "#8455ef",
                      "on-background": "#191c1e",
                      "on-error-container": "#93000a",
                      "surface-container": "#eceef0",
                      "error": "#ba1a1a",
                      "on-primary-fixed": "#23005c",
                      "on-secondary": "#ffffff",
                      "on-primary-container": "#fffbff",
                      "tertiary-container": "#b55d00",
                      "outline-variant": "#cbc3d7",
                      "surface-container-high": "#e6e8ea",
                      "primary-fixed-dim": "#d0bcff",
                      "on-tertiary": "#ffffff",
                      "on-secondary-container": "#004666",
                      "on-tertiary-fixed-variant": "#713700",
                      "inverse-on-surface": "#eff1f3",
                      "on-secondary-fixed": "#001e2f",
                      "tertiary-fixed": "#ffdcc5",
                      "surface-variant": "#e0e3e5",
                      "outline": "#7b7486",
                      "secondary-fixed": "#c9e6ff",
                      "on-surface-variant": "#494454",
                      "secondary-container": "#39b8fd",
                      "inverse-surface": "#2d3133",
                      "secondary-fixed-dim": "#89ceff",
                      "primary": "#6b38d4",
                      "surface-container-highest": "#e0e3e5",
                      "tertiary": "#904800",
                      "on-surface": "#191c1e",
                      "inverse-primary": "#d0bcff",
                      "surface-bright": "#f7f9fb"
              },
              "borderRadius": {
                      "DEFAULT": "1rem",
                      "lg": "2rem",
                      "xl": "3rem",
                      "full": "9999px"
              },
              "spacing": {
                      "container-max": "1200px",
                      "base": "8px",
                      "margin-mobile": "16px",
                      "gutter": "24px",
                      "margin-desktop": "40px"
              },
              "fontFamily": {
                      "headline-md": ["Plus Jakarta Sans"],
                      "label-sm": ["Inter"],
                      "display-lg-mobile": ["Plus Jakarta Sans"],
                      "body-lg": ["Plus Jakarta Sans"],
                      "display-lg": ["Plus Jakarta Sans"],
                      "body-md": ["Plus Jakarta Sans"]
              },
              "fontSize": {
                      "label-sm": ["13px", {"lineHeight": "1.2", "letterSpacing": "0.01em", "fontWeight": "600"}],
                      "headline-md": ["24px", {"lineHeight": "1.4", "fontWeight": "600"}],
                      "display-lg-mobile": ["32px", {"lineHeight": "1.2", "fontWeight": "700"}],
                      "body-md": ["16px", {"lineHeight": "1.6", "fontWeight": "400"}],
                      "display-lg": ["48px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                      "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}]
              },
              animation: {
                'blob': 'blob 10s infinite',
                'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'slide-up': 'slide-up 0.5s ease-out forwards',
                'icon-pulse': 'icon-pulse 3s ease-in-out infinite',
              },
              keyframes: {
                blob: {
                  '0%': { transform: 'translate(0px, 0px) scale(1)' },
                  '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                  '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                  '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                'pulse-glow': {
                  '0%, 100%': { opacity: '1' },
                  '50%': { opacity: '.5' },
                },
                'icon-pulse': {
                  '0%, 100%': { transform: 'scale(1)', opacity: '1' },
                  '50%': { transform: 'scale(1.15)', opacity: '0.8' },
                }
              }
            }
          }
        }
    `;
    document.head.appendChild(tailwindConfig);

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
