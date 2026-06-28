// ========================================
// 本地存储模块（优化版：内存缓存 + 错误处理）
// ========================================

const Storage = {
    // 内存缓存
    _cache: {
        completedDays: null,
        checklist: null,
        theme: null
    },

    // 安全写入
    _safeSet(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            // localStorage 满或不可用时静默失败
            console.warn('Storage write failed:', e);
        }
    },

    // 安全读取
    _safeGet(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn('Storage read failed:', e);
            return null;
        }
    },

    // 清除所有内存缓存（供云同步远程更新后调用）
    invalidateAllCaches() {
        this._cache.completedDays = null;
        this._cache.checklist = null;
        this._cache.theme = null;
        this._expenseCache.expenses = null;
        this._expenseCache.categories = null;
    },

    // 获取打卡状态
    getCompletedDays() {
        if (this._cache.completedDays !== null) return this._cache.completedDays;
        const data = this._safeGet('trip-completed-days');
        this._cache.completedDays = data ? JSON.parse(data) : [];
        return this._cache.completedDays;
    },

    // 设置打卡状态
    setCompletedDay(day, completed) {
        const days = this.getCompletedDays();
        if (completed) {
            if (!days.includes(day)) days.push(day);
        } else {
            const index = days.indexOf(day);
            if (index > -1) days.splice(index, 1);
        }
        this._cache.completedDays = days;
        this._safeSet('trip-completed-days', JSON.stringify(days));
        if (typeof CloudSync !== 'undefined') CloudSync.scheduleSave();
    },

    // 检查是否已完成
    isDayCompleted(day) {
        return this.getCompletedDays().includes(day);
    },

    // 获取主题
    getTheme() {
        if (this._cache.theme !== null) return this._cache.theme;
        this._cache.theme = this._safeGet('trip-theme') || 'light';
        return this._cache.theme;
    },

    // 设置主题
    setTheme(theme) {
        this._cache.theme = theme;
        this._safeSet('trip-theme', theme);
        if (typeof CloudSync !== 'undefined') CloudSync.scheduleSave();
    },

    // 获取清单状态
    getChecklistState() {
        if (this._cache.checklist !== null) return this._cache.checklist;
        const data = this._safeGet('trip-checklist');
        this._cache.checklist = data ? JSON.parse(data) : {};
        return this._cache.checklist;
    },

    // 设置清单状态
    setChecklistItem(index, checked) {
        const state = this.getChecklistState();
        state[index] = checked;
        this._cache.checklist = state;
        this._safeSet('trip-checklist', JSON.stringify(state));
        if (typeof CloudSync !== 'undefined') CloudSync.scheduleSave();
    },

    // 获取清单项状态
    isChecklistChecked(index) {
        return this.getChecklistState()[index] || false;
    },

    // 获取进度
    getProgress() {
        const completed = this.getCompletedDays().length;
        return Math.round((completed / 12) * 100);
    },

    // ========================================
    // 费用相关存储
    // ========================================

    // 内存缓存
    _expenseCache: {
        expenses: null,
        categories: null
    },

    // 获取支出记录
    getExpenses() {
        if (this._expenseCache.expenses !== null) return this._expenseCache.expenses;
        const data = this._safeGet('trip-expenses');
        this._expenseCache.expenses = data ? JSON.parse(data) : [];
        return this._expenseCache.expenses;
    },

    // 保存支出记录
    _saveExpenses(expenses) {
        this._expenseCache.expenses = expenses;
        this._safeSet('trip-expenses', JSON.stringify(expenses));
    },

    // 添加支出
    addExpense(expense) {
        const expenses = this.getExpenses();
        expense.id = Date.now();
        expense.createdAt = new Date().toISOString();
        expenses.unshift(expense);
        this._saveExpenses(expenses);
        if (typeof CloudSync !== 'undefined') CloudSync.scheduleSave();
        return expense;
    },

    // 删除支出
    deleteExpense(id) {
        const expenses = this.getExpenses();
        const index = expenses.findIndex(e => e.id === id);
        if (index > -1) {
            expenses.splice(index, 1);
            this._saveExpenses(expenses);
            if (typeof CloudSync !== 'undefined') CloudSync.scheduleSave();
        }
    },

    // 清空支出
    clearExpenses() {
        this._saveExpenses([]);
        if (typeof CloudSync !== 'undefined') CloudSync.scheduleSave();
    },

    // 获取支出统计
    getExpenseStats() {
        const expenses = this.getExpenses();
        let totalYou = 0;
        let totalHer = 0;
        const categoryStats = {};

        expenses.forEach(exp => {
            totalYou += exp.maleAmount;
            totalHer += exp.femaleAmount;
            
            const catId = exp.categoryId;
            if (!categoryStats[catId]) {
                categoryStats[catId] = {
                    name: exp.categoryName,
                    icon: exp.categoryIcon,
                    color: exp.categoryColor,
                    amount: 0
                };
            }
            categoryStats[catId].amount += exp.actualAmount;
        });

        return {
            total: totalYou + totalHer,
            totalYou,
            totalHer,
            categoryStats
        };
    },

    // ========================================
    // 类目相关存储
    // ========================================

    // 获取类目
    getCategories() {
        if (this._expenseCache.categories !== null) return this._expenseCache.categories;
        const data = this._safeGet('trip-categories');
        if (data) {
            this._expenseCache.categories = JSON.parse(data);
        } else {
            // 使用默认类目
            this._expenseCache.categories = JSON.parse(JSON.stringify(defaultCategories));
            this._saveCategories(this._expenseCache.categories);
        }
        return this._expenseCache.categories;
    },

    // 保存类目
    _saveCategories(categories) {
        this._expenseCache.categories = categories;
        this._safeSet('trip-categories', JSON.stringify(categories));
    },

    // 添加类目
    addCategory(type, category) {
        const categories = this.getCategories();
        if (!categories[type]) {
            categories[type] = [];
        }
        category.id = 'custom_' + Date.now();
        categories[type].push(category);
        this._saveCategories(categories);
        if (typeof CloudSync !== 'undefined') CloudSync.scheduleSave();
        return category;
    },

    // 删除类目
    deleteCategory(type, id) {
        const categories = this.getCategories();
        if (categories[type]) {
            const index = categories[type].findIndex(c => c.id === id);
            if (index > -1) {
                categories[type].splice(index, 1);
                this._saveCategories(categories);
                if (typeof CloudSync !== 'undefined') CloudSync.scheduleSave();
            }
        }
    },

    // 获取所有类目（扁平化）
    getAllCategories() {
        const categories = this.getCategories();
        const all = [];
        
        if (categories.normal) {
            categories.normal.forEach(cat => {
                all.push({ ...cat, type: 'normal' });
            });
        }
        
        if (categories.family) {
            categories.family.forEach(cat => {
                all.push({ ...cat, type: 'family' });
            });
        }
        
        return all;
    },

    // ========================================
    // 自定义地图地点存储
    // ========================================

    getCustomLocations() {
        const data = this._safeGet('trip-custom-locations');
        return data ? JSON.parse(data) : [];
    },

    addCustomLocation(location) {
        const locations = this.getCustomLocations();
        location.id = Date.now();
        locations.push(location);
        this._safeSet('trip-custom-locations', JSON.stringify(locations));
        if (typeof CloudSync !== 'undefined') CloudSync.scheduleSave();
        return location;
    },

    deleteCustomLocation(id) {
        const locations = this.getCustomLocations().filter(l => l.id !== id);
        this._safeSet('trip-custom-locations', JSON.stringify(locations));
        if (typeof CloudSync !== 'undefined') CloudSync.scheduleSave();
    },

    getAllMapMarkers() {
        const defaults = tripData.mapMarkers.map((m, i) => ({ ...m, index: i, isCustom: false }));
        const customs = this.getCustomLocations().map(m => ({ ...m, isCustom: true }));
        return [...defaults, ...customs];
    }
};
