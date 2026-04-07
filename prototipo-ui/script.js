document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const pollyImg = document.getElementById('polly-img');
    const pollyBubble = document.getElementById('polly-bubble');
    const pollyText = document.getElementById('polly-text');
    const btnEs = document.getElementById('btn-es');
    const btnEn = document.getElementById('btn-en');
    
    // Action Buttons
    const actionCards = document.querySelectorAll('.action-card');

    // Dictionary for multiple languages
    const dict = {
        'es': {
            'welcome': '¡Hola! Soy Polly. Toca un botón para comenzar.',
            'hotels': '¡Excelente elección! Buscando los mejores hoteles...',
            'restaurants': '¡Hmm, qué rico! Veamos dónde comer mariscos.',
            'tourism': '¡Vamos a la costa! Preparando ruta turística.',
            'map': 'Abriendo el mapa interactivo de Progreso...',
            'poke': '¡Jeje, me haces cosquillas!',
            'langChanged': '¡Entendido! Ahora hablaremos en Español.'
        },
        'en': {
            'welcome': 'Hello! I am Polly. Tap a button to start.',
            'hotels': 'Great choice! Finding the best hotels...',
            'restaurants': 'Yummy! Let\'s see where to eat seafood.',
            'tourism': 'Let\'s hit the beach! Preparing tourist route.',
            'map': 'Opening the Progreso interactive map...',
            'poke': 'Hehe, that tickles!',
            'langChanged': 'Got it! We will speak in English now.'
        }
    };

    let currentLang = 'es';
    let typingTimeout = null;
    let pollyResetTimeout = null;

    // Polly images mapping
    const POLLY_STATES = {
        IDLE: 'assets/polly/PULPITO 2.png',
        TALK: 'assets/polly/PULPITO 3.png',
        HAPPY: 'assets/polly/PULPITO 4.png',
        EXCITED: 'assets/polly/PULPITO 7.png'
    };

    // Typewriter effect function
    function typeWriter(text, i, cb) {
        if (i < text.length) {
            pollyText.innerHTML = text.substring(0, i + 1) + '<span class="cursor"></span>';
            typingTimeout = setTimeout(() => typeWriter(text, i + 1, cb), 40); // 40ms per char
        } else {
            pollyText.innerHTML = text; // remove cursor at the end
            if (cb) cb();
        }
    }

    // Function to make Polly speak with state changes
    function pollySpeak(message, stateImage = POLLY_STATES.TALK, duration = 3000) {
        // Clear previous timeouts
        if (typingTimeout) clearTimeout(typingTimeout);
        if (pollyResetTimeout) clearTimeout(pollyResetTimeout);
        
        // Show bubble
        pollyBubble.classList.remove('hidden');
        pollyText.innerHTML = '<span class="cursor"></span>';
        
        // Change image and animation
        pollyImg.src = stateImage;
        pollyImg.classList.remove('idle-anim');
        
        if (stateImage === POLLY_STATES.HAPPY || stateImage === POLLY_STATES.EXCITED) {
            pollyImg.classList.remove('talk-anim');
            // Trigger reflow to restart animation
            void pollyImg.offsetWidth;
            pollyImg.classList.add('success-anim');
        } else {
            pollyImg.classList.remove('success-anim');
            void pollyImg.offsetWidth;
            pollyImg.classList.add('talk-anim');
        }

        // Start typing
        typeWriter(message, 0, () => {
            // Revert back to idle after duration
            pollyResetTimeout = setTimeout(() => {
                pollyBubble.classList.add('hidden');
                pollyImg.src = POLLY_STATES.IDLE;
                pollyImg.classList.remove('talk-anim', 'success-anim');
                pollyImg.classList.add('idle-anim');
            }, duration);
        });
    }

    // Language Toggle Listener
    btnEs.addEventListener('click', () => {
        if (currentLang === 'es') return;
        currentLang = 'es';
        btnEs.classList.add('active');
        btnEn.classList.remove('active');
        updateUI();
        pollySpeak(dict[currentLang]['langChanged'], POLLY_STATES.HAPPY);
    });

    btnEn.addEventListener('click', () => {
        if (currentLang === 'en') return;
        currentLang = 'en';
        btnEn.classList.add('active');
        btnEs.classList.remove('active');
        updateUI();
        pollySpeak(dict[currentLang]['langChanged'], POLLY_STATES.HAPPY);
    });

    function updateUI() {
        const els = {
            'btn-hotels': currentLang === 'en' ? 'Hotels' : 'Hoteles',
            'btn-restaurants': currentLang === 'en' ? 'Restaurants' : 'Restaurantes',
            'btn-tourism': currentLang === 'en' ? 'Tourist Areas' : 'Zonas Turísticas',
            'btn-map': currentLang === 'en' ? 'Interactive Map' : 'Mapa interactivo',
        };

        for (const [id, text] of Object.entries(els)) {
            const btn = document.getElementById(id);
            if(btn) btn.querySelector('h2').innerText = text;
        }
        
        document.querySelector('.subtitle').innerText = currentLang === 'es' ? 'Progreso, Yucatán' : 'Progreso, Yucatan';
    }

    // Card click listeners
    actionCards.forEach(card => {
        card.addEventListener('click', () => {
            const id = card.id.replace('btn-', '');
            pollySpeak(dict[currentLang][id], POLLY_STATES.EXCITED, 4000);
        });
    });

    // Polly click (poke)
    pollyImg.addEventListener('click', () => {
        pollySpeak(dict[currentLang]['poke'], POLLY_STATES.EXCITED, 2000);
    });

    let greetingScripted = false;
    
    // Listen for mouse movement to detect interaction, instead of auto greeting
    const onFirstInteraction = () => {
        if (!greetingScripted) {
             pollySpeak(dict[currentLang]['welcome'], POLLY_STATES.TALK, 4000);
             greetingScripted = true;
             document.removeEventListener('mousemove', onFirstInteraction);
             document.removeEventListener('click', onFirstInteraction);
        }
    };
    
    // Instead of auto-greet, we might greet shortly after load if the user is hovering around
    setTimeout(() => {
        if (!greetingScripted) {
            pollySpeak(dict[currentLang]['welcome'], POLLY_STATES.TALK, 4000);
            greetingScripted = true;
        }
    }, 1500);

});
