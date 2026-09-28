// Nome do cache e versão (Altere a versão ex: v2, v3 sempre que fizer grandes atualizações no site)
const CACHE_NAME = 'leticia-pwa-v1';

// Lista de ficheiros que devem ser guardados na memória do telemóvel para funcionar offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './index.js',
  './manifest.json',
  './img/perfil.png',
  './img/perfillets.svg'
];

// 1. Instalação do Service Worker: Guarda os ficheiros essenciais no cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Guardando ficheiros no cache...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting()) // Força o Service Worker a ativar imediatamente
  );
});

// 2. Ativação: Elimina caches antigos quando você atualiza a versão (ex: de v1 para v2)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] A apagar cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Interceção de Requisições (Fetch): Tenta carregar da rede; se estiver offline, entrega do cache
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não sejam GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Se estiver no cache, devolve imediatamente (carregamento ultra-rápido)
        return cachedResponse;
      }

      // Caso contrário, procura na rede
      return fetch(event.request).then((networkResponse) => {
        return networkResponse;
      }).catch(() => {
        // Trata falhas de rede se o ficheiro não estiver em cache
        console.log('[Service Worker] Sem rede e ficheiro não encontrado no cache:', event.request.url);
      });
    })
  );
});