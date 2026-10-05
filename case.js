// Общая логика страниц кейсов: язык, «Say Hi!», копирование контактов
(function () {
    const CV = 'https://drive.google.com/file/d/1Yg3t4HtJvWGERvINZFn--mRIrUATi6Jk/view?usp=sharing';
    const common = {
        ru: { 'to-home': 'На главную', 'cv': 'резюме.pdf', 'copy-email': 'copy email', 'copy-phone': 'copy phone', 'copied': 'скопировано!' },
        en: { 'to-home': 'Home', 'cv': 'resume.pdf', 'copy-email': 'copy email', 'copy-phone': 'copy phone', 'copied': 'copied!' }
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

    // Появление блоков при скролле
    const io = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -80px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    applyLanguage(lang);
})();
