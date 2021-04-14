const puppeteer = require('puppeteer');

const PUPPETEER_OPTIONS = {
  args: [
    '--disable-gpu',
    '-–disable-dev-shm-usage',
    '--disable-setuid-sandbox',
    '--no-first-run',
    '--no-sandbox',
    '--no-zygote',
    '--single-process',
  ],
  headless: true,
};

const fetchRaces = async (page) => {
  try {
    const url = 'https://race.netkeiba.com/top/race_list.html';
    await page.goto(url);
    const races = [];
    const items = await page.$$(
      '#RaceTopRace .RaceList_Box .RaceList_DataList'
    );
    console.log(items);

    for await (const item of items) {
      const raceDatas = await item.$$('.RaceList_Data .RaceList_DataItem');
      const placeName = await item.$eval('.RaceList_DataTitle', (e) => e.textContent);
      for await (const raceData of raceDatas) {
        const race = {};
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

const fetchRaceDetails = async (targetRace, page) => {
  try {
    await page.goto(targetRace.url);
    const raceDetails = [];
    const items = await page.$$(
      '.Shutuba_Table > tbody .HorseList'
    );
    console.log(items);

    for await (const item of items) {
      const horseName = await item.$eval('.HorseInfo .HorseName', (e) => e.textContent);
      console.log(horseName);
    }

    return raceDetails;
  } catch (err) {
    console.error(err);
  }
}

(async () => {
  const browser = await puppeteer.launch(PUPPETEER_OPTIONS);
  const page = await browser.newPage();

  const races = await fetchRaces(page);
  // console.log(races);
  const targetRace= races.find(race => race.racecourse === '中山' && race.raceNum === '10R');
  console.log(targetRace);
  const raceDetails = await fetchRaceDetails(targetRace, page)

  await browser.close();
})();
