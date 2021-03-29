const enrichment = require('imi-enrichment-address')

exports.handler = async (event, _context) => {
  console.log(event);
  console.log(event.body);
  let response = {
    statusCode: 200,
    headers: {},
    body: 'success',
  };
  try {
    const params = JSON.parse(event.body);
    const address = await enrichment(params.city + params.addressLine1);
    response.body = JSON.stringify({ address: address });

    return response;
  } catch (error) {
    console.error(error);
    response.statusCode = error.statusCode ? error.statusCode : 500;
    response.body = error ? error : 'failed';
    return response;
  }
};
