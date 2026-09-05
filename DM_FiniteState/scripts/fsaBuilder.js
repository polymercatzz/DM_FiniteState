document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("fsa-builder-form");
    const challengeButtons = Array.from(document.querySelectorAll("[data-challenge]"));
    const challengeRule = document.getElementById("design-challenge-rule");
    const challengeExamples = document.getElementById("design-challenge-examples");
    const challengeAnnouncement = document.getElementById("design-challenge-announcement");
    const builderTitle = document.getElementById("builder-title");
    const plannerOptions = document.getElementById("state-planner-options");
    const plannerFeedback = document.getElementById("state-planner-feedback");
    const startFieldset = document.querySelector(".builder-start-states");
    const finalFieldset = document.querySelector(".builder-final-states");
    const transitionBody = document.getElementById("builder-transition-body");
    const testBody = document.getElementById("builder-test-body");
    const pathBody = document.getElementById("builder-path-body");
    const summary = document.getElementById("builder-summary");
    const message = document.getElementById("builder-message");
    const resetButton = document.getElementById("builder-reset");
    const hintButton = document.getElementById("hint-next");
    const hintList = document.getElementById("hint-list");
    const hintCount = document.getElementById("hint-count");
    const hintAnnouncement = document.getElementById("hint-announcement");
    const resultsSection = document.getElementById("builder-results");
    const pathDescription = document.getElementById("builder-path-description");
    const playback = document.getElementById("builder-playback");
    const playbackLabel = document.getElementById("builder-playback-label");
    const playbackStatus = document.getElementById("builder-playback-status");
    const playbackProgress = document.getElementById("builder-playback-progress");
    const playbackTrack = playbackProgress?.parentElement;
    const builderAnnouncement = document.getElementById("builder-announcement");
    const builderStatusSummary = document.getElementById("builder-status-summary");
    const testsComplete = document.getElementById("builder-tests-complete");
    const passedCount = document.getElementById("builder-passed-count");
    const failedCount = document.getElementById("builder-failed-count");
    const runButton = form?.querySelector(".run-button");
    const runButtonLabel = runButton?.querySelector("span");

    if (!form || !plannerOptions || !startFieldset || !finalFieldset || !transitionBody || !testBody || !pathBody) {
        return;
    }

    const challenges = {
        "begin-00": {
            title: "Begin with two 0s",
            shortTitle: "begin with 00",
            rule: "รับ bit string ที่ขึ้นต้นด้วย 00",
            memory: "จำ prefix สองตัวแรก",
            states: ["s0", "s1", "s2", "sd"],
            roles: [
                { key: "empty", label: "ยังไม่อ่าน input" },
                { key: "first-zero", label: "ตัวแรกเป็น 0" },
                { key: "success", label: "เริ่มด้วย 00 สำเร็จ" },
                { key: "dead", label: "ผิดเงื่อนไขแล้ว" }
            ],
            roleAnswers: { s0: "empty", s1: "first-zero", s2: "success", sd: "dead" },
            start: "s0",
            finals: ["s2"],
            transitions: {
                s0: { "0": "s1", "1": "sd" },
                s1: { "0": "s2", "1": "sd" },
                s2: { "0": "s2", "1": "s2" },
                sd: { "0": "sd", "1": "sd" }
            },
            tests: [
                ["00", true], ["000", true], ["001", true], ["00101", true],
                ["epsilon", false], ["0", false], ["1", false], ["01", false], ["10", false], ["100", false]
            ],
            hints: [
                "เครื่องต้องตรวจสอง input แรกเท่านั้น",
                "ถ้าตัวแรกเป็น 1 จะไม่มีทาง accepted แล้ว",
                "หลังเจอ 00 แล้ว input ใด ๆ ก็ยัง accepted"
            ]
        },
        "contain-00": {
            title: "Contain two consecutive 0s",
            shortTitle: "contain 00",
            rule: "รับ bit string ที่มี 00 ติดกันอยู่ที่ไหนก็ได้",
            memory: "จำว่าตัวล่าสุดเป็น 0 และเคยพบ 00 หรือยัง",
            states: ["s0", "s1", "s2"],
            roles: [
                { key: "clear", label: "ยังไม่พบ 00 / ล่าสุดไม่ใช่ 0" },
                { key: "last-zero", label: "ยังไม่พบ 00 / ล่าสุดเป็น 0" },
                { key: "found", label: "พบ 00 แล้ว" }
            ],
            roleAnswers: { s0: "clear", s1: "last-zero", s2: "found" },
            start: "s0",
            finals: ["s2"],
            transitions: {
                s0: { "0": "s1", "1": "s0" },
                s1: { "0": "s2", "1": "s0" },
                s2: { "0": "s2", "1": "s2" }
            },
            tests: [
                ["00", true], ["100", true], ["001", true], ["110011", true],
                ["epsilon", false], ["0", false], ["1", false], ["01", false], ["10", false], ["10101", false]
            ],
            hints: [
                "ต้องจำว่าตัวล่าสุดเป็น 0 หรือไม่",
                "ถ้าตัวล่าสุดเป็น 0 แล้วอ่าน 0 อีกครั้ง เงื่อนไขสำเร็จ",
                "เมื่อพบ 00 แล้วควรอยู่ใน success state ต่อไป"
            ]
        },
        "avoid-00": {
            title: "Do not contain two consecutive 0s",
            shortTitle: "do not contain 00",
            rule: "รับ bit string ที่ไม่มี 00 ติดกันเลย",
            memory: "จำว่าตัวล่าสุดเป็น 0 หรือเคยทำผิดเงื่อนไขแล้ว",
            states: ["s0", "s1", "sd"],
            roles: [
                { key: "safe", label: "ยังปลอดภัย / ล่าสุดไม่ใช่ 0" },
                { key: "last-zero", label: "ยังปลอดภัย / ล่าสุดเป็น 0" },
                { key: "found", label: "พบ 00 แล้ว" }
            ],
            roleAnswers: { s0: "safe", s1: "last-zero", sd: "found" },
            start: "s0",
            finals: ["s0", "s1"],
            transitions: {
                s0: { "0": "s1", "1": "s0" },
                s1: { "0": "sd", "1": "s0" },
                sd: { "0": "sd", "1": "sd" }
            },
            tests: [
                ["epsilon", true], ["0", true], ["1", true], ["01", true], ["10", true], ["10101", true],
                ["00", false], ["100", false], ["001", false], ["110011", false]
            ],
            hints: [
                "โจทย์นี้เป็น complement ของ contains 00",
                "state ที่ยังไม่พบ 00 ทั้งคู่ควรเป็น final",
                "เมื่อพบ 00 แล้วต้องอยู่ใน rejected state ถาวร"
            ]
        },
        "end-00": {
            title: "End with two 0s",
            shortTitle: "end with 00",
            rule: "รับ bit string ที่ลงท้ายด้วย 00",
            memory: "จำ suffix ล่าสุดไม่เกินสองตัว",
            states: ["s0", "s1", "s2"],
            roles: [
                { key: "none", label: "suffix ล่าสุดไม่ช่วย" },
                { key: "one-zero", label: "suffix ล่าสุดคือ 0" },
                { key: "two-zeros", label: "suffix ล่าสุดคือ 00" }
            ],
            roleAnswers: { s0: "none", s1: "one-zero", s2: "two-zeros" },
            start: "s0",
            finals: ["s2"],
            transitions: {
                s0: { "0": "s1", "1": "s0" },
                s1: { "0": "s2", "1": "s0" },
                s2: { "0": "s2", "1": "s0" }
            },
            tests: [
                ["00", true], ["100", true], ["1100", true], ["10100", true],
                ["epsilon", false], ["0", false], ["1", false], ["001", false], ["1001", false], ["1010", false]
            ],
            hints: [
                "ต้องดูสองตัวสุดท้าย ไม่ใช่สองตัวแรก",
                "เมื่ออ่าน 1 จะไม่มี suffix 0 เหลืออยู่",
                "จาก suffix 00 ถ้าอ่าน 0 อีกครั้งก็ยังลงท้ายด้วย 00"
            ]
        },
        "two-zeros": {
            title: "Contain at least two 0s",
            shortTitle: "contain at least two 0s",
            rule: "รับ bit string ที่มีเลข 0 อย่างน้อย 2 ตัว โดยไม่จำเป็นต้องติดกัน",
            memory: "นับแบบจำกัด: 0 ตัว, 1 ตัว, อย่างน้อย 2 ตัว",
            states: ["s0", "s1", "s2"],
            roles: [
                { key: "zero", label: "ยังไม่พบ 0" },
                { key: "one", label: "พบ 0 แล้วหนึ่งตัว" },
                { key: "many", label: "พบ 0 อย่างน้อยสองตัว" }
            ],
            roleAnswers: { s0: "zero", s1: "one", s2: "many" },
            start: "s0",
            finals: ["s2"],
            transitions: {
                s0: { "0": "s1", "1": "s0" },
                s1: { "0": "s2", "1": "s1" },
                s2: { "0": "s2", "1": "s2" }
            },
            tests: [
                ["00", true], ["010", true], ["1010", true], ["00111", true],
                ["epsilon", false], ["1", false], ["111", false], ["10", false], ["0111", false]
            ],
            hints: [
                "จำเพียง 0 ตัว, 1 ตัว หรืออย่างน้อย 2 ตัว",
                "เมื่อพบ 0 ตัวที่สองแล้ว accepted ถาวร",
                "input 1 ไม่เพิ่มจำนวน 0"
            ]
        }
    };

    let currentKey = "begin-00";
    let currentChallenge = challenges[currentKey];
    let startInputs = [];
    let finalInputs = [];
    let transitionGroups = [];
    let transitionButtons = [];
    let plannerButtons = [];
    let hintLevel = 0;
    let activeRunId = 0;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const testDelay = prefersReducedMotion ? 90 : 360;
    const pathDelay = prefersReducedMotion ? 110 : 560;

    function parseInput(value) {
        return value === "epsilon" ? [] : value.split("");
    }

    function setMessage(text, tone = "") {
        if (!message) return;
        message.textContent = text;
        message.classList.toggle("is-success", tone === "success");
        message.classList.toggle("is-warning", tone === "warning");
    }

    function wait(milliseconds) {
        return new Promise(resolve => window.setTimeout(resolve, milliseconds));
    }

    function setRunning(isRunning) {
        [...challengeButtons, ...startInputs, ...finalInputs, ...transitionButtons, ...plannerButtons].forEach(control => {
            control.disabled = isRunning;
        });
        if (runButton) runButton.disabled = isRunning;
        if (runButtonLabel) runButtonLabel.textContent = isRunning ? "กำลัง Run..." : "Run Tests";
        resultsSection?.setAttribute("aria-busy", String(isRunning));
    }

    function cancelActiveRun() {
        activeRunId += 1;
        setRunning(false);
    }

    function resetPlayback() {
        if (playback) {
            playback.hidden = true;
            playback.classList.remove("is-complete", "has-failures");
        }
        if (playbackLabel) playbackLabel.textContent = "Auto test";
        if (playbackStatus) playbackStatus.textContent = "";
        if (playbackProgress) playbackProgress.style.width = "0%";
        if (playbackTrack) {
            playbackTrack.setAttribute("aria-valuemax", "1");
            playbackTrack.setAttribute("aria-valuenow", "0");
            playbackTrack.setAttribute("aria-valuetext", "ยังไม่เริ่ม");
        }
    }

    function refreshControls() {
        startInputs = Array.from(document.querySelectorAll('input[name="builder-start-state"]'));
        finalInputs = Array.from(document.querySelectorAll('input[name="builder-final-state"]'));
        transitionGroups = Array.from(document.querySelectorAll(".transition-chip-group"));
        transitionButtons = Array.from(document.querySelectorAll(".transition-chip-group [data-target-state]"));
        plannerButtons = Array.from(plannerOptions.querySelectorAll("[data-planner-value]"));
    }

    function renderChallengeDetails() {
        if (builderTitle) builderTitle.textContent = `Language: ${currentChallenge.shortTitle}`;
        if (challengeRule) {
            challengeRule.innerHTML = `<span>โจทย์ ${challengeButtons.findIndex(button => button.dataset.challenge === currentKey) + 1}</span><div><h3>${currentChallenge.title}</h3><p>${currentChallenge.rule}</p><small><strong>What the state must remember</strong> ${currentChallenge.memory}</small></div>`;
        }
        if (challengeExamples) {
            const accepted = currentChallenge.tests.filter(([, expected]) => expected).map(([input]) => input);
            const rejected = currentChallenge.tests.filter(([, expected]) => !expected).map(([input]) => input);
            const formatExample = value => value === "epsilon" ? "ε (epsilon)" : value;
            challengeExamples.innerHTML = `<section aria-labelledby="accepted-examples-title"><h3 id="accepted-examples-title">Accepted examples</h3><ul>${accepted.map(value => `<li><code>${formatExample(value)}</code></li>`).join("")}</ul></section><section aria-labelledby="rejected-examples-title"><h3 id="rejected-examples-title">Rejected examples</h3><ul>${rejected.map(value => `<li><code>${formatExample(value)}</code></li>`).join("")}</ul></section>`;
        }
        if (challengeAnnouncement) {
            const challengeNumber = challengeButtons.findIndex(button => button.dataset.challenge === currentKey) + 1;
            challengeAnnouncement.textContent = `เลือกโจทย์ ${challengeNumber}: ${currentChallenge.title}; ${currentChallenge.rule}`;
        }
    }

    function renderPlanner() {
        plannerOptions.innerHTML = currentChallenge.states.map(state => `
            <article class="planner-state" data-planner-state="${state}" role="group" aria-labelledby="planner-state-${state}">
                <strong id="planner-state-${state}">${state}</strong>
                <span class="planner-state__status" data-planner-status>ยังไม่เลือก</span>
                <div class="planner-role-chips" role="group" aria-label="เลือกบทบาทของ ${state}">
                    ${currentChallenge.roles.map(role => `<button type="button" data-planner-value="${role.key}" aria-pressed="false">${role.label}</button>`).join("")}
                </div>
            </article>`).join("");
    }

    function renderBuilderControls() {
        startFieldset.innerHTML = `<legend>Start state</legend><p class="fieldset-help" id="builder-start-help">เลือกหนึ่งค่า</p>${currentChallenge.states.map(state => `<label for="builder-start-${state}"><input id="builder-start-${state}" type="radio" name="builder-start-state" value="${state}"${state === currentChallenge.start ? " checked" : ""} aria-describedby="builder-start-help"><span><span class="state-choice__marker" aria-hidden="true">○</span>${state}</span></label>`).join("")}`;
        finalFieldset.innerHTML = `<legend>Final states</legend><p class="fieldset-help" id="builder-final-help">เลือกได้หลายค่า หรือไม่เลือกเลยก็ได้</p>${currentChallenge.states.map(state => `<label for="builder-final-${state}"><input id="builder-final-${state}" type="checkbox" name="builder-final-state" value="${state}" aria-describedby="builder-final-help"><span><span class="state-choice__marker" aria-hidden="true">□</span>${state}</span></label>`).join("")}`;
        transitionBody.innerHTML = currentChallenge.states.map(state => `
            <tr><th scope="row">${state}</th>${["0", "1"].map(symbol => `
                <td><div class="transition-chip-group" id="transition-${state}-${symbol}" data-transition-state="${state}" data-transition-symbol="${symbol}" role="group" tabindex="0" aria-label="${state} on input ${symbol}" aria-describedby="transition-status-${state}-${symbol}">
                    ${currentChallenge.states.map(target => `<button type="button" data-target-state="${target}" aria-pressed="false">${target}</button>`).join("")}
                    <span class="transition-chip-group__status" id="transition-status-${state}-${symbol}" data-transition-status>Not set</span>
                </div></td>`).join("")}</tr>`).join("");
    }

    function updateMachineStatus() {
        if (!builderStatusSummary) return;
        const start = startInputs.find(input => input.checked)?.value ?? "—";
        const finals = finalInputs.filter(input => input.checked).length;
        const complete = transitionGroups.filter(group => group.querySelector(".is-selected")).length;
        builderStatusSummary.textContent = `Start: ${start} · Finals: ${finals} selected · Transitions: ${complete}/${currentChallenge.states.length * 2} complete`;
    }

    function updatePlannerFeedback() {
        const cards = Array.from(plannerOptions.querySelectorAll(".planner-state"));
        const answered = cards.filter(card => card.querySelector(".is-selected")).length;
        const correct = cards.filter(card => {
            const selected = card.querySelector(".is-selected")?.dataset.plannerValue;
            return currentChallenge.roleAnswers[card.dataset.plannerState] === selected;
        }).length;
        cards.forEach(card => {
            const selected = card.querySelector(".is-selected")?.dataset.plannerValue;
            const isCorrect = Boolean(selected) && currentChallenge.roleAnswers[card.dataset.plannerState] === selected;
            const isWrong = Boolean(selected) && !isCorrect;
            card.classList.toggle("is-correct", isCorrect);
            card.classList.toggle("is-wrong", isWrong);
            const status = card.querySelector("[data-planner-status]");
            if (status) status.textContent = !selected ? "ยังไม่เลือก" : isCorrect ? "ถูกต้อง" : "ลองอีกครั้ง";
        });
        if (plannerFeedback) {
            plannerFeedback.textContent = answered < currentChallenge.states.length
                ? `เลือกบทบาท state แล้ว: ${answered}/${currentChallenge.states.length}`
                : `State planner ถูก ${correct}/${currentChallenge.states.length}`;
            plannerFeedback.classList.toggle("is-success", correct === currentChallenge.states.length);
            plannerFeedback.classList.toggle("is-warning", answered === currentChallenge.states.length && correct < currentChallenge.states.length);
        }
    }

    function bindDynamicControls() {
        plannerOptions.querySelectorAll(".planner-state").forEach(card => {
            card.querySelectorAll("[data-planner-value]").forEach(button => {
                button.addEventListener("click", () => {
                    card.querySelectorAll("[data-planner-value]").forEach(choice => {
                        const selected = choice === button;
                        choice.classList.toggle("is-selected", selected);
                        choice.setAttribute("aria-pressed", String(selected));
                    });
                    updatePlannerFeedback();
                });
            });
        });
        transitionGroups.forEach(group => {
            group.querySelectorAll("button").forEach(button => {
                button.addEventListener("click", () => {
                    group.querySelectorAll("button").forEach(choice => {
                        const selected = choice === button;
                        choice.classList.toggle("is-selected", selected);
                        choice.setAttribute("aria-pressed", String(selected));
                    });
                    group.classList.remove("is-missing");
                    group.removeAttribute("aria-invalid");
                    const status = group.querySelector("[data-transition-status]");
                    if (status) status.textContent = `Goes to ${button.dataset.targetState}`;
                    updateMachineStatus();
                });
            });
        });
        startInputs.forEach(input => input.addEventListener("change", () => {
            startFieldset?.removeAttribute("aria-invalid");
            updateMachineStatus();
        }));
        finalInputs.forEach(input => input.addEventListener("change", updateMachineStatus));
        updateMachineStatus();
    }

    function getMachine() {
        const transitions = {};
        const missing = [];
        currentChallenge.states.forEach(state => {
            transitions[state] = {};
            ["0", "1"].forEach(symbol => {
                const group = document.querySelector(`.transition-chip-group[data-transition-state="${state}"][data-transition-symbol="${symbol}"]`);
                const target = group?.querySelector(".is-selected")?.dataset.targetState ?? "";
                if (!target) {
                    missing.push(`${state} on ${symbol}`);
                    group?.classList.add("is-missing");
                } else {
                    transitions[state][symbol] = target;
                    group?.classList.remove("is-missing");
                }
            });
        });
        return {
            start: startInputs.find(input => input.checked)?.value ?? "",
            finals: new Set(finalInputs.filter(input => input.checked).map(input => input.value)),
            transitions,
            missing
        };
    }

    function simulate(machine, symbols) {
        let state = machine.start;
        const path = [state];
        const rows = symbols.map((symbol, index) => {
            const next = machine.transitions[state][symbol];
            const row = { step: index + 1, current: state, input: symbol, next };
            state = next;
            path.push(state);
            return row;
        });
        return { rows, path, endState: state, accepted: machine.finals.has(state) };
    }

    function makeCell(text) {
        const cell = document.createElement("td");
        cell.textContent = text;
        return cell;
    }

    function makeRowHeader(text, marker = "") {
        const cell = document.createElement("th");
        cell.scope = "row";
        cell.textContent = text;
        if (marker) {
            const badge = document.createElement("span");
            badge.className = "table-current-marker";
            badge.textContent = marker;
            cell.appendChild(badge);
        }
        return cell;
    }

    function formatExample(value) {
        return value === "epsilon" ? "ε (epsilon)" : value;
    }

    function syncProgress(completed, total, valueText) {
        const safeTotal = Math.max(total, 1);
        const safeCompleted = Math.min(Math.max(completed, 0), safeTotal);
        if (playbackProgress) playbackProgress.style.width = `${(safeCompleted / safeTotal) * 100}%`;
        if (playbackTrack) {
            playbackTrack.setAttribute("aria-valuemax", String(safeTotal));
            playbackTrack.setAttribute("aria-valuenow", String(safeCompleted));
            playbackTrack.setAttribute("aria-valuetext", valueText || `${safeCompleted} จาก ${safeTotal}`);
        }
    }

    function updateResultSummary(completed, total, passed, failed, complete = false) {
        if (testsComplete) testsComplete.textContent = complete ? `${total}/${total}` : `${completed}/${total}`;
        if (passedCount) passedCount.textContent = complete ? String(passed) : (completed ? String(passed) : "กำลังตรวจ");
        if (failedCount) failedCount.textContent = complete ? String(failed) : (completed ? String(failed) : "กำลังตรวจ");
    }

    function renderPathSummary(featured, machine, finalText, path, phaseText) {
        if (!summary) return;
        const expectedText = featured.expected ? "Accepted" : "Rejected";
        const actualText = featured.actual ? "Accepted" : "Rejected";
        const nodes = path.map((state, index) => `<li><span>${index === 0 ? "Start" : index === path.length - 1 ? "End" : `State ${index}`}</span><code>${state}</code></li>`).join("");
        summary.innerHTML = `<div class="builder-summary__case"><span>Featured case</span><strong>${formatExample(featured.input)}</strong><dl><div><dt>Expected</dt><dd>${expectedText}</dd></div><div><dt>Machine</dt><dd>${actualText}</dd></div><div><dt>End state</dt><dd>${featured.simulation.endState}</dd></div><div><dt>Final states</dt><dd>${finalText}</dd></div></dl></div><ol class="builder-path-list" aria-label="State path ของ ${formatExample(featured.input)}">${nodes}</ol><p>${phaseText}</p>`;
    }

    function makeTestRow(item) {
        const row = document.createElement("tr");
        row.classList.add(item.pass ? "is-pass" : "is-fail", "is-latest");
        row.appendChild(makeRowHeader(formatExample(item.input), "Current test"));
        [item.expected ? "Accepted" : "Rejected", item.actual ? "Accepted" : "Rejected", item.pass ? "✓ Pass" : "× Fail"]
            .forEach(value => row.appendChild(makeCell(value)));
        return row;
    }

    function makePathRow(item) {
        const row = document.createElement("tr");
        row.className = "is-latest";
        row.appendChild(makeRowHeader(String(item.step), "Current"));
        [item.current, item.input, item.next].forEach(value => row.appendChild(makeCell(value)));
        return row;
    }

    function makeEpsilonPathRow(start) {
        const row = document.createElement("tr");
        row.className = "is-latest is-epsilon";
        row.appendChild(makeRowHeader("0", "Current"));
        row.appendChild(makeCell(start));
        row.appendChild(makeCell("ε (epsilon)"));
        row.appendChild(makeCell(start));
        return row;
    }

    function clearCurrentMarkers(container) {
        container?.querySelectorAll(".table-current-marker").forEach(marker => marker.remove());
    }

    async function runTests() {
        const machine = getMachine();
        if (!machine.start) {
            startFieldset?.setAttribute("aria-invalid", "true");
            setMessage("เลือก start state ก่อนรัน test", "warning");
            startInputs[0]?.focus();
            return;
        }
        startFieldset?.removeAttribute("aria-invalid");
        if (machine.missing.length > 0) {
            transitionGroups.forEach(group => {
                const missing = !group.querySelector(".is-selected");
                group.classList.toggle("is-missing", missing);
                if (missing) {
                    group.setAttribute("aria-invalid", "true");
                    const status = group.querySelector("[data-transition-status]");
                    if (status) status.textContent = "Not set · กรุณาเลือก target state";
                }
            });
            setMessage(`ขาด ${machine.missing.length} transitions: ${machine.missing.join(", ")}`, "warning");
            transitionGroups.find(group => !group.querySelector(".is-selected"))?.focus();
            return;
        }
        transitionGroups.forEach(group => group.removeAttribute("aria-invalid"));

        const results = currentChallenge.tests.map(([input, expected]) => {
            const simulation = simulate(machine, parseInput(input));
            return { input, expected, actual: simulation.accepted, pass: simulation.accepted === expected, simulation };
        });
        const passed = results.filter(item => item.pass).length;
        const featured = results.find(item => !item.pass) ?? results[0];
        const finalText = `{${Array.from(machine.finals).join(", ") || "empty"}}`;
        const totalSteps = results.length + Math.max(featured.simulation.rows.length, 1);
        let completedSteps = 0;
        const runId = activeRunId + 1;
        activeRunId = runId;

        setRunning(true);
        resetPlayback();
        if (playback) playback.hidden = false;
        if (playbackLabel) playbackLabel.textContent = "Testing cases";
        if (playbackStatus) playbackStatus.textContent = `เตรียม test cases 0/${results.length}`;
        syncProgress(0, totalSteps, `ยังไม่เริ่ม · 0 จาก ${totalSteps}`);
        updateResultSummary(0, results.length, 0, 0);
        testBody.replaceChildren();
        pathBody.innerHTML = '<tr class="is-empty"><td colspan="4">รอผล test cases ก่อนเริ่ม State Path</td></tr>';
        if (summary) summary.innerHTML = "<strong>กำลังตรวจ...</strong><p>ระบบจะแสดง case ทีละรายการ</p>";
        if (pathDescription) pathDescription.textContent = "ถ้ามี test fail จะแสดง path ของ case แรกที่ควรแก้ก่อน";
        setMessage(`กำลัง run โจทย์ ${currentChallenge.title}`);
        window.requestAnimationFrame(() => {
            resultsSection?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
            resultsSection?.focus({ preventScroll: true });
        });

        for (let index = 0; index < results.length; index += 1) {
            await wait(testDelay);
            if (runId !== activeRunId) return;
            testBody.querySelector(".is-latest")?.classList.remove("is-latest");
            clearCurrentMarkers(testBody);
            testBody.appendChild(makeTestRow(results[index]));
            completedSteps += 1;
            const completedResults = results.slice(0, index + 1);
            const completedPassed = completedResults.filter(item => item.pass).length;
            updateResultSummary(index + 1, results.length, completedPassed, completedResults.length - completedPassed);
            if (playbackStatus) playbackStatus.textContent = `Test ${index + 1}/${results.length} · ${results[index].input} · ${results[index].pass ? "Pass" : "Fail"}`;
            syncProgress(completedSteps, totalSteps, `Test ${index + 1} จาก ${results.length}`);
            if (builderAnnouncement) builderAnnouncement.textContent = `Test ${index + 1} จาก ${results.length}: ${formatExample(results[index].input)}; expected ${results[index].expected ? "Accepted" : "Rejected"}; machine ${results[index].actual ? "Accepted" : "Rejected"}; ${results[index].pass ? "Pass" : "Fail"}`;
        }

        if (featured.input === "epsilon") {
            pathBody.innerHTML = '<tr class="is-empty"><td colspan="4">กำลังตรวจ epsilon · ไม่มี transition</td></tr>';
        } else {
            pathBody.replaceChildren();
        }
        if (playbackLabel) playbackLabel.textContent = "Inspecting path";
        renderPathSummary(featured, machine, finalText, [machine.start], `Inspecting ${formatExample(featured.input)} · เตรียม State Path`);

        if (featured.input === "epsilon") {
            await wait(pathDelay);
            if (runId !== activeRunId) return;
            pathBody.replaceChildren(makeEpsilonPathRow(machine.start));
            completedSteps += 1;
            syncProgress(completedSteps, totalSteps, `Inspect ${formatExample(featured.input)} · Step 0 จาก 0`);
            if (builderAnnouncement) builderAnnouncement.textContent = `Inspect ${formatExample(featured.input)}: ไม่มี transition และ end state = ${machine.start}`;
            renderPathSummary(featured, machine, finalText, featured.simulation.path, `Step 0 · ไม่มี transition · end state = ${machine.start}`);
        } else {
            for (let index = 0; index < featured.simulation.rows.length; index += 1) {
                await wait(pathDelay);
                if (runId !== activeRunId) return;
                pathBody.querySelector(".is-latest")?.classList.remove("is-latest");
                clearCurrentMarkers(pathBody);
                pathBody.appendChild(makePathRow(featured.simulation.rows[index]));
                completedSteps += 1;
                renderPathSummary(featured, machine, finalText, featured.simulation.path.slice(0, index + 2), `State Path ${index + 1}/${featured.simulation.rows.length}`);
                if (playbackStatus) playbackStatus.textContent = `State Path ${index + 1}/${featured.simulation.rows.length} · อ่าน ${featured.simulation.rows[index].input}`;
                syncProgress(completedSteps, totalSteps, `Inspect step ${index + 1} จาก ${featured.simulation.rows.length}`);
                if (builderAnnouncement) builderAnnouncement.textContent = `Inspect ${formatExample(featured.input)}, step ${index + 1} จาก ${featured.simulation.rows.length}: อ่าน ${featured.simulation.rows[index].input}, ย้ายจาก ${featured.simulation.rows[index].current} ไป ${featured.simulation.rows[index].next}`;
            }
        }

        if (runId !== activeRunId) return;
        renderPathSummary(featured, machine, finalText, featured.simulation.path, `Inspecting ${formatExample(featured.input)}: end state = ${featured.simulation.endState}, F = ${finalText}`);
        if (playback) {
            playback.classList.add("is-complete");
            playback.classList.toggle("has-failures", passed !== results.length);
        }
        if (playbackLabel) playbackLabel.textContent = "Run result";
        if (playbackStatus) playbackStatus.textContent = `Complete · ผ่าน ${passed}/${results.length} tests`;
        if (pathDescription) pathDescription.textContent = passed === results.length
            ? "Inspecting first passing case for verification"
            : "ถ้ามี test fail จะแสดง path ของ case แรกที่ควรแก้ก่อน";
        syncProgress(totalSteps, totalSteps, `เสร็จแล้ว · ${totalSteps} จาก ${totalSteps}`);
        updateResultSummary(results.length, results.length, passed, results.length - passed, true);
        if (builderAnnouncement) builderAnnouncement.textContent = `ผ่าน ${passed} จาก ${results.length} tests; case ที่ตรวจคือ ${formatExample(featured.input)}`;
        setMessage(
            passed === results.length
                ? `ผ่านทุก test: machine นี้ recognize ภาษา ${currentChallenge.shortTitle} ได้ถูกต้อง`
                : `ผ่าน ${passed}/${results.length} tests. ดู case ${featured.input} แล้วปรับ machine อีกครั้ง`,
            passed === results.length ? "success" : "warning"
        );
        setRunning(false);
    }

    function resetBuilder() {
        cancelActiveRun();
        startInputs.forEach(input => { input.checked = input.value === currentChallenge.start; });
        finalInputs.forEach(input => { input.checked = false; });
        transitionGroups.forEach(group => {
            group.classList.remove("is-missing");
            group.removeAttribute("aria-invalid");
            group.querySelectorAll("button").forEach(button => {
                button.classList.remove("is-selected");
                button.setAttribute("aria-pressed", "false");
            });
            const status = group.querySelector("[data-transition-status]");
            if (status) status.textContent = "Not set";
        });
        plannerOptions.querySelectorAll(".planner-state").forEach(card => {
            card.classList.remove("is-correct", "is-wrong");
            card.querySelectorAll("button").forEach(button => {
                button.classList.remove("is-selected");
                button.setAttribute("aria-pressed", "false");
            });
            const status = card.querySelector("[data-planner-status]");
            if (status) status.textContent = "ยังไม่เลือก";
        });
        if (plannerFeedback) {
            plannerFeedback.textContent = "เลือกบทบาท state เพื่อวาง memory ก่อน";
            plannerFeedback.classList.remove("is-success", "is-warning");
        }
        hintLevel = 0;
        if (hintList) hintList.replaceChildren();
        if (hintCount) hintCount.textContent = `Hints 0 / ${currentChallenge.hints.length}`;
        if (hintAnnouncement) hintAnnouncement.textContent = "";
        if (builderAnnouncement) builderAnnouncement.textContent = "";
        if (hintButton) {
            hintButton.textContent = "Show Hint 1";
            hintButton.disabled = false;
        }
        testBody.innerHTML = '<tr class="is-empty"><td colspan="4">ยังไม่ได้ run tests</td></tr>';
        pathBody.innerHTML = '<tr class="is-empty"><td colspan="4">เลือก Run Tests เพื่อดู state path</td></tr>';
        if (summary) summary.innerHTML = "<strong>-</strong><p>ยังไม่มีผล test</p>";
        if (pathDescription) pathDescription.textContent = "ถ้ามี test fail จะแสดง path ของ case แรกที่ควรแก้ก่อน";
        resetPlayback();
        updateResultSummary(0, currentChallenge.tests.length, 0, 0);
        if (testsComplete) testsComplete.textContent = "—";
        if (passedCount) passedCount.textContent = "—";
        if (failedCount) failedCount.textContent = "—";
        updateMachineStatus();
        setMessage("เลือก transition ให้ครบทุก state และทุก input ใน {0, 1}");
    }

    function revealHint() {
        if (!hintList || hintLevel >= currentChallenge.hints.length) return;
        const item = document.createElement("li");
        item.textContent = `Hint ${hintLevel + 1}: ${currentChallenge.hints[hintLevel]}`;
        hintList.appendChild(item);
        hintLevel += 1;
        if (hintCount) hintCount.textContent = `Hints ${hintLevel} / ${currentChallenge.hints.length}`;
        if (hintAnnouncement) hintAnnouncement.textContent = `Hint ${hintLevel}: ${currentChallenge.hints[hintLevel - 1]}`;
        if (hintButton) {
            hintButton.textContent = hintLevel >= currentChallenge.hints.length ? "Hints complete" : `Show Hint ${hintLevel + 1}`;
            hintButton.disabled = hintLevel >= currentChallenge.hints.length;
        }
    }

    function selectChallenge(key) {
        cancelActiveRun();
        currentKey = key;
        currentChallenge = challenges[key];
        challengeButtons.forEach(button => {
            const selected = button.dataset.challenge === key;
            button.classList.toggle("is-selected", selected);
            button.setAttribute("aria-pressed", String(selected));
        });
        renderChallengeDetails();
        renderPlanner();
        renderBuilderControls();
        refreshControls();
        bindDynamicControls();
        resetBuilder();
    }

    challengeButtons.forEach(button => button.addEventListener("click", () => selectChallenge(button.dataset.challenge)));
    form.addEventListener("submit", event => {
        event.preventDefault();
        runTests();
    });
    resetButton?.addEventListener("click", resetBuilder);
    hintButton?.addEventListener("click", revealHint);

    selectChallenge(currentKey);
});
