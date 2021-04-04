import * as Ask from 'ask-sdk';
import 'source-map-support/register';

import { fetchRaceList } from './netkeiba/fetchRaceList';

const LaunchRequest = {
  canHandle: (handlerInput) => {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle: async (handlerInput) => {
    try {
      console.log(handlerInput);
      const races = await fetchRaceList();
      let speaachText = '';
      races.forEach((race) => {
        console.log(race.title);
        speaachText += race.raceNum.replace('R', 'レース') + '、' + race.title + '、';
      });
      // const speaachText = races[0].title;
      return handlerInput.responseBuilder.speak(speaachText).getResponse();
    } catch (err) {
      console.error(err);
      const speaachText = 'よねはら、しね';
      return handlerInput.responseBuilder.speak(speaachText).getResponse();
    }
  },
};

export const handler = Ask.SkillBuilders.custom()
  .addRequestHandlers(LaunchRequest)
  .lambda();
