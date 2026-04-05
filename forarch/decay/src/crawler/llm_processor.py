from llama_cpp import Llama

llm = Llama(model_path="mistral-7b-instruct-q4_k_m.gguf", n_ctx=512, n_threads=4)

def is_decay_signal(text: str) -> bool:
    prompt = f"Does this text indicate an API deprecation or breaking change? Answer YES or NO.\nText: {text}\nAnswer:"
    output = llm(prompt, max_tokens=10, echo=False)
    return "YES" in output["choices"][0]["text"]
