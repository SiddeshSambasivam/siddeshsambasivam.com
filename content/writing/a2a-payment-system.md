---
title: Payment systems for agents
draft: true
tags:
  - ideas
toc: false
---

To mimic how agent would purchase things online with the current state of payment protocols.

1. Merchant
   [retrieval pipeline]
2. Marketplace for agents (e.g. like amazon but for agents)
3. Buyer agent

Entities:

1. Seller (merchant). Server which exposes set of tools which allows to buy a particular SKU (add to cart -> checkout (lock inventory for a period of time) -> payment (success, fail) -> confirm).
2. Marketplace for agents. Given query from buyer, retrieve the most relevant products for the buyer. On the other hand, need to orchestrate the transaction if buyer agent proceeds with it.
3. Buyer agent. Given query from user or itself, browse products, show suggestions to user, human-in-the-loop (ask approval to purchase), trigger and complete transaction for a purchase.

Responsibility:

1. Buyer directly talks with seller
2. Buyer talks with marketplace and marketplace talks with seller

Cases to think:

- Double spending
- Refunds
- Report fraud transactions
- Currency exchange

---

Goal: Make it as simple as possible to understand and how it would work at scale.
