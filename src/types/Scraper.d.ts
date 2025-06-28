import { BrowserContext, Page, Stagehand } from '@browserbasehq/stagehand';

type StagehandScraperOptions = {
  page: Page;
  context: BrowserContext;
  stagehand: Stagehand;
  url: string;
  prompt: string;
}

type ScrapingFunction = (scraper: StagehandScraperOptions) =>
  Promise<ScrapedHouse>;

export { StagehandScraperOptions, ScrapingFunction };
