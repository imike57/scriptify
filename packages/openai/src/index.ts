import vscode from "vscode";
import axios from 'axios';

/** Prompt defined as an environment variable in scriptify configuration. */
interface Prompt {
  label: string;
  value: string;
}

const API_KEY = process.env.API_KEY;
const prompts = process.env.PROMPTS as Prompt[] | undefined;

function transform(selection: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!API_KEY) {
      reject("Add an Open AI API key to your configuration.");
    } else {
      if (prompts && prompts.length) {
        // Show a quick pick dialog to select a prompt
        vscode.window.showQuickPick(prompts).then(promptChoice => {
          if (promptChoice) {
            console.log(promptChoice);
            // Invoke the start function with the selected prompt and current selection
            start(promptChoice.value + "\r" + selection)
              .then(result => resolve(result)) // Resolve the promise with the value returned by the start function
              .catch(error => reject(error));
          } else {
            reject('Aborted');
          }
        });
      } else {
        // No prompts available, invoke the start function with the current selection
        start(selection)
          .then(result => resolve(result)) // Resolve the promise with the value returned by the start function
          .catch(error => reject(error));
      }
    }
  });
}

const start = async (prompt: string): Promise<string> => {
  console.log('Prompt', prompt);
  try {
    const response = await axios.post('https://api.openai.com/v1/completions', {
      model: 'text-davinci-003',
      prompt: prompt,
      temperature: 0,
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    console.log(JSON.stringify(response.data));

    if (response.data?.choices[0]) {
      return response.data.choices[0]?.text;
    } else {
      return '';
    }
  } catch (error) {
    console.log('Error:', error);
    throw error;
  }
};

module.exports = transform;
