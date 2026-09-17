\# Right to Wait



> \*\*Some decisions are worth waiting for.\*\*



Right to Wait is an autonomous pause protocol built on GenLayer. It lets one autonomous agent challenge another agent's pending action when waiting for new evidence could materially change what should happen next.



Instead of relying on a single server to decide whether a delay was worthwhile, GenLayer validators independently reason over the original action, the challenge, and the new evidence. Consensus determines whether the delay was justified and writes the resulting outcome on-chain.



\## The Problem



Autonomous agents are optimized to act.



But irreversible actions can be dangerous when important information is still changing. An agent may be ready to execute while another agent has reason to believe that waiting could materially change the decision.



Traditional smart contracts can enforce deterministic conditions, but they cannot easily judge whether new natural-language evidence is actually relevant enough to justify delaying an autonomous action.



\*\*Right to Wait introduces a protocol primitive for that decision.\*\*



\## How It Works



The protocol follows this state machine:



```text

PENDING

&#x20;  ↓

PAUSED

&#x20;  ↓

EVIDENCE\_RECEIVED

&#x20;  ↓

GENLAYER JUDGMENT

&#x20;  ↓

┌───────────────────────┐

│                       │

JUSTIFIED          UNJUSTIFIED

&#x20;  ↓                       ↓

RECONSIDER              EXECUTE

```



1\. An autonomous action begins in `PENDING`.

2\. Another agent calls `request\_wait()` with its reason for challenging the action.

3\. The protocol moves to `PAUSED`.

4\. New evidence is submitted on-chain using `submit\_new\_evidence()`.

5\. The protocol moves to `EVIDENCE\_RECEIVED`.

6\. `resolve\_wait()` asks GenLayer validators to judge whether the new evidence materially affects the original action.

7\. GenLayer consensus produces a structured verdict.

8\. A justified delay produces `RECONSIDER`; an unjustified delay produces `EXECUTE`.



\## Demo Scenario



The demo models an autonomous treasury agent preparing to:



> \*\*Buy 10 ETH for the autonomous treasury.\*\*



The information initially available to the agent supports immediate execution.



A \*\*Sentinel Agent\*\* challenges the action because new conflicting evidence may materially change whether it should execute.



During the delay, new information arrives indicating significantly increased execution risk.



GenLayer validators then determine whether that evidence is materially relevant to the original decision.



A completed reference run reached:



```text

VERDICT: JUSTIFIED

```



and the protocol transitioned to:



```text

RECONSIDER

```



\## Why GenLayer?



The core decision in Right to Wait is not a deterministic calculation.



The protocol must judge questions such as:



\- Is the new evidence actually relevant to the original action?

\- Is it material rather than trivial or duplicative?

\- Could it reasonably change whether, when, or how the action should execute?



These questions require reasoning over unstructured information.



Right to Wait uses a GenLayer Intelligent Contract and decentralized validator consensus to evaluate the evidence. The contract uses `gl.nondet.exec\_prompt()` for the judgment and `gl.eq\_principle.prompt\_comparative()` to establish agreement on the material outcome.



The resulting judgment is stored as meaningful contract state and directly determines the protocol's next state.



\## Live GenLayer Deployments



\### Interactive Deployment



This fresh Studio Dev deployment is connected to the frontend and begins in `PENDING`, allowing reviewers to try the protocol.



\*\*Contract\*\*



```text

0xF2B2bF474C8d195550d01e2fF7c3de78181b0Fe8

```



\*\*Explorer\*\*



https://explorer-studio-dev.genlayer.com/address/0xF2B2bF474C8d195550d01e2fF7c3de78181b0Fe8



\### Completed Consensus Reference



This deployment records a completed end-to-end execution that successfully reached GenLayer consensus.



\*\*Contract\*\*



```text

0x59F840B0Ed7D6b901f7F9c0a67dc82BF4766219E

```



\*\*Explorer\*\*



https://explorer-studio-dev.genlayer.com/address/0x59F840B0Ed7D6b901f7F9c0a67dc82BF4766219E



\*\*Final outcome\*\*



```text

JUSTIFIED → RECONSIDER

```



\*\*Studio Dev chain ID:\*\* `61997`



\## Repository Structure



```text

RightToWait/

├── contract/

│   └── right\_to\_wait.py

├── frontend/

├── .gitignore

└── README.md

```



`contract/right\_to\_wait.py` contains the GenLayer Intelligent Contract.



`frontend/` contains the React + TypeScript application that reads live contract state and submits protocol transactions.



\## Run Locally



\### Requirements



\- Node.js

\- npm

\- Browser wallet

\- GenLayer Studio Dev test GEN



Clone the repository and enter the frontend:



```bash

git clone https://github.com/0xBaqi/right-to-wait.git

cd right-to-wait/frontend

```



Install dependencies:



```bash

npm install

```



Start the development server:



```bash

npm run dev

```



Create a production build:



```bash

npm run build

```



\## Reproduce the Protocol Flow



1\. Open the frontend.

2\. Click \*\*CONNECT WALLET\*\*.

3\. Approve GenLayer Studio Dev in the wallet if prompted.

4\. Ensure the wallet contains Studio Dev test GEN.

5\. Click \*\*REQUEST WAIT\*\*.

6\. Confirm the transaction.

7\. Wait for the contract state to become `PAUSED`.

8\. Submit the new evidence.

9\. Confirm the evidence transaction.

10\. Wait for the state to become `EVIDENCE\_RECEIVED`.

11\. Click \*\*ASK GENLAYER TO JUDGE\*\*.

12\. Confirm the transaction.

13\. Wait for GenLayer validators to reach consensus.

14\. Refresh the application if finalization takes longer than the frontend wait period.

15\. Inspect the verdict, GenLayer judgment, protocol outcome, and Studio Dev explorer.



The expected demo path for the supplied evidence is:



```text

PENDING

→ PAUSED

→ EVIDENCE\_RECEIVED

→ GenLayer consensus

→ JUSTIFIED

→ RECONSIDER

```



Because the final judgment is produced through decentralized reasoning, reviewers should inspect the returned consensus result rather than assume a hard-coded verdict.



\## Intelligent Contract



\### Read Methods



\- `get\_action()`

\- `get\_status()`

\- `get\_verdict()`

\- `get\_judgment()`

\- `get\_wait\_reason()`



\### Write Methods



\- `request\_wait(challenger, reason)`

\- `submit\_new\_evidence(evidence)`

\- `resolve\_wait()`



\## What Is Stored On-Chain?



The Intelligent Contract maintains meaningful protocol state including:



\- autonomous action

\- original evidence

\- challenger

\- challenge reason

\- new evidence

\- current protocol status

\- consensus verdict

\- GenLayer judgment



The decentralized judgment therefore does not merely decorate the frontend — it controls whether the protocol transitions toward `RECONSIDER`, `EXECUTE`, or `REVIEW\_REQUIRED`.



\## Tech Stack



\- \*\*GenLayer Intelligent Contracts\*\*

\- \*\*GenLayer Studio Dev\*\*

\- \*\*genlayer-js\*\*

\- \*\*React\*\*

\- \*\*TypeScript\*\*

\- \*\*Vite\*\*



\## Current Scope



This prototype demonstrates the core autonomous pause primitive:



\*\*challenge → delay → new evidence → decentralized judgment → protocol outcome\*\*



The original Right to Wait concept also envisions an economic layer in which agents can bond value or economically purchase time for a challenged action.



That economic settlement layer is \*\*not implemented in this prototype\*\*. The current implementation focuses on proving the underlying GenLayer-native judgment and state-transition mechanism.



\## Track



Built for the \*\*Autonomous Protocols\*\* track of the GenLayer Agent Tank hackathon.



\---



\*\*Right to Wait\*\*



\*Because sometimes the most valuable action an autonomous agent can take is not acting yet.\*

