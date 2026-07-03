// ArpaVibe Landing Page Interactive JavaScript Logic

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Mobile Nav Menu Toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = navToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars-staggered';
        }
    });

    // Close mobile nav when clicking a link
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.querySelector('i').className = 'fa-solid fa-bars-staggered';
        });
    });

    // 3. FAQ Accordion Toggle
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Collapse all other items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-answer').style.maxHeight = null;
            });
            
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // 4. Interactive Vibe Tuner Player Data (Solid Colors Only, No Gradients)
    const vibeData = {
        chill: {
            accent: '#3B82F6',       // Solid Blue
            hover: '#2563EB',
            title: 'Lofi Dreams',
            artist: 'Acoustic Chillout Ensemble',
            desc: '"Soft ambient lofi beats, acoustic melodies, and smooth rhythms to help you decompress and find your center."'
        },
        energize: {
            accent: '#D97706',       // Solid Amber
            hover: '#B45309',
            title: 'Power Pulse',
            artist: 'Neon Electro Syndicate',
            desc: '"High-bpm electronic synth waves, driving drum loops, and high-octane basslines to power up your workout or focus."'
        },
        romance: {
            accent: '#EC4899',       // Solid Pink
            hover: '#BE185D',
            title: 'Midnight Melodies',
            artist: 'Velvet String Quartet',
            desc: '"Beautiful acoustic strings, soft piano keys, and warm vocals to set a heartfelt, romantic ambiance."'
        },
        sad: {
            accent: '#64748B',       // Solid Slate
            hover: '#475569',
            title: 'Rainy Day Whispers',
            artist: 'Subtle Piano Reflections',
            desc: '"Slow melancholy piano solos, warm vinyl crackles, and atmospheric rain textures for deep introspective moments."'
        },
        focus: {
            accent: '#10B981',       // Solid Emerald Green
            hover: '#059669',
            title: 'Deep Focus Flow',
            artist: 'Binaural Study Lab',
            desc: '"Minimalist ambient drones, binaural wave frequencies, and gentle static patterns to sharpen concentration."'
        }
    };

    const vibeChips = document.querySelectorAll('.vibe-chip');
    const vibeDescription = document.getElementById('vibe-description');
    const vibeColorPreview = document.getElementById('vibe-color-preview');
    
    // Player Elements
    const playerSongTitle = document.getElementById('player-song-title');
    const playerSongArtist = document.getElementById('player-song-artist');
    const albumDisc = document.getElementById('album-art-disc');
    const playPauseBtn = document.getElementById('btn-play-pause');
    const progressFill = document.getElementById('player-progress');
    const timeCurr = document.querySelector('.time-curr');
    const timeTotal = document.querySelector('.time-total');
    const progressBar = document.querySelector('.progress-bar');

    let isPlaying = false;
    let playInterval = null;
    let trackDurationSeconds = 225; // 3:45 total duration
    let currentSeconds = 72; // starting at 1:12

    // Function to format time stamps
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Initialize display times
    timeCurr.textContent = formatTime(currentSeconds);
    timeTotal.textContent = formatTime(trackDurationSeconds);
    progressFill.style.width = `${(currentSeconds / trackDurationSeconds) * 100}%`;

    // Click handler to switch vibes
    vibeChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const vibeName = chip.dataset.vibe;
            const data = vibeData[vibeName];
            
            if (!data) return;

            // Remove active from all chips, add to current
            vibeChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            // Apply solid theme transition via CSS variables
            document.documentElement.style.setProperty('--vibe-accent', data.accent);
            document.documentElement.style.setProperty('--vibe-accent-hover', data.hover);

            // Update DOM text
            vibeDescription.textContent = data.desc;
            playerSongTitle.textContent = data.title;
            playerSongArtist.textContent = data.artist;
            
            // Pulse color preview indicator
            vibeColorPreview.style.transform = 'scale(1.2)';
            setTimeout(() => vibeColorPreview.style.transform = 'scale(1)', 200);

            // If playing, reset player timers slightly to show transition
            if (isPlaying) {
                currentSeconds = 0;
                progressFill.style.width = '0%';
                timeCurr.textContent = formatTime(currentSeconds);
            }
        });
    });

    // 5. Simulated Audio Play/Pause Controls
    function togglePlay() {
        isPlaying = !isPlaying;
        
        if (isPlaying) {
            playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            albumDisc.classList.add('playing');
            
            // Start simulation interval
            playInterval = setInterval(() => {
                if (currentSeconds < trackDurationSeconds) {
                    currentSeconds++;
                    timeCurr.textContent = formatTime(currentSeconds);
                    progressFill.style.width = `${(currentSeconds / trackDurationSeconds) * 100}%`;
                } else {
                    // Loop track
                    currentSeconds = 0;
                }
            }, 1000);
        } else {
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            albumDisc.classList.remove('playing');
            clearInterval(playInterval);
        }
    }

    playPauseBtn.addEventListener('click', togglePlay);

    // Simple progress bar clicking to seek
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const widthFraction = clickX / rect.width;
        
        currentSeconds = Math.floor(widthFraction * trackDurationSeconds);
        timeCurr.textContent = formatTime(currentSeconds);
        progressFill.style.width = `${widthFraction * 100}%`;
    });
});
