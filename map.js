// ========================================
// 地图模块（优化版：中文地图 + 选择器 + 弹窗）
// ========================================

const MapModule = {
    map: null,
    modalMap: null,
    markers: [],
    routes: [],
    initialized: false,
    modalInitialized: false,

    // 初始化地图
    init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        this.map = L.map(containerId, {
            zoomControl: false
        }).setView([23.1291, 113.2644], 11);

        L.control.zoom({ position: 'bottomright' }).addTo(this.map);

        // 高德地图瓦片（中文）
        L.tileLayer('https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
            attribution: '&copy; 高德地图',
            maxZoom: 18,
            subdomains: '1234'
        }).addTo(this.map);

        this.addMarkers();
        this.addRoutes();
        this.addLegend();

        setTimeout(() => this.map.invalidateSize(), 200);
        this.initialized = true;
    },

    lazyInit(containerId) {
        if (this.initialized) return;
        this.init(containerId);
    },

    // 渲染地图选择器
    renderSelector() {
        const container = document.getElementById('mapSelectorGrid');
        if (!container) return;

        const iconMap = {
            hotel: { icon: 'building-2', color: '#f59e0b' },
            scenic: { icon: 'map-pin', color: '#2563eb' },
            food: { icon: 'utensils', color: '#10b981' },
            other: { icon: 'map', color: '#64748b' }
        };

        const allMarkers = Storage.getAllMapMarkers();

        let html = '';
        allMarkers.forEach((marker, index) => {
            const style = iconMap[marker.type] || iconMap.scenic;
            const deleteBtn = marker.isCustom ? `<span class="map-delete-btn" onclick="event.stopPropagation();MapModule.deleteLocation(${marker.id})" title="删除"><i data-lucide="x"></i></span>` : '';
            html += `
                <div class="map-selector-item" onclick="MapModule.showModalByMarker(${index})">
                    <div class="map-selector-icon" style="background: ${style.color}">
                        <i data-lucide="${style.icon}"></i>
                    </div>
                    <div class="map-selector-name">${marker.title}</div>
                    <div class="map-selector-desc">${marker.desc}</div>
                    ${deleteBtn}
                </div>
            `;
        });

        // 添加地点按钮
        html += `
            <div class="map-selector-item map-add-btn" onclick="MapModule.showAddLocationModal()">
                <div class="map-selector-icon" style="background: var(--bg-secondary)">
                    <i data-lucide="plus"></i>
                </div>
                <div class="map-selector-name">添加地点</div>
                <div class="map-selector-desc">自定义地点</div>
            </div>
        `;

        container.innerHTML = html;
        lucide.createIcons();
    },

    // 通过合并后的索引显示弹窗
    showModalByMarker(index) {
        const allMarkers = Storage.getAllMapMarkers();
        const marker = allMarkers[index];
        if (!marker) return;

        this._currentMarker = marker;
        document.getElementById('mapModalTitle').textContent = marker.title;
        document.getElementById('mapModal').classList.add('active');

        if (!this.modalInitialized) {
            this.modalMap = L.map('mapModalMap', { zoomControl: true }).setView([marker.lat, marker.lng], 14);
            L.tileLayer('https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
                attribution: '&copy; 高德地图', maxZoom: 18, subdomains: '1234'
            }).addTo(this.modalMap);
            this.modalInitialized = true;
        } else {
            this.modalMap.setView([marker.lat, marker.lng], 14);
        }

        this.modalMap.eachLayer(layer => {
            if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
                this.modalMap.removeLayer(layer);
            }
        });

        const style = { hotel: '#f59e0b', scenic: '#2563eb', food: '#10b981', other: '#64748b' }[marker.type] || '#2563eb';
        const modalMarker = L.circleMarker([marker.lat, marker.lng], {
            radius: 12, fillColor: style, color: '#fff', weight: 3, fillOpacity: 1
        }).addTo(this.modalMap);
        modalMarker.bindPopup(`<b>${marker.title}</b><br>${marker.desc}`).openPopup();
        setTimeout(() => this.modalMap.invalidateSize(), 300);
    },

    // 删除自定义地点
    deleteLocation(id) {
        if (confirm('确定删除这个地点吗？')) {
            Storage.deleteCustomLocation(id);
            this.renderSelector();
            Utils.showToast('已删除', 'success');
        }
    },

    // 显示添加地点弹窗
    showAddLocationModal() {
        const modal = document.getElementById('addLocationModal');
        if (!modal) {
            const div = document.createElement('div');
            div.className = 'modal-overlay';
            div.id = 'addLocationModal';
            div.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>添加地点</h3>
                        <button class="modal-close" onclick="MapModule.closeAddLocationModal()"><i data-lucide="x"></i></button>
                    </div>
                    <div class="modal-body">
                        <div class="form-section">
                            <label class="form-label">地点名称</label>
                            <input type="text" id="newLocationName" placeholder="输入地点名称">
                        </div>
                        <div class="form-section">
                            <label class="form-label">描述</label>
                            <input type="text" id="newLocationDesc" placeholder="输入描述">
                        </div>
                        <div class="form-section">
                            <label class="form-label">类型</label>
                            <select id="newLocationType" style="width:100%;padding:12px;border-radius:var(--radius-md);border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-primary);font-size:15px;">
                                <option value="scenic">景点</option>
                                <option value="hotel">住宿</option>
                                <option value="food">美食</option>
                                <option value="other">其他</option>
                            </select>
                        </div>
                        <div class="form-section">
                            <label class="form-label">纬度</label>
                            <input type="number" id="newLocationLat" placeholder="23.1291" step="0.0001">
                        </div>
                        <div class="form-section">
                            <label class="form-label">经度</label>
                            <input type="number" id="newLocationLng" placeholder="113.2644" step="0.0001">
                        </div>
                        <p style="font-size:12px;color:var(--text-tertiary);margin-top:8px;">
                            <i data-lucide="info" style="width:14px;height:14px;vertical-align:middle;"></i>
                            可在高德地图上长按获取经纬度
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-btn secondary" onclick="MapModule.closeAddLocationModal()">取消</button>
                        <button class="modal-btn primary" onclick="MapModule.saveNewLocation()">添加</button>
                    </div>
                </div>
            `;
            document.body.appendChild(div);
        }
        document.getElementById('addLocationModal').classList.add('active');
        lucide.createIcons();
    },

    closeAddLocationModal() {
        document.getElementById('addLocationModal').classList.remove('active');
    },

    saveNewLocation() {
        const name = document.getElementById('newLocationName').value.trim();
        const desc = document.getElementById('newLocationDesc').value.trim();
        const type = document.getElementById('newLocationType').value;
        const lat = parseFloat(document.getElementById('newLocationLat').value);
        const lng = parseFloat(document.getElementById('newLocationLng').value);

        if (!name || isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            Utils.showToast('请填写有效的名称和经纬度（纬度 -90~90，经度 -180~180）', 'error');
            return;
        }

        Storage.addCustomLocation({ title: name, desc: desc || name, type, lat, lng });
        this.closeAddLocationModal();
        this.renderSelector();
        Utils.showToast('已添加地点', 'success');

        // 清空表单
        document.getElementById('newLocationName').value = '';
        document.getElementById('newLocationDesc').value = '';
        document.getElementById('newLocationLat').value = '';
        document.getElementById('newLocationLng').value = '';
    },

    // 显示地图弹窗
    showModal(index) {
        const marker = tripData.mapMarkers[index];
        if (!marker) return;

        this._currentMarker = marker;
        document.getElementById('mapModalTitle').textContent = marker.title;
        document.getElementById('mapModal').classList.add('active');

        // 初始化弹窗地图
        if (!this.modalInitialized) {
            this.modalMap = L.map('mapModalMap', {
                zoomControl: true
            }).setView([marker.lat, marker.lng], 14);

            L.tileLayer('https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
                attribution: '&copy; 高德地图',
                maxZoom: 18,
                subdomains: '1234'
            }).addTo(this.modalMap);

            this.modalInitialized = true;
        } else {
            this.modalMap.setView([marker.lat, marker.lng], 14);
        }

        // 清除旧标记
        this.modalMap.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                this.modalMap.removeLayer(layer);
            }
        });

        // 添加新标记
        const style = { hotel: '#f59e0b', scenic: '#2563eb', food: '#10b981' }[marker.type] || '#2563eb';
        const modalMarker = L.circleMarker([marker.lat, marker.lng], {
            radius: 12,
            fillColor: style,
            color: '#fff',
            weight: 3,
            fillOpacity: 1
        }).addTo(this.modalMap);

        modalMarker.bindPopup(`<b>${marker.title}</b><br>${marker.desc}`).openPopup();

        setTimeout(() => this.modalMap.invalidateSize(), 300);
    },

    // 关闭地图弹窗
    closeModal() {
        document.getElementById('mapModal').classList.remove('active');
    },

    // 当前显示的地点（用于导航）
    _currentMarker: null,

    // 导航到高德地图
    navigateToAmap() {
        if (this._currentMarker) {
            const url = `https://www.amap.com/search?query=${encodeURIComponent(this._currentMarker.title)}&city=广州`;
            window.open(url, '_blank');
        }
    },

    // 创建自定义标记图标
    createIcon(type) {
        const config = {
            hotel: { color: '#f59e0b', size: 32 },
            scenic: { color: '#2563eb', size: 28 },
            food: { color: '#10b981', size: 26 }
        };

        const { color, size } = config[type] || config.scenic;

        return L.divIcon({
            className: 'custom-map-marker',
            html: `
                <div class="marker-wrapper" style="position: relative;">
                    <div class="marker-pulse" style="
                        position: absolute;
                        width: ${size}px;
                        height: ${size}px;
                        border-radius: 50%;
                        background: ${color};
                        opacity: 0.3;
                        animation: markerPulse 2s ease-in-out infinite;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                    "></div>
                    <div class="marker-dot" style="
                        width: ${size * 0.6}px;
                        height: ${size * 0.6}px;
                        background: ${color};
                        border-radius: 50%;
                        border: 3px solid white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        position: relative;
                        z-index: 2;
                    "></div>
                </div>
            `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            popupAnchor: [0, -size / 2]
        });
    },

    // 添加标记点（带点击导航）
    addMarkers() {
        tripData.mapMarkers.forEach(marker => {
            const m = L.marker([marker.lat, marker.lng], {
                icon: this.createIcon(marker.type)
            }).addTo(this.map);

            // 点击标记跳转到高德地图导航
            m.on('click', () => {
                const navUrl = `https://www.amap.com/search?query=${encodeURIComponent(marker.title)}&city=广州`;
                window.open(navUrl, '_blank');
            });

            m.bindPopup(`
                <div class="map-popup-content">
                    <div class="popup-type">${this.getTypeLabel(marker.type)}</div>
                    <h3>${marker.title}</h3>
                    <p>${marker.desc}</p>
                    <a href="https://www.amap.com/search?query=${encodeURIComponent(marker.title)}&city=广州" 
                       target="_blank" 
                       class="popup-nav-btn">
                        📍 高德地图导航
                    </a>
                </div>
            `);

            this.markers.push(m);
        });
    },

    getTypeLabel(type) {
        const labels = { hotel: '住宿', scenic: '景点', food: '美食' };
        return labels[type] || '地点';
    },

    addRoutes() {
        const mainRoute = [
            [23.1289, 113.2870],
            [23.1189, 113.2530],
            [23.1250, 113.2480],
            [23.1300, 113.2700],
            [23.0850, 113.2650],
            [23.1291, 113.2644],
            [23.0800, 113.3200],
        ];

        const route = L.polyline(mainRoute, {
            color: '#2563eb',
            weight: 4,
            opacity: 0.7,
            smoothFactor: 1,
            lineCap: 'round',
            lineJoin: 'round'
        }).addTo(this.map);

        this.addFlowAnimation(route);
        this.routes.push(route);

        const qingyuanRoute = [
            [23.0850, 113.2650],
            [23.0400, 113.2700],
            [23.6800, 113.0600],
        ];

        const qyRoute = L.polyline(qingyuanRoute, {
            color: '#f59e0b',
            weight: 3,
            opacity: 0.6,
            dashArray: '8, 8',
            smoothFactor: 1
        }).addTo(this.map);
        this.routes.push(qyRoute);

        const zengchengRoute = [
            [23.0850, 113.2650],
            [23.2900, 113.8300],
        ];

        const zcRoute = L.polyline(zengchengRoute, {
            color: '#10b981',
            weight: 3,
            opacity: 0.6,
            dashArray: '8, 8',
            smoothFactor: 1
        }).addTo(this.map);
        this.routes.push(zcRoute);
    },

    addLegend() {
        const legend = L.control({ position: 'bottomleft' });

        legend.onAdd = () => {
            const div = L.DomUtil.create('div', 'map-legend');
            div.innerHTML = `
                <div class="legend-title">广州行程地图</div>
                <div class="legend-items">
                    <div class="legend-row">
                        <span class="legend-color" style="background: #f59e0b;"></span>
                        <span>住宿</span>
                    </div>
                    <div class="legend-row">
                        <span class="legend-color" style="background: #2563eb;"></span>
                        <span>景点</span>
                    </div>
                    <div class="legend-row">
                        <span class="legend-color" style="background: #10b981;"></span>
                        <span>美食</span>
                    </div>
                    <div class="legend-divider"></div>
                    <div class="legend-row">
                        <span class="legend-line" style="background: #2563eb;"></span>
                        <span>城市路线</span>
                    </div>
                    <div class="legend-row">
                        <span class="legend-line-dash" style="background: #f59e0b;"></span>
                        <span>清远路线</span>
                    </div>
                    <div class="legend-row">
                        <span class="legend-line-dash" style="background: #10b981;"></span>
                        <span>增城路线</span>
                    </div>
                </div>
            `;
            return div;
        };

        legend.addTo(this.map);
    },

    addFlowAnimation(route) {
        let offset = 0;
        setInterval(() => {
            offset = (offset + 1) % 20;
            route.setStyle({
                dashArray: '12, 8',
                dashOffset: offset
            });
        }, 100);
    },

    highlightDayRoute(day) {
        this.markers.forEach(m => m.setOpacity(0.5));

        const dayPlan = tripData.dailyPlans.find(p => p.day === day);
        if (dayPlan) {
            this.markers.forEach(m => {
                const popup = m.getPopup();
                if (popup && popup.getContent().includes(dayPlan.title.substring(0, 4))) {
                    m.setOpacity(1);
                    m.openPopup();
                }
            });
        }
    },

    resetHighlight() {
        this.markers.forEach(m => m.setOpacity(1));
    },

    // 行程页面地图
    tripMap: null,
    tripRouteLayer: null,
    tripMarkers: [],

    // 初始化行程页面地图
    initTripMap() {
        if (this.tripMap) {
            setTimeout(() => this.tripMap.invalidateSize(), 100);
            return;
        }

        const container = document.getElementById('tripMapCanvas');
        if (!container) return;

        // 确保容器有高度
        container.style.height = '300px';

        this.tripMap = L.map('tripMapCanvas', {
            zoomControl: true,
            attributionControl: false
        }).setView([23.1291, 113.2644], 11);

        L.tileLayer('https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
            attribution: '&copy; 高德地图',
            maxZoom: 18,
            subdomains: '1234'
        }).addTo(this.tripMap);

        // 多次 invalidateSize 确保地图正确渲染
        setTimeout(() => this.tripMap.invalidateSize(), 100);
        setTimeout(() => this.tripMap.invalidateSize(), 500);
        setTimeout(() => this.tripMap.invalidateSize(), 1000);
    },

    // 显示某天的路线
    showDayRoute(day) {
        this.initTripMap();

        const route = tripData.dailyRoutes[day];
        if (!route || route.length === 0) return;

        // 隐藏提示
        const hint = document.getElementById('tripMapHint');
        if (hint) hint.style.display = 'none';

        // 清除旧路线
        if (this.tripRouteLayer) {
            this.tripMap.removeLayer(this.tripRouteLayer);
        }
        this.tripMarkers.forEach(m => this.tripMap.removeLayer(m));
        this.tripMarkers = [];

        // 颜色根据强度
        const plan = tripData.dailyPlans.find(p => p.day === day);
        const colorMap = { light: '#10b981', medium: '#3b82f6', high: '#ef4444' };
        const color = colorMap[plan?.intensity] || '#3b82f6';

        // 绘制路线
        if (route.length > 1) {
            this.tripRouteLayer = L.polyline(route, {
                color: color,
                weight: 4,
                opacity: 0.8,
                smoothFactor: 1,
                dashArray: '10, 8'
            }).addTo(this.tripMap);

            // 流动动画
            let offset = 0;
            if (this._routeAnimInterval) clearInterval(this._routeAnimInterval);
            this._routeAnimInterval = setInterval(() => {
                offset = (offset + 1) % 18;
                if (this.tripRouteLayer) {
                    this.tripRouteLayer.setStyle({ dashOffset: -offset });
                }
            }, 80);
        }

        // 添加标记点
        const dayPlan = tripData.dailyPlans.find(p => p.day === day);
        route.forEach((coord, i) => {
            const marker = L.circleMarker(coord, {
                radius: 8,
                fillColor: color,
                color: '#fff',
                weight: 2,
                fillOpacity: 1
            }).addTo(this.tripMap);

            // 找到对应的地点名称
            let title = dayPlan?.route[i] || `地点${i + 1}`;
            marker.bindPopup(`<b>${title}</b>`);
            this.tripMarkers.push(marker);
        });

        // 调整视野
        if (route.length > 1) {
            this.tripMap.fitBounds(this.tripRouteLayer.getBounds(), { padding: [30, 30] });
        } else {
            this.tripMap.setView(route[0], 13);
        }
    }
};

// 添加地图样式
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addMapStyles);
} else {
    addMapStyles();
}

function addMapStyles() {
    if (document.querySelector('#map-styles')) return;
    
    const mapStyle = document.createElement('style');
    mapStyle.id = 'map-styles';
    mapStyle.textContent = `
        @keyframes markerPulse {
            0%, 100% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0.3;
            }
            50% {
                transform: translate(-50%, -50%) scale(1.5);
                opacity: 0;
            }
        }

        .custom-map-marker {
            background: none !important;
            border: none !important;
        }

        .map-legend {
            background: white;
            padding: 12px 16px;
            border-radius: 12px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.15);
            font-family: var(--font-family, 'Noto Sans SC', sans-serif);
            min-width: 120px;
        }

        .legend-title {
            font-size: 13px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
        }

        .legend-items {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .legend-row {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: #475569;
        }

        .legend-color {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .legend-line {
            width: 20px;
            height: 3px;
            border-radius: 2px;
        }

        .legend-line-dash {
            width: 20px;
            height: 3px;
            border-radius: 2px;
            background: repeating-linear-gradient(
                90deg,
                currentColor 0px,
                currentColor 4px,
                transparent 4px,
                transparent 8px
            );
        }

        .legend-divider {
            height: 1px;
            background: #e2e8f0;
            margin: 4px 0;
        }

        .map-popup-content {
            text-align: center;
            padding: 4px;
            min-width: 140px;
        }

        .map-popup-content .popup-type {
            font-size: 11px;
            padding: 2px 8px;
            background: #2563eb;
            color: white;
            border-radius: 10px;
            display: inline-block;
            margin-bottom: 6px;
        }

        .map-popup-content h3 {
            font-size: 14px;
            margin: 4px 0;
            color: #1e293b;
        }

        .map-popup-content p {
            font-size: 12px;
            color: #64748b;
            margin: 0 0 8px 0;
        }

        .popup-nav-btn {
            display: inline-block;
            padding: 6px 12px;
            background: #2563eb;
            color: white;
            border-radius: 8px;
            font-size: 12px;
            text-decoration: none;
            transition: background 0.2s;
        }

        .popup-nav-btn:hover {
            background: #1d4ed8;
        }

        .leaflet-popup-content-wrapper {
            border-radius: 12px !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
        }

        .leaflet-control-zoom a {
            border-radius: 8px !important;
            border: none !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
        }
    `;
    document.head.appendChild(mapStyle);
}