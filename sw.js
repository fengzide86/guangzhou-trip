// Service Worker - 广州旅行计划 PWA
const CACHE_NAME = 'trip-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './data.js',
  './utils.js',
  './storage.js',
  './animations.js',
  './renderer.js',
  './map.js',
  './expense.js',
  './router.js',
  './app.js',
  './manifest.json'
];

// 安装时缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 请求时优先使用缓存，缓存没有则网络请求
self.addEventListener('fetch', (event) => {
  // 外部资源（CDN）不走缓存
  if (event.request.url.startsWith('http') && !event.request.url.includes(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});