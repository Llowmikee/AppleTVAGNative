# AppleTV AGNative One-Click Bundle

Один файл для подключения сцены **AppleTV AGNative** на сервере с Lampa-подобной plugin-инфраструктурой.

## Для кого этот пакет

Для людей, у которых уже есть:
- сервер с Lampa-подобным сервисом
- понимание, как подключать plugin JS
- базовая plugin/theme инфраструктура

## Что внутри
- `appletv_agnative_bundle.js`
- `INSTALL.md`

## Что делает файл

`appletv_agnative_bundle.js` объединяет в себе:
- минимальный theme patch для сцены `appletv_agnative`
- minimal Netflix mechanics hook для AGNative
- полный AGNative visual layer
- отдельную кнопку в настройках темы для включения сцены

То есть подключается **один JS-файл**, а включить сцену можно через отдельный пункт в настройках.

## Что не входит в задачи этого пакета

Пакет не пытается:
- заменить весь ваш runtime
- переопределить весь `theme.js`
- заменить весь `netflix_ui.js`
- работать на сервере без plugin entrypoint

Это именно one-click bundle для людей, у которых уже есть нормальная база для подключения плагинов.
