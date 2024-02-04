# Example: reuse your existing OpenAI setup
from openai import OpenAI

# Point to the local server
client = OpenAI(base_url="http://localhost:1234/v1", api_key="not-needed")

completion = client.chat.completions.create(
  model="local-model", # this field is currently unused
  messages=[
    {"role": "system", "content": "Enter concise code review mode: Provide clear, brief feedback on code snippets. "
        "Focus on critical evaluation within a short explanation limit."},
    {"role": "user", "content": f"Review the following java snippet within a concise explanation of 256 tokens or less. "
        "Summarize what this function does, identify any key issues (e.g., logical errors, inefficiency, non-adherence to best practices), "
        "and suggest specific improvements. Focus on:\n\n"
        "Briefly describe the function's purpose and functionality.\n"
        "Highlighting one or two primary potential issues or areas for improvement.\n"
        "Offering one or two targeted recommendations to enhance code efficiency, security, and readability.\n\n"
        "Please ensure your response is direct and concise, within the token count limit to facilitate a uniform evaluation process.\n\n"
        "DON'T EXCEED 256 TOKENS IN YOUR RESPONSE.\n\n"
        "[Code Snippet]\n"
        "public int max(int a, int b) { return (a > b) ? a : b; "}
  ],
  temperature=0.7,
)

print(completion.choices[0].message.content)