import * as Ask from 'ask-sdk';
import 'source-map-support/register';

import garbageCollectionSchedule from './csvUtils/garbageCollectionSchedule.json';

export const alexa = Ask.SkillBuilders.custom()
  .addRequestHandlers({
    canHandle: (handlerInput) => {
      return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle: (handlerInput) => {
      console.log(handlerInput);
      const speaachText = `こんにちは`;
      return handlerInput.responseBuilder.speak(speaachText).getResponse();
    },
  })
  .addRequestHandlers({
    canHandle: (handlerInput) => {
      return (
        handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
        handlerInput.requestEnvelope.request.intent.name === 'garbageDateIntent'
      );
    },
    handle: (handlerInput: any) => {
      console.log(handlerInput);
      const intent = handlerInput.requestEnvelope.request.intent;
      const targetDate = intent.slots.targetDate.value;
      if (!targetDate) {
        const speaachText = '日付が正しく指定されていません。もう一度やり直してください。'
        return handlerInput.responseBuilder.speak(speaachText).getResponse();
      }
      console.log(JSON.stringify(intent, null, 2));
      const garbageType = garbageCollectionSchedule.filter(item => item['年月日'] === targetDate);
      const speaachText = garbageType[0]['5'] ? `${targetDate}に収集されるゴミは${garbageType[0]['5']}です` : `${targetDate}のゴミの収集はありません` ;
      return handlerInput.responseBuilder.speak(speaachText).getResponse();
    },
  })
  .lambda();
