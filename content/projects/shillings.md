---
title: "Shillings"
oneliner: "A mock payments backend for testing client integrations end-to-end."
date: 2022-07-26
date_label: "2022"
subtitle: "A Go backend that simulates a payment provider plus the surrounding identity and ledger primitives — split into independently scalable web and application layers that talk over a custom protocol."
status: "Open source"
tags: ["go", "backend", "api", "system-design"]
icon: bolt
featured: true
weight: 50
banner_label: "shillings · mock payments backend"
banner_icon: bolt
meta:
  - { label: "Language", value: "Go" }
  - { label: "Storage", value: "MySQL + Redis" }
  - { label: "Edge", value: "Nginx" }
  - { label: "Started", value: "2022" }
actions:
  - { label: "Repository", url: "https://github.com/SiddeshSambasivam/Shillings", icon: "github", primary: true }
---

Shillings is a Go service that pretends to be a payment provider so you can test client integrations end-to-end without ever touching a real payments stack.

## Architecture

The web layer and the application layer are deliberately separated so they can scale independently:

- **Web server** — Handles incoming HTTP traffic, fronted by Nginx as a load balancer.
- **Application server** — Owns business logic: authentication, payments, accounts.
- **MySQL** — Stores user profiles, credentials, and the transaction ledger.
- **Redis** — Caches user profiles for hot reads.
- **Protobuf** — The two layers communicate over a custom protocol on top of Protobuf.

Everything ships as Docker images and comes up with a single `make prod`.

## API surface

A minimal but realistic set of endpoints to integrate against:

- `POST /v1/signup` and `POST /v1/login` — JWT-based auth.
- `GET /v1/account` — current user profile and balance.
- `POST /v1/topup` — credit the wallet.
- `POST /v1/pay` — transfer between accounts.
- `GET /v1/transactions` — paginated transaction history.

## Why

Mostly to design and ship a cleanly-layered Go service end-to-end — schema, transport, deployment, the lot. Useful as a fixture for integration tests against a payments-like API without paying for sandbox access.
