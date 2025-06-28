import { Stagehand } from '@browserbasehq/stagehand';
import type { ScrapedHouse } from '@/types/House.js';
import type { ScrapingFunction } from '@/types/Scraper.js';
import StagehandConfig from '@/stagehand.config.js';

/**
 * Launch a scraping session using an LLM extraction method.
 *
 * @param {ScrapingFunction} scraper - The scraping function
 * used for the scraping job.
 * @param {string} url - The URL leading to the page to scrape.
 * @returns {Promise<<House, 'id'>>} A promise containing the house metadata
 * scraped.
 */
const LlmScrape = async (
  scraper: ScrapingFunction,
  url: string,
  prompt: string,
): Promise<ScrapedHouse & { url: string }> => {
  const stagehand = new Stagehand({
    ...StagehandConfig,
  });
  await stagehand.init();

  const page = stagehand.page;
  const context = stagehand.context;
  const result = await scraper({ page, context, stagehand, url, prompt });
  await stagehand.close();
  return { ...result, url: url };
};

export { LlmScrape };
