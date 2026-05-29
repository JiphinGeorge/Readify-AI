document.addEventListener('DOMContentLoaded', function() {
    // --- Native Audio Integration ---
    var audio = document.getElementById('native-audio');
    var playPauseBtn = document.getElementById('play-pause-btn');
    var playIcon = document.getElementById('play-icon');
    var rewindBtn = document.getElementById('rewind-btn');
    var forwardBtn = document.getElementById('forward-btn');
    var speedBtn = document.getElementById('speed-btn');
    var muteBtn = document.getElementById('mute-btn');
    var volumeIcon = document.getElementById('volume-icon');

    var slider = document.getElementById('progress-bar');
    var currentTimeEl = document.getElementById('current-time');
    var totalTimeEl = document.getElementById('total-time');
    var errorAlert = document.getElementById('error-alert');
    var closeError = document.getElementById('close-error');

    var isPlaying = false;
    var playbackRates = [1, 1.25, 1.5, 2, 0.5];
    var currentRateIdx = 0;

    formatNumbers();

    // Log audio src for debugging
    console.log('Audio element src:', audio.src);
    console.log('Audio readyState:', audio.readyState);

    function setTotalTime() {
        if (audio.duration && !isNaN(audio.duration)) {
            totalTimeEl.textContent = formatTime(audio.duration);
        }
    }

    if (audio.readyState >= 1) {
        setTotalTime();
    }

    audio.addEventListener('loadedmetadata', setTotalTime);

    audio.addEventListener('timeupdate', function() {
        if (!audio.duration) return;
        var percent = (audio.currentTime / audio.duration) * 100;
        slider.value = percent;
        slider.style.background = 'linear-gradient(to right, #6b38d4 ' + percent + '%, #e0e3e5 ' + percent + '%)';
        currentTimeEl.textContent = formatTime(audio.currentTime);
    });

    audio.addEventListener('ended', function() {
        isPlaying = false;
        updatePlayIcon();
        toggleWaves(false);
        slider.value = 0;
        slider.style.background = 'linear-gradient(to right, #6b38d4 0%, #e0e3e5 0%)';
        audio.currentTime = 0;
    });

    audio.addEventListener('error', function(e) {
        console.error('Audio error:', audio.error);
        var msg = 'Unable to load audio file.';
        if (audio.error) {
            msg += ' Error: ' + audio.error.message;
        }
        showError(msg);
    });

    // Sync play state from actual audio events
    audio.addEventListener('play', function() {
        isPlaying = true;
        updatePlayIcon();
        toggleWaves(true);
    });

    audio.addEventListener('pause', function() {
        isPlaying = false;
        updatePlayIcon();
        toggleWaves(false);
    });

    // Seek slider input
    slider.addEventListener('input', function() {
        var percent = this.value;
        this.style.background = 'linear-gradient(to right, #6b38d4 ' + percent + '%, #e0e3e5 ' + percent + '%)';
        audio.currentTime = (percent / 100) * audio.duration;
    });

    // Play/Pause toggle
    playPauseBtn.addEventListener('click', function() {
        console.log('Play button clicked. audio.src:', audio.src, '| readyState:', audio.readyState);
        if (!audio.src || audio.src === '' || audio.src === window.location.href) {
            showError('Audio source is missing.');
            return;
        }
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(function(e) {
                console.error('Playback error:', e);
                showError('Playback failed: ' + e.message);
            });
        }
    });

    rewindBtn.addEventListener('click', function() {
        audio.currentTime = Math.max(0, audio.currentTime - 10);
    });

    forwardBtn.addEventListener('click', function() {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
    });

    speedBtn.addEventListener('click', function() {
        currentRateIdx = (currentRateIdx + 1) % playbackRates.length;
        var newRate = playbackRates[currentRateIdx];
        audio.playbackRate = newRate;
        speedBtn.textContent = newRate + 'x';
    });

    muteBtn.addEventListener('click', function() {
        audio.muted = !audio.muted;
        volumeIcon.textContent = audio.muted ? 'volume_off' : 'volume_up';
    });

    function updatePlayIcon() {
        playIcon.textContent = isPlaying ? 'pause' : 'play_arrow';
        playIcon.style.color = '#fff';
        playIcon.style.fontVariationSettings = "'FILL' 1";
        if (isPlaying) {
            playPauseBtn.style.animation = 'none';
        } else {
            playPauseBtn.style.animation = 'play-pulse 2s infinite';
        }
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        var mins = Math.floor(seconds / 60);
        var secs = Math.floor(seconds % 60);
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }

    function formatNumbers() {
        var charVal = document.getElementById('char-val');
        if (charVal && !isNaN(charVal.textContent)) {
            charVal.textContent = new Intl.NumberFormat().format(parseInt(charVal.textContent));
        }
    }

    function showError(msg) {
        document.getElementById('error-message').textContent = msg;
        errorAlert.classList.remove('hidden');
        setTimeout(function() {
            errorAlert.classList.add('hidden');
        }, 5000);
    }

    closeError.addEventListener('click', function() {
        errorAlert.classList.add('hidden');
    });

    // --- Stitch Visualizer Generators ---
    var waveformContainer = document.getElementById('waveform');
    var barCount = 40;
    var waveElements = [];

    for (var i = 0; i < barCount; i++) {
        var bar = document.createElement('div');
        var height = Math.random() * 80 + 20;
        bar.style.height = height + '%';
        bar.style.transformOrigin = 'bottom';

        var duration = 0.5 + Math.random() * 0.8;
        var delay = Math.random() * -2;

        bar.dataset.animation = 'waveform-bounce ' + duration + 's infinite ease-in-out ' + delay + 's';
        bar.style.animation = 'none';

        bar.className = 'w-full rounded-t-sm bg-gradient-to-t from-primary/20 to-primary/60 transition-colors duration-300';

        if (i < barCount * 0.4) {
            bar.className = 'w-full rounded-t-sm bg-gradient-to-t from-primary to-secondary-container transition-colors duration-300 shadow-[0_0_8px_rgba(107,56,212,0.5)]';
        }

        waveElements.push(bar);
        waveformContainer.appendChild(bar);
    }

    function toggleWaves(active) {
        for (var j = 0; j < waveElements.length; j++) {
            waveElements[j].style.animation = active ? waveElements[j].dataset.animation : 'none';
        }
    }

    // Particle generator
    var particlesContainer = document.getElementById('particles-container');
    var particleColors = ['text-primary-fixed', 'text-secondary-fixed', 'text-tertiary-fixed'];
    var particleCount = 20;

    for (var k = 0; k < particleCount; k++) {
        var particle = document.createElement('div');
        var size = Math.random() * 6 + 2;
        var left = Math.random() * 100;
        var animDuration = 15 + Math.random() * 20;
        var animDelay = Math.random() * -30;
        var colorClass = particleColors[Math.floor(Math.random() * particleColors.length)];

        particle.className = 'particle ' + colorClass;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = left + '%';
        particle.style.animation = 'particle-drift ' + animDuration + 's infinite linear ' + animDelay + 's';

        particlesContainer.appendChild(particle);
    }
});
