
# Σ SigmaPilot

## Using Artificial Intelligence to Perform Reviews of Human Code

### 🔗 [Final Report](./Documents/Final%20Report.pdf)
 ### 🔗 [Project's Presentation](./Documents/SigmaPilot-Presentation.pdf)
 ### 🔗 [Poster](./Documents/AI%20Code%20Reviewer%20Capstone%20Poster%20one%20page.pdf)

## 📕 Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
  - [Setting Up Local LLM](#setting-up-local-llm)
  - [Setting Up Remote LLM](#setting-up-remote-llm)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Introduction

🚀 **SigmaPilot** is a state-of-the-art Visual Studio Code (VSCode) extension designed to revolutionize the code review process by leveraging the power of Artificial Intelligence (AI). SigmaPilot enables developers to integrate seamlessly with both local and remote Large Language Models (LLMs) directly within their coding environment. By prioritizing user privacy, operational efficiency, and ease of use, SigmaPilot is set to transform the way developers review and enhance their code.

## Features

✨ **Key Features:**
- **Seamless Integration:** Direct integration with VSCode.
- **Flexible LLM Support:** Connects to both local and remote LLMs.
- **Enhanced Code Review:** Provides AI-driven insights for code improvement.
- **Data Privacy:** Ensures user privacy with local model connections.
- **User-Friendly Interface:** Easy configuration and usage.

## Installation

🛠️ **Installation Steps:**

### Prerequisites
- Visual Studio Code installed on your machine.
- Node.js installed on your machine.

### Steps
1. Clone the repository:
   ``` sh git clone https://github.com/Software-Sigmas/SIgmaPilot.git ```
2. Navigate to the extension directory:
   ```sh cd SIgmaPilot ```
3. Install the dependencies:
   ```sh npm install ```
4. Open VSCode and start the extension:
   ```sh code . ```
5. Press `F5` to open a new VSCode window with the extension loaded.

## Usage

🖥️ **How to Use:**

1. Open the SigmaPilot sidebar in VSCode.
2. Configure your model settings (URL, API key, model name, max tokens).
3. Select the code you want to review.
4. Choose the task you want the AI to perform (formatting, efficiency, explanation).
5. View the AI's recommendations and modifications directly in the VSCode interface.

## Configuration

⚙️ **Configuration:**

### Setting Up Local LLM

1. Download and install LM Studio.
2. Configure LM Studio to host your desired LLM.
3. Use the following configuration in SigmaPilot:
   - **URL:** `http://localhost:8000`
   - **API Key:** Your LM Studio API key

### Setting Up Remote LLM

1. Obtain an API key from your remote LLM provider (e.g., OpenAI).
2. Use the following configuration in SigmaPilot:
   - **URL:** Provider's URL
   - **API Key:** Your API key
   - **Model Name:** The name of the model you wish to use
   - **Max Tokens:** Set the maximum token limit for responses

## Development

💻 **Development Guide:**

### Project Structure
- `src/`: Contains the source code for the extension.
- `src/extension.ts`: The main entry point for the extension.
- `src/sidebar/`: Contains the Svelte components for the sidebar UI.
- `package.json`: Project configuration and dependencies.

### Building the Extension
To build the extension from source:
```sh npm run build ```

### Running Tests
To run tests:
```sh npm test ```

## Testing

🧪 **Testing:**

1. **Local Testing:**
   - Set up a local instance of LM Studio.
   - Validate API calls using Postman.
   - Ensure the extension correctly communicates with the local model.

2. **Remote Testing:**
   - Deploy the model on a cloud service (e.g., Google Colab, AWS).
   - Use Postman to validate API connections.
   - Test the extension's integration with remote models.

## Contributing

🤝 **Contributing:**

We welcome contributions to SigmaPilot! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Create a new Pull Request.

## License

📜 **License:**

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

🙏 **Acknowledgements:**

- **Project Manager:** Mikhail Nathoo
- **Team Members:** Ernest Nikolaychuk, Mikhail Nathoo, Tanish Datta, Sam Farzamfar, Saman Pordanesh
- **Teacher Assistant:** Manuel Zamudio Lopez
- **Academic Advisor:** Dr. Gouri Ginde Deshpande
- **Sponsor Representative:** Mr. Alex Shaharudin
- **Sponsor Company:** Network Innovations Inc

Special thanks to all our stakeholders and contributors for their support and guidance throughout this project.
