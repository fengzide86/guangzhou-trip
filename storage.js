// ========================================
// 本地存储模块（内存缓存 + 错误处理 + 预算）
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
        this._budgetCache = null;
    },

    // 获取打卡状态
    getCompletedDays() {
        if (this._cache.completedDays !== null) return this._cache.completedDays;
        const data = this._safeGet('trip-completed-days');
        this._cache.completedDays = data ? JSON.parse(data) : [];
        return this._cache.completedDays;
    },

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

    isDayCompleted(day) {
        return this.getCompletedDays().includes(day);
    },

    getTheme() {
        if (this._cache.theme !== null) return this._cache.theme;
        this._cache.theme = this._safeGet('trip-theme') || 'light';
        return this._cache.theme;
    },

    setTheme(theme) {
        this._cache.theme = theme;
        this._safeSet('trip-theme', theme);
        if (typeof CloudSync !== 'undefined') CloudSync.scheduleSave();
    },

    getChecklistState() {
        if (this._cache.checklist !== null) return this._cache.checklist;
        const data = this._safeGet('trip-checklist');
        this._cache.checklist = data ? JSON.parse(data) : {};
        return this._cache.checklist;
    },

    setChecklistItem(index, checked) {
        const state = this.getChecklistState();
        state[index] = checked;
        this._cache.checklist = state;
        this._safeSet('trip-checklist', JSON.stringify(state));
        if (typeof CloudSync !== 'undefined') CloudSync.scheduleSave();
    },

    isChecklistChecked(index) {
        return this.getChecklistState()[index] || false;
    },

    getProgress() {
        const completed = this.getCompletedDays().length;
        return Math.round((completed / 12) * 100);
    },

    // ========================================
    // 费用相关存储
    // ========================================

    _expenseCache: {
        expenses: null,
        categories: null
    },

    getExpenses() {
        if (this._expenseCache.expenses !== null) return this._expenseCache.expenses;
        const data = this._safeGet('trip-expenses');
        this._expenseCache.expenses = data ? JSON.parse(data) : [];
        return this._expenseCache.expenses;
    },

    _saveExpenses(expenses) {
        this._expenseCache.expenses = expenses;
        this._safeSet('trip-expenses', JSON.stringify(expenses));
    },

    addExpense(expense) {
        const expenses = this.getExpenses();
        expense.id = Date.now();
        expense.createdAt = new Date().toISOString();
        expenses.unshift(expense);
        this._saveExpenses(expenses);
        if (typeof CloudSync !== 'undefined') CloudSync.scheduleSave();
        return expense;
    },

    deleteExpense(id) {
        const expenses = this.getExpenses();
        const index = expenses.findIndex(e => e.id === id);
        if (index > -1) {
            expenses.splice(index, 1);
            this._saveExpenses(expenses);
            if (typeof CloudSync !== 'undefined') CloudSync.scheduleSave();
        }
    },

    clearExpenses() {
        this._saveExpenses([]);
        if (typeof CloudSync !== 'undefined') CloudSync.scheduleSave();
    },

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
    // 预算相关存储
    // ========================================

    _budgetCache: null,

    getBudget() {
        if (this._budgetCache !== null) return this._budgetCache;
        const data = this._safeGet('trip-budget');
        this._budgetCache = data ? parseFloat(data) : 0;
        return this._budgetCache;
    },

    setBudget(amount) {
        this._budgetCache = amount;
        this._safeSet('trip-budget', amount.toString());
        if (typeof CloudSync !== 'undefined') CloudSync.scheduleSave();
    },

    // ========================================
    // 类目相关存储
    // ========================================

    getCategories() {
        if (this._expenseCache.categories !== null) return this._expenseCache.categories;
        const data = this._safeGet('trip-categories');
        if (data) {
            this._expenseCache.categories = JSON.parse(data);
        } else {
            this._expenseCache.categories = JSON.parse(JSON.stringify(defaultCategories));
            this._saveCategories(this._expenseCache.categories);
        }
        return this._expenseCache.categories;
    },

    _saveCategories(categories) {
        this._expenseCache.categories = categories;
        this._safeSet('trip-categories', JSON.stringify(categories));
    },

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
