(() => {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    const STAGGER_CONFIG = [
        { selector: '.menu', targets: '.menu-card' },
        { selector: '.gallery', targets: '.gallery-item' },
        { selector: '.events-ribbon', targets: '.events-ribbon__list li' },
        { selector: '.testimonials', targets: '.testimonial-card' },
        { selector: '.location', targets: '.location-grid > *' }
    ];
    const THEME_STORAGE_KEY = 'cafe-lumen-theme';
    const HERO_STATS = {
        seasonal: {
            tag: 'Roastery note',
            fallback: {
                headline: '27 seasonal lots roasted on-site',
                detail: 'Rotating single origins cupped weekly. Pair them with house-fermented pastries for the full experience.'
            },
            months: {
                0: {
                    headline: '12 single origins warming January mornings',
                    detail: 'Cold-processed Ethiopians and velvety Guatemala lots rotate through our pour-over bar every week.'
                },
                1: {
                    headline: '9 honey-processed lots for February flights',
                    detail: 'Sip limited Costa Rica honey-process runs alongside cacao truffle pairings from our pastry chefs.'
                },
                2: {
                    headline: '6 new harvest arrivals this March',
                    detail: 'Fresh crop Burundi and Papua New Guinea beans land this month, roasted on-site every Thursday.'
                },
                3: {
                    headline: '10 blooming microlots for April tastings',
                    detail: 'Join dawn cuppings to sample jasmine-forward Ethiopians alongside our wildflower pollen cruffins.'
                },
                4: {
                    headline: '8 sunny cold brew infusions in May',
                    detail: 'Cascara, yuzu, and strawberry shrub infusions keep our tap wall refreshed heading into patio season.'
                },
                5: {
                    headline: '11 patio-perfect lots to celebrate June',
                    detail: 'Washed Kenyan AA and natural Colombia beans take turns on espresso while live vinyl spins nightly.'
                },
                6: {
                    headline: '7 summer naturals for July slow pours',
                    detail: 'Berry-forward naturals from Peru and Brazil headline our single-origin flight all month long.'
                },
                7: {
                    headline: '5 experimental ferments this August',
                    detail: 'Anaerobic Costa Rica, lactic Honduran lots, and a sparkling cascara tonic join the bar rotation.'
                },
                8: {
                    headline: '13 harvest lots roasted each September',
                    detail: 'We celebrate the new crop with extended roasting hours and pairing classes every Sunday morning.'
                },
                9: {
                    headline: '15 sweater-weather beans for October',
                    detail: 'Look for maple-washed Guatemalans and chocolatey Sumatran lots to pair with smoky caramel bites.'
                },
                10: {
                    headline: '18 small-batch holiday roasts in November',
                    detail: 'Warm spice profiles anchor our seasonal espresso flight alongside gingerbread kouign-amann slices.'
                },
                11: {
                    headline: '21 snow-day lots in December',
                    detail: 'Midnight roast blends, peppermint microlots, and limited cascara syrups make giftable sampler boxes.'
                }
            }
        }
    };
    const MENU_TAG_LABELS = {
        vegan: 'Vegan',
        gluten: 'Gluten-friendly',
        seasonal: 'Seasonal',
        vegetarian: 'Vegetarian'
    };

    document.addEventListener('DOMContentLoaded', () => {
        if (!window.location.hash) {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }
        const yearEl = document.getElementById('year');
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }

        initThemeToggle();
        initReveal();
        initParallax();
        initHeroStats();
        initSmoothScroll();
        initHeroTicker();
        initMenuFilters();
        initRoasterModal();
        initSmoothScroll();
        let lightbox = initLightbox();
        initGalleryFilters(() => {
            if (lightbox) {
                lightbox.destroy();
            }
            lightbox = initLightbox();
        });

        initNewsletterForm();
    });

    function initLightbox() {
        if (!window.GLightbox) return null;
        return GLightbox({ selector: '.glightbox:not(.is-hidden)' });
    }

    function initGalleryFilters(onUpdate) {
        const buttons = document.querySelectorAll('.filter-chip');
        const items = document.querySelectorAll('.gallery-item');
        if (!buttons.length || !items.length) return;

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                if (button.classList.contains('is-active')) return;

                buttons.forEach((chip) => {
                    chip.classList.remove('is-active');
                    chip.setAttribute('aria-selected', 'false');
                });

                button.classList.add('is-active');
                button.setAttribute('aria-selected', 'true');

                const filter = button.dataset.filter || 'all';
                items.forEach((item) => {
                    const category = item.dataset.category || 'all';
                    const shouldShow = filter === 'all' || category === filter;
                    item.classList.toggle('is-hidden', !shouldShow);
                    item.style.display = shouldShow ? 'block' : 'none';
                    item.setAttribute('aria-hidden', String(!shouldShow));
                });

                if (typeof onUpdate === 'function') {
                    onUpdate();
                }
            });
        });
    }

    function initNewsletterForm() {
        const form = document.getElementById('newsletter-form');
        const feedback = document.querySelector('.newsletter-feedback');
        if (!form) return;

        const submitButton = form.querySelector('button[type="submit"]');

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = form.email?.value.trim();
            if (!email) {
                if (feedback) {
                    feedback.textContent = 'Please enter a valid email address.';
                }
                return;
            }

            form.reset();
            if (feedback) {
                feedback.textContent = 'Thanks! Your first brew queue note is on its way.';
            }
            if (submitButton) {
                submitButton.classList.add('is-success');
                window.setTimeout(() => submitButton.classList.remove('is-success'), 650);
            }
        });
    }

    function initThemeToggle() {
        const toggles = Array.from(document.querySelectorAll('[data-theme-toggle]'));
        if (!toggles.length) return;

        const body = document.body;
        const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)');

        const storedTheme = normalizeTheme(safeGetStorage(THEME_STORAGE_KEY));
        const initialTheme = storedTheme || body.dataset.theme || (systemPrefersLight.matches ? 'dawn' : 'night');
        applyTheme(initialTheme);

        toggles.forEach((toggle) => {
            toggle.addEventListener('click', () => {
                const nextTheme = body.dataset.theme === 'dawn' ? 'night' : 'dawn';
                applyTheme(nextTheme);
                safeSetStorage(THEME_STORAGE_KEY, nextTheme);
            });
        });

        const handleSystemChange = (event) => {
            const preference = safeGetStorage(THEME_STORAGE_KEY);
            if (preference) return;
            applyTheme(event.matches ? 'dawn' : 'night');
        };

        if (typeof systemPrefersLight.addEventListener === 'function') {
            systemPrefersLight.addEventListener('change', handleSystemChange);
        } else if (typeof systemPrefersLight.addListener === 'function') {
            systemPrefersLight.addListener(handleSystemChange);
        }

        function applyTheme(theme) {
            const normalized = normalizeTheme(theme) || 'night';
            const isDawn = normalized === 'dawn';
            body.dataset.theme = normalized;
            toggles.forEach((toggle) => {
                toggle.setAttribute('aria-pressed', String(isDawn));
                toggle.setAttribute('aria-label', isDawn ? 'Switch to night palette' : 'Switch to dawn palette');
                const labelEl = toggle.querySelector('.theme-toggle__label');
                if (labelEl) {
                    labelEl.textContent = isDawn ? 'Night palette' : 'Dawn palette';
                }
                const primaryIcon = toggle.querySelector('.theme-toggle__icon');
                if (primaryIcon) {
                    primaryIcon.textContent = isDawn ? 'Moon' : 'Glow';
                }
            });
        }
    }

    function normalizeTheme(theme) {
        return theme === 'dawn' || theme === 'night' ? theme : null;
    }

    function initHeroStats() {
        const cards = Array.from(document.querySelectorAll('[data-stat-key]'));
        if (!cards.length) return;

        const month = new Date().getMonth();

        cards.forEach((card) => {
            const key = card.dataset.statKey;
            const dataset = HERO_STATS[key];
            if (!dataset) return;

            const stat = dataset.months?.[month] || dataset.fallback;
            const tagText = stat.tag || dataset.tag;

            const tagEl = card.querySelector('.hero-stat-card__tag');
            const headlineEl = card.querySelector('[data-stat-headline]');
            const detailEl = card.querySelector('[data-stat-detail]');

            if (tagEl && tagText) {
                tagEl.textContent = tagText;
            }
            if (headlineEl && stat.headline) {
                headlineEl.textContent = stat.headline;
            }
            if (detailEl && stat.detail) {
                detailEl.textContent = stat.detail;
            }
        });
    }

    function initReveal() {
        const sections = Array.from(document.querySelectorAll('[data-reveal]'));
        if (!sections.length) return;

        prepareRevealChildren(sections);

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (reduceMotion.matches) {
            sections.forEach((section) => {
                section.classList.add('is-visible');
                applyChildReveal(section, true);
            });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const section = entry.target;
                    section.classList.add('is-visible');
                    applyChildReveal(section, false);
                    observer.unobserve(section);
                }
            });
        }, { threshold: 0.2, rootMargin: '0px 0px -10%' });

        sections.forEach((section) => observer.observe(section));

        const handleMotionChange = (event) => {
            if (!event.matches) return;
            observer.disconnect();
            sections.forEach((section) => {
                section.classList.add('is-visible');
                applyChildReveal(section, true);
            });
        };

        if (typeof reduceMotion.addEventListener === 'function') {
            reduceMotion.addEventListener('change', handleMotionChange);
        } else if (typeof reduceMotion.addListener === 'function') {
            reduceMotion.addListener(handleMotionChange);
        }
    }

    function prepareRevealChildren(sections) {
        sections.forEach((section) => {
            STAGGER_CONFIG.forEach((config) => {
                if (section.matches(config.selector)) {
                    section.querySelectorAll(config.targets).forEach((child) => {
                        child.setAttribute('data-reveal-child', '');
                    });
                }
            });
        });
    }

    function applyChildReveal(section, instant) {
        const config = STAGGER_CONFIG.find((entry) => section.matches(entry.selector));
        if (!config) return;
        const children = Array.from(section.querySelectorAll(`${config.targets}[data-reveal-child]`));
        children.forEach((child, index) => {
            if (instant) {
                child.classList.add('is-visible');
                child.style.removeProperty('--reveal-delay');
                return;
            }
            const delay = Math.min(index * 0.08, 0.48);
            child.style.setProperty('--reveal-delay', `${delay.toFixed(2)}s`);
            requestAnimationFrame(() => {
                child.classList.add('is-visible');
            });
        });
    }

    function initParallax() {
        const groups = Array.from(document.querySelectorAll('[data-parallax-group]'));
        if (!groups.length) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (reduceMotion.matches) return;

        const scenes = groups
            .map((group) => {
                const layers = Array.from(group.querySelectorAll('[data-parallax-depth]'));
                if (!layers.length) return null;
                return { group, layers };
            })
            .filter(Boolean);

        if (!scenes.length) return;

        let pointerX = 0;
        let ticking = false;
        const allowPointer = window.matchMedia('(pointer: fine)').matches;

        const update = () => {
            scenes.forEach(({ group, layers }) => {
                const rect = group.getBoundingClientRect();
                const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
                const scrollFactor = clamp(centerOffset / window.innerHeight, -1, 1);

                layers.forEach((layer) => {
                    const depth = parseFloat(layer.dataset.parallaxDepth || '0');
                    const yOffset = clamp(scrollFactor * depth * -40, -28, 28);
                    const xOffset = clamp(pointerX * depth * 12, -12, 12);
                    layer.style.transform = `translate3d(${xOffset.toFixed(2)}px, ${yOffset.toFixed(2)}px, 0)`;
                });
            });
            ticking = false;
        };

        const schedule = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        };

        const handleScroll = () => schedule();
        const handleResize = () => schedule();
        const handlePointerMove = (event) => {
            pointerX = clamp((event.clientX / window.innerWidth) * 2 - 1, -1, 1);
            schedule();
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize);
        if (allowPointer) {
            window.addEventListener('mousemove', handlePointerMove, { passive: true });
        }

        const handleMotionChange = (event) => {
            if (!event.matches) return;
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            if (allowPointer) {
                window.removeEventListener('mousemove', handlePointerMove);
            }
            scenes.forEach(({ layers }) => {
                layers.forEach((layer) => {
                    layer.style.transform = '';
                });
            });
        };

        if (typeof reduceMotion.addEventListener === 'function') {
            reduceMotion.addEventListener('change', handleMotionChange);
        } else if (typeof reduceMotion.addListener === 'function') {
            reduceMotion.addListener(handleMotionChange);
        }

        schedule();
    }

    function initSmoothScroll() {
        const links = Array.from(document.querySelectorAll('a[href^="#"]'));
        if (!links.length) return;

        const supportsNative = 'scrollBehavior' in document.documentElement.style;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        const prefersReduced = () => reduceMotion.matches;

        links.forEach((link) => {
            link.addEventListener('click', (event) => {
                const href = link.getAttribute('href');
                if (!href || href === '#' || href === '#0') return;
                const target = document.querySelector(href);
                if (!target) return;

                if (supportsNative && !prefersReduced()) {
                    // Native CSS smooth scroll handles this; let default behavior occur.
                    return;
                }

                event.preventDefault();

                if (prefersReduced()) {
                    target.scrollIntoView({ behavior: 'auto', block: 'start' });
                    return;
                }

                smoothScrollFallback(target);
            });
        });

        function smoothScrollFallback(target) {
            const start = window.pageYOffset || document.documentElement.scrollTop || 0;
            const targetRect = target.getBoundingClientRect();
            const targetOffset = targetRect.top + start;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const destination = Math.min(targetOffset, maxScroll);
            const distance = destination - start;
            if (Math.abs(distance) < 1) return;

            const duration = 650;
            const startTime = performance.now();

            const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

            const step = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = easeInOutQuad(progress);
                window.scrollTo(0, start + distance * eased);
                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            };

            requestAnimationFrame(step);
        }
    }

    function initHeroTicker() {
        const ticker = document.querySelector('[data-ticker]');
        const track = ticker?.querySelector('[data-ticker-track]');
        if (!ticker || !track) return;

        const items = Array.from(track.querySelectorAll('[data-ticker-item]'));
        if (items.length <= 1) {
            ticker.classList.add('is-static');
            return;
        }

        let index = 0;
        let autoplayId = null;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        const setActive = (nextIndex) => {
            if (!items.length) return;
            index = (nextIndex + items.length) % items.length;
            track.style.transform = `translateX(${index * -100}%)`;
        };

        const next = () => setActive(index + 1);
        const prev = () => setActive(index - 1);

        const stopAutoplay = () => {
            if (autoplayId) {
                window.clearInterval(autoplayId);
                autoplayId = null;
            }
        };

        const startAutoplay = () => {
            if (reduceMotion.matches) return;
            stopAutoplay();
            autoplayId = window.setInterval(next, 6000);
        };

        const prevBtn = ticker.querySelector('[data-ticker-prev]');
        const nextBtn = ticker.querySelector('[data-ticker-next]');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prev();
                startAutoplay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                next();
                startAutoplay();
            });
        }

        ticker.addEventListener('mouseenter', stopAutoplay);
        ticker.addEventListener('mouseleave', startAutoplay);

        if (typeof reduceMotion.addEventListener === 'function') {
            reduceMotion.addEventListener('change', (event) => {
                if (event.matches) {
                    stopAutoplay();
                } else {
                    startAutoplay();
                }
            });
        }

        setActive(0);
        startAutoplay();
    }

    function initMenuFilters() {
        const filterChips = Array.from(document.querySelectorAll('.menu-filter-chip'));
        const menuGrid = document.querySelector('[data-menu-grid]');
        if (!filterChips.length || !menuGrid) return;

        const tagElements = Array.from(menuGrid.querySelectorAll('[data-menu-tags]'));
        const renderTags = (tagEl) => {
            const tags = (tagEl.dataset.menuTags || '').split(' ').filter(Boolean);
            const labels = tags.map((tag) => MENU_TAG_LABELS[tag] || tag);
            tagEl.textContent = labels.join(' / ');
            tagEl.dataset.label = tagEl.textContent;
            tagEl.classList.toggle('has-tags', labels.length > 0);
            tagEl.setAttribute('aria-hidden', labels.length === 0 ? 'true' : 'false');
        };
        tagElements.forEach(renderTags);

        const update = (filter) => {
            tagElements.forEach((tagEl) => {
                const tags = (tagEl.dataset.menuTags || '').split(' ').filter(Boolean);
                const shouldShow = filter === 'all' || tags.includes(filter);
                const item = tagEl.closest('li');
                if (!item) return;
                item.classList.toggle('is-hidden', !shouldShow);
                item.setAttribute('aria-hidden', String(!shouldShow));
            });

            const lists = Array.from(menuGrid.querySelectorAll('ul'));
            lists.forEach((list) => {
                const visibleCount = Array.from(list.children).filter((child) => !child.classList.contains('menu-empty') && !child.classList.contains('is-hidden')).length;
                let emptyItem = list.querySelector('.menu-empty');
                if (visibleCount === 0) {
                    if (!emptyItem) {
                        emptyItem = document.createElement('li');
                        emptyItem.className = 'menu-empty';
                        emptyItem.textContent = 'More menu pairings arriving soon.';
                        list.appendChild(emptyItem);
                    }
                    emptyItem.hidden = false;
                    emptyItem.setAttribute('aria-hidden', 'false');
                } else if (emptyItem) {
                    emptyItem.hidden = true;
                    emptyItem.setAttribute('aria-hidden', 'true');
                }
            });
        };

        filterChips.forEach((chip) => {
            chip.addEventListener('click', () => {
                if (chip.classList.contains('is-active')) return;
                filterChips.forEach((c) => {
                    c.classList.remove('is-active');
                    c.setAttribute('aria-selected', 'false');
                });
                chip.classList.add('is-active');
                chip.setAttribute('aria-selected', 'true');
                update(chip.dataset.filterMenu || 'all');
            });
        });

        update('all');
    }

    function initRoasterModal() {
        const openers = Array.from(document.querySelectorAll('[data-roaster-modal-open]'));
        const backdrop = document.querySelector('[data-modal-backdrop]');
        const modal = backdrop?.querySelector('.modal');
        const closeBtn = backdrop?.querySelector('[data-roaster-modal-close]');
        if (!openers.length || !backdrop || !modal || !closeBtn) return;

        let lastFocused = null;
        if (!modal.hasAttribute('tabindex')) {
            modal.setAttribute('tabindex', '-1');
        }

        const open = () => {
            lastFocused = document.activeElement;
            backdrop.hidden = false;
            document.body.setAttribute('data-modal-open', 'true');
            modal.focus();
            trapFocus(modal);
        };

        const close = () => {
            backdrop.hidden = true;
            document.body.removeAttribute('data-modal-open');
            releaseFocusTrap();
            if (lastFocused && typeof lastFocused.focus === 'function') {
                lastFocused.focus();
            }
        };

        openers.forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                open();
            });
        });

        closeBtn.addEventListener('click', close);
        backdrop.addEventListener('click', (event) => {
            if (event.target === backdrop) {
                close();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !backdrop.hidden) {
                close();
            }
        });
    }

    let focusTrapCleanup = null;

    function trapFocus(container) {
        const selectors = [
            'a[href]',
            'button:not([disabled])',
            'textarea:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ];
        const focusable = Array.from(container.querySelectorAll(selectors.join(','))).filter((el) => !el.hasAttribute('hidden'));
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        const handleKeyDown = (event) => {
            if (event.key !== 'Tab') return;
            if (event.shiftKey) {
                if (document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        };

        focusTrapCleanup = () => {
            container.removeEventListener('keydown', handleKeyDown);
        };

        container.addEventListener('keydown', handleKeyDown);
    }

    function releaseFocusTrap() {
        if (typeof focusTrapCleanup === 'function') {
            focusTrapCleanup();
            focusTrapCleanup = null;
        }
    }
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function safeGetStorage(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            return null;
        }
    }

    function safeSetStorage(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            // ignore storage errors (private mode, etc.)
        }
    }
})();




