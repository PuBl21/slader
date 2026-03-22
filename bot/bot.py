import os
import json
import logging
from urllib.parse import urlencode

from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import (
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    WebAppInfo,
    MenuButtonWebApp,
)

logging.basicConfig(level=logging.INFO)

BOT_TOKEN   = os.environ["BOT_TOKEN"]
MINI_APP_URL = os.environ.get("MINI_APP_URL", "https://publ21.github.io/slader/")

bot = Bot(token=BOT_TOKEN)
dp  = Dispatcher()


@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    await message.answer(
        "Привет! Открой слайдер через кнопку меню внизу.\n"
        "Загрузи два фото и нажми «Поделиться» — я пришлю ссылку."
    )


@dp.message(F.web_app_data)
async def handle_web_app_data(message: types.Message):
    """
    Получаем данные от Mini App после нажатия кнопки «Поделиться».
    Payload: {"b": "url_before", "a": "url_after"}
    """
    try:
        data = json.loads(message.web_app_data.data)
        url_b = data["b"]
        url_a = data["a"]
    except (json.JSONDecodeError, KeyError):
        await message.answer("Ошибка: неверный формат данных.")
        return

    # Формируем ссылку на Mini App с параметрами
    params = urlencode({"b": url_b, "a": url_a})
    slider_url = f"{MINI_APP_URL}?{params}"

    # Кнопка «Запустить слайдер» открывает Mini App с фото
    keyboard = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(
            text="▶ Запустить слайдер",
            web_app=WebAppInfo(url=slider_url),
        )
    ]])

    await message.answer(
        "✅ Слайдер готов! Нажми кнопку ниже чтобы открыть его.\n"
        "Можешь переслать это сообщение кому угодно.",
        reply_markup=keyboard,
    )


async def main():
    # Устанавливаем кнопку меню (Menu Button) — открывает Mini App
    await bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(
            text="Открыть слайдер",
            web_app=WebAppInfo(url=MINI_APP_URL),
        )
    )
    await dp.start_polling(bot)


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
