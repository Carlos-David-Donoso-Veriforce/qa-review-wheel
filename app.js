(function () {
  "use strict";

  const CONFIG = Object.assign(
    { team: [], away: [], asanaProjectId: "", asanaProjectEmail: "", emailPattern: "", dueInBusinessDays: 2 },
    window.WHEEL_CONFIG || {}
  );

  const TAU = Math.PI * 2;
  // Full-strength brand colours, with the text colour that reads on each.
  const SEGMENTS = [
    { fill: "#215bea", text: "#ffffff" }, // Veriforce Blue
    { fill: "#002a42", text: "#ffffff" }, // Ink Blue
    { fill: "#6da6f7", text: "#002a42" }, // Aero Blue
    { fill: "#d7e6f5", text: "#002a42" }, // Mist Blue
  ];
  const CONFETTI_COLOURS = ["#215bea", "#6da6f7", "#00ac42", "#d7e6f5", "#002a42"];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (id) => document.getElementById(id);
  const form = $("assetForm");
  const author = $("author");
  const assetName = $("assetName");
  const description = $("description");
  const assetLink = $("assetLink");
  const dueDate = $("dueDate");
  const canvas = $("wheel");
  const ctx = canvas.getContext("2d");
  const wrap = $("wheelWrap");
  const pointer = $("pointer");
  const spinBtn = $("spinBtn");
  const status = $("status");
  const soundToggle = $("soundToggle");
  const result = $("result");
  const resultName = $("resultName");
  const resultAsset = $("resultAsset");
  const resultStatus = $("resultStatus");
  const emailBtn = $("emailBtn");
  const taskLink = $("taskLink");
  const asanaState = $("asanaState");
  const asanaBtn = $("asanaBtn");
  const connect = $("connect");
  const connectForm = $("connectForm");
  const tokenInput = $("tokenInput");
  const connectError = $("connectError");
  const connectSubmit = $("connectSubmit");
  const connectCancel = $("connectCancel");
  const doneBtn = $("doneBtn");

  const team = CONFIG.team.map((n) => String(n).trim()).filter(Boolean);
  const away = new Set(CONFIG.away.map((n) => String(n).trim()));

  let rotation = 0;
  let spinning = false;
  let candidates = [];
  let colours = [];
  let lastSubmission = null;

  /* ---------- Storage (per-browser conveniences only) ---------- */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
    remove(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
  };

  /* ---------- Form setup ---------- */
  team.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    author.appendChild(opt);
  });
  const remembered = store.get("qaWheel.author");
  if (remembered && team.includes(remembered)) author.value = remembered;

  function addBusinessDays(date, days) {
    const d = new Date(date);
    while (days > 0) {
      d.setDate(d.getDate() + 1);
      const day = d.getDay();
      if (day !== 0 && day !== 6) days--;
    }
    return d;
  }
  const isoDate = (d) => [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
  function resetDueDate() {
    dueDate.value = isoDate(addBusinessDays(new Date(), CONFIG.dueInBusinessDays));
    dueDate.min = isoDate(new Date());
  }
  resetDueDate();

  function formIsValid() {
    return author.value && assetName.value.trim() && description.value.trim() && dueDate.value &&
      (!assetLink.value.trim() || assetLink.checkValidity());
  }

  /* ---------- Wheel ---------- */
  function pickColours(n) {
    // Cycle the palette, then make sure the last slice never matches the first.
    const out = [];
    for (let i = 0; i < n; i++) out.push(SEGMENTS[i % SEGMENTS.length]);
    if (n > 1 && (out[n - 1] === out[0] || out[n - 1] === out[n - 2])) {
      out[n - 1] = SEGMENTS.find((s) => s !== out[0] && s !== out[n - 2]);
    }
    return out;
  }

  function updateCandidates() {
    candidates = team.filter((n) => !away.has(n) && n !== author.value);
    colours = pickColours(candidates.length);
    drawWheel();
  }

  function fitText(text, maxWidth, size) {
    let s = size;
    ctx.font = `500 ${s}px "Instrument Sans", Arial, sans-serif`;
    while (ctx.measureText(text).width > maxWidth && s > 20) {
      s -= 2;
      ctx.font = `500 ${s}px "Instrument Sans", Arial, sans-serif`;
    }
    if (ctx.measureText(text).width <= maxWidth) return text;
    let t = text;
    while (t.length > 1 && ctx.measureText(t + "…").width > maxWidth) t = t.slice(0, -1);
    return t + "…";
  }

  function drawWheel() {
    const size = canvas.width;
    const r = size / 2;
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(r, r);
    ctx.rotate(rotation);

    const n = candidates.length;
    if (n === 0) {
      ctx.fillStyle = "#d7e6f5";
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.fill();
      ctx.restore();
      return;
    }

    const seg = TAU / n;
    for (let i = 0; i < n; i++) {
      // Slice i starts at 12 o'clock and runs clockwise.
      const start = -Math.PI / 2 + i * seg;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, start, start + seg);
      ctx.closePath();
      ctx.fillStyle = colours[i].fill;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.save();
      ctx.rotate(start + seg / 2);
      ctx.fillStyle = colours[i].text;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      const maxW = r * 0.68;
      const fontSize = Math.min(44, Math.max(24, (seg * r * 0.55)));
      const label = fitText(candidates[i], maxW, fontSize);
      ctx.fillText(label, r - 36, 2);
      ctx.restore();
    }

    // Outer keyline ring.
    ctx.beginPath();
    ctx.arc(0, 0, r - 4, 0, TAU);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.restore();
  }

  function indexAtPointer(rot) {
    const n = candidates.length;
    const a = ((-rot % TAU) + TAU) % TAU;
    return Math.floor(a / (TAU / n)) % n;
  }

  /* ---------- Ready state ---------- */
  function refresh() {
    if (spinning) return;
    const ready = formIsValid() && candidates.length > 0;
    spinBtn.disabled = !ready;
    wrap.classList.toggle("is-ready", ready);
    wrap.tabIndex = ready ? 0 : -1;
    wrap.setAttribute("role", "button");
    wrap.setAttribute("aria-disabled", String(!ready));
    wrap.setAttribute("aria-label", ready ? "Spin the wheel" : "Wheel locked until the form is complete");
    if (team.length === 0) status.textContent = "No team members yet. Add names in config.js.";
    else if (candidates.length === 0 && author.value) status.textContent = "Nobody is available to review right now.";
    else status.textContent = ready ? "Ready. Click the wheel or the button to spin." : "Fill in the form to unlock the wheel.";
  }

  author.addEventListener("change", () => {
    store.set("qaWheel.author", author.value);
    updateCandidates();
    refresh();
  });
  [assetName, description, assetLink, dueDate].forEach((el) => el.addEventListener("input", refresh));

  /* ---------- Sound (generated, no audio files) ---------- */
  let audio = null;
  let soundOn = store.get("qaWheel.sound") !== "off";
  function setSoundLabel() {
    soundToggle.textContent = soundOn ? "Sound on" : "Sound off";
    soundToggle.setAttribute("aria-pressed", String(soundOn));
  }
  setSoundLabel();
  soundToggle.addEventListener("click", () => {
    soundOn = !soundOn;
    store.set("qaWheel.sound", soundOn ? "on" : "off");
    setSoundLabel();
  });

  function audioCtx() {
    if (!audio) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audio = new AC();
    }
    if (audio.state === "suspended") audio.resume();
    return audio;
  }

  function tick() {
    const ac = soundOn && audioCtx();
    if (!ac) return;
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(1500, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.03);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  function fanfare() {
    const ac = soundOn && audioCtx();
    if (!ac) return;
    const t0 = ac.currentTime + 0.05;
    // C5 E5 G5, then a held C6 chord: the classic "ta-da".
    const notes = [[523.25, 0, 0.12], [659.25, 0.12, 0.12], [783.99, 0.24, 0.12], [1046.5, 0.38, 0.7], [783.99, 0.38, 0.7], [659.25, 0.38, 0.7]];
    notes.forEach(([f, at, len]) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "triangle";
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.0001, t0 + at);
      gain.gain.exponentialRampToValueAtTime(0.16, t0 + at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + at + len);
      osc.connect(gain).connect(ac.destination);
      osc.start(t0 + at);
      osc.stop(t0 + at + len + 0.05);
    });
  }

  /* ---------- Spin ---------- */
  function secureRandom() {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return a[0] / 4294967296;
  }

  const easeOut = (t) => 1 - Math.pow(1 - t, 4);

  function spin() {
    if (spinning || !formIsValid() || candidates.length === 0) return;
    spinning = true;
    audioCtx(); // unlock audio on the click
    form.classList.add("is-locked");
    [author, assetName, description, assetLink, dueDate].forEach((el) => (el.disabled = true));
    spinBtn.disabled = true;
    wrap.classList.remove("is-ready");
    wrap.classList.add("is-spinning");
    status.textContent = "Spinning…";

    const n = candidates.length;
    const seg = TAU / n;
    const winner = Math.floor(secureRandom() * n);
    // Land somewhere inside the winner's slice, away from the edges.
    const landing = (winner + 0.15 + secureRandom() * 0.7) * seg;
    const spins = reduceMotion ? 1 : 6 + Math.floor(secureRandom() * 3);
    const start = rotation;
    const base = Math.ceil(start / TAU) * TAU;
    const target = base + spins * TAU + (TAU - landing);
    const duration = reduceMotion ? 1200 : 5200 + secureRandom() * 1200;
    const t0 = performance.now();
    let lastIndex = indexAtPointer(start);

    function frame(now) {
      const t = Math.min(1, (now - t0) / duration);
      rotation = start + (target - start) * easeOut(t);
      drawWheel();
      const idx = indexAtPointer(rotation);
      if (idx !== lastIndex) {
        lastIndex = idx;
        tick();
        pointer.classList.remove("is-flick");
        void pointer.getBoundingClientRect();
        pointer.classList.add("is-flick");
      }
      if (t < 1) requestAnimationFrame(frame);
      else finish(candidates[indexAtPointer(rotation)]);
    }
    requestAnimationFrame(frame);
  }

  spinBtn.addEventListener("click", spin);
  wrap.addEventListener("click", spin);
  wrap.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); spin(); }
  });

  /* ---------- Result + handoff ---------- */
  function formatDue(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });
  }

  function finish(reviewer) {
    spinning = false;
    wrap.classList.remove("is-spinning");
    fanfare();
    confetti();

    lastSubmission = {
      author: author.value,
      reviewer: reviewer,
      assetName: assetName.value.trim(),
      description: description.value.trim(),
      link: assetLink.value.trim(),
      dueDate: dueDate.value,
    };

    resultName.textContent = reviewer;
    resultAsset.textContent = `will review "${lastSubmission.assetName}" by\u00a0${formatDue(lastSubmission.dueDate).replace(/ /g, "\u00a0")}.`;
    status.textContent = `${reviewer} was picked.`;
    result.hidden = false;
    doneBtn.focus();

    taskLink.hidden = true;
    emailBtn.hidden = true;
    if (asanaToken && CONFIG.asanaProjectId) createTask();
    else showEmail(`Last step: send the email to let ${reviewer} know. Connect Asana and the wheel will create the task for you next time.`);
  }

  async function createTask() {
    const s = lastSubmission;
    const reviewerEmail = emailFor(s.reviewer);
    setResultStatus("Creating the task in Asana…");
    const notes = [
      `Author: ${s.author}`,
      `What to check: ${s.description}`,
      s.link ? `Link: ${s.link}` : null,
      "",
      "Picked by the QA Review Wheel.",
    ].filter((line) => line !== null).join("\n");
    try {
      const task = await asanaFetch("/tasks?opt_fields=permalink_url", {
        method: "POST",
        body: JSON.stringify({
          data: {
            name: `QA review: ${s.assetName}`,
            notes: notes,
            assignee: reviewerEmail,
            due_on: s.dueDate,
            projects: [CONFIG.asanaProjectId],
          },
        }),
      });
      if (task && task.permalink_url) {
        taskLink.href = task.permalink_url;
        taskLink.hidden = false;
      }
      setResultStatus(`Done. The task is assigned to ${s.reviewer}, and Asana is letting them know.`, "success");
    } catch (err) {
      console.error("Asana task failed:", err);
      let why;
      if (err.status === 401) {
        why = "Your Asana connection has stopped working, so connect Asana again.";
        disconnect();
      } else if (err.status === 403 || err.status === 404) {
        why = "Asana says you don't have access to the QA project. Ask the project owner to add you as a member.";
      } else if (err.status === 400 && /assignee|user/i.test(err.message)) {
        why = `Asana couldn't find ${s.reviewer} at ${reviewerEmail}. Check that this is the email they use for Asana.`;
      } else if (!err.status) {
        why = "We couldn't reach Asana.";
      } else {
        why = `Asana said: ${err.message}.`;
      }
      showEmail(`The task wasn't created. ${why} For now, send the email instead.`);
    }
  }

  function setResultStatus(text, kind) {
    resultStatus.textContent = text;
    resultStatus.classList.toggle("is-success", kind === "success");
  }

  function emailFor(name) {
    if (!CONFIG.emailPattern) return "";
    // "Carlos-David Donoso" -> first "carlosdavid", last "donoso"; accents and hyphens dropped.
    const clean = (w) => w.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
    const parts = name.trim().split(/\s+/);
    return CONFIG.emailPattern
      .replace("{first}", clean(parts[0] || ""))
      .replace("{last}", clean(parts.slice(1).join("")));
  }

  function showEmail(message) {
    const s = lastSubmission;
    // Asana turns the subject into the task name and the body into its description.
    const subject = `QA review: ${s.assetName}`;
    const body = [
      `Hi ${s.reviewer.split(" ")[0]},`,
      "",
      `The QA Review Wheel picked you to review "${s.assetName}" before it's published.`,
      "",
      `What to check: ${s.description}`,
      s.link ? `Link: ${s.link}` : "",
      `Due: ${formatDue(s.dueDate)}`,
      "",
      "Thanks,",
      s.author,
    ].filter((line, i, arr) => !(line === "" && arr[i - 1] === "")).join("\n");
    const params = [];
    if (CONFIG.asanaProjectEmail) params.push("cc=" + encodeURIComponent(CONFIG.asanaProjectEmail));
    params.push("subject=" + encodeURIComponent(subject), "body=" + encodeURIComponent(body));
    emailBtn.href = `mailto:${encodeURIComponent(emailFor(s.reviewer))}?${params.join("&")}`;
    emailBtn.hidden = false;
    setResultStatus(message);
  }

  emailBtn.addEventListener("click", () => {
    setResultStatus("Your email is ready. Press Send in your email app to finish.", "success");
  });

  function closeResult() {
    result.hidden = true;
    form.classList.remove("is-locked");
    [author, assetName, description, assetLink, dueDate].forEach((el) => (el.disabled = false));
    assetName.value = "";
    description.value = "";
    assetLink.value = "";
    resetDueDate();
    refresh();
    assetName.focus();
  }
  doneBtn.addEventListener("click", closeResult);
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!connect.hidden) closeConnect();
    else if (!result.hidden) closeResult();
  });

  /* ---------- Asana connection ----------
     Each person's token is kept only in their own browser and is
     sent only to Asana. Nothing secret lives in this site's code. */
  const ASANA_API = "https://app.asana.com/api/1.0";
  let asanaToken = store.get("qaWheel.asanaToken") || "";
  let asanaUser = null;

  async function asanaFetch(path, opts, token) {
    const res = await fetch(ASANA_API + path, Object.assign({}, opts, {
      headers: {
        Authorization: "Bearer " + (token || asanaToken),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }));
    let json = null;
    try { json = await res.json(); } catch (e) { /* empty body */ }
    if (!res.ok) {
      const msg = (json && json.errors && json.errors[0] && json.errors[0].message) || "HTTP " + res.status;
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return json && json.data;
  }

  function renderAsana() {
    asanaBtn.hidden = false;
    if (!CONFIG.asanaProjectId) {
      asanaState.textContent = "Asana isn't set up for this wheel yet.";
      asanaBtn.hidden = true;
    } else if (asanaToken) {
      asanaState.textContent = asanaUser
        ? `Connected to Asana as ${asanaUser.name}. Tasks are created and assigned for you.`
        : "Connected to Asana. Tasks are created and assigned for you.";
      asanaBtn.textContent = "Disconnect";
    } else {
      asanaState.textContent = "Connect Asana once, and the wheel creates and assigns the review task for you.";
      asanaBtn.textContent = "Connect Asana";
    }
  }

  function disconnect() {
    asanaToken = "";
    asanaUser = null;
    store.remove("qaWheel.asanaToken");
    renderAsana();
  }

  function openConnect() {
    connectError.textContent = "";
    tokenInput.value = "";
    connect.hidden = false;
    tokenInput.focus();
  }
  function closeConnect() {
    connect.hidden = true;
    asanaBtn.focus();
  }

  asanaBtn.addEventListener("click", () => {
    if (asanaToken) disconnect();
    else openConnect();
  });
  connectCancel.addEventListener("click", closeConnect);

  connectForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = tokenInput.value.trim();
    if (!token) { connectError.textContent = "Paste your token first."; return; }
    connectSubmit.disabled = true;
    connectError.textContent = "Checking with Asana…";
    try {
      const me = await asanaFetch("/users/me?opt_fields=name,email", { method: "GET" }, token);
      asanaToken = token;
      asanaUser = me;
      store.set("qaWheel.asanaToken", token);
      tokenInput.value = "";
      connect.hidden = true;
      renderAsana();
      asanaBtn.focus();
    } catch (err) {
      connectError.textContent = err.status === 401
        ? "Asana didn't accept that token. Copy it again and paste the whole thing."
        : "We couldn't reach Asana. Check your connection and try again.";
    } finally {
      connectSubmit.disabled = false;
    }
  });

  async function checkAsana() {
    renderAsana();
    if (!asanaToken) return;
    try {
      asanaUser = await asanaFetch("/users/me?opt_fields=name,email", { method: "GET" });
    } catch (err) {
      if (err.status === 401) disconnect();
    }
    renderAsana();
  }

  /* ---------- Confetti (brand squares) ---------- */
  const confettiCanvas = $("confetti");
  const cctx = confettiCanvas.getContext("2d");
  function confetti() {
    if (reduceMotion) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    confettiCanvas.width = w * dpr;
    confettiCanvas.height = h * dpr;
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const pieces = [];
    const bursts = [[w * 0.2, h * 0.85], [w * 0.8, h * 0.85], [w * 0.5, h * 0.95]];
    bursts.forEach(([x, y]) => {
      for (let i = 0; i < 70; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.3;
        const speed = 9 + Math.random() * 11;
        pieces.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 6 + Math.random() * 9,
          rot: Math.random() * TAU,
          vr: (Math.random() - 0.5) * 0.3,
          colour: CONFETTI_COLOURS[Math.floor(Math.random() * CONFETTI_COLOURS.length)],
          outline: Math.random() < 0.3,
        });
      }
    });

    const t0 = performance.now();
    function frame(now) {
      const elapsed = now - t0;
      cctx.clearRect(0, 0, w, h);
      const fade = Math.max(0, 1 - Math.max(0, elapsed - 2600) / 900);
      pieces.forEach((p) => {
        p.vy += 0.32;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        cctx.save();
        cctx.globalAlpha = fade;
        cctx.translate(p.x, p.y);
        cctx.rotate(p.rot);
        if (p.outline) {
          cctx.strokeStyle = p.colour;
          cctx.lineWidth = 2;
          cctx.strokeRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          cctx.fillStyle = p.colour;
          cctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        }
        cctx.restore();
      });
      if (fade > 0) requestAnimationFrame(frame);
      else cctx.clearRect(0, 0, w, h);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Start ---------- */
  updateCandidates();
  refresh();
  checkAsana();
  if (document.fonts && document.fonts.load) document.fonts.load('500 40px "Instrument Sans"').then(drawWheel, () => {});
})();
