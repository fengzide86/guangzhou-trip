// ========================================
// 动画模块（优化版）
// ========================================

const Animations = {
    // 滚动显示动画
    initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    },

    // 卡片展开动画
    expandCard(card) {
        const content = card.querySelector('.daily-content');
        if (!content) return;

        if (card.classList.contains('expanded')) {
            card.classList.remove('expanded');
            content.style.maxHeight = '0';
        } else {
            card.classList.add('expanded');
            content.style.maxHeight = content.scrollHeight + 'px';
        }
    },

    // 柱状图弹性动画（使用 requestAnimationFrame）
    animateBars() {
        const bars = document.querySelectorAll('.bar-fill');
        if (!bars.length) return;

        bars.forEach((bar, index) => {
            const height = bar.dataset.height || '30%';
            bar.style.height = '0%';
            bar.style.transition = 'none';
            
            // 强制重排
            void bar.offsetHeight;
            
            const delay = index * 50;
            
            setTimeout(() => {
                requestAnimationFrame(() => {
                    bar.style.transition = `height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)`;
                    bar.style.height = height;
                });
            }, delay);
        });
    },

    // 路线绘制动画
    animateRoute(routeElement) {
        const points = routeElement.querySelectorAll('.route-point');
        const arrows = routeElement.querySelectorAll('.route-arrow');
        
        points.forEach((point, index) => {
            point.style.opacity = '0';
            point.style.transform = 'translateX(-10px)';
            
            setTimeout(() => {
                point.style.transition = 'all 0.3s ease';
                point.style.opacity = '1';
                point.style.transform = 'translateX(0)';
            }, index * 100);
        });

        arrows.forEach((arrow, index) => {
            arrow.style.opacity = '0';
            
            setTimeout(() => {
                arrow.style.transition = 'opacity 0.3s ease';
                arrow.style.opacity = '1';
            }, index * 100 + 50);
        });
    },

    // 页面加载动画
    initPageLoad() {
        const loader = document.getElementById('loader');
        if (loader) {
            setTimeout(() => {
                loader.classList.add('hidden');
                setTimeout(() => {
                    loader.remove();
                }, 500);
            }, 800);
        }
    },

    // 数字计数动画
    animateCounter(element, target, duration = 1000) {
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.round(start + (target - start) * easeOutQuart);
            
            element.textContent = current + '%';
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    },

    // 脉冲动画
    createPulse(element) {
        element.style.animation = 'pulse 2s ease-in-out infinite';
    },

    // 涟漪效果
    createRipple(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }
};

// 添加动画样式（等 DOM 加载后执行）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addAnimationStyles);
} else {
    addAnimationStyles();
}

function addAnimationStyles() {
    if (document.querySelector('#animation-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'animation-styles';
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(1.05);
                opacity: 0.8;
            }
        }
        
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-on-scroll.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .animate-on-scroll.delay-1 { transition-delay: 0.1s; }
        .animate-on-scroll.delay-2 { transition-delay: 0.2s; }
        .animate-on-scroll.delay-3 { transition-delay: 0.3s; }
    `;
    document.head.appendChild(style);
}