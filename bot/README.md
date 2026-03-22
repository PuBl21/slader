# Slider Bot

## Переменные окружения

| Переменная | Описание |
|-----------|----------|
| `BOT_TOKEN` | Токен бота от @BotFather |
| `MINI_APP_URL` | URL слайдера (https://publ21.github.io/slader/) |

## Деплой на Railway

1. Зайди на https://railway.app → Sign up (через GitHub)
2. New Project → Deploy from GitHub repo → выбери репозиторий
3. В настройках проекта → Variables → добавь:
   - `BOT_TOKEN` = твой токен
   - `MINI_APP_URL` = https://publ21.github.io/slader/
4. Railway сам установит зависимости и запустит бота
