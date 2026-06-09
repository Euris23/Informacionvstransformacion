/* APP.JS - INTERACTIVE PRESENTATION LOGIC */

document.addEventListener("DOMContentLoaded", () => {
    // 1. DOM Elements
    const slides = document.querySelectorAll(".slide");
    const roadSvg = document.querySelector(".road-svg");
    const progressBar = document.getElementById("progress-bar");
    const treeWrapper = document.getElementById("tree-wrapper");
    const treeContainer = document.getElementById("tree-container");
    const treeDesc = document.getElementById("tree-desc");
    
    // Hilo Steps
    const hiloInfo = document.getElementById("hilo-info");
    const hiloConvic = document.getElementById("hilo-convic");
    const hiloFruto = document.getElementById("hilo-fruto");
    
    // Presenter Drawer
    const drawerToggle = document.getElementById("drawer-toggle");
    const presenterDrawer = document.getElementById("presenter-drawer");
    const quickListContainer = document.getElementById("slide-quick-list");
    
    // Nav Arrows
    const prevArrowBtn = document.getElementById("prev-arrow-btn");
    const nextArrowBtn = document.getElementById("next-arrow-btn");

    // 2. Presentation State Variables
    let currentSlideIndex = 0;
    const totalSlides = slides.length;
    let isTransitioning = false;

    // Slide Titles for Presenter Drawer
    const slideTitles = [
        "1. Portada del Estudio",
        "2. Pregunta de Apertura",
        "3. ¿Qué es Información?",
        "4. ¿Qué es Transformación?",
        "5. Pregunta 1: ¿Info sin Transf?",
        "6. Respuesta 1: Santiago 1:22",
        "7. Pregunta 2: ¿Transf sin Info?",
        "8. Respuesta 2: Juan 8 & Rom 12",
        "9. Pregunta 3: ¿Cómo se evidencia?",
        "10. Respuesta 3: El Fruto (Mateo 7)",
        "11. Intro: Ejemplos Bíblicos",
        "12. Tabla Comparativa - Paso 1",
        "13. Detalle: Judas Iscariote",
        "14. Tabla Comparativa - Paso 2",
        "15. Detalle: Zaqueo",
        "16. Tabla Comparativa - Paso 3",
        "17. Detalle: Los Fariseos",
        "18. Tabla Comparativa - Paso 4",
        "19. Detalle: Pedro Apóstol",
        "20. Tabla Comparativa - Paso 5",
        "21. Detalle: Los Escribas",
        "22. Tabla Comparativa - Paso 6",
        "23. Caso Especial: Saulo ➜ Pablo",
        "24. Tabla Comparativa - Paso 7",
        "25. Detalle: Rey Saúl",
        "26. Tabla Comparativa - Paso 8",
        "27. Detalle: La Mujer Samaritana",
        "28. Tabla Final Comparativa",
        "29. Reflexión Personal Intima",
        "30. Conclusión & Cierre"
    ];

    // Tree descriptions mapping
    const treeDescriptions = {
        "seed": "🌱 Semilla: La Verdad de Dios es plantada en nuestra mente.",
        "sprout": "🌿 Brote: La verdad despierta la convicción y empieza a germinar.",
        "young": "🌳 Árbol Joven: Crecimiento inicial alimentado por la Palabra y la oración.",
        "developed": "🌳 Árbol Desarrollado: Un carácter firme que resiste las tormentas.",
        "fruit": "🌳🍇 Árbol con Fruto: Vida transformada que rinde honra a Dios.",
        "fruit-bg": "🌳🍇 Árbol con Fruto: Vida transformada que rinde honra a Dios."
    };

    // 3. Initialize Background Particles (Stars)
    function generateStars() {
        const starsContainer = document.getElementById("stars");
        if (!starsContainer) return;
        
        const starsCount = 100;
        for (let i = 0; i < starsCount; i++) {
            const star = document.createElement("div");
            star.classList.add("star");
            
            // Random properties
            const size = Math.random() * 2 + 1; // 1px to 3px
            const top = Math.random() * 80; // top 80% of screen
            const left = Math.random() * 100; // full width
            const delay = Math.random() * 3; // up to 3s delay
            
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.top = `${top}%`;
            star.style.left = `${left}%`;
            star.style.animationDelay = `${delay}s`;
            
            starsContainer.appendChild(star);
        }
    }
    generateStars();

    // 4. Initialize Presenter Drawer Quick List
    function initPresenterDrawer() {
        quickListContainer.innerHTML = "";
        slideTitles.forEach((title, index) => {
            const btn = document.createElement("button");
            btn.classList.add("quick-slide-item");
            if (index === currentSlideIndex) btn.classList.add("active");
            btn.textContent = title;
            btn.addEventListener("click", () => {
                goToSlide(index);
                presenterDrawer.classList.remove("open");
            });
            quickListContainer.appendChild(btn);
        });

        // Drawer Toggle
        drawerToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            presenterDrawer.classList.toggle("open");
        });

        // Close drawer clicking outside
        document.addEventListener("click", (e) => {
            if (!presenterDrawer.contains(e.target) && e.target !== drawerToggle) {
                presenterDrawer.classList.remove("open");
            }
        });
    }
    initPresenterDrawer();

    // 5. Update State (Sync Header progress, Tree growth, Hilo visual)
    function updateState() {
        // Sync slides active/past classes
        slides.forEach((slide, idx) => {
            slide.classList.remove("active", "past");
            if (idx === currentSlideIndex) {
                slide.classList.add("active");
            } else if (idx < currentSlideIndex) {
                slide.classList.add("past");
            }
        });

        // Scroll top of current slide content
        const activeSlideContent = slides[currentSlideIndex].querySelector(".slide-content");
        if (activeSlideContent) {
            activeSlideContent.scrollTop = 0;
        }

        // Update Progress Bar
        const progressPct = (currentSlideIndex / (totalSlides - 1)) * 100;
        progressBar.style.width = `${progressPct}%`;

        // Sync Hilo Visual highlights
        const currentSlide = slides[currentSlideIndex];
        const hiloState = currentSlide.getAttribute("data-hilo");
        
        // Reset all
        hiloInfo.classList.remove("active");
        hiloConvic.classList.remove("active");
        hiloFruto.classList.remove("active");

        if (hiloState === "info") {
            hiloInfo.classList.add("active");
        } else if (hiloState === "convic") {
            hiloConvic.classList.add("active");
        } else if (hiloState === "fruto") {
            hiloFruto.classList.add("active");
        } else if (hiloState === "all") {
            hiloInfo.classList.add("active");
            hiloConvic.classList.add("active");
            hiloFruto.classList.add("active");
        }

        // Sync Tree Growth
        const treeState = currentSlide.getAttribute("data-tree");
        if (!treeState || treeState === "none") {
            treeWrapper.classList.remove("active-tree-panel");
        } else {
            treeWrapper.classList.add("active-tree-panel");
            
            // Clean previous stage classes
            treeContainer.className = "tree-container";
            
            // Add stage class (e.g. stage-seed, stage-fruit)
            if (treeState === "fruit-bg") {
                treeContainer.classList.add("stage-fruit");
            } else {
                treeContainer.classList.add(`stage-${treeState}`);
            }
            
            // Update description text
            treeDesc.textContent = treeDescriptions[treeState] || "";
        }

        // Sync Presenter Drawer Active Button
        const quickItems = quickListContainer.querySelectorAll(".quick-slide-item");
        quickItems.forEach((item, idx) => {
            item.classList.remove("active");
            if (idx === currentSlideIndex) {
                item.classList.add("active");
                // Scroll into view within list container
                item.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }
        });

        // Sync Nav Arrows visibility
        if (currentSlideIndex === 0) {
            prevArrowBtn.classList.add("hidden");
        } else {
            prevArrowBtn.classList.remove("hidden");
        }

        if (currentSlideIndex === totalSlides - 1) {
            nextArrowBtn.classList.add("hidden");
        } else {
            nextArrowBtn.classList.remove("hidden");
        }
    }

    // 6. Navigation Functions
    window.goToSlide = function(index) {
        if (index < 0 || index >= totalSlides || index === currentSlideIndex || isTransitioning) return;
        
        isTransitioning = true;
        
        // Add moving effect class to background road
        const directionClass = index > currentSlideIndex ? "move-forward" : "move-backward";
        roadSvg.classList.add(directionClass);

        currentSlideIndex = index;
        updateState();

        setTimeout(() => {
            roadSvg.classList.remove("move-forward", "move-backward");
            isTransitioning = false;
        }, 1200); // synchronizes with CSS transitions (1.2s)
    };

    window.nextSlide = function() {
        // Intercept: If slide has a revealable content container that is NOT yet revealed, reveal it first!
        const activeSlide = slides[currentSlideIndex];
        const revealContainer = activeSlide.querySelector(".interactive-reveal-container");
        
        if (revealContainer && !revealContainer.classList.contains("revealed")) {
            revealContainer.classList.add("revealed");
            // Highlight icon if present
            const btn = revealContainer.querySelector(".reveal-btn");
            if (btn) btn.style.opacity = "0.5";
            return; // Stay on the slide
        }

        if (currentSlideIndex < totalSlides - 1) {
            goToSlide(currentSlideIndex + 1);
        }
    };

    window.prevSlide = function() {
        if (currentSlideIndex > 0) {
            goToSlide(currentSlideIndex - 1);
        }
    };

    // 7. Interactive Reveal click handlers
    window.revealAnswer = function(buttonElement) {
        const container = buttonElement.closest(".interactive-reveal-container");
        if (container) {
            container.classList.add("revealed");
        }
    };

    // 8. Keydown Listeners (Desktop space/arrows navigation)
    window.addEventListener("keydown", (e) => {
        // Ignore key inputs when user focuses on input fields (if any existed, just a safety measure)
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        
        switch (e.key) {
            case " ": // Spacebar
            case "ArrowRight":
            case "ArrowDown":
                e.preventDefault();
                nextSlide();
                break;
            case "ArrowLeft":
            case "ArrowUp":
                e.preventDefault();
                prevSlide();
                break;
        }
    });

    // 9. Mobile Touch (Swipe Gestures)
    let touchStartX = 0;
    let touchEndX = 0;
    
    window.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    window.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    }, false);

    function handleSwipeGesture() {
        const deltaX = touchEndX - touchStartX;
        const swipeThreshold = 50; // pixels
        
        if (Math.abs(deltaX) > swipeThreshold) {
            if (deltaX < 0) {
                // Swipe Left -> next
                nextSlide();
            } else {
                // Swipe Right -> prev
                prevSlide();
            }
        }
    }

    // 10. Fullscreen toggle
    window.toggleFullscreen = function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                alert(`Error intentando activar pantalla completa: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    // Initialize display state
    updateState();
});
