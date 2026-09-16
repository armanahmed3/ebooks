import time
from openai import OpenAI

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key="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"
)

for max_tok in [2048, 4096]:
    print(f"\n--- Testing max_tokens = {max_tok} ---", flush=True)
    t0 = time.time()
    try:
        response = client.chat.completions.create(
            model="z-ai/glm-5.3",
            messages=[
                {"role": "system", "content": "You are a bestselling non-fiction author. Output ONLY the book chapter prose with no meta intro or thinking."},
                {"role": "user", "content": "Write Chapter 1: The Point of Maximum Friction. Topic: Why what you have tried has drained your energy without building momentum. (200 words)."}
            ],
            temperature=0.3,
            max_tokens=max_tok,
            stream=False
        )
        t1 = time.time()
        msg = response.choices[0].message
        print(f"Time: {t1 - t0:.2f}s", flush=True)
        print("msg.content length:", len(msg.content) if msg.content else 0, flush=True)
        print("msg.content snippet:", repr(msg.content[:200] if msg.content else None), flush=True)
        print("has reasoning_content:", bool(getattr(msg, "reasoning_content", None)), flush=True)
        if msg.content:
            print("Full content generated successfully!", flush=True)
            break
    except Exception as e:
        print("Error:", e, flush=True)
