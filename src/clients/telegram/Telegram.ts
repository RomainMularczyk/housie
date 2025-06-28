import dotenv from 'dotenv';
import { Context } from 'grammy';
import { Bot } from 'grammy';
import type { Message } from 'grammy/types';
import { LlmScrape } from '@/scrapers/llm/index.js';
import { HousePostScraper } from '@/scrapers/llm/HousePostScraper.js';
import { Text } from '@/utils/text/Text.js';
import { HouseApiHandler } from '@/utils/api/HouseApiHandler.js';
import { PromptApiHandler } from '@/utils/api/PromptApiHandler.js';
import { ConfigError } from '@/errors/ConfigError.js';
dotenv.config();

type TelegramClientMessageStatus = 'SUCCESS' | 'URL_ERROR' | 'PROMPT_ERROR' | undefined;

class TelegramClient {
  bot: Bot;
  private static readonly LOADING_MESSAGE: string = 'Processing...';
  private static readonly TELEGRAM_BOT_TOKEN?: string = process.env.TELEGRAM_BOT_TOKEN;

  constructor() {
    if (!TelegramClient.TELEGRAM_BOT_TOKEN) {
      throw new ConfigError(
        'Missing Configuration Error',
        'An environnement variable providing Telegram bot token should be provided.'
      );
    }
    this.bot = new Bot(TelegramClient.TELEGRAM_BOT_TOKEN);
  }

  /**
   * Initialize the Telegram client.
   *
   * @returns {TelegramClient} The Telegram client instance.
   */
  public static init(): TelegramClient {
    const client = new TelegramClient();
    client.registerCommands();
    return client;
  }

  /**
   * Register all defined commands on the Telegram bot.
   */
  registerCommands = (): void => {
    this.bot.command('house', this.houseCommand);

    this.bot.catch((err) => {
      const ctx = err.ctx;
      return ctx.reply(
        'Something went wrong with HousieBot. 🤖'
        + `\n${err.message}`,
      );
    });
  };

  /**
  * Send a text reply in the chat from which the command was emitted.
  *
  * @param {Context} ctx - The context of the Telegram client chat.
  * @param {Message} loadingMessage - The loading message.
  * @param {TelegramClientMessageStatus} status - The status of the
  * operation defining which type of message to send back.
  * @param {House | undefined} result - The metadata of the house scraped.
  */
  sendReply = async (
    ctx: Context,
    loadingMessage: Message,
    status?: TelegramClientMessageStatus,
    result?: string,
  ): Promise<Message.TextMessage> => {
    if (ctx.chat) {
      switch (status) {
      case 'SUCCESS':
        await ctx.api.deleteMessage(ctx.chat.id, loadingMessage.message_id);
        return ctx.reply(JSON.stringify(result));
      case 'URL_ERROR':
        await ctx.api.deleteMessage(ctx.chat.id, loadingMessage.message_id);
        throw new Error('Please provide a valid URL.');
      case 'PROMPT_ERROR':
        await ctx.api.deleteMessage(ctx.chat.id, loadingMessage.message_id);
        throw new Error(
          'Please set an active prompt to allow the scraper to follow instructions.',
        );
      default:
        await ctx.api.deleteMessage(ctx.chat.id, loadingMessage.message_id);
        throw new Error('An unknwon error occurred.');
      }
    } else {
      throw new Error('This command only works from an existing chat.');
    }
  };

  /**
   * The trigger connected to the '/house' command.
   * Scrape a house offer and save it in the database.
   *
   * @param {Context} ctx - The context of the Telegram client chat.
   * @returns {Promise<Message.TextMessage>} A reply message detailing
   * if the operation succeeded or not.
   */
  houseCommand = async (ctx: Context): Promise<Message.TextMessage> => {
    const message = ctx.message;
    const loadingMessage = await ctx.reply(TelegramClient.LOADING_MESSAGE);
    if (message?.text) {
      const url = message.text.split(' ')[1];
      if (Text.isUrl(url)) {
        try {
          const activePrompt = await PromptApiHandler.get.activePrompt();
          const result = await LlmScrape(
            HousePostScraper, url, activePrompt.data!.prompt,
          );
          const house = await HouseApiHandler.post.house(result);
          return this.sendReply(
            ctx,
            loadingMessage,
            'SUCCESS',
            `🏠 The house was properly saved ! 🔗 ${house.data?.url}`,
          );
        } catch (_err) {
          return this.sendReply(ctx, loadingMessage, 'PROMPT_ERROR');
        }
      } else {
        return this.sendReply(ctx, loadingMessage, 'URL_ERROR');
      }
    } else {
      return this.sendReply(ctx, loadingMessage);
    }
  };
}

export { TelegramClient };
