import dotenv from 'dotenv';
import { Bot } from 'grammy';
import { DefaultScraper, LlmScrape } from '../scrapers/llm/index';
import { Text } from '../utils/text/Text';
dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (TELEGRAM_BOT_TOKEN) {
  console.log('An environnement variable should be provided containing Telegram ids.');
}

const bot = new Bot(TELEGRAM_BOT_TOKEN!);

bot.command('house', async (ctx) => {
  const message = ctx.message;
  if (message?.text) {
    const url = message.text.split(' ')[1];
    if (Text.isUrl(url)) {
      const result = await LlmScrape(DefaultScraper, url);
      console.log(result);
      return ctx.reply(JSON.stringify(result));
    } else {
      return ctx.reply('Please provide a valid link.');
    }
  } else {
    return ctx.reply('Please provide a valid link.');
  }
});

bot.command('all', async (ctx) => {
  const result = await fetch('http://127.0.0.1:8787/house', {
    method: 'GET',
  });
  return ctx.reply(JSON.stringify(await result.json()));
});

export { bot };
