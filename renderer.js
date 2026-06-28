// ========================================
// 渲染模块（优化版）
// ========================================

const Renderer = {
    // 缓存 active 日期按钮
    _activeDateBtn: null,

    // 渲染日期导航
    renderDateNav(container) {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();

        const fragment = document.createDocumentFragment();

        tripData.dates.forEach(date => {
            const btn = document.createElement('button');
            btn.className = 'date-btn';
            btn.dataset.day = date.day;

            if (currentMonth === 7 && currentDay === date.day) {
                btn.classList.add('today');
            }

            btn.innerHTML = `
                <span class="date-day">${date.date}</span>
                <span class="date-label">${date.label}</span>
            `;

            btn.addEventListener('click', () => {
                if (this._activeDateBtn) {
                    this._activeDateBtn.classList.remove('active');
                }
                btn.classList.add('active');
                this._activeDateBtn = btn;

                // 第一步：立即显示当天路线地图
                if (typeof MapModule !== 'undefined' && MapModule.showDayRoute) {
                    MapModule.showDayRoute(date.day);
                }

                // 第二步：延迟后滚动到卡片并展开
                const card = document.querySelector(`.daily-card[data-day="${date.day}"]`);
                if (card) {
                    setTimeout(() => {
                        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setTimeout(() => Animations.expandCard(card), 400);
                    }, 500);
                }
            });

            fragment.appendChild(btn);
        });

        container.appendChild(fragment);
    },

    // 渲染强度图表
    renderIntensityChart(container) {
        const fragment = document.createDocumentFragment();

        tripData.dates.forEach(date => {
            const bar = document.createElement('div');
            bar.className = 'intensity-bar';
            bar.dataset.day = date.day;

            const fillClass = date.intensity === 'light' ? 'light' :
                              date.intensity === 'medium' ? 'medium' : 'high';
            const heightMap = { light: '30%', medium: '60%', high: '90%' };

            bar.innerHTML = `
                <div class="bar-container">
                    <div class="bar-fill ${fillClass}" data-height="${heightMap[date.intensity]}" style="height: 0%"></div>
                </div>
                <span class="bar-label">${date.date}</span>
            `;

            bar.addEventListener('click', () => {
                const card = document.querySelector(`.daily-card[data-day="${date.day}"]`);
                if (card) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    Animations.expandCard(card);
                }
            });

            fragment.appendChild(bar);
        });

        container.appendChild(fragment);

        // 触发动画
        setTimeout(() => Animations.animateBars(), 300);
    },

    // 渲染每日卡片
    renderDailyCards(container) {
        const fragment = document.createDocumentFragment();

        tripData.dailyPlans.forEach(plan => {
            const card = document.createElement('div');
            card.className = 'daily-card animate-on-scroll';
            card.dataset.day = plan.day;
            card.dataset.type = plan.type;

            const completed = Storage.isDayCompleted(plan.day);
            if (completed) card.classList.add('completed');

            const typeLabel = { city: '城市', outdoor: '户外', far: '远途', rest: '休息' }[plan.type];
            const intensityLabel = { light: '轻松', medium: '中等', high: '高强度' }[plan.intensity];

            // 生成路线 HTML
            const routeHtml = plan.route.map((point, i) => {
                const isHighlight = i === 0 || i === plan.route.length - 1;
                const arrow = i < plan.route.length - 1 ?
                    '<span class="route-arrow"><i data-lucide="chevron-right"></i></span>' : '';
                return `<span class="route-point ${isHighlight ? 'highlight' : ''}">${point}</span>${arrow}`;
            }).join('');

            card.innerHTML = `
                <div class="daily-header" onclick="App.toggleCard(this)">
                    <div class="daily-date">
                        <span class="daily-date-day">${plan.day}</span>
                        <span class="daily-date-weekday">${plan.weekday}</span>
                    </div>
                    <div class="daily-info">
                        <h3 class="daily-title">${plan.title}</h3>
                        <div class="daily-tags">
                            <span class="daily-tag type-${plan.type}">${typeLabel}</span>
                            <span class="daily-tag intensity">${intensityLabel}</span>
                            ${plan.tags.map(tag => `<span class="daily-tag type-${plan.type}">${tag}</span>`).join('')}
                        </div>
                    </div>
                    <div class="daily-expand-icon">
                        <i data-lucide="chevron-down"></i>
                    </div>
                </div>
                <div class="daily-content">
                    <div class="daily-content-inner">
                        <div class="daily-section">
                            <div class="daily-section-title">
                                <i data-lucide="route"></i>
                                <span>主线</span>
                            </div>
                            <div class="route-visual">
                                ${routeHtml}
                            </div>
                        </div>

                        <div class="daily-section">
                            <div class="daily-section-title">
                                <i data-lucide="train-front"></i>
                                <span>交通</span>
                            </div>
                            <div class="transport-info">
                                <i data-lucide="navigation"></i>
                                <p>${plan.transport}</p>
                            </div>
                        </div>

                        <div class="daily-section">
                            <div class="daily-section-title">
                                <i data-lucide="cloud-sun"></i>
                                <span>天气</span>
                            </div>
                            <div class="weather-info">
                                <i data-lucide="umbrella"></i>
                                <p>${plan.weather}</p>
                            </div>
                        </div>

                        <div class="daily-section">
                            <div class="daily-section-title">
                                <i data-lucide="sticky-note"></i>
                                <span>备注</span>
                            </div>
                            <div class="note-info">
                                <i data-lucide="info"></i>
                                <p>${plan.note}</p>
                            </div>
                        </div>

                        <div class="daily-actions">
                            <button class="daily-action-btn primary" onclick="App.copyDayPlan(${plan.day})">
                                <i data-lucide="copy"></i>
                                <span>复制当天计划</span>
                            </button>
                            <button class="daily-action-btn secondary" onclick="App.toggleDayComplete(${plan.day}, this)">
                                <i data-lucide="check-circle"></i>
                                <span>${completed ? '已完成' : '标记完成'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            fragment.appendChild(card);
        });

        container.appendChild(fragment);
    },

    // 更新进度条
    updateProgress() {
        const progress = Storage.getProgress();
        const progressBar = document.getElementById('dateProgressBar');
        if (progressBar) {
            Animations.animateCounter(progressBar, progress, 800);
        }
    }
};