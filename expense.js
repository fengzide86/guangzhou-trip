// ========================================
// 费用计算模块
// ========================================

const ExpenseModule = {
    // 当前选中的类目
    _selectedCategory: null,
    // 当前选中的图标
    _selectedIcon: null,
    // 当前选中的颜色
    _selectedColor: null,
    // 当前添加类目的类型
    _addCategoryType: null,

    // 初始化
    init() {
        this.renderExpenseList();
        this.renderStats();
        this.renderCategoryChart();
    },

    // 刷新模块
    refresh() {
        this.renderExpenseList();
        this.renderStats();
        this.renderCategoryChart();
    },

    // ========================================
    // 计算逻辑
    // ========================================

    // 计算费用分配
    calculateExpense(type, actualAmount, expectedAmount) {
        const config = expenseConfig[type];
        if (!config) return null;

        let femaleAmount, maleAmount, hasDiscount = false;

        // 如果有预期金额且预期低于实际
        if (expectedAmount && expectedAmount < actualAmount) {
            // 她只出预期金额的比例
            femaleAmount = expectedAmount * config.femaleRatio;
            maleAmount = actualAmount - femaleAmount;
            hasDiscount = true;
        } else {
            // 正常按比例分配
            femaleAmount = actualAmount * config.femaleRatio;
            maleAmount = actualAmount * config.maleRatio;
        }

        return {
            actualAmount,
            expectedAmount: expectedAmount || null,
            femaleAmount: Math.round(femaleAmount * 100) / 100,
            maleAmount: Math.round(maleAmount * 100) / 100,
            hasDiscount
        };
    },

    // ========================================
    // 渲染统计
    // ========================================

    // 渲染总览统计
    renderStats() {
        const stats = Storage.getExpenseStats();
        const total = stats.total;
        const totalYou = stats.totalYou;
        const totalHer = stats.totalHer;

        // 更新数字
        document.getElementById('donutTotal').textContent = `¥${total.toFixed(0)}`;
        document.getElementById('statYou').textContent = `¥${totalYou.toFixed(0)}`;
        document.getElementById('statHer').textContent = `¥${totalHer.toFixed(0)}`;

        // 更新百分比
        const youPercent = total > 0 ? Math.round((totalYou / total) * 100) : 0;
        const herPercent = total > 0 ? 100 - youPercent : 0;
        document.getElementById('statYouPercent').textContent = `${youPercent}%`;
        document.getElementById('statHerPercent').textContent = `${herPercent}%`;

        // 更新环形图
        const donutChart = document.getElementById('donutChart');
        if (total > 0) {
            donutChart.style.background = `conic-gradient(
                var(--expense-you) 0% ${youPercent}%,
                var(--expense-her) ${youPercent}% 100%
            )`;
        } else {
            donutChart.style.background = 'var(--bg-secondary)';
        }
    },

    // 渲染类目分布图
    renderCategoryChart() {
        const stats = Storage.getExpenseStats();
        const categoryStats = stats.categoryStats;
        const container = document.getElementById('categoryBars');
        
        if (!container) return;

        const total = stats.total;
        
        if (total === 0) {
            container.innerHTML = '<p class="category-empty">暂无数据</p>';
            return;
        }

        let html = '';
        const sortedCategories = Object.entries(categoryStats)
            .sort((a, b) => b[1].amount - a[1].amount);

        sortedCategories.forEach(([catId, cat]) => {
            const percent = Math.round((cat.amount / total) * 100);
            html += `
                <div class="category-bar-item">
                    <div class="category-bar-icon" style="background: ${cat.color}">
                        <i data-lucide="${cat.icon}"></i>
                    </div>
                    <div class="category-bar-info">
                        <div class="category-bar-name">${cat.name}</div>
                        <div class="category-bar-track">
                            <div class="category-bar-fill" style="width: ${percent}%; background: ${cat.color}"></div>
                        </div>
                    </div>
                    <div class="category-bar-amount">¥${cat.amount.toFixed(0)}</div>
                </div>
            `;
        });

        container.innerHTML = html;
        lucide.createIcons();
    },

    // ========================================
    // 渲染支出列表
    // ========================================

    renderExpenseList() {
        const expenses = Storage.getExpenses();
        const listContainer = document.getElementById('expenseRecordsList');
        const emptyContainer = document.getElementById('expenseEmpty');

        if (!listContainer || !emptyContainer) return;

        if (expenses.length === 0) {
            listContainer.style.display = 'none';
            emptyContainer.style.display = 'block';
            return;
        }

        listContainer.style.display = 'flex';
        emptyContainer.style.display = 'none';

        // 按日期分组
        const grouped = this._groupExpensesByDate(expenses);
        
        let html = '';
        Object.entries(grouped).forEach(([date, items]) => {
            html += `<div class="expense-date-group">`;
            html += `<div class="expense-date-label">${date}</div>`;
            
            items.forEach(exp => {
                const config = expenseConfig[exp.type];
                const typeLabel = config ? config.label : '';
                
                html += `
                    <div class="expense-card" data-id="${exp.id}">
                        <div class="expense-card-header">
                            <div class="expense-card-icon" style="background: ${exp.categoryColor}">
                                <i data-lucide="${exp.categoryIcon}"></i>
                            </div>
                            <div class="expense-card-info">
                                <div class="expense-card-name">${exp.categoryName}</div>
                                <div class="expense-card-meta">${typeLabel}${exp.hasDiscount ? ' · 预期生效' : ''}</div>
                            </div>
                            <div class="expense-card-amount">¥${exp.actualAmount.toFixed(0)}</div>
                            <button class="expense-card-delete" onclick="ExpenseModule.deleteExpense(${exp.id})">
                                <i data-lucide="x"></i>
                            </button>
                        </div>
                        <div class="expense-card-split">
                            <div class="expense-card-split-item">
                                <span class="expense-card-split-dot you"></span>
                                <span>你 ¥${exp.maleAmount.toFixed(0)}</span>
                            </div>
                            <div class="expense-card-split-item">
                                <span class="expense-card-split-dot her"></span>
                                <span>她 ¥${exp.femaleAmount.toFixed(0)}</span>
                            </div>
                        </div>
                        ${exp.hasDiscount ? `
                            <div class="expense-card-discount">
                                <i data-lucide="info"></i>
                                <span>预期 ¥${exp.expectedAmount} 生效</span>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
            
            html += `</div>`;
        });

        listContainer.innerHTML = html;
        lucide.createIcons();
    },

    // 按日期分组
    _groupExpensesByDate(expenses) {
        const grouped = {};
        
        expenses.forEach(exp => {
            const date = exp.date || '未知日期';
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(exp);
        });
        
        return grouped;
    },

    // ========================================
    // 添加支出弹窗
    // ========================================

    showAddModal() {
        this._selectedCategory = null;
        document.getElementById('expenseAmount').value = '';
        document.getElementById('expenseExpected').value = '';
        
        this._renderCategorySelect();
        this._updatePreview();
        
        document.getElementById('addExpenseModal').classList.add('active');
    },

    closeAddModal() {
        document.getElementById('addExpenseModal').classList.remove('active');
    },

    // 渲染类目选择
    _renderCategorySelect() {
        const categories = Storage.getAllCategories();
        const container = document.getElementById('categorySelectGrid');
        
        if (!container) return;

        let html = '';
        categories.forEach(cat => {
            const typeLabel = cat.type === 'normal' ? '一般' : '亲属卡';
            html += `
                <div class="category-card" data-category-id="${cat.id}" data-category-type="${cat.type}" onclick="ExpenseModule.selectCategory('${cat.id}', '${cat.type}')">
                    <div class="category-icon" style="background: ${cat.color}20">
                        <i data-lucide="${cat.icon}" style="color: ${cat.color}"></i>
                    </div>
                    <span class="category-name">${cat.name}</span>
                    <span class="category-type">${typeLabel}</span>
                </div>
            `;
        });

        container.innerHTML = html;
        lucide.createIcons();
    },

    // 选择类目
    selectCategory(categoryId, type) {
        this._selectedCategory = {
            id: categoryId,
            type: type
        };

        // 更新选中状态
        document.querySelectorAll('#categorySelectGrid .category-card').forEach(card => {
            card.classList.remove('selected');
            if (card.dataset.categoryId === categoryId) {
                card.classList.add('selected');
            }
        });

        this._updatePreview();
    },

    // 金额变化时更新预览
    onAmountChange() {
        this._updatePreview();
    },

    // 更新预览
    _updatePreview() {
        const amount = parseFloat(document.getElementById('expenseAmount').value) || 0;
        const expected = parseFloat(document.getElementById('expenseExpected').value) || 0;
        
        let type = 'normal';
        let categoryName = '';
        let categoryIcon = '';
        let categoryColor = '';

        if (this._selectedCategory) {
            type = this._selectedCategory.type;
            const allCats = Storage.getAllCategories();
            const cat = allCats.find(c => c.id === this._selectedCategory.id);
            if (cat) {
                categoryName = cat.name;
                categoryIcon = cat.icon;
                categoryColor = cat.color;
            }
        }

        const result = this.calculateExpense(type, amount, expected);
        
        if (result) {
            document.getElementById('previewTotal').textContent = `¥${amount.toFixed(0)}`;
            document.getElementById('previewYou').textContent = `¥${result.maleAmount.toFixed(0)}`;
            document.getElementById('previewHer').textContent = `¥${result.femaleAmount.toFixed(0)}`;
            
            const youPercent = amount > 0 ? Math.round((result.maleAmount / amount) * 100) : 0;
            const herPercent = 100 - youPercent;
            
            document.getElementById('previewBarYou').style.width = `${youPercent}%`;
            document.getElementById('previewBarHer').style.width = `${herPercent}%`;
            
            // 显示折扣提示
            const discountEl = document.getElementById('previewDiscount');
            if (result.hasDiscount) {
                discountEl.style.display = 'flex';
            } else {
                discountEl.style.display = 'none';
            }
        } else {
            document.getElementById('previewTotal').textContent = '¥0';
            document.getElementById('previewYou').textContent = '¥0';
            document.getElementById('previewHer').textContent = '¥0';
            document.getElementById('previewBarYou').style.width = '60%';
            document.getElementById('previewBarHer').style.width = '40%';
            document.getElementById('previewDiscount').style.display = 'none';
        }
    },

    // 添加支出
    addExpense() {
        if (!this._selectedCategory) {
            Utils.showToast('请选择类目', 'error');
            return;
        }

        const amount = parseFloat(document.getElementById('expenseAmount').value);
        if (!amount || amount <= 0) {
            Utils.showToast('请输入金额', 'error');
            return;
        }

        const expected = parseFloat(document.getElementById('expenseExpected').value) || 0;

        // 获取类目信息
        const allCats = Storage.getAllCategories();
        const cat = allCats.find(c => c.id === this._selectedCategory.id);
        if (!cat) {
            Utils.showToast('类目不存在', 'error');
            return;
        }

        // 计算分配
        const result = this.calculateExpense(this._selectedCategory.type, amount, expected);
        
        // 获取当前日期
        const today = new Date();
        const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`;

        // 创建支出记录
        const expense = {
            categoryId: cat.id,
            categoryName: cat.name,
            categoryIcon: cat.icon,
            categoryColor: cat.color,
            type: this._selectedCategory.type,
            actualAmount: amount,
            expectedAmount: expected > 0 ? expected : null,
            date: dateStr,
            maleAmount: result.maleAmount,
            femaleAmount: result.femaleAmount,
            hasDiscount: result.hasDiscount
        };

        Storage.addExpense(expense);
        this.closeAddModal();
        this.refresh();
        Utils.showToast('已添加支出', 'success');
    },

    // ========================================
    // 删除支出
    // ========================================

    deleteExpense(id) {
        if (confirm('确定删除这条支出吗？')) {
            Storage.deleteExpense(id);
            this.refresh();
            Utils.showToast('已删除', 'success');
        }
    },

    // ========================================
    // 清空记录
    // ========================================

    clearAll() {
        if (confirm('确定清空所有支出记录吗？此操作不可恢复。')) {
            Storage.clearExpenses();
            this.refresh();
            Utils.showToast('已清空', 'success');
        }
    },

    // ========================================
    // 导出明细
    // ========================================

    exportDetail() {
        const expenses = Storage.getExpenses();
        const stats = Storage.getExpenseStats();

        if (expenses.length === 0) {
            Utils.showToast('暂无记录可导出', 'error');
            return;
        }

        let text = '=== 费用明细 ===\n\n';
        text += `总计: ¥${stats.total.toFixed(2)}\n`;
        text += `你出: ¥${stats.totalYou.toFixed(2)}\n`;
        text += `她出: ¥${stats.totalHer.toFixed(2)}\n\n`;
        text += '--- 明细 ---\n\n';

        expenses.forEach(exp => {
            text += `${exp.date} ${exp.categoryName}\n`;
            text += `  金额: ¥${exp.actualAmount.toFixed(2)}\n`;
            if (exp.hasDiscount) {
                text += `  预期: ¥${exp.expectedAmount.toFixed(2)} (生效)\n`;
            }
            text += `  你出: ¥${exp.maleAmount.toFixed(2)} | 她出: ¥${exp.femaleAmount.toFixed(2)}\n\n`;
        });

        Utils.copyToClipboard(text);
        Utils.showToast('已复制到剪贴板', 'success');
    },

    // ========================================
    // 类目管理弹窗
    // ========================================

    showCategoryModal() {
        this._renderCategoryManage();
        document.getElementById('categoryModal').classList.add('active');
    },

    closeCategoryModal() {
        document.getElementById('categoryModal').classList.remove('active');
        // 刷新类目选择
        this._renderCategorySelect();
    },

    // 渲染类目管理
    _renderCategoryManage() {
        const categories = Storage.getCategories();
        
        // 一般支出类目
        const normalGrid = document.getElementById('normalCategoryGrid');
        if (normalGrid) {
            let html = '';
            (categories.normal || []).forEach(cat => {
                html += `
                    <div class="category-tag">
                        <i data-lucide="${cat.icon}"></i>
                        <span>${cat.name}</span>
                        <span class="category-tag-delete" onclick="ExpenseModule.deleteCategory('normal', '${cat.id}')">
                            <i data-lucide="x"></i>
                        </span>
                    </div>
                `;
            });
            normalGrid.innerHTML = html;
        }

        // 亲属卡类目
        const familyGrid = document.getElementById('familyCategoryGrid');
        if (familyGrid) {
            let html = '';
            (categories.family || []).forEach(cat => {
                html += `
                    <div class="category-tag">
                        <i data-lucide="${cat.icon}"></i>
                        <span>${cat.name}</span>
                        <span class="category-tag-delete" onclick="ExpenseModule.deleteCategory('family', '${cat.id}')">
                            <i data-lucide="x"></i>
                        </span>
                    </div>
                `;
            });
            familyGrid.innerHTML = html;
        }

        lucide.createIcons();
    },

    // 删除类目
    deleteCategory(type, id) {
        if (confirm('确定删除这个类目吗？')) {
            Storage.deleteCategory(type, id);
            this._renderCategoryManage();
            Utils.showToast('已删除', 'success');
        }
    },

    // ========================================
    // 添加类目弹窗
    // ========================================

    showAddCategoryModal(type) {
        this._addCategoryType = type;
        this._selectedIcon = null;
        this._selectedColor = availableColors[0];
        
        document.getElementById('newCategoryName').value = '';
        
        this._renderIconSelect();
        this._renderColorSelect();
        
        document.getElementById('addCategoryModal').classList.add('active');
    },

    closeAddCategoryModal() {
        document.getElementById('addCategoryModal').classList.remove('active');
    },

    // 渲染图标选择
    _renderIconSelect() {
        const container = document.getElementById('iconSelectGrid');
        if (!container) return;

        let html = '';
        availableIcons.forEach((icon, index) => {
            const selected = index === 0 ? 'selected' : '';
            if (index === 0) this._selectedIcon = icon;
            
            html += `
                <div class="icon-option ${selected}" data-icon="${icon}" onclick="ExpenseModule.selectIcon('${icon}')">
                    <i data-lucide="${icon}"></i>
                </div>
            `;
        });

        container.innerHTML = html;
        lucide.createIcons();
    },

    // 选择图标
    selectIcon(icon) {
        this._selectedIcon = icon;
        
        document.querySelectorAll('#iconSelectGrid .icon-option').forEach(opt => {
            opt.classList.remove('selected');
            if (opt.dataset.icon === icon) {
                opt.classList.add('selected');
            }
        });
    },

    // 渲染颜色选择
    _renderColorSelect() {
        const container = document.getElementById('colorSelectGrid');
        if (!container) return;

        let html = '';
        availableColors.forEach((color, index) => {
            const selected = index === 0 ? 'selected' : '';
            
            html += `
                <div class="color-option ${selected}" data-color="${color}" onclick="ExpenseModule.selectColor('${color}')"></div>
            `;
        });

        container.innerHTML = html;
    },

    // 选择颜色
    selectColor(color) {
        this._selectedColor = color;
        
        document.querySelectorAll('#colorSelectGrid .color-option').forEach(opt => {
            opt.classList.remove('selected');
            if (opt.dataset.color === color) {
                opt.classList.add('selected');
            }
        });
    },

    // 添加类目
    addCategory() {
        const name = document.getElementById('newCategoryName').value.trim();
        
        if (!name) {
            Utils.showToast('请输入类目名称', 'error');
            return;
        }

        if (!this._selectedIcon) {
            Utils.showToast('请选择图标', 'error');
            return;
        }

        const category = {
            name: name,
            icon: this._selectedIcon,
            color: this._selectedColor
        };

        Storage.addCategory(this._addCategoryType, category);
        this.closeAddCategoryModal();
        this._renderCategoryManage();
        Utils.showToast('已添加类目', 'success');
    }
};