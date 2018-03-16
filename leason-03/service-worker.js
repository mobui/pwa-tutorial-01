
const CACHE_NAME = 'hello-world-pwa-v1'; // Имя кэша
const CDN_BASE = 'https://openui5.hana.ondemand.com/resources/'; // CDN для OpenUI5

// Файлы проекта
var resourcesToCache = [
	'index.html',
	'manifest.json'
]

// Файлы библиотеки OpenUI5
resourcesToCache = resourcesToCache.concat([
	`${CDN_BASE}sap-ui-core.js`,
	`${CDN_BASE}sap/ui/core/library-preload.js`,
	`${CDN_BASE}sap/ui/core/themes/sap_belize_plus/library.css`,
	`${CDN_BASE}sap/ui/core/themes/base/fonts/SAP-icons.woff2`,
	`${CDN_BASE}sap/m/library-preload.js`, // сжатая в один файл sap.m библиотека
	`${CDN_BASE}sap/m/themes/sap_belize_plus/library.css`
]);

// Регистрация обработчика события install
self.addEventListener('install', function (event) {
	event.waitUntil(
		caches.open(CACHE_NAME).then(function (cache) {
			// Помещаем в кэш все необходимые ресурсы
			return cache.addAll(resourcesToCache); 
		}).catch(function(err){
            console.log(err);
        })
	);
});

// Регистрация обработчика события activate
self.addEventListener('activate', function (event) {
	event.waitUntil(
		caches.keys().then(function (keyList) {
			return Promise.all(keyList.map(function (key) {
				if (key !== CACHE_NAME) {
					// Удаляем из кэша устаревшие ресурсы
					return caches.delete(key);
				}
			}));
		})
	);
});

// Регистрация обработчика события fetch
self.addEventListener('fetch', function (event) {
	event.respondWith(
		caches.match(event.request).then(function(resp) {
			return resp || // Запрос найден в кэше, возвращаем ответ из кэша
				// Иначе выполянем сетевой запрос
				fetch(event.request).then(function(response) { 
					return caches.open(CACHE_NAME).then(function(cache) {
						// Помещаем успешный ответ в кэш
						if (response.status === 200 || response.type === 'opaque'){
							cache.put(event.request, response.clone());
						}
						return response;
				});  
			});
		})
	)}
);
