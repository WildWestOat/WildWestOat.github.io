---
title: Start learning vLLM
date: 2026-09-24
summary: A beginner's roadmap to vLLM — what to learn first, which resources helped me, and how to think about benchmarking.
tags: [vllm, llm, inference, notes, 10 mins reading]
---

My first post — hopefully not the last one.

I'm writing this for anyone who is just starting to learn vLLM and wants to dig
deeper into its stack. If you've recently become interested in vLLM, you might
feel overwhelmed by everything it offers. I certainly did.

> **Disclaimer:** I'm still a rookie, but I think this is worth sharing so you
> don't waste as much valuable time as I did. This post focuses on the
> **inference** side, since that's what we're learning vLLM for. I can't avoid
> touching on some training details, though, so keep in mind what we're
> actually aiming to understand.

## What is vLLM, quickly?

I'll assume most of you already have a basic idea of what vLLM is and what it's
for. If not, here's a quick recap.

The LLMs you use, like ChatGPT or Claude Opus, need an **engine** to serve them.
These engines are responsible for:

- serving requests (your prompts).
- managing the LLM's **KV cache** (a little deep, but don't give up yet!).
- applying optimizations so the LLM achieves **high throughput** and **low latency**

**vLLM** is a production-grade LLM engine, with killer features like
**PagedAttention**, which I'll cover in a later post. Plenty of people have
already written about this technique, so if you're keen to learn it now, feel
free to check them out first.

In this post, I'll walk through what you need to know to get a feel for vLLM,
step by step, along with resources that worked well for me.

## Step 1: Understand the core ideas behind LLMs

Knowing *what* an LLM is isn't enough.

Behind the success of LLMs is an architecture called the **Transformer** (not
the robot cars), introduced in the paper
[*Attention Is All You Need*](https://arxiv.org/abs/1706.03762).

Why is it so important? Before Transformers, language models (RNNs and LSTMs) read text one word at a time, passing a kind of running summary along the way. That made them slow to train and prone to "forgetting" things from earlier in a long text.

The idea of attention already existed, but this paper showed you could build a whole model out of it. With self-attention, every token can look at every other token in the input and decide how much each one matters. In "The cat sat on the mat because it was tired," attention helps the model link it to cat. Because this happens for all tokens at once, Transformers train in parallel on GPUs, and that's a big reason LLMs could scale up.

You don't have to read the whole paper, but you should understand its core idea
to understand how an LLM works.

### Free resources

These YouTube videos helped me get through the hard times a lot:

- [Transformers explained (video)](https://www.youtube.com/watch?v=PaNPWuASOvM)
- [3Blue1Brown — Neural networks playlist](https://www.youtube.com/watch?v=LPZh9BOjkQs&list=PLZHQObOWTQDM4E-dwvbnQTiyKDO-y9T2t)
- [Under The Hood (channel)](https://www.youtube.com/@underthehood444)

Hugging Face also has a great free course for getting started with LLMs:
[Hugging Face LLM Course](https://huggingface.co/learn/llm-course/en/chapter1/1).

### What to focus on

Before you get overwhelmed, remember: you don't have to understand everything at
once. These are the topics to focus on:

- **LLM architecture** — what it looks like, especially the inference part.
- **Linear algebra**: without it, there's no LLM. At minimum, understand
  **vectors**, the **dot product**, and **matrix multiplication**. These terms
  come up constantly: a token's embedding is a vector, attention scores come
  from dot products between Q and K, and almost everything a GPU does during
  inference is matrix multiplication.
  ([3Blue1Brown — Essence of Linear Algebra](https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab))
- **Weights, activation functions, and biases** — know what they are, but skip how they're trained (backprop, optimizers). For inference, what matters is their size: weights take up most of the GPU memory, and they're read on every generated token. That's why decoding is usually memory-bound, and why tricks like quantization (e.g. FP8, INT4) help.
- **Tokenizers** — how an LLM treats its inputs.
- **Embeddings, vocabulary, and n-grams.**
- **Q, K, V** (query, key, value) — again, especially for inference.
- **The attention mechanism** and how it creates the KV cache. Don't mistake vLLM's PagedAttention for a new kind of attention. The math is the same; PagedAttention is about memory management. It stores the KV cache in small fixed-size blocks (like pages in an operating system) instead of one big chunk per request, so less GPU memory is wasted and more requests fit at once. It might be a good idea to brush up Operating System book, as it is inspired from OS memory management.
- **The KV cache** — what it is, and where Q fits in (again, focus on
  inference).

Don't beat yourself up. Make sure you understand all of these before you start
learning vLLM. Trust me, I learned this the hard way.

## Step 2: Get an overview of vLLM

Now I'll assume you're ready for the next part: vLLM itself.

Usually I'd tell everyone to go read the docs, but this time is different. I
found it more useful to read this blog post first:
[Anatomy of vLLM](https://vllm.ai/blog/2025-09-05-anatomy-of-vllm).

It gives a useful overview of vLLM. After reading it, you should have an idea of:

- what the inside of vLLM looks like.
- the important features vLLM offers.

It's worth mentioning that it *doesn't* contain a good explanation of the
feature that sets vLLM apart from other engines: **PagedAttention**. For that,
read the [PagedAttention design doc](https://docs.vllm.ai/en/latest/design/paged_attention/#qk)
instead.

## Step 3: Learn benchmarking

You also need to understand benchmarking. It was the very first task I was
given to help me understand vLLM.

You need to understand the **limitations** of your system (is it memory-bound
or compute-bound?) and the **performance** you want to see from your inference
system. My hint: an LLM is an **autoregressive** model, meaning it generates one
new token at a time.

There are two things to focus on, and sometimes you need to trade one off
against the other:

- **Throughput** — the ability to serve many concurrent requests.
- **Latency** — the ability to respond quickly.

### Key metrics

In the LLM world, there are several metrics for measuring engine performance:

- **TTFT (Time To First Token)** — how long it takes to get the first token.
  Imagine you enter your prompt and the first token (you know what a token is
  by now, after all that reading above!) arrives quickly. You're happy.
- **ITL (Inter-Token Latency)** — the average time between tokens. If it's too
  high, users get a slow response, and they're unhappy. Remember: even if TTFT
  is fast, slow subsequent tokens can make the whole experience worse.
- **Tokens per second** — how many tokens the system can generate per second.
  This indicates the system's throughput.

There are many more insightful metrics, but I'm not an expert yet, so I'll leave
the rest of the reading to you.

### Recommended reading

I recommend reading these posts, or any other benchmarks you find, to get an
idea of what to look for when optimizing and tuning system performance:

- [Qwen3.8 PD serving](https://vllm.ai/blog/2026-09-21-qwen38-pd-serving) — I strongly recommend it, not for the numbers, but for the thought process. It shows what to figure out before you benchmark: how much KV cache memory you have, how many requests fit, and why prefill and decode are measured separately. Don't worry if the hardware details go over your head; focus on the "Maximizing Throughput" and "Measure prefill/decode performance" sections.
- [vLLM Metal v0.28.0](https://vllm.ai/blog/2026-09-22-vllm-metal-v0-28-0)

There's also a free book on inference engineering:
[Inference Engineering by Baseten](https://www.baseten.co/inference-engineering/).
I've only skimmed it, but I'd say it's a good start for newcomers.

## Step 4 (optional, for now): GPU programming

The next thing I'd recommend — which I haven't gone deep into myself yet — is
learning **GPU programming techniques**. This is especially useful for
developers who want to contribute features to vLLM. GPU knowledge is a must
there, since many optimizations are done through parallelism.

## Wrapping up

Thank you for reading my post! I hope it's useful enough to help someone who
feels overwhelmed by vLLM. If I had to start again, I'd ask myself two
questions: ***Why do I need vLLM in the first place?*** and ***What knowledge do I need before using vLLM?***

I'll keep sharing my journey and writing useful posts, because I believe this
knowledge should be free. Thanks to all the kind engineers out there who keep
posting free knowledge on the Internet.
