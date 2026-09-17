# v0.3.0
# { "Depends": "py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng" }

import genlayer as gl
from genlayer.types import *

class RightToWait(gl.contract.Contract):
    action: str
    status: str
    challenger: str
    wait_reason: str
    evidence_before: str
    evidence_after: str
    verdict: str
    judgment: str

    def __init__(self, action: str, evidence_before: str):
        self.action = action
        self.evidence_before = evidence_before
        self.status = "PENDING"
        self.challenger = ""
        self.wait_reason = ""
        self.evidence_after = ""
        self.verdict = "UNRESOLVED"
        self.judgment = ""

    @gl.public.view
    def get_action(self) -> str:
        return self.action

    @gl.public.view
    def get_status(self) -> str:
        return self.status

    @gl.public.view
    def get_verdict(self) -> str:
        return self.verdict

    @gl.public.view
    def get_judgment(self) -> str:
        return self.judgment

    @gl.public.view
    def get_wait_reason(self) -> str:
        return self.wait_reason

    @gl.public.write
    def request_wait(self, challenger: str, reason: str) -> None:
        if self.status != "PENDING":
            raise Exception("Action is not pending")
        self.challenger = challenger
        self.wait_reason = reason
        self.status = "PAUSED"

    @gl.public.write
    def submit_new_evidence(self, evidence: str) -> None:
        if self.status != "PAUSED":
            raise Exception("Action is not paused")
        if not evidence:
            raise Exception("Evidence cannot be empty")
        self.evidence_after = evidence
        self.status = "EVIDENCE_RECEIVED"

    @gl.public.write
    def resolve_wait(self) -> None:
        if self.status != "EVIDENCE_RECEIVED":
            raise Exception("New evidence must be submitted before resolution")

        action = self.action
        evidence_before = self.evidence_before
        wait_reason = self.wait_reason
        evidence_after = self.evidence_after

        def evaluate_wait() -> str:
            prompt = f"""
You are evaluating an autonomous-agent delay challenge.

ORIGINAL ACTION:
{action}

INFORMATION AVAILABLE WHEN THE ACTION WAS PROPOSED:
{evidence_before}

REASON ANOTHER AGENT REQUESTED A DELAY:
{wait_reason}

NEW EVIDENCE THAT ARRIVED DURING THE DELAY:
{evidence_after}

Determine whether the delay was justified.

A delay is JUSTIFIED only when the new evidence is materially relevant to
the original action and could reasonably change whether, when, or how the
action should execute.

A delay is UNJUSTIFIED when the new evidence is irrelevant, trivial,
duplicative, or would not reasonably affect the original decision.

Return exactly this structure:

VERDICT: JUSTIFIED or UNJUSTIFIED
REASON: one concise sentence explaining why.
"""
            return gl.nondet.exec_prompt(prompt).strip()

        result = gl.eq_principle.prompt_comparative(
            evaluate_wait,
            """
The VERDICT must agree on whether the new evidence materially affects the
original action. JUSTIFIED and UNJUSTIFIED are not equivalent.
The reason may use different wording but must rely only on the supplied
action, original information, challenge reason, and new evidence.
"""
        )

        self.judgment = result
        normalized = result.upper()

        if "VERDICT: JUSTIFIED" in normalized:
            self.verdict = "JUSTIFIED"
            self.status = "RECONSIDER"
        elif "VERDICT: UNJUSTIFIED" in normalized:
            self.verdict = "UNJUSTIFIED"
            self.status = "EXECUTE"
        else:
            self.verdict = "INCONCLUSIVE"
            self.status = "REVIEW_REQUIRED"