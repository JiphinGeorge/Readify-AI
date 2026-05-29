document.addEventListener('DOMContentLoaded', function() {
    // --- Audio Elements ---
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

    console.log('[Readify] Audio src:', audio.src);
    console.log('[Readify] Audio readyState:', audio.readyState);

    // --- Duration ---
    function setTotalTime() {
        if (audio.duration && !isNaN(audio.duration)) {
            totalTimeEl.textContent = formatTime(audio.duration);
            console.log('[Readify] Duration set:', audio.duration);
        }
    }

    if (audio.readyState >= 1) {
        setTotalTime();
    }
    audio.addEventListener('loadedmetadata', setTotalTime);
    audio.addEventListener('durationchange', setTotalTime);

    // --- Time Update ---
    audio.addEventListener('timeupdate', function() {
        if (!audio.duration) return;
        var percent = (audio.currentTime / audio.duration) * 100;
        slider.value = percent;
        slider.style.background = 'linear-gradient(to right, #7C3AED ' + percent + '%, rgba(255,255,255,0.1) ' + percent + '%)';
        currentTimeEl.textContent = formatTime(audio.currentTime);
    });

    // --- Ended ---
    audio.addEventListener('ended', function() {
        isPlaying = false;
        updatePlayIcon();
        toggleWaves(false);
        slider.value = 0;
        slider.style.background = 'linear-gradient(to right, #7C3AED 0%, rgba(255,255,255,0.1) 0%)';
        audio.currentTime = 0;
    });

    // --- Error ---
    audio.addEventListener('error', function() {
        console.error('[Readify] Audio error:', audio.error);
        showError('Unable to load audio file.');
    });

    // --- State Sync ---
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

    // --- Seek ---
    slider.addEventListener('input', function() {
        var percent = this.value;
        this.style.background = 'linear-gradient(to right, #7C3AED ' + percent + '%, rgba(255,255,255,0.1) ' + percent + '%)';
        if (audio.duration) {
            audio.currentTime = (percent / 100) * audio.duration;
        }
    });

    // --- Play/Pause ---
    playPauseBtn.addEventListener('click', function() {
        console.log('[Readify] Play clicked. src:', audio.src, 'readyState:', audio.readyState);
        if (!audio.src || audio.src === '' || audio.src === window.location.href) {
            showError('Audio source is missing.');
            return;
        }
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(function(e) {
                console.error('[Readify] Playback error:', e);
                showError('Playback failed: ' + e.message);
            });
        }
    });

    // --- Rewind/Forward ---
    rewindBtn.addEventListener('click', function() {
        audio.currentTime = Math.max(0, audio.currentTime - 10);
    });

    forwardBtn.addEventListener('click', function() {
        if (audio.duration) {
            audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
        }
    });

    // --- Speed ---
    speedBtn.addEventListener('click', function() {
        currentRateIdx = (currentRateIdx + 1) % playbackRates.length;
        var newRate = playbackRates[currentRateIdx];
        audio.playbackRate = newRate;
        speedBtn.textContent = newRate + 'x';
    });

    // --- Mute ---
    muteBtn.addEventListener('click', function() {
        audio.muted = !audio.muted;
        volumeIcon.textContent = audio.muted ? 'volume_off' : 'volume_up';
    });

    // --- Helpers ---
    function updatePlayIcon() {
        playIcon.textContent = isPlaying ? 'pause' : 'play_arrow';
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
        setTimeout(function() { errorAlert.classList.add('hidden'); }, 5000);
    }

    closeError.addEventListener('click', function() {
        errorAlert.classList.add('hidden');
    });

    // --- Waveform Visualizer ---
    var waveformContainer = document.getElementById('waveform');
    var barCount = 50;
    var waveElements = [];

    for (var i = 0; i < barCount; i++) {
        var bar = document.createElement('div');
        var height = Math.random() * 80 + 20;
        bar.style.height = height + '%';
        bar.style.transformOrigin = 'bottom';
        bar.style.flex = '1';
        bar.style.borderRadius = '2px 2px 0 0';
        bar.style.transition = 'background 0.3s';

        var duration = 0.4 + Math.random() * 0.8;
        var delay = Math.random() * -2;
        bar.dataset.animation = 'waveform-bounce ' + duration + 's infinite ease-in-out ' + delay + 's';
        bar.style.animation = 'none';

        if (i < barCount * 0.4) {
            bar.style.background = 'linear-gradient(to top, #7C3AED, #06B6D4)';
            bar.style.boxShadow = '0 0 6px rgba(124, 58, 237, 0.4)';
        } else {
            bar.style.background = 'linear-gradient(to top, rgba(124,58,237,0.2), rgba(124,58,237,0.5))';
        }

        waveElements.push(bar);
        waveformContainer.appendChild(bar);
    }

    function toggleWaves(active) {
        for (var j = 0; j < waveElements.length; j++) {
            waveElements[j].style.animation = active ? waveElements[j].dataset.animation : 'none';
        }
    }
});
