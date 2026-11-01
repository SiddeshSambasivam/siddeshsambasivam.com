---
title: "OpenPlan, alignment as a system."
date: 2026-10-30
draft: false
subtitle: A desktop app that puts every agent plan through a defined lifecycle, with alignment required before implementation begins.
icon: pen
toc: true
featured: true
app: openplan
card_image: openplan-blog-hero.png
comments: true
video: openplan-demo.mp4 # file in assets/media/, or a /path or https URL
video_poster: openplan-blog-hero.png # optional: the frame shown before play
# Content for the agent-workflow and plan-lifecycle diagram shortcodes.
agent_workflow:
  - id: prompt
    title: Prompt
    actor: You
    does: "You describe the task in a prompt."
    risk: "The prompt carries only what you remembered to write down."
  - id: questions
    title: Questions
    actor: Agent
    mark: gap
    does: "The agent asks a few clarifying questions."
    risk: "A few questions can't carry your team's context, so the agent fills gaps with guesses."
  - id: plan
    title: Plan
    actor: Agent
    does: "The agent writes a plan from what it understood."
    risk: "A misunderstanding from step 2 turns into a clean plan for the wrong problem."
  - id: review
    title: Review
    actor: You
    mark: review
    does: "You review the plan the agent wrote."
    risk: "Review checks the plan as written. It can't see the question nobody asked."
  - id: build
    title: Build
    actor: Agent
    does: "The agent builds it, and code review follows."
    risk: "Changing direction now costs the most, because the code already exists."
# The align-demo example mirrors the app's Alignment tab: one question per persona,
# covering the three areas every plan must settle (edge cases, error handling, scale).
alignment_demo:
  plan: "Add CSV export to the orders table"
  target: 80
  questions:
    - role: product
      aspect: Scope
      question: "Who needs this export first?"
      options:
        - label: "Finance, for the monthly close"
          consequence: "Exports every order in the month, with totals finance can reconcile."
          recommended: true
        - label: "Support, to look up single orders"
          consequence: "Smaller files, but finance keeps exporting by hand."
    - role: design
      aspect: Edge cases
      question: "What should Export do when the filters match no orders?"
      options:
        - label: "Turn the button off and say why"
          consequence: "A tooltip reads \"No orders match these filters.\""
          recommended: true
        - label: "Download an empty file"
          consequence: "Consistent, but people open a blank sheet and think it broke."
    - role: engineering
      aspect: Error handling
      question: "What happens if an export fails halfway?"
      options:
        - label: "Retry it, then email a link when it's ready"
          consequence: "Failures recover without anyone watching a spinner."
          recommended: true
        - label: "Show an error and let them start over"
          consequence: "Simpler, but long exports fail for someone eventually."
    - role: oncall
      aspect: Scale
      question: "What happens when an export has 500,000 rows?"
      options:
        - label: "Build the file in a background job"
          consequence: "Requests stay fast, and the queue absorbs the load."
          recommended: true
        - label: "Stream rows to the browser"
          consequence: "No queue, but a slow network holds a server worker for minutes."
plan_lifecycle:
  target: 80
  states:
    - id: draft
      name: Draft
      mover: You
      does: "The agent files the first version of the plan. You comment on it until it reads right."
      next: "Sending your first review opens alignment."
    - id: alignment
      name: Alignment
      mover: You
      gate: true
      does: "Four personas take turns asking questions. Each answer raises the alignment score."
      next: "Build unlocks once every question has an answer and the score reaches your target."
    - id: in-progress
      name: In progress
      mover: Agent
      back: "You can reopen alignment"
      does: "Agents work through the todo list. A new requirement you raise becomes a new todo."
      next: "It moves to review once no todo is open. You can reopen alignment."
    - id: in-review
      name: In review
      mover: You
      does: "The work waits on review: an agent review, a human review on GitHub, or CI checks."
      next: "You mark the plan completed once every PR is merged."
    - id: completed
      name: Completed
      mover: You
      does: "Every PR for the plan is merged, and you've confirmed it."
      next: "Only you can complete a plan. Agents stop at in review."
    - id: archived
      name: Archived
      mover: You
      side: "From any state"
      does: "Any plan can be archived. It sits behind a collapsed toggle on the board and table views."
      next: "Only you can archive a plan, from any state."
---

Agents are great at building features, fixing bugs, optimizing code, and a myriad of other things. But one thing I've repeatedly noticed is how easily they miss the context a team builds up over the years: why the product works the way it does, what customers keep asking for, and which past decisions still matter.

I've seen this pattern play out more than once, and it has bitten us back every single time. An agent makes a reasonable assumption, fills in a gap in the requirements, and builds something that technically works but isn't quite what we needed.

You could argue that this can be solved with good documentation and retrieval mechanisms. And to some extent, it can. But even with all the right documents, agents often miss the bigger picture. Product context changes over time, and documentation inevitably gets out of date.

Generally, an agent works from an initial prompt, context about the repo, and any additional docs it can find. That's rarely the whole picture.

An agent can be great at executing a task, but it can still:

{{< cards cols="2" >}}
{{< card label="Failure 1" title="Misreads the ask" >}}Misread a requirement or fill a gap in the spec with a reasonable but wrong guess.{{< /card >}}
{{< card label="Failure 2" title="Misses the bigger picture" >}}Solve the stated problem while missing the wider product vision or overlooking what else the change might affect.{{< /card >}}
{{< /cards >}}

Yeah, agents **can** write code and solve the problem in front of them. Whether it's the right problem to solve is a separate question.

{{< callout type="info" title="The core problem" >}}
That's an alignment problem, not a capability problem.
{{< /callout >}}

## Why code review alone doesn't catch it

Most workflows with coding agents follow roughly the same five steps:

{{< agent-workflow >}}

We do review the code after implementation, but there's a problem. If the agent or human reviewing the code is working from an already misaligned plan, they might not even know it. It's easy to approve something that's technically correct without realizing it solves the wrong problem.

One solution is to introduce a review step at the planning stage. But reviewing long, complex plans can become tedious, especially when there's a lot to go through.

The real gap is at step 2.

A few quick clarifying questions aren't enough to transfer the context a team carries in its head. Files like CLAUDE.md help, but they're better suited to general instructions and conventions than capturing the intent behind a specific piece of work.

## Introducing OpenPlan

Alignment shouldn't depend on how complete the initial prompt was or how many questions the agent happened to ask.

_OpenPlan_ gives every piece of work a defined lifecycle, with explicit states and rules for moving between them.

The **plan** is the basic unit of work. A single plan can span multiple repositories and multiple agent sessions.

To be honest, OpenPlan is mostly a nice way to manage Markdown files and other metadata. But, that's the point. The value isn't in the files themselves, but in the structure around them. It makes alignment a fixed part of every plan rather than something that happens only when someone remembers to do it.

### The plan lifecycle

Every plan moves through six states. Alignment is the gate: no code gets written until it's complete.

{{< plan-lifecycle >}}

<details class="doc-details">
<summary>Read the six states as a list</summary>

1. _Draft._ The agent writes the first version of the plan. I review it and give feedback until it reads right.
2. _Alignment_. The agent asks me questions until we agree on what to build, why it matters, and how we'll approach it. The outcome is a todo list for the plan. More on this below.
3. _In progress._ Agents work through the todo list. If I introduce a new requirement along the way, it's automatically added to the todo list.
4. _In review_. Once the implementation is completed and waiting for review. This could be an agent review, a human review on GitHub or a similar platform, or CI checks.
5. _Completed._ All PRs associated with the plan have been merged.
6. _Archived._ Any plan can be archived. Archived plans sit behind a collapsed toggle in the board or table view.

</details>

### Alignment: the step that matters most

This is where OpenPlan gets opinionated. Before any code is written, the agent and I need to agree on what we're building, why it's worth building, and how we'll build it (it's okay even if I'm not sure how.)

#### How it works

The agent drafts questions, each with a few options (always with free text option). Intentionally, the agent never makes any decision. The goal is to help develop product and engineering taste, not to take decisions off my plate.

{{< cards cols="2" >}}
{{< card title="The agent owns alignment" >}}It's the agent's job to identify gaps between how I think about the work and how it understands it. I shouldn't have to know what to ask.{{< /card >}}
{{< card title="Easy questions first" >}}Questions start simple and gradually get harder. The harder ones might require me to explain my reasoning, which is often where the real gaps show up.{{< /card >}}
{{< card title=`"Let the agent figure it out" is a valid answer` >}}I won't always know the answer. Every question has an option to hand that decision back to the agent.{{< /card >}}
{{< card title="Short and direct" >}}Questions are written plainly. The entire process should take around 10–15 minutes.{{< /card >}}
{{< card title="The output is a todo list" >}}Once we're aligned, the plan gets a todo list. Every agent working on that plan uses it as the source of truth.{{< /card >}}
{{< /cards >}}

As we work through the questions and agree on the requirements and approach, the alignment score increases. This score determines whether an agent can start implementing the plan.

{{< align-demo >}}

## Why an app and not just a skill?

A skill would get me most of the way there. Something like Matt Pocock's `/grill-me` already makes an agent question you before it starts building, and it works well.

I built an app anyway, for three reasons.

{{< point n="1" title="Good tools build good habits" >}}
I enjoy using well-designed interfaces, and I tend to come back to tools I enjoy. If the alignment process feels good to go through, I'm more likely to do it every time.

Some people might see this as bloat. For me, it helps make the habit stick.
{{< /point >}}

{{< point n="2" title="I want to practise product taste" >}}
OpenPlan is a low-stakes place to experiment with different flows and interactions. At work, I build for enterprise B2B customers, where the stakes are too high to experiment as freely.

Right now, agents can build and iterate quickly, but they're not particularly good at knowing what feels great to use. They can learn from existing interfaces and past design research, but tools for working with agents are still relatively new.

I think their design should come from how people actually work with agents today, rather than from patterns built for a different time.
{{< /point >}}

{{< point n="3" title="Borrowing from products I admire" >}}
For the design, I learned a lot from {{< mention "linear" >}}, which has one of the friendliest interfaces I've used. I also drew inspiration from {{< mention "arc" >}} browser (they have some of the cleanest UX, especially onboarding), {{< mention "xai" >}}'s approach to bots, {{< mention "notion" >}}, {{< mention "openai" >}}, and {{< mention "anthropic" >}}.

I respect the care these teams put into their products, and I wanted to bring some of that thinking into OpenPlan.
{{< /point >}}

### Making plans easier to understand

Long plans are slow to read, and it's easy to miss a misunderstanding buried somewhere in the middle.

To address this, OpenPlan can generate short explainer videos of a plan using Remotion. A video can communicate the main flows much faster than pages of text.

It costs more tokens, but I think that's worth it.

## Trade-offs I'm willing to make

OpenPlan comes with a few trade-offs that I'm happy to accept:

{{< cards cols="2" >}}
{{< card title="More friction" >}}Every plan takes longer to start. I'm trading some speed upfront for fewer problems later.{{< /card >}}
{{< card title="Opinionated by design" >}}Fixed states and fixed personas won't suit every team or every task.{{< /card >}}
{{< card title="Extra token cost" >}}The explainer videos aren't free.{{< /card >}}
{{< card title="Still Markdown underneath" >}}There's no fancy new file format or technology here. The value is in how the system structures the work and changes how I approach it.{{< /card >}}
{{< /cards >}}

## What's next

OpenPlan is still changing. I'll share more as I make progress. Cheers!
