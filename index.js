document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. BARRA DE PROGRESSO DE SCROLL NO TOPO --- */
    const progressBar = document.getElementById('scrollProgressBar');
    if (progressBar) {
        const updateProgressBar = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            progressBar.style.width = `${progress}%`;
        };

        window.addEventListener('scroll', updateProgressBar, { passive: true });
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
                // Pausa outros vídeos no carrossel para tocar apenas um por vez
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
                    // Trata restrições de autoplay se necessário
                    card.classList.add('is-paused');
                });
            } else {
                video.pause();
                card.classList.add('is-paused');
            }
        });
    });

    /* --- 4. ANIMAÇÕES DE ENTRADA AO ROLAR (SCROLL REVEAL) --- */
    const revealElements = document.querySelectorAll('.reveal-title, .reveal-content, .reveal-up, .footer');

    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Anima apenas uma vez para manter a performance
                }
            });
        }, observerOptions);

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback para navegadores mais antigos
        revealElements.forEach(el => el.classList.add('visible'));
    }
});