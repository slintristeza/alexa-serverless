import * as Ask from 'ask-sdk';
import { IntentRequest } from 'ask-sdk-model';
import { number2kanji } from '@geolonia/japanese-numeral'
import 'source-map-support/register';

import { getAddress } from './addressUtil';
import addressGroup from './csvUtils/addressGroup.json';
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
    handle: async (handlerInput) => {
      console.log(handlerInput);
      const {
        requestEnvelope,
        serviceClientFactory,
        responseBuilder,
      } = handlerInput;

      console.log(requestEnvelope.context.System);
      try {
        const address = await getAddress(requestEnvelope, serviceClientFactory);
        const targetStreet = address.住所.町名 + number2kanji(address.住所.丁目);
        console.log(targetStreet);
        const request = requestEnvelope.request;
        const intent = (request as IntentRequest).intent;
        const targetDate = intent.slots.targetDate.value;
        if (!targetDate) {
          const speaachText =
            '日付が正しく指定されていません。もう一度やり直してください。';
          return handlerInput.responseBuilder.speak(speaachText).getResponse();
        }
        console.log(JSON.stringify(intent, null, 2));
        const garbageType = garbageCollectionSchedule.filter(
          (item) => item['年月日'] === targetDate
        );
        const speaachText = garbageType[0]['5']
          ? `${targetDate}に収集されるゴミは${garbageType[0]['5']}です`
          : `${targetDate}のゴミの収集はありません`;
        return responseBuilder.speak(speaachText).getResponse();
      } catch (error) {
        if (error.name === 'ServiceError' && error.statusCode === 403) {
          return handlerInput.responseBuilder
            .speak(
              '住所の利用が許可されていません。アレクサアプリの設定で許可してください。'
            )
            .withAskForPermissionsConsentCard([
              'read::alexa:device:all:address',
            ])
            .getResponse();
        } else {
          return handlerInput.responseBuilder
            .speak('住所の取得に失敗しました。')
            .getResponse();
        }
      }
    },
  })
  .withApiClient(new Ask.DefaultApiClient())
  .lambda();
