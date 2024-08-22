exports.handler = async (event, context) => {
  const redirectUrl = process.env.webpageURL+"/index.html?" + event['body'];
  const response = {
      statusCode: 302,
      headers: {
          Location: redirectUrl
      },
  };
  return response;
};