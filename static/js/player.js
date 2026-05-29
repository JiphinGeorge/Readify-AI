document.addEventListener('DOMContentLoaded', () => {
    
    const audio = document.getElementById('native-audio');
    
    // Controls
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const rewindBtn = document.getElementById('rewind-btn');
    const forwardBtn = document.getElementById('forward-btn');
    const speedBtn = document.getElementById('speed-btn');
    const muteBtn = document.getElementById('mute-btn');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeSlider = document.getElementById('volume-slider');
    
    // Progress
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    
    // Waves Animation
    const waves = document.querySelectorAll('.wave');
    
    // Error Alert
    const errorAlert = document.getElementById('error-alert');
    const closeError = document.getElementById('close-error');
    
    let isPlaying = false;
    let playbackRates = [1, 1.25, 1.5, 2, 0.5];
    let currentRateIdx = 0;

    // Initialize formatting
    formatNumbers();

    // -- AUDIO EVENT LISTENERS --

    audio.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
        const percent = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${percent}%`;
        currentTimeEl.textContent = formatTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
        isPlaying = false;
        updatePlayIcon();
        toggleWaves(false);
        progressBar.style.width = '0%';
        audio.currentTime = 0;
    });

    audio.addEventListener('error', () => {
        showError("Unable to load audio file.");
    });

    // -- CONTROLS --

    playPauseBtn.addEventListener('click', () => {
        if (!audio.src || audio.src.endsWith('None')) {
            showError("Audio source is invalid.");
            return;
        }

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(e => {
                showError("Playback blocked. Please try again.");
            });
        }
        isPlaying = !isPlaying;
        updatePlayIcon();
        toggleWaves(isPlaying);
    });

    rewindBtn.addEventListener('click', () => {
        audio.currentTime = Math.max(0, audio.currentTime - 15);
    });

    forwardBtn.addEventListener('click', () => {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 15);
    });

    speedBtn.addEventListener('click', () => {
        currentRateIdx = (currentRateIdx + 1) % playbackRates.length;
        const newRate = playbackRates[currentRateIdx];
        audio.playbackRate = newRate;
        speedBtn.textContent = `${newRate}x`;
    });

    // Volume & Mute
    muteBtn.addEventListener('click', () => {
        audio.muted = !audio.muted;
        updateVolumeIcon();
    });

    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value;
        if (audio.volume > 0) audio.muted = false;
        updateVolumeIcon();
    });

    // Progress Bar Seeking
    progressContainer.addEventListener('click', (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pos * audio.duration;
    });

    // -- HELPERS --

    function updatePlayIcon() {
        if (isPlaying) {
            playIcon.classList.remove('fa-play');
            playIcon.classList.add('fa-pause');
        } else {
            playIcon.classList.remove('fa-pause');
            playIcon.classList.add('fa-play');
        }
    }

    function toggleWaves(active) {
        waves.forEach(wave => {
            if (active) {
                wave.classList.add('playing');
            } else {
                wave.classList.remove('playing');
            }
        });
    }

    function updateVolumeIcon() {
        volumeIcon.className = '';
        if (audio.muted || audio.volume === 0) {
            volumeIcon.className = 'fa-solid fa-volume-xmark';
        } else if (audio.volume < 0.5) {
            volumeIcon.className = 'fa-solid fa-volume-low';
        } else {
            volumeIcon.className = 'fa-solid fa-volume-high';
        }
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function formatNumbers() {
        const charVal = document.getElementById('char-val');
        if (charVal && !isNaN(charVal.textContent)) {
            charVal.textContent = new Intl.NumberFormat().format(parseInt(charVal.textContent));
        }
    }

    // Error Alert Handlers
    function showError(msg) {
        document.getElementById('error-message').textContent = msg;
        errorAlert.classList.add('show');
        setTimeout(() => {
            errorAlert.classList.remove('show');
        }, 5000);
    }

    closeError.addEventListener('click', () => {
        errorAlert.classList.remove('show');
    });

});
