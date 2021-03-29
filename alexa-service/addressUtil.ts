import * as Lambda from 'aws-sdk/clients/lambda';

const lambda = new Lambda({ apiVersion: '2015-03-31' });
const GET_ADDRESS_FUNCTION_NAME = process.env.GET_ADDRESS_FUNCTION_NAME;

type alexaFullAddress = {
  addressLine1: string | null;
  addressLine2: string | null;
  addressLine3: string | null;
  city: string | null;
  stateOrRegion: string | null;
  districtOrCounty: string | null;
  countryCode: string | null;
  postalCode: string | null;
};

type enrichmentType = {
  '@context': string;
  '@type': string;
  住所: {
    '@type': string;
    表記: string;
    都道府県: string;
    都道府県コード: string;
    市区町村: string;
    市区町村コード: string;
    町名: string;
    丁目: number;
    番地: number;
    号: number;
  };
  地理座標: {
    '@type': string;
    緯度: string;
    経度: string;
  };
};

const addressConverter = async (address: alexaFullAddress) => {
  const params = {
    FunctionName: GET_ADDRESS_FUNCTION_NAME,
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify({
      body: {
        stateOrRegion: address.stateOrRegion,
        city: address.city,
        addressLine1: address.addressLine1,
      },
    }),
  };
  const result = await lambda.invoke(params).promise();
  return JSON.parse(JSON.parse(result.Payload.toString()).body).address;
};

export const getAddress = async (requestEnvelope, serviceClientFactory) => {
  const { deviceId } = requestEnvelope.context.System.device;
  const deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
  const address: alexaFullAddress = await deviceAddressServiceClient.getFullAddress(
    deviceId
  );
  const result: enrichmentType = await addressConverter(address);
  console.log(result);
  return result;
};
