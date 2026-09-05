document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("language-form");
    const machineSelect = document.getElementById("machine-select");
    const input = document.getElementById("language-input");
    const errorMessage = document.getElementById("language-error");
    const machineSummary = document.getElementById("machine-summary");
    const simulationPanel = document.querySelector(".language-panel--simulation");
    const languageResults = document.getElementById("language-results") || simulationPanel;
    const announcement = document.getElementById("language-announcement");
    const playback = document.getElementById("language-playback");
    const playbackLabel = document.getElementById("language-playback-label");
    const playbackStatus = document.getElementById("language-playback-status");
    const playbackProgress = document.getElementById("language-playback-progress");
    const playbackTrack = playback?.querySelector(".language-playback__track");
    const statePathDisplay = document.getElementById("language-state-path");
    const endStateDisplay = document.getElementById("language-end-state");
    const finalStatesDisplay = document.getElementById("language-final-states");
    const stringDisplay = document.getElementById("language-string");
    const pipelineInput = document.getElementById("language-pipeline-input");
    const pipelineEnd = document.getElementById("language-pipeline-end");
    const pipelineFinal = document.getElementById("language-pipeline-final");
    const pipelineMembership = document.getElementById("language-pipeline-membership");
    const tableBody = document.getElementById("language-body");
    const resetButton = document.getElementById("language-reset");
    const runButton = form?.querySelector(".run-button");
    const runButtonLabel = runButton?.querySelector("span");
    const stringChips = Array.from(document.querySelectorAll("[data-string-action]"));
    const guessGrid = document.getElementById("guess-grid");
    const howToDialog = document.getElementById("language-how-to-dialog");
    const openHowToButton = document.getElementById("open-language-how-to");
    const closeHowToButton = document.getElementById("close-language-how-to");

    if (!form || !machineSelect || !input || !tableBody) {
        return;
    }

    const machines = {
        ones: {
            title: "{1}*",
            rule: "strings ที่มีแต่ 1 เท่านั้น รวมถึง epsilon",
            start: "q0",
            finals: new Set(["q0"]),
            states: ["q0", "qd"],
            transitions: {
                q0: { "0": "qd", "1": "q0" },
                qd: { "0": "qd", "1": "qd" }
            },
            examples: {
                accepted: ["epsilon", "1", "11", "111"],
                rejected: ["0", "10", "101"]
            }
        },
        finite: {
            title: "{1, 01}",
            rule: "รับเฉพาะ string 1 หรือ 01 เท่านั้น",
            start: "q0",
            finals: new Set(["q2", "q3"]),
            states: ["q0", "q1", "q2", "q3", "qd"],
            transitions: {
                q0: { "0": "q1", "1": "q2" },
                q1: { "0": "qd", "1": "q3" },
                q2: { "0": "qd", "1": "qd" },
                q3: { "0": "qd", "1": "qd" },
                qd: { "0": "qd", "1": "qd" }
            },
            examples: {
                accepted: ["1", "01"],
                rejected: ["epsilon", "0", "11", "001", "010"]
            }
        },
        "zero-or-10": {
            title: "{0}* U {0}*{10}{0,1}*",
            rule: "รับ strings ที่มีแต่ 0 หรือมี 0 กี่ตัวก็ได้แล้วตามด้วย 10 จากนั้นต่อด้วย bit ใด ๆ",
            start: "q0",
            finals: new Set(["q0", "q2"]),
            states: ["q0", "q1", "q2", "qd"],
            transitions: {
                q0: { "0": "q0", "1": "q1" },
                q1: { "0": "q2", "1": "qd" },
                q2: { "0": "q2", "1": "q2" },
                qd: { "0": "qd", "1": "qd" }
            },
            examples: {
                accepted: ["epsilon", "0", "00", "10", "010", "001011"],
                rejected: ["1", "01", "011", "0011"]
            }
        }
    };

    const guessItems = [
        {
            accepted: ["epsilon", "1", "11"],
            rejected: ["0", "10"],
            answer: "ones"
        },
        {
            accepted: ["1", "01"],
            rejected: ["epsilon", "0", "11"],
            answer: "finite"
        },
        {
            accepted: ["10", "010", "001011"],
            rejected: ["1", "01", "011"],
            answer: "zero-or-10"
        }
    ];

    let activeRunId = 0;
    let lastAnnouncedStep = 0;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stepDelay = prefersReducedMotion ? 120 : 650;

    function parseInput(value) {
        const trimmed = value.trim();
        if (trimmed === "" || trimmed.toLowerCase() === "epsilon" || trimmed === "ε") {
            return { display: "epsilon", symbols: [] };
        }

        return { display: trimmed.replace(/\s+/g, ""), symbols: trimmed.replace(/\s+/g, "").split("") };
    }

    function setError(message, isSuccess = false) {
        if (!errorMessage) {
            return;
        }

        errorMessage.textContent = message;
        errorMessage.classList.toggle("is-success", isSuccess);
    }

    function wait(milliseconds) {
        return new Promise(resolve => window.setTimeout(resolve, milliseconds));
    }

    function setRunning(isRunning) {
        machineSelect.disabled = isRunning;
        input.disabled = isRunning;
        stringChips.forEach(button => {
            button.disabled = isRunning;
        });
        if (runButton) runButton.disabled = isRunning;
        if (runButtonLabel) runButtonLabel.textContent = isRunning ? "กำลัง Test..." : "Test";
        form.setAttribute("aria-busy", String(isRunning));
        languageResults?.setAttribute("aria-busy", String(isRunning));
    }

    function cancelActiveRun() {
        activeRunId += 1;
        setRunning(false);
    }

    function makeCell(value) {
        const cell = document.createElement("td");
        cell.textContent = value;
        return cell;
    }

    function simulate(machine, symbols) {
        let state = machine.start;
        const path = [state];
        const rows = symbols.map((symbol, index) => {
            const next = machine.transitions[state][symbol];
            const row = {
                step: index + 1,
                current: state,
                input: symbol,
                next
            };
            state = next;
            path.push(state);
            return row;
        });

        return {
            rows,
            path,
            endState: state,
            accepted: machine.finals.has(state)
        };
    }

    function makeStepRow(row) {
        const tr = document.createElement("tr");
        tr.className = "is-latest";
        const stepCell = document.createElement("th");
        stepCell.scope = "row";
        stepCell.textContent = String(row.step);
        const marker = document.createElement("span");
        marker.className = "table-current-marker";
        marker.textContent = "Current";
        stepCell.append(" ", marker);
        tr.appendChild(stepCell);
        [row.current, row.input, row.next]
            .forEach(value => tr.appendChild(makeCell(value)));
        return tr;
    }

    function highlightMachineState(state) {
        machineSummary?.querySelectorAll("[data-machine-state]").forEach(badge => {
            const isCurrent = badge.dataset.machineState === state;
            badge.classList.toggle("is-current", isCurrent);
            if (isCurrent) {
                badge.setAttribute("aria-current", "step");
            } else {
                badge.removeAttribute("aria-current");
            }
            const currentMarker = badge.querySelector(".machine-state-row__current");
            if (currentMarker) currentMarker.hidden = !isCurrent;
            const labels = [badge.dataset.machineState];
            if (badge.dataset.machineStart === "true") labels.push("start state");
            if (badge.dataset.machineFinal === "true") labels.push("final state");
            if (isCurrent) labels.push("current state");
            badge.setAttribute("aria-label", labels.join(", "));
        });
    }

    function renderMachineSummary(machine) {
        if (!machineSummary) {
            return;
        }

        const finalText = `{${Array.from(machine.finals).join(", ")}}`;
        machineSummary.innerHTML = "";

        const titleLabel = document.createElement("span");
        titleLabel.className = "machine-summary__label";
        titleLabel.textContent = "Selected machine";

        const title = document.createElement("h3");
        title.className = "machine-summary__title";
        title.textContent = `L(M) = ${machine.title}`;

        const rule = document.createElement("p");
        rule.textContent = machine.rule;

        const meta = document.createElement("div");
        meta.className = "machine-state-row";
        meta.setAttribute("role", "list");
        meta.setAttribute("aria-label", "รายการ state ของ machine");
        machine.states.forEach(state => {
            const badge = document.createElement("span");
            badge.dataset.machineState = state;
            badge.dataset.machineStart = String(machine.start === state);
            badge.dataset.machineFinal = String(machine.finals.has(state));
            badge.classList.toggle("is-final", machine.finals.has(state));
            badge.setAttribute("role", "listitem");
            const stateName = document.createElement("span");
            stateName.className = "machine-state-row__name";
            stateName.textContent = state;
            const startMarker = document.createElement("span");
            startMarker.className = "machine-state-row__marker machine-state-row__start";
            startMarker.textContent = "S";
            startMarker.hidden = machine.start !== state;
            const finalMarker = document.createElement("span");
            finalMarker.className = "machine-state-row__marker machine-state-row__final";
            finalMarker.textContent = "F";
            finalMarker.hidden = !machine.finals.has(state);
            const currentMarker = document.createElement("span");
            currentMarker.className = "machine-state-row__marker machine-state-row__current";
            currentMarker.textContent = "Current";
            currentMarker.hidden = true;
            badge.append(stateName, startMarker, finalMarker, currentMarker);
            meta.appendChild(badge);
        });

        const finals = document.createElement("small");
        finals.textContent = `start = ${machine.start}, F = ${finalText}`;

        machineSummary.append(titleLabel, title, rule, meta, finals);
        highlightMachineState(machine.start);
    }

    function renderStatePath(path, isComplete = false) {
        if (!statePathDisplay) return;
        statePathDisplay.replaceChildren();
        if (!path.length) {
            statePathDisplay.textContent = "-";
            return;
        }

        const list = document.createElement("ol");
        list.className = "language-state-path-list";
        path.forEach((state, index) => {
            const item = document.createElement("li");
            item.className = "language-state-path-node";
            const label = document.createElement("strong");
            label.textContent = state;
            item.appendChild(label);
            const marker = document.createElement("span");
            marker.className = "language-state-path-node__marker";
            marker.textContent = index === 0
                ? "Start"
                : (isComplete && index === path.length - 1 ? "End" : (index === path.length - 1 ? "Current" : "Read"));
            item.appendChild(marker);
            if (index < path.length - 1) {
                const connector = document.createElement("span");
                connector.className = "language-state-path-connector";
                connector.setAttribute("aria-hidden", "true");
                connector.textContent = "→";
                item.appendChild(connector);
            }
            list.appendChild(item);
        });
        statePathDisplay.appendChild(list);
    }

    function updateMembershipPipeline(parsedDisplay, endState, finalText, membershipText, resultClass = "") {
        pipelineInput?.querySelector("strong")?.replaceChildren(document.createTextNode(parsedDisplay));
        pipelineEnd?.querySelector("strong")?.replaceChildren(document.createTextNode(endState));
        pipelineFinal?.querySelector("strong")?.replaceChildren(document.createTextNode(finalText));
        if (pipelineMembership) {
            const value = pipelineMembership.querySelector("strong");
            if (value) value.textContent = membershipText;
            pipelineMembership.classList.remove("is-accepted", "is-rejected");
            if (resultClass) pipelineMembership.classList.add(resultClass);
        }
    }

    function resetResult(options = {}) {
        if (playback) {
            playback.hidden = true;
            playback.classList.remove("is-accepted", "is-rejected");
        }
        if (playbackLabel) playbackLabel.textContent = "Auto trace";
        if (playbackStatus) playbackStatus.textContent = "";
        if (playbackProgress) playbackProgress.style.width = "0%";
        if (playbackTrack) {
            playbackTrack.setAttribute("aria-valuemax", "0");
            playbackTrack.setAttribute("aria-valuenow", "0");
            playbackTrack.setAttribute("aria-valuetext", "ยังไม่เริ่ม");
        }
        renderStatePath([]);
        if (endStateDisplay) endStateDisplay.textContent = "-";
        const machine = machines[machineSelect.value];
        const parsed = parseInput(input.value);
        if (stringDisplay) stringDisplay.textContent = parsed.display;
        updateMembershipPipeline(parsed.display, machine.start, "กำลังตรวจ", "รอการ Test");
        tableBody.innerHTML = '<tr class="is-empty"><td colspan="4">Step 0 · กด Test เพื่อเริ่มดู transition ทีละ step</td></tr>';
        if (announcement) announcement.textContent = "";
        lastAnnouncedStep = 0;
        if (!options.keepMessage) {
            setError("");
        }
    }

    function syncMachine() {
        cancelActiveRun();
        const machine = machines[machineSelect.value];
        renderMachineSummary(machine);
        if (finalStatesDisplay) {
            finalStatesDisplay.textContent = `{${Array.from(machine.finals).join(", ")}}`;
        }
        resetResult();
    }

    function showFinalResult(parsed, result) {
        const membershipText = result.accepted ? "∈ L(M)" : "∉ L(M)";

        if (endStateDisplay) endStateDisplay.textContent = result.endState;
        if (playback) {
            playback.classList.add(result.accepted ? "is-accepted" : "is-rejected");
        }
        if (playbackLabel) playbackLabel.textContent = "Membership result";
        if (playbackStatus) {
            playbackStatus.textContent = `${parsed.display} ${membershipText} · ${result.accepted ? "accepted" : "rejected"}`;
        }
        if (playbackProgress) playbackProgress.style.width = result.rows.length === 0 ? "0%" : "100%";
        if (playbackTrack) {
            playbackTrack.setAttribute("aria-valuenow", String(result.rows.length));
            playbackTrack.setAttribute("aria-valuetext", result.rows.length === 0 ? "No transition · epsilon" : `อ่านครบ ${result.rows.length} steps`);
        }
        renderStatePath(result.path, true);
        updateMembershipPipeline(
            parsed.display,
            result.endState,
            result.accepted ? "อยู่ใน F" : "ไม่อยู่ใน F",
            `${parsed.display} ${membershipText} · ${result.accepted ? "accepted" : "rejected"}`,
            result.accepted ? "is-accepted" : "is-rejected"
        );
    }

    async function testMembership() {
        const machine = machines[machineSelect.value];
        const parsed = parseInput(input.value);

        if (parsed.symbols.some(symbol => symbol !== "0" && symbol !== "1")) {
            input.setAttribute("aria-invalid", "true");
            setError("Input alphabet คือ {0, 1} หรือใช้ epsilon สำหรับ string ว่าง");
            resetResult({ keepMessage: true });
            input.focus();
            return;
        }

        input.removeAttribute("aria-invalid");

        const result = simulate(machine, parsed.symbols);
        const finalText = `{${Array.from(machine.finals).join(", ")}}`;
        const runId = activeRunId + 1;
        activeRunId = runId;

        resetResult({ keepMessage: true });
        setError("");
        setRunning(true);
        if (playback) playback.hidden = false;
        if (playbackLabel) playbackLabel.textContent = "Auto trace";
        if (playbackStatus) playbackStatus.textContent = `เริ่มที่ ${machine.start}`;
        renderStatePath([machine.start]);
        if (endStateDisplay) endStateDisplay.textContent = machine.start;
        if (finalStatesDisplay) finalStatesDisplay.textContent = finalText;
        if (stringDisplay) stringDisplay.textContent = parsed.display;
        updateMembershipPipeline(parsed.display, machine.start, "กำลังตรวจ", "กำลังตรวจ");
        if (playbackTrack) {
            playbackTrack.setAttribute("aria-valuemax", String(result.rows.length));
            playbackTrack.setAttribute("aria-valuenow", "0");
            playbackTrack.setAttribute("aria-valuetext", result.rows.length === 0 ? "No transition · epsilon" : `Step 0 จาก ${result.rows.length}`);
        }
        if (announcement) announcement.textContent = `เริ่มที่ ${machine.start}`;
        lastAnnouncedStep = 0;
        highlightMachineState(machine.start);
        tableBody.replaceChildren();
        window.requestAnimationFrame(() => {
            languageResults?.scrollIntoView({
                behavior: prefersReducedMotion ? "auto" : "smooth",
                block: "start"
            });
            languageResults?.focus({ preventScroll: true });
        });

        if (result.rows.length === 0) {
            tableBody.innerHTML = '<tr class="is-empty"><td colspan="4">Step 0 · ไม่มี transition · end state = start state</td></tr>';
            if (playbackStatus) playbackStatus.textContent = "epsilon · ไม่ต้องอ่าน symbol";
            if (announcement) announcement.textContent = `epsilon ไม่มี transition; end state เท่ากับ start state ${machine.start}`;
            await wait(stepDelay);
        } else {
            for (let index = 0; index < result.rows.length; index += 1) {
                await wait(stepDelay);
                if (runId !== activeRunId) return;

                tableBody.querySelector(".is-latest")?.classList.remove("is-latest");
                tableBody.appendChild(makeStepRow(result.rows[index]));
                const completedSteps = index + 1;
                const currentState = result.path[completedSteps];
                renderStatePath(result.path.slice(0, completedSteps + 1));
                if (endStateDisplay) endStateDisplay.textContent = currentState;
                updateMembershipPipeline(parsed.display, currentState, "กำลังตรวจ", "กำลังตรวจ");
                if (playbackStatus) {
                    playbackStatus.textContent = `Step ${completedSteps} / ${result.rows.length} · อ่าน ${result.rows[index].input}`;
                }
                if (playbackProgress) {
                    playbackProgress.style.width = `${(completedSteps / result.rows.length) * 100}%`;
                }
                if (playbackTrack) {
                    playbackTrack.setAttribute("aria-valuenow", String(completedSteps));
                    playbackTrack.setAttribute("aria-valuetext", `Step ${completedSteps} จาก ${result.rows.length}`);
                }
                if (announcement && completedSteps > lastAnnouncedStep) {
                    announcement.textContent = `Step ${completedSteps} จาก ${result.rows.length}: อ่าน ${result.rows[index].input}, ย้ายจาก ${result.rows[index].current} ไป ${result.rows[index].next}`;
                    lastAnnouncedStep = completedSteps;
                }
                highlightMachineState(currentState);
            }

            await wait(Math.min(stepDelay, 320));
        }

        if (runId !== activeRunId) return;
        if (announcement) {
            const membershipAnnouncement = result.accepted ? `${parsed.display} อยู่ใน L(M)` : `${parsed.display} ไม่อยู่ใน L(M)`;
            const finalAnnouncement = result.accepted ? `end state ${result.endState} อยู่ใน F` : `end state ${result.endState} ไม่อยู่ใน F`;
            announcement.textContent = result.rows.length === 0
                ? `epsilon ไม่มี transition; end state เท่ากับ start state ${result.endState}; ${membershipAnnouncement}; ${finalAnnouncement}`
                : `${membershipAnnouncement}; ${finalAnnouncement}`;
        }
        showFinalResult(parsed, result);
        setRunning(false);
    }

    function updateStringFromChip(button) {
        const action = button.dataset.stringAction;
        const parsed = parseInput(input.value);
        let symbols = parsed.symbols;

        if (action === "append") {
            symbols = [...symbols, button.dataset.symbol];
        } else if (action === "remove") {
            symbols = symbols.slice(0, -1);
        } else {
            symbols = [];
        }

        input.value = symbols.length > 0 ? symbols.join("") : "epsilon";
        input.removeAttribute("aria-invalid");
        resetResult();
        highlightMachineState(machines[machineSelect.value].start);
    }

    function renderGuessActivity() {
        if (!guessGrid) {
            return;
        }

        guessGrid.replaceChildren(...guessItems.map((item, index) => {
            const card = document.createElement("article");
            card.className = "guess-card";
            card.setAttribute("role", "group");

            const heading = document.createElement("strong");
            heading.id = `guess-card-title-${index + 1}`;
            card.setAttribute("aria-labelledby", heading.id);
            heading.textContent = `Set ${index + 1}`;

            const accepted = document.createElement("div");
            accepted.className = "guess-card__examples guess-card__examples--accepted";
            const acceptedLabel = document.createElement("span");
            acceptedLabel.textContent = "Accepted";
            const acceptedList = document.createElement("ul");
            item.accepted.forEach(example => {
                const li = document.createElement("li");
                li.textContent = example;
                acceptedList.appendChild(li);
            });
            accepted.append(acceptedLabel, acceptedList);

            const rejected = document.createElement("div");
            rejected.className = "guess-card__examples guess-card__examples--rejected";
            const rejectedLabel = document.createElement("span");
            rejectedLabel.textContent = "Rejected";
            const rejectedList = document.createElement("ul");
            item.rejected.forEach(example => {
                const li = document.createElement("li");
                li.textContent = example;
                rejectedList.appendChild(li);
            });
            rejected.append(rejectedLabel, rejectedList);

            const choices = document.createElement("div");
            choices.className = "guess-card__choices";

            Object.entries(machines).forEach(([key, machine]) => {
                const button = document.createElement("button");
                button.type = "button";
                button.textContent = machine.title;
                button.dataset.guess = key;
                button.setAttribute("aria-pressed", "false");
                choices.appendChild(button);
            });

            const note = document.createElement("small");
            note.className = "guess-card__feedback";
            note.setAttribute("role", "status");
            note.setAttribute("aria-live", "polite");
            note.setAttribute("aria-atomic", "true");
            note.textContent = "เลือก rule ที่ตรงกับ examples";

            choices.querySelectorAll("button").forEach(button => {
                button.addEventListener("click", () => {
                    const isCorrect = button.dataset.guess === item.answer;
                    choices.querySelectorAll("button").forEach(choice => {
                        choice.classList.toggle("is-selected", choice === button);
                        choice.setAttribute("aria-pressed", String(choice === button));
                    });
                    card.classList.toggle("is-correct", isCorrect);
                    card.classList.toggle("is-wrong", !isCorrect);
                    note.textContent = isCorrect
                        ? `✓ ถูกต้อง: examples ชุดนี้อธิบาย L(M) = ${machines[item.answer].title}`
                        : `× ยังไม่ตรง: ลองเทียบ accepted/rejected examples กับนิยามของ L(M) อีกครั้ง · เลือกใหม่ได้`;
                });
            });

            card.append(heading, accepted, rejected, choices, note);
            return card;
        }));
    }

    form.addEventListener("submit", event => {
        event.preventDefault();
        testMembership();
    });

    stringChips.forEach(button => {
        button.addEventListener("click", () => updateStringFromChip(button));
    });

    openHowToButton?.addEventListener("click", () => howToDialog?.showModal());
    closeHowToButton?.addEventListener("click", () => howToDialog?.close());
    howToDialog?.addEventListener("close", () => openHowToButton?.focus());
    howToDialog?.addEventListener("click", event => {
        if (event.target === howToDialog) {
            howToDialog.close();
        }
    });

    machineSelect.addEventListener("change", syncMachine);
    resetButton?.addEventListener("click", () => {
        cancelActiveRun();
        machineSelect.value = "ones";
        input.value = "epsilon";
        input.removeAttribute("aria-invalid");
        syncMachine();
    });

    renderGuessActivity();
    syncMachine();
});
