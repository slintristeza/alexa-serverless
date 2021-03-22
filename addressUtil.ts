import enrichment from 'imi-enrichment-address';

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

export const addressConverter = async (address: alexaFullAddress) => {
  return await enrichment(address.addressLine1);
};

export const getAddress = async (requestEnvelope, serviceClientFactory) => {
  const { deviceId } = requestEnvelope.context.System.device;
  console.log(deviceId);
  const deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
  const address: alexaFullAddress = await deviceAddressServiceClient.getFullAddress(
    deviceId
  );
  const result: enrichmentType = await addressConverter(address);
  return result;
};
