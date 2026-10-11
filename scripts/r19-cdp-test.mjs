#!/usr/bin/env node
// r19-cdp-test.mjs — verify CDP Emulation.setEmulatedMedia plumbing works
// (test with prefers-color-scheme, then try hover variants).
const port = Number(process.argv[2] || 43399);

const ver = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
const ws = new WebSocket(ver.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
};
const send = (method, params, sessionId) => new Promise((res) => {
  const msgId = ++id;
  pending.set(msgId, res);
  ws.send(JSON.stringify({ id: msgId, method, params, ...(sessionId ? { sessionId } : {}) }));
});
const { result: targets } = await send("Target.getTargets");
const page = targets.targetInfos.find(t => t.type === "page" && !t.url.startsWith("chrome://"));
const { result: attached } = await send("Target.attachToTarget", { targetId: page.targetId, flatten: true });
const sid = attached.sessionId;

// test 1: prefers-color-scheme
let r = await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }] }, sid);
console.log("color-scheme call:", JSON.stringify(r).slice(0, 120));
const ev1 = await send("Runtime.evaluate", { expression: "matchMedia('(prefers-color-scheme: dark)').matches" }, sid);
console.log("color-scheme matches:", JSON.stringify(ev1.result?.result));

// test 2: hover variants
r = await send("Emulation.setEmulatedMedia", { features: [
  { name: "hover", value: "hover" },
  { name: "any-hover", value: "hover" },
  { name: "prefers-color-scheme", value: "" },
] }, sid);
console.log("hover call:", JSON.stringify(r).slice(0, 120));
const ev2 = await send("Runtime.evaluate", { expression: "matchMedia('(hover: hover)').matches + '/' + matchMedia('(prefers-color-scheme: dark)').matches" }, sid);
console.log("hover matches/color:", JSON.stringify(ev2.result?.result));
ws.close();
