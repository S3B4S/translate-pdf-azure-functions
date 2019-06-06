const pdf = require('pdf-parse');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.body) {
        const data = await pdf(req.body);
        const splitted = breakInChunks(data.text, 5000);
        // const splitted = data.text.match(/[\s\S]{1,5000}/g);
        const textList = splitted.map(text => ({ text }));
        context.res = {
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: textList,
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please upload a pdf file"
        };
    }
};

/**
 * This splits it at spaces only, can rejoin using .join(' ') to regain original string.
 * Every sizeOfChunks characters it will backtrace to find a space and split there.
 * Then repeat process on remaining piece of string.
 */
function breakInChunks(text, sizeOfChunks) {
    const collection = [];
    const startingIndex = 0;
    let index = sizeOfChunks;
    while (text.length > sizeOfChunks) {
        if (text[index] === ' ') {
            const start = text.slice(startingIndex, index);
            collection.push(start);
            text = text.slice(index + 1);
            index = startingIndex + sizeOfChunks;
        } else {
            index--;
        }
    }

    // Add remaining string
    if (text.length <= sizeOfChunks && text.length != 0) {
        collection.push(text);
    }
    
    return collection
}