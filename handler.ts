import * as Ask from 'ask-sdk';
import 'source-map-support/register';

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
      console.log(JSON.stringify(intent, null, 2));
      const dayName = '日月火水木金土'[new Date(intent.slots.targetDate.value).getDay()];
      const speaachText = `指定した日は${dayName}曜日です`;
      return handlerInput.responseBuilder.speak(speaachText).getResponse();
    },
  })
  .lambda();
