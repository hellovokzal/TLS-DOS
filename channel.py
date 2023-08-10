import telebot
bot = telebot.TeleBot("6344256672:AAGy5JpT0dTlom0562o3MgO1G-cm54MtAtQ")
@bot.message_handler(commands=['channel'])
def channel(message):
	bot.send_message(message.chat.id, "Наш канал: @NodeStresserChannel")
bot.polling(none_stop=True)
