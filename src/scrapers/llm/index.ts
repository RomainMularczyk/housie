import { BrowserContext, Page, Stagehand } from '@browserbasehq/stagehand';
import StagehandConfig from '../../../stagehand.config';
import boxen from 'boxen';
import chalk from 'chalk';
import { ParserHouseSchema } from '../../validators/House';

type StagehandScraperOptions = {
  page: Page;
  context: BrowserContext;
  stagehand: Stagehand;
  url: string;
}

type ScrapingFunction = (scraper: StagehandScraperOptions) =>
  Promise<typeof ParserHouseSchema>;

const LlmScrape = async (scraper: ScrapingFunction, url: string) => {
  const stagehand = new Stagehand({
    ...StagehandConfig,
  });
  await stagehand.init();

  if (StagehandConfig.env === 'BROWSERBASE' && stagehand.browserbaseSessionID) {
    console.log(
      boxen(
        `View this session live in your browser: \n${chalk.blue(
          `https://browserbase.com/sessions/${stagehand.browserbaseSessionID}`,
        )}`,
        {
          title: 'Browserbase',
          padding: 1,
          margin: 3,
        },
      ),
    );
  }

  const page = stagehand.page;
  const context = stagehand.context;
  const result = await scraper({ page, context, stagehand, url });
  await stagehand.close();
  return result;
};

const DefaultScraper = async ({
  page,
  context,
  stagehand,
  url,
}: StagehandScraperOptions) => {
  await page.goto(url);
  const data = await page.extract({
    instruction: 'Extract the price of the house, the square meters,' +
      ' the number of rooms, and the energy class'
      + ' (known as DPE, it\'s usually just one letter).',
    schema: ParserHouseSchema,
  });
  console.log(data);
  return data;
};

export { LlmScrape, DefaultScraper };
