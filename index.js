document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. BARRA DE PROGRESSO DE SCROLL USANDO TRANSFORM SCALE --- */
    const progressBar = document.getElementById('scrollProgressBar');
    if (progressBar) {
        let isTicking = false;

        const updateProgressBar = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) : 0;
            
            // Altera apenas o scaleX (GPU pura) sem forçar o recálculo do layout da página
            progressBar.style.transform = `scaleX(${progress})`;
            isTicking = false;
        };

        window.addEventListener('scroll', () => {
            if (!isTicking) {
                window.requestAnimationFrame(updateProgressBar);
                isTicking = true;
            }
        }, { passive: true });

        updateProgressBar();
    }

    /* --- 2. CONTROLE DE ÁUDIO DO VÍDEO PRINCIPAL --- */
    const topVideo = document.getElementById('topVideo');
    const toggleAudioBtn = document.getElementById('toggleAudioBtn');
    const audioIcon = document.getElementById('audioIcon');
    const audioText = document.getElementById('audioText');

    if (topVideo && toggleAudioBtn) {
        toggleAudioBtn.addEventListener('click', () => {
            topVideo.muted = !topVideo.muted;
            if (topVideo.muted) {
                if (audioIcon) audioIcon.textContent = '🔇';
                if (audioText) audioText.textContent = 'Ativar Som';
            } else {
                if (audioIcon) audioIcon.textContent = '🔊';
                if (audioText) audioText.textContent = 'Desativar Som';
            }
        });
    }

    /* --- 3. CONTROLE DE PLAY / PAUSE NOS VÍDEOS DO CARROSSEL --- */
    const videoCards = document.querySelectorAll('.video-card');
    
    videoCards.forEach(card => {
        const video = card.querySelector('video');
        if (!video) return;

        card.addEventListener('click', () => {
            if (video.paused) {
                videoCards.forEach(otherCard => {
                    const otherVideo = otherCard.querySelector('video');
                    if (otherVideo && otherVideo !== video) {
                        otherVideo.pause();
                        otherCard.classList.add('is-paused');
                    }
                });

                video.play().then(() => {
                    card.classList.remove('is-paused');
                }).catch(() => {
                    card.classList.add('is-paused');
                });
            } else {
                video.pause();
                card.classList.add('is-paused');
            }
        });
    });

    /* --- 4. ANIMAÇÕES DE ENTRADA AO ROLAR (SCROLL REVEAL OPTIMIZED) --- */
    const revealElements = document.querySelectorAll('.reveal-title, .reveal-content, .reveal-up, .footer');

    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -20px 0px'
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('visible'));
    }
});