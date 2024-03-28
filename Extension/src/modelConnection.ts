import {lmStudioCall} from "./connections/lmStudioCall";
import {openAICall} from "./connections/openAICall";
import {standardConnection} from "./connections/standardConnection"

// for LM studio: URL: http://localhost:1234/v1/chat/completions
// for OpenAI: URL: https://api.openai.com/v1/chat/completions

// Function that will send the messages to the models and will call the designated call to the proper model. 
export async function sendMessageToModel(userMessage: string, url:string, api:string, tokens:number, model:string) {

    return await standardConnection(userMessage, url, api, tokens, model);

    // switch (type) {
    //     case 'LM Studio': {
    //         return await lmStudioCall(userMessage, url, api, tokens);
    //         break;
    //     }
    //     case 'OpenAI API': {
    //         return await openAICall(userMessage, url, api, tokens);
    //         break;
    //     }
    //     default: {
    //         break;
    //     }        
    // }
}
