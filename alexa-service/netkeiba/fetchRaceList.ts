import chromium from 'chrome-aws-lambda';
const puppeteer = chromium.puppeteer;

type Race = {
  racecourse: string | null;
  raceNum: string | null;
  url: string | null;
  title: string | null;
  datetime: string | null;
  range: string | null;
  numberOfHorse: number | null;
};

const blankRace: Race = {
  racecourse: null,
  raceNum: null,
  url: null,
  title: null,
  datetime: null,
  range: null,
  numberOfHorse: null,
};

const fetchRaces = async (page) => {
  try {
    const url = 'https://race.netkeiba.com/top/race_list.html';
    await page.goto(url, { waitUntil: 'networkidle0' });
    const races = [];
    const items = await page.$$(
      '#RaceTopRace .RaceList_Box .RaceList_DataList'
    );
    console.log(items);

    for await (const item of items) {
      const raceDatas = await item.$$('.RaceList_Data .RaceList_DataItem');
      const placeName = await item.$eval('.RaceList_DataTitle', (e) => e.textContent);
      for await (const raceData of raceDatas) {
        const race: Race = { ...blankRace };
        race.racecourse = placeName.split(' ')[1];

        const a = await raceData.$('a');
        const href = await a.getProperty('href');
        const url = await href.jsonValue();
        race.url = url;

        race.raceNum = await raceData.$eval(
          '.Race_Num > span',
          (e) => e.textContent
        );
        race.title = await raceData.$eval(
          '.RaceList_ItemContent .RaceList_ItemTitle .ItemTitle',
          (e) => e.textContent
        );
        race.datetime = await raceData.$eval(
          '.RaceList_ItemContent .RaceData .RaceList_Itemtime',
          (e) => e.textContent
        );
        races.push(race);
      }
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
