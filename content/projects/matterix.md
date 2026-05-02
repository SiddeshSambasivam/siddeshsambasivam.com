---
title: "MatterIx"
oneliner: "A tiny deep learning framework, built from scratch to teach the fundamentals."
date: 2020-07-24
date_label: "2020 → 2022"
subtitle: "A small, distilled PyTorch — reverse-mode autodiff, optimizers, loss functions, and a minimal Module API. Written to make the ideas under the hood obvious."
status: "Open source"
tags: ["python", "deep-learning", "autodiff"]
icon: stack
featured: true
weight: 10
banner_label: "matterix · deep learning from scratch"
banner_icon: stack
meta:
  - { label: "Language", value: "Python" }
  - { label: "Stars", value: "9" }
  - { label: "Started", value: "2020" }
  - { label: "Package", value: "PyPI" }
actions:
  - { label: "Repository", url: "https://github.com/SiddeshSambasivam/MatterIx", icon: "github", primary: true }
  - { label: "PyPI", url: "https://pypi.org/project/MatterIx/", icon: "arrow" }
---

MatterIx is a deep learning framework I wrote from scratch in Python while learning the internals of automatic differentiation. It is intentionally small — the core engine fits in a few hundred lines and the API mirrors PyTorch closely enough that the mapping is obvious.

## What's in it

- **Autodiff** — Reverse-mode automatic differentiation. Every tensor holds a reference to the function that can compute its local gradient; one traversal of the computation graph yields all partials in `O(n)`.
- **Loss functions** — Mean Squared Error and Root Mean Squared Error.
- **Optimizers** — Stochastic Gradient Descent with `zero_grad()` and `step()`.
- **Activations** — `sigmoid`, `tanh`, `relu`.
- **Module** — A small base class for defining your own networks, with parameter tracking and gradient zeroing.

## Why I built it

I wanted to understand reverse-mode autodiff well enough to implement it, not just use it. Calculating the *local* derivative of every node and walking the graph once was the conceptual unlock — once that clicked, the rest of the framework fell out naturally. The package is on PyPI mainly so I could feel the friction of shipping a real Python library end-to-end.
