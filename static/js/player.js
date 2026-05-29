document.addEventListener('DOMContentLoaded', () => {
    // --- Native Audio Integration ---
    const audio = document.getElementById('native-audio');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const rewindBtn = document.getElementById('rewind-btn');
    const forwardBtn = document.getElementById('forward-btn');
    const speedBtn = document.getElementById('speed-btn');
    const muteBtn = document.getElementById('mute-btn');
    const volumeIcon = document.getElementById('volume-icon');
    
    const slider = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const errorAlert = document.getElementById('error-alert');
    const closeError = document.getElementById('close-error');
    
    let isPlaying = false;
    let playbackRates = [1, 1.25, 1.5, 2, 0.5];
    let currentRateIdx = 0;

    formatNumbers();

    function setTotalTime() {
        if (audio.duration && !isNaN(audio.duration)) {
            totalTimeEl.textContent = formatTime(audio.duration);
        }
    }

    if (audio.readyState >= 1) {
        setTotalTime();
    }

    audio.addEventListener('loadedmetadata', setTotalTime);

    audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        const percent = (audio.currentTime / audio.duration) * 100;
        slider.value = percent;
        slider.style.background = \`linear-gradient(to right, #6b38d4 \${percent}%, #e0e3e5 \${percent}%)\`;
        currentTimeEl.textContent = formatTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
        isPlaying = false;
        updatePlayIcon();
        toggleWaves(false);
        slider.value = 0;
        slider.style.background = \`linear-gradient(to right, #6b38d4 0%, #e0e3e5 0%)\`;
        audio.currentTime = 0;
    });

    audio.addEventListener('error', (e) => {
        console.error('Audio error:', audio.error);
        showError('Unable to load audio file. Error: ' + (audio.error ? audio.error.message : 'unknown'));
    });

    // Sync play state from actual audio events
    audio.addEventListener('play', () => {
        isPlaying = true;
        updatePlayIcon();
        toggleWaves(true);
    });

    audio.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayIcon();
        toggleWaves(false);
    });

    // Log audio src for debugging
    console.log('Audio element src:', audio.src);
    console.log('Audio readyState:', audio.readyState);

    // Seek slider input
    slider.addEventListener('input', function() {
        const percent = this.value;
        this.style.background = \`linear-gradient(to right, #6b38d4 \${percent}%, #e0e3e5 \${percent}%)\`;
        audio.currentTime = (percent / 100) * audio.duration;
    });

    playPauseBtn.addEventListener('click', () => {
        console.log('Play button clicked. audio.src:', audio.src, '| readyState:', audio.readyState);
        if (!audio.src || audio.src === '' || audio.src === window.location.href) {
            showError('Audio source is missing.');
            return;
        }
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(e => {
                console.error('Playback error:', e);
                showError('Playback failed: ' + e.message);
            });
        }
    });

    rewindBtn.addEventListener('click', () => {
        audio.currentTime = Math.max(0, audio.currentTime - 10);
    });

    forwardBtn.addEventListener('click', () => {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
    });

    speedBtn.addEventListener('click', () => {
        currentRateIdx = (currentRateIdx + 1) % playbackRates.length;
        const newRate = playbackRates[currentRateIdx];
        audio.playbackRate = newRate;
        speedBtn.textContent = \`\${newRate}x\`;
    });

    muteBtn.addEventListener('click', () => {
        audio.muted = !audio.muted;
        volumeIcon.textContent = audio.muted ? 'volume_off' : 'volume_up';
    });

    function updatePlayIcon() {
        playIcon.textContent = isPlaying ? 'pause' : 'play_arrow';
        // Keep inline styles intact — only toggle animation
        playIcon.style.color = '#fff';
        playIcon.style.fontVariationSettings = "'FILL' 1";
        if (isPlaying) {
            playPauseBtn.style.animation = 'none';
        } else {
            playPauseBtn.style.animation = 'play-pulse 2s infinite';
        }
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return \`\${mins}:\${secs < 10 ? '0' : ''}\${secs}\`;
    }

    function formatNumbers() {
        const charVal = document.getElementById('char-val');
        if (charVal && !isNaN(charVal.textContent)) {
            charVal.textContent = new Intl.NumberFormat().format(parseInt(charVal.textContent));
        }
    }

    function showError(msg) {
        document.getElementById('error-message').textContent = msg;
        errorAlert.classList.remove('hidden');
        setTimeout(() => {
            errorAlert.classList.add('hidden');
        }, 5000);
    }

    closeError.addEventListener('click', () => {
        errorAlert.classList.add('hidden');
    });

    // --- Stitch Visualizer Generators ---
    const waveformContainer = document.getElementById('waveform');
    const barCount = 40;
    const waveElements = [];
    
    for (let i = 0; i < barCount; i++) {
        const bar = document.createElement('div');
        const height = Math.random() * 80 + 20;
        bar.style.height = \`\${height}%\`;
        bar.style.transformOrigin = 'bottom';
        
        const duration = 0.5 + Math.random() * 0.8;
        const delay = Math.random() * -2;
        
        // Save animation string for toggling
        bar.dataset.animation = \`waveform-bounce \${duration}s infinite ease-in-out \${delay}s\`;
        bar.style.animation = 'none'; // Initially paused
        
        bar.className = 'w-full rounded-t-sm bg-gradient-to-t from-primary/20 to-primary/60 transition-colors duration-300';
        
        if(i < barCount * 0.4) {
             bar.className = 'w-full rounded-t-sm bg-gradient-to-t from-primary to-secondary-container transition-colors duration-300 shadow-[0_0_8px_rgba(107,56,212,0.5)]';
        }
        
        waveElements.push(bar);
        waveformContainer.appendChild(bar);
    }

    function toggleWaves(active) {
        waveElements.forEach(bar => {
            bar.style.animation = active ? bar.dataset.animation : 'none';
        });
    }

    // Particle generator
    const particlesContainer = document.getElementById('particles-container');
    const particleColors = ['text-primary-fixed', 'text-secondary-fixed', 'text-tertiary-fixed'];
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 6 + 2;
        const left = Math.random() * 100;
        const animationDuration = 15 + Math.random() * 20;
        const animationDelay = Math.random() * -30;
        const colorClass = particleColors[Math.floor(Math.random() * particleColors.length)];

        particle.className = \`particle \${colorClass}\`;
        particle.style.width = \`\${size}px\`;
        particle.style.height = \`\${size}px\`;
        particle.style.left = \`\${left}%\`;
        particle.style.animation = \`particle-drift \${animationDuration}s infinite linear \${animationDelay}s\`;
        
        particlesContainer.appendChild(particle);
    }
});
