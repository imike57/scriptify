const OPENAI_API_KEY = 'YOUR_API_KEY';

function transform(question) {

    _log("Question:", question);

    return new Promise(async (resolve, reject) => {

        try {
            const response = await _axios.post('https://api.openai.com/v1/completions', {
                model: 'text-davinci-003',
                prompt: question,
                temperature: 0,
                max_tokens: 100,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                }
            });

            _log(JSON.stringify(response.data));

            if (response.data?.choices[0]) {
                resolve(response.data.choices[0]?.text);
            }


        } catch (error) {
            _log('Error:', error);
            reject(error);
        }

    });
}


module.exports = transform;