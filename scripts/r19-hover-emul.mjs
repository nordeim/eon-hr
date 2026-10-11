#!/usr/bin/env node
// r19-hover-emul.mjs — force (hover: hover) + (pointer: fine) media features
// on the agent-browser sessions via CDP Emulation.setEmulatedMedia, so the
// Tailwind v4 hover variants (wrapped in @media (hover: hover)) apply in the
// headless probe browser exactly like a real desktop. Node 24 global
// WebSocket — no deps. Usage: node scripts/r19-hover-emul.mjs <port> [...]
const ports = process.argv.slice(2).map(Number);
if (!ports.length) { console.error("usage: node r19-hover-emul.mjs <cdp-port> [...]"); process.exit(1); }

async function emulateOnPort(port) {
  // browser-level endpoint
  const ver = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
  const browserWs = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((res, rej) => { browserWs.onopen = res; browserWs.onerror = rej; });
  let id = 0;
  const pending = new Map();
  browserWs.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  };
  const send = (method, params, sessionId) => new Promise((res) => {
    const msgId = ++id;
    pending.set(msgId, res);
    browserWs.send(JSON.stringify({ id: msgId, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
  const { result: targets } = await send("Target.getTargets");
  const pages = targets.targetInfos.filter(t => t.type === "page");
  for (const t of pages) {
    const { result: attached } = await send("Target.attachToTarget", { targetId: t.targetId, flatten: true });
    const r = await send("Emulation.setEmulatedMedia", {
      features: [
        { name: "hover", value: "hover" },
        { name: "pointer", value: "fine" },
        { name: "any-hover", value: "hover" },
        { name: "any-pointer", value: "fine" },
      ],
    }, attached.sessionId);
    console.log(`port ${port} :: ${t.url.slice(0, 60)} -> ${r && r.error ? "ERR " + r.error.message : "emulated (hover:hover, pointer:fine)"}`);
  }
  browserWs.close();
}

for (const p of ports) {
  try { await emulateOnPort(p); } catch (e) { console.log(`port ${p} FAILED: ${String(e).slice(0, 120)}`); }
}
