import type { ScrapedHouse } from '@/types/House.js';
import type { StagehandScraperOptions } from '@/types/Scraper.js';
import { ParserHouseSchema } from '@/types/validators/House.js';
import { ScrapingError } from '@/errors/ScrapingError.js';

/**
 * Default scraper that connects to a page and extract a set of variables
 * describing a house.
 *
 * @param {StagehandScraperOptions} options - The scraper options.
 * @returns {Promise<ScrapedHouse>} The house metadata.
 * @throws {ScrapingError} When the scraper could not complete the
 * scraping job properly.
 */
const HousePostScraper = async (
  options: StagehandScraperOptions
): Promise<ScrapedHouse> => {
  try {
    await options.page.goto(options.url);
    const [action] = await options.page.observe(
      'If a dialog box or a pop up related to cookies prevents you ' +
        'from seeing the actual page content, just accept cookies policy terms.'
    );
    await options.page.act(action);
    const data = await options.page.extract({
      instruction: options.prompt,
      schema: ParserHouseSchema,
    });
    return data;
  } catch (err) {
    throw new ScrapingError('Timeout Error', undefined, err);
  }
};

export { HousePostScraper };
