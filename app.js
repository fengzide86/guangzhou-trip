// ========================================
// 主应用入口（优化版）
// ========================================

const App = {
    // 缓存 DOM 引用
    _cache: {},

    // 配置常量
    _config: {
        SCROLL_THRESHOLD: 50,
        BACK_TO_TOP_THRESHOLD: 300,
        HEART_MAX_COUNT: 8,
        HEART_INTERVAL: 2000,
        CONFETTI_COUNT: 30
    },

    // 初始化
    init() {
        // 缓存常用 DOM 元素
        this._cacheElements();

        // 页面加载动画
        Animations.initPageLoad();

        // 初始化 Lucide 图标
        lucide.createIcons();

        // 渲染各模块
        Renderer.renderDateNav(this._cache.dateNav);
        Renderer.renderIntensityChart(this._cache.intensityChart);
        Renderer.renderDailyCards(this._cache.dailyCards);

        // 初始化功能模块
        this.initTheme();
        Animations.initScrollAnimations();
        this.initScrollEffects();
        this.initReminders();
        this.initChecklist();
        Renderer.updateProgress();
        this.initCountdown();
        this.initMapLazyLoad();
        this.initRouteNavigation();
        this.initIntensityTooltips();
        this.updateChecklistProgress();
        this.initHeartParticles();

        // 初始化费用模块
        ExpenseModule.init();

        // 行程提醒
        this.initTripReminder();

        // 初始化侧边栏
        this.initSidebar();

        // 初始化路由（最后初始化，确保其他模块已就绪）
        Router.init();

        // 获取实时天气
        this.fetchWeather();

        // 初始化云同步（最后初始化，确保其他模块已就绪）
        if (typeof CloudSync !== 'undefined') {
            CloudSync.init();
        }
    },

    // 初始化侧边栏
    initSidebar() {
        const menuBtn = document.getElementById('menuBtn');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const sidebarClose = document.getElementById('sidebarClose');
        const sidebarItems = document.querySelectorAll('.sidebar-item');

        // 打开侧边栏
        menuBtn.addEventListener('click', () => {
            sidebarOverlay.classList.add('active');
        });

        // 关闭侧边栏
        const closeSidebar = () => {
            sidebarOverlay.classList.remove('active');
        };

        sidebarClose.addEventListener('click', closeSidebar);
        sidebarOverlay.addEventListener('click', (e) => {
            if (e.target === sidebarOverlay) {
                closeSidebar();
            }
        });

        // 侧边栏导航
        sidebarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    Router.goTo(page);
                    closeSidebar();
                }
            });
        });
    },

    // 初始化行程页面回到顶部按钮（只初始化一次）
    _tripBackToTopInitialized: false,

    initTripBackToTop() {
        if (this._tripBackToTopInitialized) return;
        this._tripBackToTopInitialized = true;

        const btn = document.createElement('button');
        btn.id = 'tripBackToTop';
        btn.className = 'trip-back-to-top';
        btn.innerHTML = '<i data-lucide="arrow-up"></i>';
        btn.setAttribute('aria-label', '回到顶部');
        document.body.appendChild(btn);
        lucide.createIcons();

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // 监听滚动（只添加一次）
        window.addEventListener('scroll', () => {
            if (Router.currentPage === 'trip') {
                btn.classList.toggle('visible', window.scrollY > 300);
            } else {
                btn.classList.remove('visible');
            }
        }, { passive: true });
    },

    // 缓存 DOM 元素
    _cacheElements() {
        this._cache = {
            dateNav: document.getElementById('dateNav'),
            intensityChart: document.getElementById('intensityChart'),
            dailyCards: document.getElementById('dailyCards'),
            themeToggle: document.getElementById('themeToggle'),
            backToTop: document.getElementById('backToTop'),
            topBar: document.querySelector('.top-bar'),
            heroSection: document.querySelector('.hero-section'),
            countdownDays: document.getElementById('countdownDays'),
            countdownHours: document.getElementById('countdownHours'),
            countdownMinutes: document.getElementById('countdownMinutes'),
            countdownSeconds: document.getElementById('countdownSeconds')
        };
    },

    // 爱心粒子背景（红色浪漫版）
    _heartInterval: null,
    
    initHeartParticles() {
        const { heroSection } = this._cache;
        if (!heroSection) return;

        const hearts = ['❤️', '', '💗', '💖', '', '♥️'];
        let activeCount = 0;

        const createHeart = () => {
            if (activeCount >= this._config.HEART_MAX_COUNT) return;
            activeCount++;

            const heart = document.createElement('div');
            heart.className = 'heart-particle';
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.cssText = `
                left: ${Math.random() * 100}%;
                top: ${60 + Math.random() * 40}%;
                font-size: ${14 + Math.random() * 14}px;
                animation-duration: ${5 + Math.random() * 5}s;
                animation-delay: ${Math.random() * 2}s;
            `;
            heroSection.appendChild(heart);

            setTimeout(() => {
                heart.remove();
                activeCount--;
            }, 10000);
        };

        this._heartInterval = setInterval(createHeart, this._config.HEART_INTERVAL);
        for (let i = 0; i < 4; i++) {
            setTimeout(createHeart, i * 400);
        }
    },

    // 切换卡片展开
    toggleCard(header) {
        const card = header.closest('.daily-card');
        Animations.expandCard(card);
    },

    // 切换完成状态
    toggleDayComplete(day, btn) {
        const card = btn.closest('.daily-card');
        const isCompleted = card.classList.toggle('completed');

        Storage.setCompletedDay(day, isCompleted);

        const span = btn.querySelector('span');
        span.textContent = isCompleted ? '已完成' : '标记完成';

        Utils.showToast(isCompleted ? '已标记为完成！' : '已取消完成标记', 'success');

        Renderer.updateProgress();

        if (Storage.getProgress() === 100) {
            this.showCelebration();
        }
    },

    // 复制当天计划
    copyDayPlan(day) {
        const plan = tripData.dailyPlans.find(p => p.day === day);
        if (!plan) return;

        const text = [
            `${plan.date} ${plan.weekday}｜${plan.title}`,
            `主线：${plan.route.join(' → ')}`,
            `交通：${plan.transport}`,
            `提醒：${plan.note}`
        ].join('\n');

        Utils.copyToClipboard(text);
        Utils.showToast('已复制当天计划！', 'success');
    },

    // 复制全部行程
    copyAllPlans() {
        const plans = tripData.dailyPlans.map(plan =>
            `${plan.date} ${plan.weekday}｜${plan.title}\n主线：${plan.route.join(' → ')}\n交通：${plan.transport}`
        ).join('\n\n');

        Utils.copyToClipboard(`广州及周边 12 天旅行计划\n7·1 — 7·12\n\n${plans}`);
        Utils.showToast('已复制全部行程！', 'success');
    },

    // 分享行程
    shareTrip() {
        const shareData = {
            title: '广州及周边 12 天旅行计划',
            text: '7·1 — 7·12 广州旅行计划，一起探索这座城市的精彩！',
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData).catch(() => {
                // 用户取消分享，静默处理
            });
        } else {
            Utils.copyToClipboard(window.location.href);
            Utils.showToast('链接已复制，快分享给 TA 吧！', 'success');
        }
    },

    // 初始化主题
    initTheme() {
        const theme = Storage.getTheme();
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeIcon(theme);

        this._cache.themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            Storage.setTheme(newTheme);
            this.updateThemeIcon(newTheme);

            Utils.showToast(`已切换到${newTheme === 'dark' ? '深色' : '浅色'}模式`, 'info');
        });
    },

    // 更新主题图标
    updateThemeIcon(theme) {
        this._cache.themeToggle.innerHTML = `<i data-lucide="${theme === 'dark' ? 'sun' : 'moon'}"></i>`;
        lucide.createIcons();
    },

    // 初始化滚动效果
    initScrollEffects() {
        const { topBar } = this._cache;
        let ticking = false;

        const onScroll = () => {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                topBar.classList.toggle('scrolled', scrollY > this._config.SCROLL_THRESHOLD);
                ticking = false;
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
    },

    // 初始化提醒卡片
    initReminders() {
        const confirmCard = document.querySelector('.reminder-card:nth-child(2)');
        if (confirmCard) {
            confirmCard.classList.add('active');
        }
    },

    // 初始化清单（使用事件委托）
    initChecklist() {
        const checklist = document.querySelector('.checklist');
        if (!checklist) return;

        const items = checklist.querySelectorAll('li');

        // 恢复已勾选状态
        items.forEach((item, index) => {
            if (Storage.isChecklistChecked(index)) {
                item.classList.add('checked');
                this._updateChecklistIcon(item, true);
            }
        });

        // 事件委托
        checklist.addEventListener('click', (e) => {
            const item = e.target.closest('li');
            if (!item) return;

            const index = Array.from(items).indexOf(item);
            if (index === -1) return;

            const isNowChecked = item.classList.toggle('checked');
            Storage.setChecklistItem(index, isNowChecked);

            this._updateChecklistIcon(item, isNowChecked);

            if (isNowChecked) {
                Utils.showToast('已确认！', 'success');
            }

            this.updateChecklistProgress();
        });

        this.updateChecklistProgress();
    },

    // 更新清单图标（不重新渲染所有图标）
    _updateChecklistIcon(item, isChecked) {
        const icon = item.querySelector('i');
        if (icon) {
            icon.setAttribute('data-lucide', isChecked ? 'check-circle' : 'circle');
            lucide.createIcons();
        }
    },

    // 和风天气 API
    _weatherKey: '0dba0065ae5d4f27816a93385e358022',
    _weatherData: null,

    // 获取实时天气
    async fetchWeather() {
        try {
            const res = await fetch(`https://devapi.qweather.com/v7/weather/now?location=101280101&key=${this._weatherKey}`);
            const data = await res.json();
            if (data.code === '200' && data.now) {
                this._weatherData = data.now;
                this.applyWeatherBackground(data.now);
                console.log('天气获取成功:', data.now.text, data.now.temp + '°C');
            } else {
                console.warn('天气API返回异常:', data.code);
                // fallback: 使用模拟数据
                this.applyWeatherBackground({ icon: 100, text: '晴', temp: '32' });
            }
        } catch (e) {
            console.warn('天气获取失败，使用模拟数据:', e);
            // fallback: 使用模拟数据展示效果
            this.applyWeatherBackground({ icon: 100, text: '晴', temp: '32' });
        }
    },

    // 根据天气应用背景效果
    applyWeatherBackground(weather) {
        const heroGradient = document.querySelector('.hero-gradient');
        const heroSection = document.querySelector('.hero-section');
        if (!heroGradient || !heroSection) return;

        const icon = weather.icon;
        const text = weather.text;

        // 清除旧动画元素
        heroSection.querySelectorAll('.weather-effect').forEach(el => el.remove());

        // 判断天气类型
        let weatherType = 'sunny';
        if (icon >= 300 && icon <= 399) weatherType = 'cloudy';
        else if (icon >= 500 && icon <= 599) weatherType = 'rain';
        else if (icon >= 600 && icon <= 699) weatherType = 'snow';
        else if (icon >= 700 && icon <= 799) weatherType = 'thunder';
        else if (icon >= 1500 && icon <= 1999) weatherType = 'night';

        // 应用背景渐变
        const gradients = {
            sunny: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)',
            cloudy: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)',
            rain: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 50%, #3b82f6 100%)',
            snow: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)',
            thunder: 'linear-gradient(135deg, #475569 0%, #334155 50%, #1e293b 100%)',
            night: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)'
        };

        heroGradient.style.background = gradients[weatherType] || gradients.sunny;

        // 添加动画效果
        this.createWeatherEffect(heroSection, weatherType);

        // 更新首页天气标签
        const weatherBadge = document.querySelector('.hero-badge span');
        if (weatherBadge) {
            weatherBadge.textContent = `${text} ${weather.temp}°C`;
        }

        // 更新全局天气状态栏
        const weatherIcon = document.getElementById('weatherStatusIcon');
        const weatherText = document.getElementById('weatherStatusText');
        if (weatherIcon) {
            const iconMap = { 100: '☀️', 101: '⛅', 102: '⛅', 103: '⛅', 104: '☁️', 300: '🌦️', 301: '🌦️', 302: '⛈️', 303: '⛈️', 304: '⛈️', 305: '🌧️', 306: '🌧️', 307: '🌧️', 308: '️', 309: '️', 310: '🌧️', 311: '⛈️', 312: '⛈️', 313: '️', 314: '️', 315: '️', 316: '️', 317: '️', 318: '️', 399: '️', 400: '🌨️', 401: '🌨️', 402: '🌨️', 403: '🌨️', 404: '🌨️', 405: '🌨️', 406: '🌨️', 407: '🌨️', 408: '🌨️', 409: '🌨️', 410: '🌨️', 499: '🌨️', 500: '🌧️', 501: '🌧️', 502: '️', 503: '️', 504: '️', 507: '🌧️', 508: '🌧️', 509: '🌧️', 510: '🌧️', 514: '🌧️', 515: '🌧️', 800: '🌫️', 801: '🌫️', 802: '🌫️', 803: '🌫️', 804: '🌫️', 805: '🌫️', 806: '🌫️', 807: '🌫️', 900: '🌡️', 901: '🌡️', 999: '❓' };
            weatherIcon.textContent = iconMap[parseInt(icon)] || '🌤️';
        }
        if (weatherText) {
            weatherText.textContent = `${text} ${weather.temp}°C`;
        }
    },

    // 创建天气动画效果
    createWeatherEffect(container, type) {
        if (type === 'rain') {
            for (let i = 0; i < 20; i++) {
                const drop = document.createElement('div');
                drop.className = 'weather-effect rain-drop';
                drop.style.cssText = `
                    position:absolute;left:${Math.random()*100}%;top:-20px;
                    width:2px;height:${15+Math.random()*20}px;
                    background:rgba(147,197,253,0.6);border-radius:2px;
                    animation:rainFall ${1+Math.random()}s linear infinite;
                    animation-delay:${Math.random()*2}s;pointer-events:none;
                `;
                container.appendChild(drop);
            }
        } else if (type === 'cloudy') {
            for (let i = 0; i < 3; i++) {
                const cloud = document.createElement('div');
                cloud.className = 'weather-effect cloud';
                cloud.style.cssText = `
                    position:absolute;top:${10+Math.random()*30}%;
                    width:${80+Math.random()*60}px;height:${30+Math.random()*20}px;
                    background:rgba(255,255,255,0.4);border-radius:50px;
                    animation:cloudFloat ${15+Math.random()*10}s linear infinite;
                    animation-delay:${Math.random()*10}s;pointer-events:none;
                `;
                container.appendChild(cloud);
            }
        } else if (type === 'night') {
            for (let i = 0; i < 15; i++) {
                const star = document.createElement('div');
                star.className = 'weather-effect star';
                star.style.cssText = `
                    position:absolute;left:${Math.random()*100}%;top:${Math.random()*60}%;
                    width:${2+Math.random()*3}px;height:${2+Math.random()*3}px;
                    background:white;border-radius:50%;
                    animation:starTwinkle ${2+Math.random()*3}s ease-in-out infinite;
                    animation-delay:${Math.random()*3}s;pointer-events:none;
                `;
                container.appendChild(star);
            }
        }
    },

    // 初始化见面倒计时（缓存 DOM 引用）
    _countdownInterval: null,
    
    initCountdown() {
        const targetDate = new Date('2026-07-01T00:00:00');
        const { countdownDays: elDays, countdownHours: elHours, countdownMinutes: elMinutes, countdownSeconds: elSeconds } = this._cache;

        if (!elDays || !elHours || !elMinutes || !elSeconds) return;

        const updateCountdown = () => {
            const diff = targetDate - new Date();

            if (diff <= 0) {
                elDays.textContent = '00';
                elHours.textContent = '00';
                elMinutes.textContent = '00';
                elSeconds.textContent = '00';
                return;
            }

            elDays.textContent = String(Math.floor(diff / 86400000)).padStart(2, '0');
            elHours.textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
            elMinutes.textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
            elSeconds.textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
        };

        updateCountdown();
        this._countdownInterval = setInterval(updateCountdown, 1000);
    },

    // 销毁应用，清理定时器
    destroy() {
        if (this._countdownInterval) {
            clearInterval(this._countdownInterval);
            this._countdownInterval = null;
        }
        if (this._heartInterval) {
            clearInterval(this._heartInterval);
            this._heartInterval = null;
        }
    },

    // 初始化地图懒加载
    initMapLazyLoad() {
        const mapSection = document.getElementById('overviewMap');
        if (!mapSection) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    MapModule.lazyInit('mainMap');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(mapSection);
    },

    // 初始化路线导航（事件委托）- 点击路线地点弹出地图弹窗
    initRouteNavigation() {
        const dailyCards = this._cache.dailyCards;
        if (!dailyCards) return;

        dailyCards.addEventListener('click', (e) => {
            const point = e.target.closest('.route-point');
            if (!point) return;

            e.stopPropagation();
            e.preventDefault();
            const location = point.textContent.trim();

            // 在 mapMarkers 中查找匹配的地点
            const markerIndex = tripData.mapMarkers.findIndex(m =>
                location.includes(m.title) || m.title.includes(location)
            );

            if (markerIndex !== -1 && typeof MapModule !== 'undefined') {
                // 找到匹配项，弹出地图弹窗
                MapModule.showModal(markerIndex);
            } else {
                // 找不到匹配项，用 toast 提示
                Utils.showToast(`「${location}」暂无地图信息`, 'info');
            }
        });
    },

    // 初始化强度图表 hover 提示（事件委托）
    initIntensityTooltips() {
        const chart = this._cache.intensityChart;
        if (!chart) return;

        const intensityInfo = {
            light: '轻松：自由活动、室内、自然醒',
            medium: '中等：城市路线、半日户外',
            high: '高强度：增城户外、清远漂流'
        };

        chart.addEventListener('mouseenter', (e) => {
            const bar = e.target.closest('.intensity-bar');
            if (!bar) return;

            const fill = bar.querySelector('.bar-fill');
            if (!fill) return;

            const intensity = fill.classList.contains('light') ? 'light' :
                             fill.classList.contains('medium') ? 'medium' : 'high';

            const tooltip = document.createElement('div');
            tooltip.className = 'intensity-tooltip';
            tooltip.textContent = intensityInfo[intensity];
            tooltip.style.cssText = `
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: var(--bg-card);
                color: var(--text-primary);
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 12px;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                z-index: 10;
                margin-bottom: 8px;
            `;
            bar.style.position = 'relative';
            bar.appendChild(tooltip);
        }, true);

        chart.addEventListener('mouseleave', (e) => {
            const bar = e.target.closest('.intensity-bar');
            if (!bar) return;

            const tooltip = bar.querySelector('.intensity-tooltip');
            if (tooltip) tooltip.remove();
        }, true);
    },

    // 更新清单进度显示
    updateChecklistProgress() {
        const items = document.querySelectorAll('.checklist li');
        const checkedItems = document.querySelectorAll('.checklist li.checked');
        let progressText = document.querySelector('.checklist-progress');

        const text = `已完成 ${checkedItems.length}/${items.length}`;

        if (progressText) {
            progressText.textContent = text;
        } else {
            progressText = document.createElement('div');
            progressText.className = 'checklist-progress';
            progressText.textContent = text;
            progressText.style.cssText = 'font-size:12px;color:var(--text-tertiary);margin-top:8px;text-align:center;';

            const checklist = document.querySelector('.checklist');
            if (checklist) {
                checklist.parentNode.appendChild(progressText);
            }
        }
    },

    // 关闭所有弹窗
    closeAllModals() {
        // 关闭地图弹窗
        const mapModal = document.getElementById('mapModal');
        if (mapModal && mapModal.classList.contains('active')) {
            mapModal.classList.remove('active');
        }
        
        // 关闭添加支出弹窗
        const addExpenseModal = document.getElementById('addExpenseModal');
        if (addExpenseModal && addExpenseModal.classList.contains('active')) {
            addExpenseModal.classList.remove('active');
        }
        
        // 关闭类目管理弹窗
        const categoryModal = document.getElementById('categoryModal');
        if (categoryModal && categoryModal.classList.contains('active')) {
            categoryModal.classList.remove('active');
        }
        
        // 关闭添加类目弹窗
        const addCategoryModal = document.getElementById('addCategoryModal');
        if (addCategoryModal && addCategoryModal.classList.contains('active')) {
            addCategoryModal.classList.remove('active');
        }
        
        // 关闭侧边栏
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        if (sidebarOverlay && sidebarOverlay.classList.contains('active')) {
            sidebarOverlay.classList.remove('active');
        }
    },

    // 行程提醒
    initTripReminder() {
        // 获取今天的日期（模拟7月1日开始）
        const now = new Date();
        const startDate = new Date('2026-07-01');
        const diffDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        
        // 如果还没到旅行日期或已经过了，不显示提醒
        if (diffDays < 0 || diffDays >= 12) return;
        
        const todayPlan = tripData.dailyPlans[diffDays];
        if (!todayPlan) return;
        
        // 检查今天是否已经提醒过
        const reminderKey = `trip-reminder-${diffDays}`;
        if (Storage._safeGet(reminderKey)) return;
        
        // 显示提醒
        setTimeout(() => {
            Utils.showToast(`📅 今天是${todayPlan.date}：${todayPlan.title}`, 'info');
            Storage._safeSet(reminderKey, 'true');
        }, 2000);
    },

    // 完成庆祝动画
    showCelebration() {
        const celebration = document.createElement('div');
        celebration.className = 'celebration-overlay';
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-emoji"></div>
                <h2>恭喜完成全部行程！</h2>
                <p>12 天的广州之旅圆满结束</p>
                <p style="font-size:18px;color:#ef4444;margin-top:12px;">ZD ❤ 小芽芽 的专属回忆</p>
                <button onclick="this.parentElement.parentElement.remove()">关闭</button>
            </div>
        `;

        celebration.style.cssText = `
            position:fixed;top:0;left:0;right:0;bottom:0;
            background:rgba(0,0,0,0.5);display:flex;
            align-items:center;justify-content:center;
            z-index:9999;animation:fadeIn 0.3s ease;
        `;

        document.body.appendChild(celebration);

        // 添加彩带样式（只添加一次）
        if (!document.querySelector('#confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.textContent = `
                @keyframes confettiFall {
                    to { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        // 创建彩带
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < this._config.CONFETTI_COUNT; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position:fixed;width:10px;height:10px;
                background:hsl(${Math.random() * 360},100%,50%);
                left:${Math.random() * 100}vw;top:-10px;
                border-radius:${Math.random() > 0.5 ? '50%' : '0'};
                animation:confettiFall ${2 + Math.random() * 3}s linear forwards;
                z-index:10000;
            `;
            fragment.appendChild(confetti);
        }
        document.body.appendChild(fragment);

        setTimeout(() => {
            document.querySelectorAll('[style*="confettiFall"]').forEach(el => el.remove());
        }, 5000);
    }
};

// 注册 Service Worker（PWA 离线支持）
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    App.init();
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') App.closeAllModals();
    });
});

// 全局函数供 HTML 调用
function toggleReminder(header) {
    const card = header.closest('.reminder-card');
    card.classList.toggle('active');
    
    // 更新 aria-expanded 属性
    const isExpanded = card.classList.contains('active');
    header.setAttribute('aria-expanded', isExpanded);
}

function scrollToSection(sectionId) {
    Utils.scrollToSection(sectionId);
}

function copyAllPlans() {
    App.copyAllPlans();
}

function shareTrip() {
    App.shareTrip();
}