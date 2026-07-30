(() => {
    "use strict";

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const header = document.getElementById("site-header");
    const nav = document.getElementById("primary-navigation");
    const navToggle = document.querySelector(".nav-toggle");
    const navToggleLabel = document.querySelector(".nav-toggle-label");
    const navLinks = nav ? Array.from(nav.querySelectorAll('a[href^="#"]')) : [];
    const progressBar = document.getElementById("scroll-progress-bar");
    const sections = navLinks
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    const closeNavigation = (returnFocus = false) => {
        if (!header || !navToggle) return;

        header.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open navigation menu");
        if (navToggleLabel) navToggleLabel.textContent = "Menu";
        if (returnFocus) navToggle.focus();
    };

    if (header && navToggle) {
        navToggle.addEventListener("click", () => {
            const willOpen = !header.classList.contains("nav-open");
            header.classList.toggle("nav-open", willOpen);
            navToggle.setAttribute("aria-expanded", String(willOpen));
            navToggle.setAttribute("aria-label", willOpen ? "Close navigation menu" : "Open navigation menu");
            if (navToggleLabel) navToggleLabel.textContent = willOpen ? "Close" : "Menu";
        });

        navLinks.forEach((link) => {
            link.addEventListener("click", () => closeNavigation());
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && header.classList.contains("nav-open")) {
                closeNavigation(true);
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 880 && header.classList.contains("nav-open")) {
                closeNavigation();
            }
        });
    }

    const revealElements = Array.from(document.querySelectorAll(".reveal"));

    if (reducedMotion || !("IntersectionObserver" in window)) {
        revealElements.forEach((element) => element.classList.add("is-visible"));
    } else {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                });
            },
            {
                rootMargin: "0px 0px -9% 0px",
                threshold: 0.08,
            }
        );

        revealElements.forEach((element) => revealObserver.observe(element));
    }

    const heroTitle = document.getElementById("hero-title");
    const heroTitleLines = heroTitle
        ? Array.from(heroTitle.querySelectorAll(".hero-title-line"))
        : [];

    if (heroTitle && heroTitleLines.length) {
        const lineData = heroTitleLines.map((line) => ({
            text: line.getAttribute("data-text") || "",
            output: line.querySelector(".hero-title-typed"),
            caret: line.querySelector(".hero-title-caret"),
        }));

        const canAnimate = lineData.every((line) => line.output && line.caret);

        if (canAnimate) {
            heroTitle.classList.add("is-typing");

            if (reducedMotion) {
                lineData.forEach((line) => {
                    line.output.textContent = line.text;
                    line.caret.classList.remove("is-active", "is-complete");
                });
                lineData[lineData.length - 1].caret.classList.add("is-active", "is-complete");
            } else {
                lineData.forEach((line) => {
                    line.output.textContent = "";
                    line.caret.classList.remove("is-active", "is-complete");
                });

                let lineIndex = 0;
                let characterIndex = 0;
                const characterDelay = 110;
                const lineDelay = 180;

                const typeNextCharacter = () => {
                    const currentLine = lineData[lineIndex];

                    if (characterIndex < currentLine.text.length) {
                        characterIndex += 1;
                        currentLine.output.textContent = currentLine.text.slice(0, characterIndex);
                        window.setTimeout(typeNextCharacter, characterDelay);
                        return;
                    }

                    if (lineIndex < lineData.length - 1) {
                        currentLine.caret.classList.remove("is-active");
                        lineIndex += 1;
                        characterIndex = 0;

                        window.setTimeout(() => {
                            lineData[lineIndex].caret.classList.add("is-active");
                            typeNextCharacter();
                        }, lineDelay);
                        return;
                    }

                    currentLine.caret.classList.add("is-complete");
                };

                window.setTimeout(() => {
                    lineData[0].caret.classList.add("is-active");
                    typeNextCharacter();
                }, 480);
            }
        }
    }

    let ticking = false;

    const updateScrollState = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? Math.min(Math.max(scrollTop / scrollable, 0), 1) : 0;

        if (progressBar) {
            progressBar.style.transform = `scaleX(${progress})`;
        }

        if (header) {
            header.classList.toggle("is-scrolled", scrollTop > 16);
        }

        const referenceLine = scrollTop + window.innerHeight * 0.36;
        let activeSection = null;

        sections.forEach((section) => {
            if (section.offsetTop <= referenceLine) activeSection = section;
        });

        navLinks.forEach((link) => {
            const isActive = activeSection && link.getAttribute("href") === `#${activeSection.id}`;
            if (isActive) {
                link.setAttribute("aria-current", "location");
            } else {
                link.removeAttribute("aria-current");
            }
        });

        ticking = false;
    };

    const requestScrollUpdate = () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(updateScrollState);
    };

    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    window.addEventListener("resize", requestScrollUpdate);
    updateScrollState();

    const year = document.getElementById("current-year");
    if (year) year.textContent = String(new Date().getFullYear());
})();
