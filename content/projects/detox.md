---
title: "Detox"
oneliner: "A drop-in REST API for multilingual profanity filtering."
date: 2021-10-16
date_label: "2021 → 2023"
subtitle: "A web service that classifies and filters toxic content across languages, built around a fine-tuned XLM-RoBERTa model and deployed as an easy-to-integrate API."
status: "Open source"
tags: ["java", "ml", "api", "hackathon"]
icon: code
featured: true
weight: 30
banner_label: "detox · multilingual profanity API"
banner_icon: code
meta:
  - { label: "Model", value: "XLM-RoBERTa" }
  - { label: "Train acc.", value: "96.55%" }
  - { label: "Val acc.", value: "87.78%" }
  - { label: "Deploy", value: "AWS EC2" }
actions:
  - { label: "Repository", url: "https://github.com/SiddeshSambasivam/Detox", icon: "github", primary: true }
  - { label: "Live demo", url: "https://siddeshsambasivam.github.io/Detox/", icon: "arrow" }
---

Detox is a web service that filters toxic content in messages and webpages — multilingual by design, so it works across the languages people actually use online. Built with Nishka, Swathi, and Arumugam over a hackathon and iterated on after.

## How it works

The classifier is a fine-tuned **XLM-RoBERTa**, trained to label toxic content across multiple languages. We exposed the model behind a single REST endpoint deployed on an AWS EC2 instance with a load balancer for handling traffic spikes. The fine-tuned model reaches **96.55% training** and **87.78% validation** accuracy on the toxicity benchmark we trained against.

## Sample integrations

To prove the API was actually drop-in, we shipped two demo clients:

- **Discord bot** — listens to channel messages, deletes toxic ones, warns the sender.
- **Android accessibility service** — overlays a warning screen when the device displays offensive content in any app.

## What's next

The roadmap includes a Chrome extension that censors hateful content inline, plus a feedback loop for users to report false positives and false negatives so we can keep improving the model.
