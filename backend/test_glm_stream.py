import time
from openai import OpenAI

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key="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"
)

t0 = time.time()
print("Sending request to NVIDIA GLM-5.3...")
try:
    response = client.chat.completions.create(
        model="z-ai/glm-5.3",
        messages=[
            {"role": "system", "content": "You are a bestselling non-fiction author. Output ONLY the book chapter prose with no meta intro or thinking."},
            {"role": "user", "content": "Write Chapter 1: The Point of Maximum Friction. Topic: Why what you have tried has drained your energy without building momentum. (200 words)."}
        ],
        temperature=0.3,
        max_tokens=1024,
        stream=False
    )
    t1 = time.time()
    msg = response.choices[0].message
    print(f"Done in {t1 - t0:.2f}s!")
    print("msg.content is:", repr(msg.content[:200] if msg.content else None))
    has_reasoning = hasattr(msg, "reasoning_content") and msg.reasoning_content
    print("has reasoning_content:", bool(has_reasoning))
    if has_reasoning:
        print("reasoning_content snippet:", repr(msg.reasoning_content[:200]))
except Exception as e:
    print("Error:", e)
