---
title: "SciML for Knowledge Discovery"
oneliner: "A comparative study of symbolic and sparse regression for scientific ML."
date: 2022-07-15
date_label: "2022 · ICARCV"
subtitle: "Reference implementation of our ICARCV 2022 paper — a head-to-head comparison of four symbolic regression methods on the Feynman-03 and Nguyen-12 benchmarks, with an honest look at where each one breaks."
status: "Research"
tags: ["research", "scientific-ml", "symbolic-regression"]
icon: disc
featured: true
weight: 60
banner_label: "sciml · ICARCV 2022 paper"
banner_icon: disc
meta:
  - { label: "Venue", value: "ICARCV 2022" }
  - { label: "Type", value: "Paper + code" }
  - { label: "Datasets", value: "Feynman-03, Nguyen-12" }
  - { label: "Stack", value: "Jupyter / Python" }
actions:
  - { label: "Repository", url: "https://github.com/SiddeshSambasivam/A-Comparative-Study-on-SciML-for-KD", icon: "github", primary: true }
---

Official implementation of *A Comparative Study on Machine Learning Algorithms for Knowledge Discovery*, accepted at the **17th International Conference on Control, Automation, Robotics and Vision (ICARCV 2022)** at Nanyang Technological University.

## What the paper does

It surveys the dominant approaches to symbolic regression — the family of methods that try to recover a closed-form equation from observations — and benchmarks them under matched conditions. The goal is to understand the strengths and limitations of each method honestly, and to call out where the field still has open problems.

## Methods compared

- **Genetic Programming (GPL)** — `gplearn` as the implementation.
- **Deep Symbolic Regression (DSR)** — RL-based search over the symbolic space.
- **AI-Feynman (AIF)** — Heuristic search using recurring patterns from physics formulas.
- **Neural Symbolic Regression that Scales (NeSymRes)** — Pretrained transformer over 100M synthetic equations.

## Datasets

- **Feynman-03** — 52 equations sampled from the AI-Feynman dataset, capped at three input variables.
- **Nguyen-12** — 12 equations with up to two input variables, intentionally including high-frequency terms like `x^5` and `x^6` to stress-test the methods.

The repo contains the full benchmark harness, the noise-sweep experiments shown in the paper, and the citation block if you find it useful.
