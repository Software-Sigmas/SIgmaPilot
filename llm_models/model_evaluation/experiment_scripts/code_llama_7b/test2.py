import sys
import pandas as pd
import signal
from openai import OpenAI
from tqdm import tqdm

# Function to handle the timeout
def handler(signum, frame):
    raise TimeoutError

# Setup the signal to use our handler function
signal.signal(signal.SIGALRM, handler)

def read_csv(file_path):
    try:
        df = pd.read_csv(file_path)
        if 'code' not in df.columns:
            raise ValueError("The CSV file does not contain a 'code' column.")
        return df
    except FileNotFoundError:
        raise FileNotFoundError("The specified CSV file was not found.")
    except Exception as e:
        raise e

def create_prompt(programming_language, code_snippet):
    system_prompt = (
        "Enter concise code review mode: Provide clear, brief feedback on code snippets. "
        "Focus on critical evaluation within a short explanation limit."
    )
    main_prompt = (
        f"Review the following {programming_language} snippet within a concise explanation of 256 tokens or less. "
        "Summarize what this function does, identify any key issues (e.g., logical errors, inefficiency, non-adherence to best practices), "
        "and suggest specific improvements. Focus on:\n\n"
        "Briefly describe the function's purpose and functionality.\n"
        "Highlighting one or two primary potential issues or areas for improvement.\n"
        "Offering one or two targeted recommendations to enhance code efficiency, security, and readability.\n\n"
        "Please ensure your response is direct and concise, within the token count limit to facilitate a uniform evaluation process.\n\n"
        "DON'T EXCEED 256 TOKENS IN YOUR RESPONSE.\n\n"
        "[Code Snippet]\n"
        f"{code_snippet}"
    )
    return system_prompt, main_prompt

def get_openai_response(system_prompt, main_prompt, timeout_duration=300):

    try:
        # Set an alarm for the timeout duration
        signal.alarm(timeout_duration)
        client = OpenAI(base_url="http://localhost:1234/v1", api_key="not-needed")
        response = client.chat.completions.create(
            model="local-model",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": main_prompt}
            ],
            temperature=0.7,
            max_tokens=256
        )
        # Cancel the alarm after successful completion
        signal.alarm(0)
        return response.choices[0].message.content
    except TimeoutError:
        print("Request timed out. Moving to the next iteration.")
        return "Timeout - No response"
    except Exception as e:
        print(f"An error occurred: {e}")
        return "Error - No response"


def review_code(df, programming_language, client):
    for index, row in tqdm(df.iterrows(), total=df.shape[0], desc="Processing"):
        system_prompt, main_prompt = create_prompt(programming_language, row['code'])
        df.at[index, 'reviewed'] = get_openai_response(client, system_prompt, main_prompt)
    return df    

if __name__ == "__main__":
    # if len(sys.argv) != 4:
    #     print("Usage: script.py <model_name> <programming_language> <csv_file_path>")
    #     sys.exit(1)
    
    # model_name, programming_language, csv_file_path = sys.argv[1], sys.argv[2], sys.argv[3]
    
    # df = read_csv(csv_file_path)

    # for index, row in tqdm(df.iterrows(), total=df.shape[0], desc="Processing"):
    #     system_prompt, main_prompt = create_prompt(programming_language, row['code'])
    #     df.at[index, 'review'] = get_openai_response(system_prompt, main_prompt)

    response = get_openai_response("Enter concise code review mode: Provide clear, brief feedback on code snippets. ", f"Review the following java snippet within a concise explanation of 256 tokens or less. "
        "Summarize what this function does, identify any key issues (e.g., logical errors, inefficiency, non-adherence to best practices), "
        "and suggest specific improvements. Focus on:\n\n"
        "Briefly describe the function's purpose and functionality.\n"
        "Highlighting one or two primary potential issues or areas for improvement.\n"
        "Offering one or two targeted recommendations to enhance code efficiency, security, and readability.\n\n"
        "Please ensure your response is direct and concise, within the token count limit to facilitate a uniform evaluation process.\n\n"
        "DON'T EXCEED 256 TOKENS IN YOUR RESPONSE.\n\n"
        "[Code Snippet]\n"
        "public int max(int a, int b) { return (a > b) ? a : b; ")
    
    print(response)

    # save_path = csv_file_path.replace(".csv", f"_{model_name}_reviews.csv")
    # df.to_csv(save_path, index=False)
    # print(f"Code reviews have been added to the CSV file at {save_path}.")
