// Общая логика страниц кейсов: язык, «Say Hi!», копирование контактов
(function () {
    const CV = 'https://drive.google.com/file/d/1Yg3t4HtJvWGERvINZFn--mRIrUATi6Jk/view?usp=sharing';
    const common = {
        ru: { 'zoom-hint': 'Нажмите, чтобы увеличить', 'to-home': 'На главную', 'cv': 'резюме.pdf', 'copy-email': 'copy email', 'copy-phone': 'copy phone', 'copied': 'скопировано!' },
        en: { 'zoom-hint': 'Click to zoom in', 'to-home': 'Home', 'cv': 'resume.pdf', 'copy-email': 'copy email', 'copy-phone': 'copy phone', 'copied': 'copied!' }
    };
    const own = window.CASE_TRANSLATIONS || { ru: {}, en: {} };

    let lang = 'ru';
    try {
        lang = localStorage.getItem('language') || ((navigator.language || '').startsWith('ru') ? 'ru' : 'en');
    } catch (e) {}
    if (!common[lang]) lang = 'ru';

    const t = key => (own[lang] && own[lang][key]) || common[lang][key] || (own.ru && own.ru[key]) || common.ru[key] || '';

    function applyLanguage(next) {
        lang = next;
        try { localStorage.setItem('language', lang); } catch (e) {}
        document.documentElement.lang = lang;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const v = t(el.dataset.i18n);
            if (v) el.innerHTML = v;
        });
        document.querySelectorAll('[data-i18n-label]').forEach(el => { el.querySelector('span').textContent = t(el.dataset.i18nLabel); });
        document.querySelectorAll('.lang button').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
        const cv = document.getElementById('cv-link');
        if (cv) cv.href = CV;
    }

    document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => applyLanguage(b.dataset.lang)));

    // Say Hi
    const sayHi = document.getElementById('say-hi');
    const toggle = document.getElementById('say-hi-toggle');
    const setSayHi = open => {
        sayHi.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', open);
    };
    toggle.addEventListener('click', () => setSayHi(true));
    document.getElementById('say-hi-close').addEventListener('click', () => setSayHi(false));
    document.addEventListener('mousedown', e => { if (!sayHi.contains(e.target)) setSayHi(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setSayHi(false); });

    document.querySelectorAll('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
        const value = btn.dataset.copy;
        try {
            await navigator.clipboard.writeText(value);
        } catch (err) {
            const ta = document.createElement('textarea');
            ta.value = value;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
        }
        const label = btn.querySelector('span');
        label.textContent = t('copied');
        setTimeout(() => { label.textContent = t(btn.dataset.i18nLabel); }, 2000);
    }));

    // Просмотр картинок и видео на весь экран, второй клик — увеличение до реального размера
    const viewer = document.createElement('div');
    viewer.className = 'viewer';
    viewer.innerHTML = '<button type="button" class="viewer-close" aria-label="Close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button><div class="viewer-stage"></div><div class="viewer-hint"></div>';
    document.body.appendChild(viewer);
    const stage = viewer.querySelector('.viewer-stage');

    function closeViewer() {
        viewer.classList.remove('open', 'zoomed', 'is-video');
        stage.innerHTML = '';
        document.body.style.overflow = '';
    }

    function openViewer(el) {
        const isVideo = el.tagName === 'VIDEO';
        if (isVideo) {
            const v = document.createElement('video');
            v.src = el.currentSrc || el.querySelector('source')?.src || el.src;
            Object.assign(v, { autoplay: true, loop: true, muted: true, playsInline: true, controls: true });
            stage.appendChild(v);
        } else {
            const img = document.createElement('img');
            img.src = el.currentSrc || el.src;
            img.alt = el.alt || '';
            stage.appendChild(img);
            img.addEventListener('click', e => {
                e.stopPropagation();
                const r = img.getBoundingClientRect();
                const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
                const zoom = !viewer.classList.contains('zoomed');
                // если картинка и так помещается целиком, увеличиваем хотя бы вдвое
                img.style.width = zoom ? Math.max(img.naturalWidth, r.width * 2) + 'px' : '';
                viewer.classList.toggle('zoomed', zoom);
                if (zoom) {
                    viewer.scrollLeft = fx * img.offsetWidth - innerWidth / 2;
                    viewer.scrollTop = fy * img.offsetHeight - innerHeight / 2;
                }
            });
        }
        viewer.querySelector('.viewer-hint').textContent = t('zoom-hint');
        viewer.classList.toggle('is-video', isVideo);
        viewer.classList.add('open');
        viewer.scrollTo(0, 0);
        document.body.style.overflow = 'hidden';
    }

    document.querySelectorAll('.project-detail-image').forEach(el => el.addEventListener('click', () => openViewer(el)));
    viewer.addEventListener('click', e => { if (!e.target.closest('video')) closeViewer(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && viewer.classList.contains('open')) closeViewer(); });

    // Появление блоков при скролле
    const io = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -80px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    applyLanguage(lang);
})();
