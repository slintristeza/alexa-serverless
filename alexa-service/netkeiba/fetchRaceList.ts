import chromium from 'chrome-aws-lambda';
const puppeteer = chromium.puppeteer;

type Race = {
  raceNum: string | null;
  title: string | null;
  datetime: string | null;
  range: string | null;
  numberOfHorse: number | null;
};

const blankRace: Race = {
  raceNum: null,
  title: null,
  datetime: null,
  range: null,
  numberOfHorse: null,
};

const fetchRaces = async (page) => {
  try {
    console.log('Fetching races');
    const url = 'https://race.netkeiba.com/top/race_list.html';
    await page.goto(url);
    console.log('page goto completed')

    const races: Race[] = [];
    const items = await page.$$(
      '#RaceTopRace .RaceList_Box .RaceList_DataList .RaceList_Data .RaceList_DataItem'
    );
    console.log(items);

    for await (const item of items) {
      // console.log(item);
      const race: Race = { ...blankRace };

      race.raceNum = await item.$eval('.Race_Num > span', (e) => e.textContent);

      race.title = await item.$eval(
        '.RaceList_ItemContent .RaceList_ItemTitle .ItemTitle',
        (e) => e.textContent
      );

      race.datetime = await item.$eval(
        '.RaceList_ItemContent .RaceData .RaceList_Itemtime',
        (e) => e.textContent
      );

      races.push(race);
    }

    return races;
  } catch (err) {
    console.error(err);
  }
};

export const fetchRaceList = async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();

    const races = await fetchRaces(page);

    await browser.close();
    return races;
  } catch (err) {
    console.error(err);
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};
