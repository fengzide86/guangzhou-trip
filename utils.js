// ========================================
// 工具函数模块（优化版）
// ========================================

const Utils = {
    // Toast 管理
    _toastQueue: [],
    _maxToasts: 3,

    // HTML 转义（防止 XSS）
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // 复制到剪贴板
    copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text).catch(() => {
                this._fallbackCopy(text);
            });
        }
        this._fallbackCopy(text);
        return Promise.resolve();
    },

    // 降级复制方案
    _fallbackCopy(text) {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.cssText = 'position:fixed;opacity:0;left:-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        } catch (e) {
            console.warn('Copy failed:', e);
            this.showToast('复制失败，请手动复制', 'error');
        }
    },

    // 显示 Toast 提示（防重复 + 限制数量）
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        // 移除多余的 Toast
        while (this._toastQueue.length >= this._maxToasts) {
            const oldToast = this._toastQueue.shift();
            oldToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const iconName = type === 'success' ? 'check-circle' : 
                         type === 'error' ? 'x-circle' : 'info';

        toast.innerHTML = `
            <i data-lucide="${iconName}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);
        lucide.createIcons();

        this._toastQueue.push(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                toast.remove();
                const index = this._toastQueue.indexOf(toast);
                if (index > -1) this._toastQueue.splice(index, 1);
            }, 300);
        }, 3000);
    },

    // 滚动到指定区域
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    },

    // 获取星期几
    getWeekday(dateStr) {
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const match = dateStr.match(/(\d+)·(\d+)/);
        if (match) {
            const month = parseInt(match[1]);
            const day = parseInt(match[2]);
            const date = new Date(2026, month - 1, day);
            return weekdays[date.getDay()];
        }
        return '';
    },

    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};