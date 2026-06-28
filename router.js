// ========================================
// 路由模块 - Hash 路由管理
// ========================================

const Router = {
    // 路由配置
    routes: {
        '#home': 'home',
        '#trip': 'trip',
        '#map': 'map',
        '#expense': 'expense',
        '#reminders': 'reminders'
    },

    // 当前页面
    currentPage: 'home',

    // 初始化
    init() {
        // 监听 hash 变化
        window.addEventListener('hashchange', () => this.navigate());
        
        // 初始导航
        this.navigate();
    },

    // 导航到指定页面
    navigate() {
        const hash = window.location.hash || '#home';
        const page = this.routes[hash] || 'home';
        this.showPage(page);
    },

    // 显示页面
    showPage(page) {
        if (this.currentPage === page) return;

        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        // 显示目标页面
        const targetPage = document.getElementById(`page-${page}`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // 更新底部导航
        this.updateNav(page);

        // 更新当前页面
        this.currentPage = page;

        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'instant' });

        // 触发页面切换事件
        this.onPageChange(page);
    },

    // 更新底部导航高亮
    updateNav(page) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            const href = item.getAttribute('href');
            if (href === `#${page}`) {
                item.classList.add('active');
            }
        });
    },

    // 页面切换回调
    onPageChange(page) {
        // 地图页面懒加载 + 渲染选择器
        if (page === 'map') {
            setTimeout(() => {
                if (typeof MapModule !== 'undefined') {
                    MapModule.renderSelector();
                }
            }, 100);
        }

        // 费用页面刷新统计
        if (page === 'expense') {
            setTimeout(() => {
                if (typeof ExpenseModule !== 'undefined') {
                    ExpenseModule.refresh();
                }
            }, 100);
        }

        // 行程页面初始化回到顶部按钮
        if (page === 'trip') {
            setTimeout(() => {
                if (typeof App !== 'undefined' && App.initTripBackToTop) {
                    App.initTripBackToTop();
                }
            }, 100);
        }
    },

    // 跳转到指定页面（编程式导航）
    goTo(page) {
        window.location.hash = `#${page}`;
    }
};