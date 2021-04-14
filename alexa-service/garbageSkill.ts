import * as Ask from 'ask-sdk';
import { IntentRequest } from 'ask-sdk-model';
import { number2kanji } from '@geolonia/japanese-numeral';
import 'source-map-support/register';
import * as Sentry from "@sentry/node";
import withSentry from "serverless-sentry-lib";

import { getAddress } from './addressUtil';
import addressGroup from './csvUtils/addressGroup.json';
import garbageCollectionSchedule from './csvUtils/garbageCollectionSchedule.json';
import largeGarbageCollectionSchedule from './csvUtils/largeGarbageCollectionSchedule.json';

const LaunchRequest = {
  canHandle: (handlerInput) => {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle: (handlerInput) => {
    console.log(handlerInput);
    const speaachText = `こんにちは`;
    return handlerInput.responseBuilder.speak(speaachText).getResponse();
  },
};

const garabedeDateIntent = {
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
      Sentry.captureMessage("Hello from Lambda!");
      const address = await getAddress(requestEnvelope, serviceClientFactory);
      const targetStreet =
        address.住所.町名 + number2kanji(address.住所.丁目) + '丁目';
      const targetGroup = addressGroup.filter(
        (address) => address.町名 === targetStreet
      );
      const request = requestEnvelope.request;
      const intent = (request as IntentRequest).intent;
      console.log(JSON.stringify(intent, null, 2));
      const targetDate = intent.slots.targetDate.value;
      if (!targetDate) {
        const speaachText =
          '日付が正しく指定されていません。もう一度やり直してください。';
        return handlerInput.responseBuilder.speak(speaachText).getResponse();
      }
      const garbageType = garbageCollectionSchedule.filter(
        (item) => item.年月日 === targetDate
      );
      const largeGarbageType = largeGarbageCollectionSchedule.filter(
        (item) => item.年月日 === targetDate
      );
      const largeGarbageCollection =
        largeGarbageType[0][targetGroup[0].グループ];
      let speaachText = garbageType[0][targetGroup[0].グループ]
        ? `${targetDate}に収集されるゴミは${
            garbageType[0][targetGroup[0].グループ]
          }です。`
        : `${targetDate}のゴミの収集はありません。`;
      if (largeGarbageCollection) {
        speaachText += 'また、大型ごみの収集があります。';
      }
      return responseBuilder.speak(speaachText).getResponse();
    } catch (error) {
      if (error.name === 'ServiceError' && error.statusCode === 403) {
        return handlerInput.responseBuilder
          .speak(
            '住所の利用が許可されていません。アレクサアプリの設定で許可してください。'
          )
          .withAskForPermissionsConsentCard(['read::alexa:device:all:address'])
          .getResponse();
      } else {
        console.error(error);
        return handlerInput.responseBuilder
          .speak('住所の取得に失敗しました。')
          .getResponse();
      }
    }
  },
};

const garabedeTypeIntent = {
  canHandle: (handlerInput) => {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'garbageTypeIntent'
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
      const targetStreet =
        address.住所.町名 + number2kanji(address.住所.丁目) + '丁目';
      const targetGroup = addressGroup.filter(
        (address) => address.町名 === targetStreet
      );
      const request = requestEnvelope.request;
      const intent = (request as IntentRequest).intent;
      console.log(JSON.stringify(intent, null, 2));
      const targetTypeName = intent.slots.targetGarbageType.value;
      const targetType = intent.slots.targetGarbageType.resolutions.resolutionsPerAuthority[0].values[0].value.name;
      console.log(targetType);
      if (!targetType) {
        const speaachText =
          'ゴミの種別が正しく指定されていません。もう一度やり直してください。';
        return handlerInput.responseBuilder.speak(speaachText).getResponse();
      }
      const garbageTypeList = garbageCollectionSchedule.filter(
        (item) => item[targetGroup[0].グループ] === targetType
      );
      // const largeGarbageTypeList = largeGarbageCollectionSchedule.filter(
      //   (item) => item[targetGroup[0].グループ] === targetType
      // );
      console.log(garbageTypeList);
      const speaachText = garbageTypeList[0].年月日
        ? `次の${targetTypeName}の収集日は${garbageTypeList[0].年月日}です。`
        : `${targetTypeName}の収集予定はありません。`;
      return responseBuilder.speak(speaachText).getResponse();
    } catch (error) {
      if (error.name === 'ServiceError' && error.statusCode === 403) {
        return handlerInput.responseBuilder
          .speak(
            '住所の利用が許可されていません。アレクサアプリの設定で許可してください。'
          )
          .withAskForPermissionsConsentCard(['read::alexa:device:all:address'])
          .getResponse();
      } else {
        console.error(error);
        return handlerInput.responseBuilder
          .speak('処理に失敗しました。もう一度お試しください。')
          .getResponse();
      }
    }
  },
};

export const handler = withSentry(Ask.SkillBuilders.custom()
  .addRequestHandlers(LaunchRequest)
  .addRequestHandlers(garabedeDateIntent)
  .addRequestHandlers(garabedeTypeIntent)
  .withApiClient(new Ask.DefaultApiClient())
  .lambda());
