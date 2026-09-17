import { useEffect, useState } from "react";
import { createClient, isSuccessful } from "genlayer-js";
import { studioDevnet } from "genlayer-js/chains";
import "./App.css";

const CONTRACT_ADDRESS =
  "0xF2B2bF474C8d195550d01e2fF7c3de78181b0Fe8" as `0x${string}`;

const client = createClient({
  chain: studioDevnet,
});

type ProtocolState = {
  action: string;
  status: string;
  verdict: string;
  waitReason: string;
  judgment: string;
};

const initialState: ProtocolState = {
  action: "",
  status: "",
  verdict: "",
  waitReason: "",
  judgment: "",
};

function App() {
  const [wallet, setWallet] = useState("");
const [txStatus, setTxStatus] = useState("");
const [newEvidence, setNewEvidence] = useState(
  "New market information indicates significantly increased execution risk that was not available when the original action was proposed."
);
async function connectWallet() {
  try {
    const ethereum = (window as any).ethereum;

    if (!ethereum) {
      throw new Error("No browser wallet detected.");
    }

    const accounts = (await ethereum.request({
      method: "eth_requestAccounts",
    })) as string[];

    if (!accounts[0]) {
      throw new Error("No wallet account returned.");
    }

    const walletAddress = accounts[0] as `0x${string}`;

    const chainIdHex = "0xF22D"; // 61997

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainIdHex,
              chainName: "GenLayer Studio Dev",
              nativeCurrency: {
                name: "GEN",
                symbol: "GEN",
                decimals: 18,
              },
              rpcUrls: ["https://studio-dev.genlayer.com/api"],
              blockExplorerUrls: [
                "https://explorer-studio-dev.genlayer.com",
              ],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }

    setWallet(walletAddress);
    setTxStatus("Wallet connected to GenLayer Studio Dev");
  } catch (err) {
    console.error(err);

    setTxStatus(
      err instanceof Error
        ? err.message
        : JSON.stringify(err, null, 2)
    );
  }
}
async function requestWait() {
  try {
    const ethereum = (window as any).ethereum;

    if (!ethereum) {
      throw new Error("Connect a browser wallet first.");
    }

    if (!wallet) {
      throw new Error("Connect your wallet first.");
    }

    setTxStatus("Preparing challenge…");

    const walletClient = createClient({
      chain: studioDevnet,
      account: wallet as `0x${string}`,
      provider: ethereum,
    });

    const write = {
      address: CONTRACT_ADDRESS,
      functionName: "request_wait",
      args: [
        "Sentinel Agent",
        "New conflicting evidence may materially change whether this action should execute.",
      ],
    };

    const estimate =
      await walletClient.estimateTransactionFeesForWrite(write);

    setTxStatus("Confirm transaction in your wallet…");

    const txId = await walletClient.writeContract({
      ...write,
      fees: {
        distribution: estimate.distribution,
        feeValue: estimate.feeValue,
      },
    });

    setTxStatus(
      `Submitted ${txId.slice(0, 10)}… Waiting for GenLayer…`
    );

    const transaction = await walletClient.waitForFinalization({
      hash: txId,
    });

    if (!isSuccessful(transaction)) {
      throw new Error(
        `Transaction finalized but execution failed: ${transaction.statusName} / ${transaction.txExecutionResultName}`
      );
    }

    setTxStatus("Challenge accepted — action paused.");
    await loadProtocol();
  } catch (err) {
    console.error("requestWait failed:", err);

    setTxStatus(
      err instanceof Error
        ? err.message
        : JSON.stringify(err, null, 2)
    );
  }
}

async function submitEvidence() {
  try {
    const ethereum = (window as any).ethereum;

    if (!ethereum) {
      throw new Error("No browser wallet detected.");
    }

    if (!wallet) {
      throw new Error("Connect your wallet first.");
    }

    if (!newEvidence.trim()) {
      throw new Error("Evidence cannot be empty.");
    }

    setTxStatus("Preparing evidence transaction…");

    const walletClient = createClient({
      chain: studioDevnet,
      account: wallet as `0x${string}`,
      provider: ethereum,
    });

    const write = {
      address: CONTRACT_ADDRESS,
      functionName: "submit_new_evidence",
      args: [newEvidence.trim()],
    };

    const estimate =
      await walletClient.estimateTransactionFeesForWrite(write);

    setTxStatus("Confirm evidence transaction in your wallet…");

    const txId = await walletClient.writeContract({
      ...write,
      fees: {
        distribution: estimate.distribution,
        feeValue: estimate.feeValue,
      },
    });

    setTxStatus(
      `Evidence submitted ${txId.slice(0, 10)}… Waiting for GenLayer…`
    );

    const transaction = await walletClient.waitForFinalization({
      hash: txId,
    });

    if (!isSuccessful(transaction)) {
      throw new Error(
        `Transaction failed: ${transaction.statusName} / ${transaction.txExecutionResultName}`
      );
    }

    setTxStatus("New evidence accepted on-chain.");
    await loadProtocol();
  } catch (err) {
    console.error("submitEvidence failed:", err);

    setTxStatus(
      err instanceof Error
        ? err.message
        : JSON.stringify(err, null, 2)
    );
  }
}

async function resolveWait() {
  try {
    const ethereum = (window as any).ethereum;

    if (!ethereum) {
      throw new Error("No browser wallet detected.");
    }

    if (!wallet) {
      throw new Error("Connect your wallet first.");
    }

    setTxStatus("Preparing GenLayer judgment…");

    const walletClient = createClient({
      chain: studioDevnet,
      account: wallet as `0x${string}`,
      provider: ethereum,
    });

    const write = {
      address: CONTRACT_ADDRESS,
      functionName: "resolve_wait",
      args: [],
    };

    const estimate =
      await walletClient.estimateTransactionFeesForWrite(write);

    setTxStatus("Confirm judgment transaction in your wallet…");

    const txId = await walletClient.writeContract({
      ...write,
      fees: {
        distribution: estimate.distribution,
        feeValue: estimate.feeValue,
      },
    });

    setTxStatus(
      `Judgment requested ${txId.slice(0, 10)}… GenLayer validators are reasoning…`
    );

    const transaction = await walletClient.waitForFinalization({
      hash: txId,
    });

    if (!isSuccessful(transaction)) {
      throw new Error(
        `Judgment failed: ${transaction.statusName} / ${transaction.txExecutionResultName}`
      );
    }

    setTxStatus("GenLayer consensus finalized.");
    await loadProtocol();
  } catch (err) {
    console.error("resolveWait failed:", err);

    setTxStatus(
      err instanceof Error
        ? err.message
        : JSON.stringify(err, null, 2)
    );
  }
}
    
  const [data, setData] = useState<ProtocolState>(initialState);
  const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

  async function loadProtocol() {
    setLoading(true);
    setError("");

    try {
      const [action, status, verdict, waitReason, judgment] =
        await Promise.all([
          client.readContract({
            address: CONTRACT_ADDRESS,
            functionName: "get_action",
            args: [],
          }),
          client.readContract({
            address: CONTRACT_ADDRESS,
            functionName: "get_status",
            args: [],
          }),
          client.readContract({
            address: CONTRACT_ADDRESS,
            functionName: "get_verdict",
            args: [],
          }),
          client.readContract({
            address: CONTRACT_ADDRESS,
            functionName: "get_wait_reason",
            args: [],
          }),
          client.readContract({
            address: CONTRACT_ADDRESS,
            functionName: "get_judgment",
            args: [],
          }),
        ]);

      setData({
        action: String(action),
        status: String(status),
        verdict: String(verdict),
        waitReason: String(waitReason),
        judgment: String(judgment),
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProtocol();
  }, []);

return (
  <main className="shell">
    <nav>
      <div className="brand">
        <span className="mark">Ⅱ</span>
        RIGHT TO WAIT
      </div>

      <div className="network">
        <span className="networkDot" />
        LIVE · GENLAYER STUDIO DEV
      </div>
    </nav>

    <section className="hero">
      <p className="eyebrow">AUTONOMOUS PAUSE PROTOCOL</p>

      <h1>
        Some decisions are
        <br />
        worth <span>waiting for.</span>
      </h1>

      <p className="intro">
        Right to Wait gives autonomous agents a protocol for challenging
        pending actions when new evidence could materially change what
        should happen next.
      </p>
    </section>

    {loading ? (
      <section className="actionCard">
        <p className="label">READING ON-CHAIN STATE</p>
        <h2>Connecting to GenLayer…</h2>
      </section>
    ) : error ? (
      <section className="errorBox">
        <p className="label">PROTOCOL UNAVAILABLE</p>
        <p>{error}</p>
        <button onClick={loadProtocol}>TRY AGAIN</button>
      </section>
    ) : (
      <>
        <section className="actionCard">
          <div className="cardTop">
            <div>
              <p className="label">AUTONOMOUS ACTION</p>
              <h2>{data.action}</h2>
            </div>

            <span className="status">{data.status}</span>
          </div>

          <div className="flow">
            <span
              className={
                data.status === "PENDING" ? "active" : undefined
              }
            >
              PENDING
            </span>

            <i />

            <span
              className={
                data.status === "PAUSED" ? "active" : undefined
              }
            >
              PAUSED
            </span>

            <i />

            <span
              className={
                data.status === "EVIDENCE_RECEIVED"
                  ? "active"
                  : undefined
              }
            >
              EVIDENCE
            </span>

            <i />

            <span
              className={
                data.status === "RECONSIDER" ||
                data.status === "EXECUTE"
                  ? "active"
                  : undefined
              }
            >
              JUDGMENT
            </span>

            <i />

            <span
              className={
                data.status === "RECONSIDER" ||
                data.status === "EXECUTE"
                  ? "active"
                  : undefined
              }
            >
              OUTCOME
            </span>
          </div>
        </section>

        {(data.waitReason ||
          data.status === "PENDING" ||
          data.status === "PAUSED" ||
          data.status === "EVIDENCE_RECEIVED") && (
          <section className="grid">
            <article>
              <p className="label">CHALLENGE</p>
              <h3>Should this action wait?</h3>

              <p className="body">
                {data.waitReason ||
                  "Another autonomous agent can challenge this action before execution when it believes waiting for new evidence could materially change the decision."}
              </p>

              <div className="agent">
                <span>S</span>

                <div>
                  <small>CHALLENGER</small>
                  <strong>Sentinel Agent</strong>
                </div>
              </div>
            </article>

            <article>
              <p className="label">DECENTRALIZED JUDGMENT</p>
              <h3>Evidence, not authority.</h3>

              <p className="body">
                GenLayer validators independently evaluate whether the
                evidence that arrived during the delay is materially
                relevant to the original autonomous action.
              </p>

              <div className="agent">
                <span>G</span>

                <div>
                  <small>DECISION LAYER</small>
                  <strong>GenLayer Consensus</strong>
                </div>
              </div>
            </article>
          </section>
        )}

        <section className="protocolControls">
          <div className="controlHeader">
            <div>
              <p className="label">LIVE PROTOCOL CONTROL</p>

              <h3>
                {data.status === "PENDING" &&
                  "Challenge the pending action"}

                {data.status === "PAUSED" &&
                  "Submit the evidence that arrived"}

                {data.status === "EVIDENCE_RECEIVED" &&
                  "Evidence received — ready for judgment"}

                {data.status === "RECONSIDER" &&
                  "Consensus reached"}

                {data.status === "EXECUTE" &&
                  "Consensus reached"}

                {data.status === "REVIEW_REQUIRED" &&
                  "Human review required"}
              </h3>
            </div>

            {wallet && (
              <span className="walletBadge">
                ● {wallet.slice(0, 6)}…{wallet.slice(-4)}
              </span>
            )}
          </div>

          {!wallet &&
            ["PENDING", "PAUSED", "EVIDENCE_RECEIVED"].includes(
              data.status
            ) && (
              <button
                className="primaryButton"
                onClick={connectWallet}
              >
                CONNECT WALLET
              </button>
            )}

          {wallet && data.status === "PENDING" && (
            <button
              className="primaryButton"
              onClick={requestWait}
            >
              REQUEST WAIT
            </button>
          )}

          {wallet && data.status === "PAUSED" && (
            <div className="evidenceControl">
              <label htmlFor="newEvidence">
                NEW EVIDENCE
              </label>

              <textarea
                id="newEvidence"
                value={newEvidence}
                onChange={(event) =>
                  setNewEvidence(event.target.value)
                }
                rows={5}
              />

              <button
                className="primaryButton"
                onClick={submitEvidence}
              >
                SUBMIT EVIDENCE
              </button>
            </div>
          )}

          {wallet &&
            data.status === "EVIDENCE_RECEIVED" && (
              <div>
                <div className="readyState">
                  <span>✓</span>
                  Evidence is stored on-chain. GenLayer can now
                  judge whether the delay was justified.
                </div>

                <button
                  className="primaryButton"
                  onClick={resolveWait}
                  style={{ marginTop: "16px" }}
                >
                  ASK GENLAYER TO JUDGE
                </button>
              </div>
            )}

          {txStatus && (
            <p className="txStatus">{txStatus}</p>
          )}
        </section>

        {(data.status === "RECONSIDER" ||
          data.status === "EXECUTE" ||
          data.status === "REVIEW_REQUIRED") && (
          <section className="judgment">
            <div className="judgmentHeader">
              <div>
                <p className="label">
                  GENLAYER CONSENSUS
                </p>
                <h2>Decentralized judgment</h2>
              </div>

              <div className="verdict">
                <small>VERDICT</small>
                <strong>{data.verdict}</strong>
              </div>
            </div>

            <blockquote>
              {data.judgment ||
                "Consensus finalized without an additional judgment message."}
            </blockquote>

            <div className="outcome">
              <span>PROTOCOL OUTCOME</span>
              <strong>{data.status}</strong>
            </div>
          </section>
        )}
      </>
    )}

    <footer>
      <div>
        <span>CONTRACT</span>
        <code>
          {CONTRACT_ADDRESS.slice(0, 10)}…
          {CONTRACT_ADDRESS.slice(-8)}
        </code>
      </div>

      <div>
        <span>CHAIN 61997</span>
      </div>

      <a
        href={`https://explorer-studio-dev.genlayer.com/address/${CONTRACT_ADDRESS}`}
        target="_blank"
        rel="noreferrer"
      >
        VIEW ON STUDIO DEV EXPLORER ↗
      </a>
    </footer>
  </main>
);
}

export default App;