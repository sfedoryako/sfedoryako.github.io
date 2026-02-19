# АгроКонтур — корпоративная платформа внедрения точного земледелия

## Локальный запуск
1. Откройте проект в VS Code.
2. Запустите **Live Server** (или `python3 -m http.server 4173`).
3. Перейдите на локальный URL и проверьте страницы.

## Настройка Formspree
Во всех формах оставлен комментарий:

`<!-- Вставьте ваш Formspree endpoint -->`

### Что сделать
1. Зарегистрироваться на Formspree.
2. Создать форму и получить endpoint вида `https://formspree.io/f/XXXXXXXX`.
3. Подставить endpoint в `action` на страницах:
   - `calc/index.html`
   - `contact/index.html`
   - `product/index.html`
   - `index.html` (квиз)
4. Проверить отправку с локального сервера.

## Фоновый паттерн
Файл паттерна: `assets/img/agro-pattern.svg`.

Чтобы заменить фон:
1. Положите новый SVG/PNG в `assets/img/`.
2. Обновите путь в `css/main.css` в `body::before`.
