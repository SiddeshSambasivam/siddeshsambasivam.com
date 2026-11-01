---
title: A Field Guide to Model Post-training
date: 2026-05-19
draft: true
subtitle: A framework for picking the right post-training method — every technique is just a combination of what you're fixing (correctness vs preference) and how you teach it (supervised vs reinforcement).
tags:
  - llm
  - post-training
icon: pen
toc: true
card_image: model-post-training-cover.png
banner_image: model-post-training-cover.png
references:
  - id: instructgpt
    authors: Ouyang et al.
    year: 2022
    title: Training language models to follow instructions with human feedback
    venue: NeurIPS
    url: https://arxiv.org/abs/2203.02155
  - id: lima
    authors: Zhou et al.
    year: 2023
    title: "LIMA: Less Is More for Alignment"
    url: https://arxiv.org/abs/2305.11206
  - id: ifd
    authors: Li et al.
    year: 2024
    title: "From Quantity to Quality: Boosting LLM Performance with Self-Guided Data Selection"
    venue: NAACL
    url: https://aclanthology.org/2024.naacl-long.421/
  - id: forgetting
    authors: Wang et al.
    year: 2025
    title: Catastrophic forgetting scales with model size in fine-tuning
    url: https://arxiv.org/pdf/2506.09428
  - id: lora
    authors: Hu et al.
    year: 2021
    title: "LoRA: Low-Rank Adaptation of Large Language Models"
    url: https://arxiv.org/abs/2106.09685
  - id: slora
    authors: Sheng et al.
    year: 2023
    title: "S-LoRA: Serving Thousands of Concurrent LoRA Adapters"
    url: https://arxiv.org/pdf/2311.03285
  - id: dpo
    authors: Rafailov et al.
    year: 2023
    title: "Direct Preference Optimization: Your Language Model Is Secretly a Reward Model"
    url: https://arxiv.org/abs/2305.18290
  - id: kto
    authors: Ethayarajh et al.
    year: 2024
    title: "KTO: Model Alignment as Prospect Theoretic Optimization"
    venue: ICML
    url: https://arxiv.org/abs/2402.01306
  - id: deepseekr1
    authors: DeepSeek-AI
    year: 2025
    title: "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning"
    url: https://arxiv.org/abs/2501.12948
methods_map:
  - name: SFT
    era: 1
    quad: bl
    desc: Supervised fine-tuning on labeled (prompt → response) pairs. The baseline for teaching correctness — locks in format, domain knowledge, and a specific skill set.
  - name: FFT
    era: 1
    quad: bl
    group: weight-update variants
    desc: Full fine-tuning — every parameter updated. Highest task ceiling per variant; most expensive in compute and storage. Prone to catastrophic forgetting at larger scales.
    members:
      - name: Adapters
        era: 1
        desc: Insert small bottleneck layers between frozen base layers and train only those. The original PEFT idea (Houlsby 2019). PEFT methods aren't strictly tied to one quadrant — they're a layer you can apply to any objective (SFT, DPO, RLHF). Grouped here because in practice they're almost always paired with SFT.
      - name: LoRA
        era: 2
        desc: Low-Rank Adaptation (Hu et al., 2021). Train rank-r delta matrices alongside frozen base weights. ~1% of params trained, mergeable at deploy, the production default. Not strictly bound to a single quadrant — a layer you can stack on any objective, but in practice almost always paired with SFT.
      - name: QLoRA
        era: 3
        desc: LoRA on top of a 4-bit quantized base model (Dettmers et al., 2023). Lets a 65B model fit on a single 48GB GPU at near-LoRA quality. Same caveat as LoRA — it's a parameter-efficiency layer, just commonly applied with SFT.
      - name: DoRA
        era: 3
        desc: Weight-Decomposed Low-Rank Adaptation (Liu et al., 2024). Splits each weight into magnitude and direction components and applies LoRA only to direction, closing more of the gap to FFT. Like LoRA/QLoRA, it's a layer you can apply to any method — grouped here because it's almost always used with SFT.
  - name: RFT
    era: 3
    quad: bl
    desc: Rejection-sampling fine-tuning. Sample N completions, keep the ones that pass a verifier, train SFT on those. Closes the gap between SFT and full RL without a reward model.
  - name: RLHF
    era: 2
    quad: tr
    desc: Train a reward model on human pairwise preferences, then optimize the policy via PPO. The original preference-optimization recipe. Highest ceiling, heaviest ops.
  - name: RLAIF
    era: 2
    quad: tr
    desc: Reinforcement Learning from AI Feedback — Constitutional AI. Preferences come from a critic model judging against a written constitution instead of humans. Scales without raters.
  - name: DPO
    era: 3
    quad: tl
    desc: Direct Preference Optimization. Skip the reward model and optimize directly on (chosen, rejected) pairs with a classification loss. RLHF-quality alignment, FT-style training.
  - name: KTO
    era: 3
    quad: tl
    desc: Kahneman-Tversky Optimization. Trains on binary thumbs-up/down labels with no pairs required. Cold-start friendly when you already have production feedback logs.
  - name: ORPO
    era: 3
    quad: tl
    desc: Odds-Ratio Preference Optimization. Combines SFT and preference learning into a single loss with no reference model, so you train a base into an aligned model in one stage.
  - name: SimPO
    era: 3
    quad: tl
    desc: Simple Preference Optimization. Reference-free, length-normalized objective. Reported to match or beat DPO with a smaller memory footprint.
  - name: GRPO
    era: 4
    quad: br
    desc: Group Relative Policy Optimization. PPO without the value-function critic — uses the mean reward of a sampled group as the baseline. 40–60% less memory than PPO. The DeepSeek-R1 recipe.
  - name: RLVR
    era: 4
    quad: br
    desc: Reinforcement Learning with Verifiable Rewards. Drops the learned reward model entirely; uses programmatic checks (unit tests, math graders) as the reward. The reason DeepSeek-R1-Zero worked from a pure-RL cold start.
---

A base model is trained to predict the next token. AI labs take a raw base model and post-train it into a general-purpose assistant, something like Claude or GPT.

These models do well on most tasks and POCs. But they aren't always reliable. On niche tasks, they struggle to produce the correct output consistently for the same input.

That's the gap post-training closes. When building an AI product, we take a general-purpose model and post-train it _again_ to specialize it for a specific task.

The goal of this post is to give a framework for choosing the right post-training method (or at least pointing you in the right direction) for a given use case. Feel free to jump straight to the end if you want a brief summary.

## Exploring the landscape

{{< methods-map title="" wide="true" >}}

While mapping out post-training methods, I realized any given method is really answering two questions:

1. **What are you trying to fix?** Either the model gives the wrong kind of answer (_correctness_), or it gives okay answers but not the ones people prefer (_preference_).
2. **How do you teach it?** Show it good answers and it imitates them (_supervised_), or score and reward the answers it generates (_reinforcement_).

Every method I read was just one of these combinations:

- **supervised + correctness → SFT** — show it correct answers, it copies them.
- **reinforcement + preference → RLHF** — let it answer, humans rate which is better, reward the preferred one.
- **supervised + preference → DPO** — show it pairs of better/worse answers, it learns the pattern.
- **reinforcement + correctness → GRPO** — let it answer math/code, auto-check if it's right, reward the correct ones.

In 2022, only the diagonal existed (SFT and RLHF). In the three years since, we've filled in the other two corners — DPO first, then GRPO.

{{< callout type="warn" title="One thing worth clarifying" >}}
PEFT (LoRA, QLoRA, DoRA, adapters) is **independent** of the objective. It's a parameter-efficiency layer — you can stack it on SFT, DPO, or RLHF. Pick efficiency and objective separately.
{{< /callout >}}

## SFT: Teaching correctness

General-purpose models look great in a demo and stumble in production — not because they're wrong, but because the _error margin_ matters. A model that hits 90% in a notebook becomes a liability at scale when the task needs precise domain knowledge, a strict output format, or a narrow skill set.

That's the gap SFT closes.

SFT trains on `(prompt → response)` pairs with cross-entropy loss applied only to the assistant tokens{{< sidenote >}}The model isn't penalized for how it reads the input, only for what it generates.{{< /sidenote >}}. People call it _instruction tuning_ when the goal is general instruction-following, _domain fine-tuning_ when the goal is specialization. {{< ref "instructgpt" >}} was the early proof at scale: a 1.3B SFT+RLHF model preferred over the 175B base GPT-3 in 71% of human comparisons.

A training sample:

```json
{
	"messages": [
		{ "role": "system", "content": "You are a medical coding assistant." },
		{ "role": "user", "content": "ICD-10 code for Type 2 diabetes?" },
		{
			"role": "assistant",
			"content": "E11.9 — Type 2 diabetes mellitus without complications."
		}
	]
}
```

The format is trivial. What you put in it is the whole game.

### How much data do you really need?

Less than you'd expect, but **quality dominates quantity**. {{< ref "lima" >}} fine-tuned on just 1,000 hand-curated examples and got responses preferred over GPT-4 in 43% of comparisons — the argument being that almost everything the model _knows_ was learned in pre-training, so alignment needs surprisingly little clean signal. {{< ref "ifd" >}} pushed further: selecting just 5% of a dataset using an Instruction-Following Difficulty score outperformed training on the _full_ set and beat WizardLM by ~10% on standard benchmarks. The question isn't _how much_, it's _how well selected_.

{{< cols n="2" wide="true" >}}
{{< col >}}
{{< callout type="ok" title="Use SFT when" >}}

- Significant **domain shift** — legal, medical, finance, code — where general outputs miss the error tolerance.
- **Output format is non-negotiable**: strict JSON, templates, a specific tone.
- You have **quality labeled data** and a clear evaluation signal to measure against.
- Maximum task performance is the goal and cost is secondary.
  {{< /callout >}}
  {{< /col >}}
  {{< col >}}
  {{< callout type="avoid" title="Avoid SFT when" >}}
- You need to serve many fine-tuned variants — multi-tenant is expensive with full SFT; reach for LoRA.
- Fewer than a few hundred clean examples — SFT overfits on sparse data. Start with few-shot.
- **Catastrophic forgetting** matters — {{< ref "forgetting" >}} shows the effect _worsens_ as model size grows from 1B → 7B.
- You're iterating quickly — slow feedback loop. Exhaust prompt engineering first.
  {{< /callout >}}
  {{< /col >}}
  {{< /cols >}}

### PEFT: Same goal, fraction of the cost

The biggest problem with full fine-tuning isn't the _concept_ — it's the bill. Updating every parameter in a 7B or 70B model means significant compute, long training runs, and a separate copy of weights for every variant you want to serve.

PEFT sidesteps this by **freezing most of the model** and retraining only a small fraction of the weights — typically less than 2%. The quality trade-off is surprisingly small: PEFT recovers **90–95% of full fine-tuning performance** while cutting memory **10–20×**.

The most widely used PEFT method in production is LoRA.

#### LoRA: Low-rank adapters

LoRA — {{< ref "lora" >}}, not the Google font — is the dominant PEFT method in production. The core idea: instead of modifying the original weight matrices, LoRA _freezes_ them and injects small trainable adapter matrices alongside. The adapters have a low rank `r` that controls how many parameters are actually trained. After training, the adapters can be **merged into the base weights** — mathematically just an addition — producing a model that behaves like a fully fine-tuned one with **zero inference overhead**.

A LoRA run uses the same data format as SFT:

```json
{
	"messages": [
		{ "role": "system", "content": "You are a contract review assistant." },
		{
			"role": "user",
			"content": "Does this clause include an indemnification obligation?"
		},
		{
			"role": "assistant",
			"content": "Yes — Section 4.2 contains a mutual indemnification clause covering third-party IP claims."
		}
	]
}
```

The key hyperparameter is rank `r`. Practical guidance:

{{< cols n="3" >}}
{{< col >}}

<div class="card"><div class="card-label">rank</div><div class="card-title">r = 4 – 8</div><div class="card-body">Simple style or format adjustments. Start here.</div></div>
{{< /col >}}
{{< col >}}
<div class="card"><div class="card-label">rank</div><div class="card-title">r = 16</div><div class="card-body">Most domain-specific tasks. Sensible default.</div></div>
{{< /col >}}
{{< col >}}
<div class="card"><div class="card-label">rank</div><div class="card-title">r = 32 – 64</div><div class="card-body">Large domain shifts or multi-task settings.</div></div>
{{< /col >}}
{{< /cols >}}

Start low, increase only if the model underfits.

##### Multi-LoRA in production

The most useful production property of LoRA is **multi-adapter serving**. Because adapters are small and separate from the base model, a single deployment can serve hundreds of adapters at once — one per customer, domain, or use case — without keeping a full model copy for each. Fireworks and vLLM support this natively; {{< ref "slora" >}} showed serving _thousands_ of concurrent adapters on a single base model. The trade-off: dynamically swapping unmerged adapters adds ~10–30% to prompt processing vs. a merged model{{< sidenote >}}If you're serving exactly one variant and latency is critical, merge the adapter into the base weights at deploy time.{{< /sidenote >}}.

> If you want the mechanics, [CodeEmporium's video](https://www.youtube.com/watch?v=Bq9zqTJDsjg) is the clearest walkthrough I've seen.

{{< cols n="2" wide="true" >}}
{{< col >}}
{{< callout type="ok" title="Use LoRA when" >}}

- You want **SFT-level quality** without the compute — 90–95% performance, <1% of params trained.
- You're serving **multiple variants** from one base (per-customer, multi-tenant).
- Storage is a constraint — adapter weights only, not a full model per variant.
  {{< /callout >}}
  {{< /col >}}
  {{< col >}}
  {{< callout type="avoid" title="Avoid LoRA when" >}}
- The task needs a **very large domain shift** and compute isn't a constraint — full FT still has a measurable ceiling above LoRA.
- Prompt latency is critical **and** you need dynamic swapping — pick merged (fast, single variant) or unmerged (flexible, ~10–30% overhead).
  {{< /callout >}}
  {{< /col >}}
  {{< /cols >}}

## Preference: from correct to preferred

Even when the model is generating _correct_ responses, users prefer some correct outputs over others — tone, depth, format, restraint. SFT rarely captures that. **Preference optimization** does. The goal shifts from training for correctness to training for alignment.

Two camps:

- **RL-based** — learn from live feedback during training (RLHF/PPO, GRPO).
- **Static preference** — learn from a fixed dataset of human preferences collected beforehand (DPO, KTO).

In practice you almost always start with static methods. RL comes later — only when you need a ceiling offline methods can't reach.

### RLHF / PPO: the original recipe

{{< ref "instructgpt" >}} is the original preference optimization pipeline. Two stages: (1) train a reward model on human preference data — _which of these two responses is better?_ (2) optimize the language model against that reward via Proximal Policy Optimization (PPO). The model samples during training, gets scored, updates weights — an online loop.

It works. It's also **expensive, unstable, and operationally complex**. You're juggling two models, sampling live, and tuning a finicky RL algorithm. Most teams don't start here.

{{< cols n="2" wide="true" >}}
{{< col >}}
{{< callout type="ok" title="Use RLHF when" >}}

- You need the **highest possible ceiling** and have the infra.
- You have a **reliable reward model** and human raters at scale.
- Helpfulness _and_ safety alignment are required simultaneously — RLHF handles multi-objective optimization better than offline methods.
  {{< /callout >}}
  {{< /col >}}
  {{< col >}}
  {{< callout type="avoid" title="Avoid RLHF when" >}}
- You're small or early — the ops overhead rarely justifies the gain.
- You don't have a good reward model — garbage reward signal produces **reward hacking**, not alignment.
  {{< /callout >}}
  {{< /col >}}
  {{< /cols >}}

### DPO: skip the reward model

{{< ref "dpo" >}} reframes RLHF as a **classification problem**. The key insight: the reward model in RLHF is implicit in the language model itself — you don't have to train it separately. DPO drops the reward model entirely and optimizes directly on `(chosen, rejected)` pairs with a classification loss. No RL, no live sampling, no second model.

It matches or beats PPO-based RLHF on summarization and dialogue while being **substantially simpler**.

```json
{
	"prompt": "Explain neural networks to a 10-year-old.",
	"chosen": "Think of it like a brain made of math — lots of tiny switches that learn to turn on or off based on examples.",
	"rejected": "Neural networks are computational systems loosely inspired by biological neural networks that constitute animal brains."
}
```

The model learns to increase the probability of `chosen` relative to `rejected`.

{{< cols n="2" wide="true" >}}
{{< col >}}
{{< callout type="ok" title="Use DPO when" >}}

- You have pairwise preference data (or can generate it with a strong judge).
- You want RLHF-level alignment without the RL complexity.
- You're iterating fast — DPO trains like a standard FT job.
  {{< /callout >}}
  {{< /col >}}
  {{< col >}}
  {{< callout type="avoid" title="Avoid DPO when" >}}
- Preference data is noisy or the chosen/rejected distinction is weak — DPO is sensitive to data quality.
- You only have **binary** feedback (👍/👎) without pairs — reach for KTO.
  {{< /callout >}}
  {{< /col >}}
  {{< /cols >}}

### KTO: when you only have thumbs

{{< ref "kto" >}} solves a practical problem: most teams don't _have_ pairwise preference data. They have **logs** — responses users liked or didn't. KTO was designed for exactly this. Grounded in Kahneman–Tversky prospect theory, it optimizes directly on binary feedback (desirable / undesirable) without matched pairs. It matches or exceeds DPO across model scales from 1B → 30B.

```json
{
	"prompt": "Summarize this customer complaint.",
	"completion": "The customer is frustrated about a delayed shipment and is requesting a refund.",
	"label": true
}
```

`true` = desirable, `false` = not. No paired responses needed.

{{< cols n="2" wide="true" >}}
{{< col >}}
{{< callout type="ok" title="Use KTO when" >}}

- You have production logs with implicit or explicit user feedback.
- You're at **cold start** with no pairwise data yet.
- You want to start preference optimization cheaply before investing in DPO infra.
  {{< /callout >}}
  {{< /col >}}
  {{< col >}}
  {{< callout type="avoid" title="Avoid KTO when" >}}
- You have **high-quality pairwise data** — DPO will generally outperform KTO when pairs are clean and abundant.
  {{< /callout >}}
  {{< /col >}}
  {{< /cols >}}

### GRPO: RL without the critic

GRPO is RL-based, but it does one thing differently from PPO: **no value function**. Instead of maintaining a separate critic network, GRPO samples a group of outputs for each prompt and uses their average reward as the baseline. This cuts memory **40–60% vs. PPO**, making large-scale RL training tractable.

It was central to {{< ref "deepseekr1" >}}: trained with GRPO, DeepSeek-R1 rivals OpenAI's o1 on reasoning benchmarks while requiring ~147K H800 GPU-hours — an order of magnitude less than comparable models. Notably, **DeepSeek-R1-Zero used pure RL with GRPO and no SFT at all**, producing emergent behaviors like self-correction mid-reasoning.

{{< cols n="2" wide="true" >}}
{{< col >}}
{{< callout type="ok" title="Use GRPO when" >}}

- The task has a **verifiable reward signal** — math answers, code passing tests, structured logic.
- You're training a reasoning model.
- You want RL-level alignment at lower memory than PPO.
  {{< /callout >}}
  {{< /col >}}
  {{< col >}}
  {{< callout type="avoid" title="Avoid GRPO when" >}}
- The reward is hard to verify — open-ended generation, creative writing, tone — GRPO needs a reliable signal.
- You don't have SFT as a foundation — GRPO without a warm-started model is unstable in most practical settings.
  {{< /callout >}}
  {{< /col >}}
  {{< /cols >}}

## Pick the right tool

The decision usually compresses to: _what data do I have, and what am I optimizing for?_ This table is sortable and filterable — try filtering for "LoRA" or sorting by recommended approach.

{{< table sortable="true" filter="true" wide="true" caption="Decision table for common post-training situations" >}}
| Situation | Recommended | Why |
| --- | --- | --- |
| Domain adaptation (medical, legal, e-commerce) | SFT + LoRA | Efficient domain shift without full retraining |
| Enforce output format or style | SFT + LoRA | Format is a correctness problem — SFT is the right axis |
| Limited compute / single-GPU fine-tuning | QLoRA | 4-bit quantization fits a 65B model on a single 48GB GPU |
| Serving multiple fine-tuned variants | Multi-LoRA | One base, many adapters, shared GPU |
| Cold start — only binary feedback | KTO | No pairwise data needed, works on 👍/👎 logs |
| Pairwise preference alignment | DPO | Simpler than RLHF, matches PPO on most tasks |
| Improve helpfulness or tone from existing logs | KTO | Binary signal is enough; no annotation pipeline |
| Full safety alignment at scale | RLHF / PPO | Multi-objective optimization, highest ceiling |
| Reasoning tasks (math, code) | GRPO | Verifiable reward, 40–60% less memory than PPO |
| Prevent catastrophic forgetting | LoRA / PEFT | Frozen base weights preserve general capabilities |
{{< /table >}}

The framework, compressed:

1. **Start with correctness.** SFT (with LoRA if compute is tight) is the workhorse — it locks in format, domain knowledge, and the basic task.
2. **Add preference once you have signal.** DPO when you have pairwise data, KTO when you only have thumbs.
3. **Reach for RL last.** RLHF/GRPO only earn their cost when an offline method has plateaued and the upside justifies the operational weight — verifiable rewards (math, code, structured tasks) make this dramatically easier.

Pick by what you're fixing and what you can teach with. The rest is implementation detail.

{{< refs >}}
