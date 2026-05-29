document.addEventListener('DOMContentLoaded', () => {
    // --- Add Tailwind Config Injector (Shared with Landing Page) ---
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
              }
            }
          }
        }
    `;
    document.head.appendChild(tailwindConfig);

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

    audio.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(audio.duration);
    });

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

    audio.addEventListener('error', () => {
        showError("Unable to load audio file.");
    });

    // Seek slider input
    slider.addEventListener('input', function() {
        const percent = this.value;
        this.style.background = \`linear-gradient(to right, #6b38d4 \${percent}%, #e0e3e5 \${percent}%)\`;
        audio.currentTime = (percent / 100) * audio.duration;
    });

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
        if (isPlaying) {
            playPauseBtn.style.animation = 'none'; // Stop pulse when playing
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
