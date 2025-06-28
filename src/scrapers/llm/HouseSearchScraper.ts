import { ScrapingError } from '@/errors/ScrapingError.js';
import { StagehandScraperOptions } from '@/types/Scraper.js';
import { z } from 'zod';

const HouseSearchScraper = async (
  options: StagehandScraperOptions,
) => {
  try {
    await options.page.goto(options.url);
    //const [action] = await options.page.observe(
    //  'If a dialog box or a pop up related to cookies prevents you '
    //  + 'from seeing the actual page content, just accept cookies policy terms.'
    //  + 'If there is no cookie pop-up dialog box, just ignore this step.');
    //await options.page.act(action);

    await options.page.observe('Look for a research form.');

    await options.page.act('Fill in the location search form with the'
      + 'following value : Lyon');

    await options.page.observe(
      'Verify if a dropdown menu detailling a list of cities'
      + 'is displayed');

    await options.page.observe(
      'In the dropdown menu, look for the most relevant match'
    );

    await options.page.act('Click on the most relevant match in the dropdown menu');


    await options.page.act('Launch the search');

    const data = await options.page.extract({
      instruction: 'Gather all the URLs for each house post',
      schema: z.object({ url: z.string() })
    });

    console.log('EXTRACTED DATA', data);
  } catch (err) {
    throw new ScrapingError('Timeout Error', undefined, err);
  }
};

export { HouseSearchScraper };
