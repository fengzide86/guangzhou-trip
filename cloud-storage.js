// ========================================
// 云同步模块（Firebase Firestore）
// ========================================
// 两人共享同一份数据：打卡、清单、费用、类目、自定义地点、主题
// 本地写入 → 防抖上传 Firestore
// Firestore 变更 → 实时监听 → 写入 localStorage → 刷新 UI
// ========================================

const CloudSync = {
    db: null,
    _saveTimer: null,
    _isApplyingRemote: false,
    _enabled: false,
    _lastSyncedAt: null,

    // 初始化：检查配置 → 初始化 Firebase → 开启实时监听
    init() {
        // 检查是否已配置（排除占位符）
        if (typeof firebaseConfig === 'undefined' ||
            !firebaseConfig.projectId ||
            firebaseConfig.projectId.includes('在此填入')) {
            console.warn('[CloudSync] Firebase 未配置，数据仅保存在本地。请参考 firebase-config.js 中的说明。');
            this._updateIndicator('disabled');
            return;
        }

        // 检查 Firebase SDK 是否加载
        if (typeof firebase === 'undefined') {
            console.warn('[CloudSync] Firebase SDK 未加载');
            this._updateIndicator('disabled');
            return;
        }

        try {
            firebase.initializeApp(firebaseConfig);
            this.db = firebase.firestore();
            this._enabled = true;
            console.log('[CloudSync] 已连接，项目:', firebaseConfig.projectId);
            this._updateIndicator('synced');
            this._startListening();
        } catch (e) {
            console.warn('[CloudSync] 初始化失败:', e);
            this._updateIndicator('error');
        }
    },

    // 本地数据变更后调用（防抖 800ms 后上传）
    scheduleSave() {
        if (!this._enabled) return;
        if (this._saveTimer) clearTimeout(this._saveTimer);
        this._updateIndicator('syncing');
        this._saveTimer = setTimeout(() => this._save(), 800);
    },

    // 上传全部数据到 Firestore（单文档存储）
    async _save() {
        if (!this._enabled) return;
        try {
            const data = {
                completedDays: Storage.getCompletedDays(),
                checklist:     Storage.getChecklistState(),
                theme:         Storage.getTheme(),
                expenses:      Storage.getExpenses(),
                categories:    Storage.getCategories(),
                budget:        Storage.getBudget(),
                locations:     Storage.getCustomLocations(),
                updatedAt:     firebase.firestore.FieldValue.serverTimestamp()
            };
            await this.db.collection('trip').doc('shared').set(data);
            this._lastSyncedAt = new Date();
            this._updateIndicator('synced');
        } catch (e) {
            console.warn('[CloudSync] 上传失败:', e);
            this._updateIndicator('error');
        }
    },

    // 开启 Firestore 实时监听
    _startListening() {
        this.db.collection('trip').doc('shared').onSnapshot(
            (snapshot) => {
                if (this._isApplyingRemote) return;
                if (!snapshot.exists) return; // 云端无数据，保留本地

                this._isApplyingRemote = true;
                try {
                    this._applyRemote(snapshot.data());
                } finally {
                    this._isApplyingRemote = false;
                }
            },
            (error) => {
                console.warn('[CloudSync] 监听失败:', error);
                this._updateIndicator('error');
            }
        );
    },

    // 将云端数据写入本地并刷新 UI
    _applyRemote(data) {
        // 1. 清除 Storage 内存缓存，让后续 getter 从 localStorage 读取最新值
        Storage.invalidateAllCaches();

        // 2. 将云端数据直接写入 localStorage（不触发 scheduleSave，避免回写循环）
        if (data.completedDays !== undefined) {
            localStorage.setItem('trip-completed-days', JSON.stringify(data.completedDays));
        }
        if (data.checklist !== undefined) {
            localStorage.setItem('trip-checklist', JSON.stringify(data.checklist));
        }
        if (data.theme !== undefined) {
            localStorage.setItem('trip-theme', JSON.stringify(data.theme));
        }
        if (data.budget !== undefined) {
            localStorage.setItem('trip-budget', data.budget.toString());
        }
        if (data.expenses !== undefined) {
            localStorage.setItem('trip-expenses', JSON.stringify(data.expenses));
        }
        if (data.categories !== undefined) {
            localStorage.setItem('trip-categories', JSON.stringify(data.categories));
        }
        if (data.locations !== undefined) {
            localStorage.setItem('trip-custom-locations', JSON.stringify(data.locations));
        }

        // 3. 刷新 UI
        this._refreshUI(data);

        this._lastSyncedAt = new Date();
        this._updateIndicator('synced');
    },

    // 刷新 UI 各模块
    _refreshUI(data) {
        // 打卡状态：更新每日卡片
        if (data.completedDays !== undefined) {
            document.querySelectorAll('.daily-card').forEach(card => {
                const day    = parseInt(card.dataset.day);
                const isDone = data.completedDays.includes(day);
                card.classList.toggle('completed', isDone);
                const btn = card.querySelector('.daily-action-btn.secondary span');
                if (btn) btn.textContent = isDone ? '已完成' : '标记完成';
            });
            Renderer.updateProgress();
        }

        // 清单勾选
        if (data.checklist !== undefined) {
            const items = document.querySelectorAll('.checklist li');
            items.forEach((item, index) => {
                const shouldBeChecked = data.checklist[index] || false;
                const isNowChecked    = item.classList.contains('checked');
                if (shouldBeChecked !== isNowChecked) {
                    item.classList.toggle('checked', shouldBeChecked);
                    App._updateChecklistIcon(item, shouldBeChecked);
                }
            });
            App.updateChecklistProgress();
        }

        // 主题
        if (data.theme !== undefined) {
            document.documentElement.setAttribute('data-theme', data.theme);
            App.updateThemeIcon(data.theme);
        }

        // 费用模块
        if (data.expenses !== undefined || data.categories !== undefined) {
            if (typeof ExpenseModule !== 'undefined') {
                ExpenseModule.refresh();
            }
        }

        // 地图自定义地点（如果有地图模块）
        if (data.locations !== undefined && typeof MapModule !== 'undefined' && MapModule.refresh) {
            MapModule.refresh();
        }
    },

    // 更新同步指示器
    _updateIndicator(status) {
        const dot  = document.getElementById('syncDot');
        const text = document.getElementById('syncText');
        if (!dot || !text) return;

        dot.className = 'sync-dot ' + status;

        const labels = {
            syncing: '同步中…',
            synced:  this._lastSyncedAt ? '已同步' : '已连接',
            error:   '同步失败',
            disabled:'未连接'
        };
        text.textContent = labels[status] || '';
    }
};
