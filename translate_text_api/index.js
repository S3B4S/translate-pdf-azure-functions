const rp = require('request-promise');
const uuidv4 = require('uuid/v4');

module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    if (req.body) {
        const textList = req.body;
        const promises = textList.map(text => translateTextAPI([text], req.headers['language']));
        context.log('About to fire the promises.');
        Promise.all(promises).then(result => {
            context.log('Promises finished.');
            context.res = {
                body: result,
            };
            context.done();
        });
    } else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
  }
};

/**
 * https://docs.microsoft.com/en-us/azure/cognitive-services/translator/reference/v3-0-translate?tabs=curl#request-body
 * Array can have up to 100 elements.
 * Total text cannot exceed 5000 chars.
 * @param {Object[]} text Text to be translated 
 */
const translateTextAPI = (text, language='en') => {
    const options = {
        method: 'POST',
        baseUrl: 'https://api.cognitive.microsofttranslator.com/',
        url: 'translate',
        qs: {
            'api-version': '3.0',
            'to': language,
        },
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.subscriptionKey,
            'Content-type': 'application/json',
            'X-ClientTraceId': uuidv4().toString()
        },
        body: text,
        json: true,
    };
    
    return new Promise(resolve => {
        rp(options).then(result => {
            const textExtracted = result.map(x => x.translations[0].text);
            resolve(textExtracted[0]);
        });
    });
};