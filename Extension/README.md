# SigmaPilot VSCode Extension

This Visual Studio Code extension facilitates the connection to Large Language Models using a URL and API key. Users can connect to any model that follows the post header and body request of OpenAI API. Our team tested using LM Studio for local connections and OpenAI api for external connections.

It streamlines the process of interfacing with these powerful language models directly within your coding environment, enhancing your productivity and enabling seamless integration of AI-powered language capabilities into your workflow.

## Features

-   **Connect to Local LLM with LM Studios**: Easily connect to a local Language Model via LM Studios, enabling you to leverage its capabilities directly from within Visual Studio Code.
-   **Connect to OpenAI API**: Connect to OpenAI's ChatGPT API by providing your API Key, allowing you to interact with ChatGPT and harness its conversational AI capabilities effortlessly.
-   **Streamlined Interface**: The extension offers a user-friendly interface within Visual Studio Code, making it intuitive to establish connections and utilize the language models seamlessly.

## Requirements

To use this extension, ensure that you have the following prerequisites:

-   **Local Language Model (LLM) Setup**: If you intend to connect to a local Language Model using LM Studios, you need to have LM Studios installed and properly configured with the desired language model. Follow the instructions provided by LM Studios for installation and setup.
-   **OpenAI API**: If you wish to connect to ChatGPT using its API, you must have an API Key from OpenAI. You can obtain your API Key by signing up for an account and subscribing to the ChatGPT API. For more information, visit [OpenAI's website](https://openai.com/chatgpt).
-   **Other Models**: Any model that uses the same body and headers of an OpenAI model connection will work.

## Installation

To install the SigmaPilot, follow these steps:

1. Open Visual Studio Code.
2. Go to the Extensions view by clicking on the square icon on the sidebar or pressing `Ctrl+Shift+X`.
3. Search for "SigmaPilot" in the Extensions Marketplace.
4. Click on the Install button next to the extension offered by the Software Sigmas.
5. Once installed, the extension will be available for use in Visual Studio Code.

## Usage

After installing the extension, you can utilize its features as follows:

Access the extensions configurations by searching SigmaPilot in command palette and clicking on settings. In these configurations you can specify URL, API, Model Name and max tokens. These
allow you connect to any model of choosing.

### Examples

1. **Connecting to Local LLM with LM Studios**:

    - Run LM Studio model server.
    - Open Visual Studio Code.
    - Navigate to the SigmaPilot configurations using command palette.
    - Under URL, use the url provided by LM Studio server.
    - Once connected, you can start using the language model directly within Visual Studio Code.

2. **Connecting to OpenAI api**:
    - Open Visual Studio Code.
    - Navigate to the SigmaPilot configurations using command palette.
    - Enter URL, API key and model name.
    - Once connected, you can start using the language model directly within Visual Studio Code.

## Feedback

If you encounter any issues or have suggestions for improving the LM Studio & ChatGPT VSCode Extension, feel free to reach out to us. You can provide feedback or report issues on the extension's GitHub repository [here](https://github.com/Software-Sigmas/AI_Code_Reviewer).

## License

This extension is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

---

**Note:** SigmaPilot VSCode Extension is a project by Software Sigmas. Thank you for using our extension! It is a very early version. Expect further improvements!
