document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("fsa-form");
    const input = document.getElementById("fsa-input");
    const errorMessage = document.getElementById("fsa-error");
    const feedback = document.getElementById("fsa-feedback");
    const endStateDisplay = document.getElementById("fsa-end-state");
    const resultDisplay = document.getElementById("fsa-result");
    const currentStateDisplay = document.getElementById("fsa-current-state");
    const cursorDisplay = document.getElementById("fsa-cursor");
    const tape = document.getElementById("fsa-bit-tape");
    const tableBody = document.getElementById("fsa-body");
    const resetButton = document.getElementById("fsa-reset");
    const removeBitButton = document.getElementById("fsa-remove-bit");
    const clearInputButton = document.getElementById("fsa-clear-input");
    const resultsPanel = document.getElementById("fsa-results");
    const simulationStatus = document.getElementById("fsa-simulation-status");
    const stepNote = document.getElementById("fsa-step-note");
    const announcement = document.getElementById("fsa-announcement");
    const stepToolbar = document.getElementById("fsa-step-toolbar");
    const previousStepButton = document.getElementById("fsa-previous-step");
    const nextStepButton = document.getElementById("fsa-next-step");
    const stepCounter = document.getElementById("fsa-step-counter");
    const stepProgressBar = document.getElementById("fsa-step-progress-bar");
    const conclusion = document.getElementById("fsa-conclusion");
    const predictionDisplay = document.getElementById("fsa-prediction");
    const howToDialog = document.getElementById("fsa-how-to-dialog");
    const openHowToButton = document.getElementById("open-fsa-how-to");
    const closeHowToButton = document.getElementById("close-fsa-how-to");

    if (!form || !input || !tableBody) return;

    const finalStates = new Set(["s0", "s1", "s2", "s3"]);
    const finalStatesLabel = "{s0, s1, s2, s3}";
    const transitions = {
        s0: { "0": "s0", "1": "s1" },
        s1: { "0": "s0", "1": "s2" },
        s2: { "0": "s0", "1": "s3" },
        s3: { "0": "s2", "1": "s1" }
    };

    let activeRun = null;
    let visibleStep = 0;
    let autoplayTimer = null;
    let lastAnnouncedStep = -1;
    let lastAnnouncedComplete = false;

    function sanitizeBinary(value) {
        return value.trim().replace(/\s+/g, "");
    }

    function setError(message, isSuccess = false) {
        errorMessage.textContent = message;
        errorMessage.classList.toggle("is-success", isSuccess);
    }

    function stopAutoplay() {
        window.clearTimeout(autoplayTimer);
        autoplayTimer = null;
    }

    function simulate(value) {
        let state = "s0";
        const rows = value.split("").map((bit, index) => {
            const next = transitions[state][bit];
            const row = { step: index + 1, current: state, input: bit, next, path: `${state} —${bit}→ ${next}` };
            state = next;
            return row;
        });
        return { rows, endState: state, accepted: finalStates.has(state) };
    }

    function setSimulationStatus(text, state = "idle") {
        if (!simulationStatus) return;
        simulationStatus.textContent = text;
        simulationStatus.classList.toggle("is-running", state === "running");
        simulationStatus.classList.toggle("is-complete", state === "complete");
    }

    function renderTape(value = "", step = 0) {
        if (!tape) return;
        if (!value) {
            tape.textContent = "-";
            return;
        }
        const nodes = value.split("").map((bit, index) => {
            const node = document.createElement("span");
            node.textContent = bit;
            const isRead = index < step;
            const isCurrent = index === step - 1;
            const isPending = index >= step;
            node.classList.toggle("is-read", isRead);
            node.classList.toggle("is-current", isCurrent);
            node.classList.toggle("is-pending", isPending);
            node.dataset.tapeState = isCurrent ? "current" : isRead ? "read" : "pending";
            const stateLabel = isCurrent ? "อ่านแล้วและเป็นตำแหน่งปัจจุบัน" : isRead ? "อ่านแล้ว" : "รอการอ่าน";
            node.setAttribute("aria-label", `Step ${index + 1}: input ${bit}, ${stateLabel}`);
            return node;
        });
        tape.replaceChildren(...nodes);
    }

    function renderTable(rows) {
        if (!rows.length) {
            tableBody.innerHTML = '<tr class="is-empty"><td colspan="5">กำลังรอ step แรก...</td></tr>';
            return;
        }
        tableBody.replaceChildren(...rows.map((row, index) => {
            const tr = document.createElement("tr");
            tr.classList.toggle("is-active", index === rows.length - 1);
            const stepCell = document.createElement("th");
            stepCell.scope = "row";
            stepCell.textContent = String(row.step);
            if (index === rows.length - 1) {
                const marker = document.createElement("span");
                marker.className = "visually-hidden";
                marker.textContent = " Current";
                stepCell.appendChild(marker);
            }
            tr.appendChild(stepCell);
            [row.current, row.input, row.next, row.path].forEach(value => {
                const td = document.createElement("td");
                td.textContent = value;
                tr.appendChild(td);
            });
            return tr;
        }));
    }

    function updateDiagram(state) {
        document.querySelectorAll("[data-fsa-state]").forEach(node => {
            const isActive = node.dataset.fsaState === state;
            node.classList.toggle("is-active", isActive);
            if (isActive) {
                node.setAttribute("aria-current", "step");
            } else {
                node.removeAttribute("aria-current");
            }
        });

        const currentRow = activeRun?.result.rows[visibleStep - 1];
        const activeEdge = currentRow ? `${currentRow.current}-${currentRow.input}-${currentRow.next}` : "";
        document.querySelectorAll("[data-fsa-edge]").forEach(edge => {
            const isActive = edge.dataset.fsaEdge === activeEdge;
            edge.classList.toggle("is-active-edge", isActive);
            edge.setAttribute("marker-end", `url(#${isActive ? "fsa-arrow-active" : "fsa-arrow"})`);
        });
    }

    function showConclusion() {
        if (!activeRun || !conclusion) return;
        const { result, prediction } = activeRun;
        const predictionIsCorrect = prediction === result.endState;
        endStateDisplay.textContent = result.endState;
        if (predictionDisplay) predictionDisplay.textContent = prediction || "ยังไม่ได้เลือก";
        resultDisplay.textContent = result.accepted ? "Accepted" : "Rejected";
        feedback.textContent = predictionIsCorrect ? "ทาย end state ถูกต้อง" : `คำตอบที่ถูกคือ ${result.endState}`;
        conclusion.classList.toggle("is-accepted", result.accepted);
        conclusion.classList.toggle("is-rejected", !result.accepted);
        conclusion.classList.toggle("is-wrong", !predictionIsCorrect);
        conclusion.hidden = false;
    }

    function updateStepView(step) {
        if (!activeRun) return;
        const { value, result } = activeRun;
        const totalSteps = result.rows.length;
        visibleStep = Math.max(0, Math.min(step, totalSteps));
        const currentRow = result.rows[visibleStep - 1];
        const currentState = currentRow?.next ?? "s0";

        renderTape(value, visibleStep);
        renderTable(result.rows.slice(0, visibleStep));
        updateDiagram(currentState);
        currentStateDisplay.textContent = currentState;
        cursorDisplay.textContent = `${visibleStep} / ${totalSteps}`;
        stepCounter.textContent = `Step ${visibleStep} / ${totalSteps}`;
        const progressPercent = totalSteps > 0 ? (visibleStep / totalSteps) * 100 : 0;
        stepProgressBar.style.width = `${progressPercent}%`;
        const progressTrack = stepProgressBar.parentElement;
        progressTrack.setAttribute("aria-valuemax", String(totalSteps));
        progressTrack.setAttribute("aria-valuenow", String(visibleStep));
        progressTrack.setAttribute("aria-valuetext", `Step ${visibleStep} จาก ${totalSteps}`);
        previousStepButton.disabled = visibleStep === 0;
        nextStepButton.disabled = visibleStep === totalSteps;

        stepNote.hidden = visibleStep === 0;
        stepNote.textContent = visibleStep === 0
            ? ""
            : `Step ${visibleStep}: อ่าน ${currentRow.input} แล้วเปลี่ยนจาก ${currentRow.current} ไป ${currentRow.next}`;

        if (announcement && visibleStep > 0 && currentRow && lastAnnouncedStep !== visibleStep) {
            announcement.textContent = `Step ${visibleStep} จาก ${totalSteps}: อ่าน ${currentRow.input}, ย้ายจาก ${currentRow.current} ไป ${currentRow.next}`;
            lastAnnouncedStep = visibleStep;
        }

        const isComplete = visibleStep === totalSteps;
        conclusion.hidden = !isComplete;
        if (isComplete) {
            stopAutoplay();
            setError("");
            setSimulationStatus("เฉลยครบแล้ว", "complete");
            showConclusion();
            if (announcement && !lastAnnouncedComplete) {
                const predictionIsCorrect = activeRun.prediction === result.endState;
                announcement.textContent = `จบที่ ${result.endState}; prediction ${predictionIsCorrect ? "ถูก" : "ผิด"}; Accepted เพราะ ${result.endState} อยู่ใน F`;
                lastAnnouncedComplete = true;
            }
        } else {
            setSimulationStatus(`กำลังเฉลย ${visibleStep}/${totalSteps}`, "running");
            lastAnnouncedComplete = false;
        }
    }

    function scheduleNextStep() {
        if (!activeRun || visibleStep >= activeRun.result.rows.length) return;
        const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 250 : 700;
        autoplayTimer = window.setTimeout(() => {
            updateStepView(visibleStep + 1);
            scheduleNextStep();
        }, delay);
    }

    function clearSimulationView() {
        stopAutoplay();
        activeRun = null;
        visibleStep = 0;
        lastAnnouncedStep = -1;
        lastAnnouncedComplete = false;
        renderTape();
        tableBody.innerHTML = '<tr class="is-empty"><td colspan="5">ยังไม่มี simulation</td></tr>';
        updateDiagram("s0");
        currentStateDisplay.textContent = "s0";
        cursorDisplay.textContent = "0 / 0";
        if (stepProgressBar) {
            stepProgressBar.style.width = "0%";
            const progressTrack = stepProgressBar.parentElement;
            progressTrack.setAttribute("aria-valuemax", "0");
            progressTrack.setAttribute("aria-valuenow", "0");
            progressTrack.setAttribute("aria-valuetext", "Step 0 จาก 0");
        }
        if (announcement) announcement.textContent = "";
        stepNote.textContent = "";
        stepNote.hidden = true;
        stepToolbar.hidden = true;
        conclusion.hidden = true;
        setSimulationStatus("รอการ Run");
    }

    function runSimulation() {
        const value = sanitizeBinary(input.value);
        if (!value) {
            clearSimulationView();
            setError("กรุณาใส่ binary string อย่างน้อย 1 bit");
            input.setAttribute("aria-invalid", "true");
            input.focus();
            return;
        }
        if (/[^01]/.test(value)) {
            clearSimulationView();
            setError("Input alphabet คือ {0, 1} เท่านั้น");
            input.setAttribute("aria-invalid", "true");
            input.focus();
            return;
        }

        input.value = value;
        input.removeAttribute("aria-invalid");
        activeRun = {
            value,
            result: simulate(value),
            prediction: form.querySelector('input[name="end-state-prediction"]:checked')?.value
        };
        stepToolbar.hidden = false;
        setError("");
        updateStepView(0);
        window.requestAnimationFrame(() => {
            resultsPanel?.scrollIntoView({ behavior: "auto", block: "start" });
            resultsPanel?.focus({ preventScroll: true });
        });
        scheduleNextStep();
    }

    function insertBit(bit) {
        const focused = document.activeElement === input;
        const start = focused ? (input.selectionStart ?? input.value.length) : input.value.length;
        const end = focused ? (input.selectionEnd ?? start) : start;
        input.setRangeText(bit, start, end, "end");
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.focus();
    }

    function resetView() {
        input.value = "";
        form.querySelector('input[name="end-state-prediction"][value="s0"]')?.click();
        setError("");
        input.removeAttribute("aria-invalid");
        clearSimulationView();
    }

    form.addEventListener("submit", event => {
        event.preventDefault();
        runSimulation();
    });
    input.addEventListener("input", () => {
        if (activeRun) clearSimulationView();
        input.removeAttribute("aria-invalid");
        setError("");
    });
    document.querySelectorAll("[data-fsa-bit]").forEach(button => {
        button.addEventListener("click", () => insertBit(button.dataset.fsaBit));
    });
    removeBitButton?.addEventListener("click", () => {
        input.value = input.value.slice(0, -1);
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.focus();
    });
    clearInputButton?.addEventListener("click", () => {
        input.value = "";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.focus();
    });
    previousStepButton?.addEventListener("click", () => {
        stopAutoplay();
        updateStepView(visibleStep - 1);
    });
    nextStepButton?.addEventListener("click", () => {
        stopAutoplay();
        updateStepView(visibleStep + 1);
    });
    resetButton?.addEventListener("click", resetView);
    openHowToButton?.addEventListener("click", () => howToDialog?.showModal());
    closeHowToButton?.addEventListener("click", () => howToDialog?.close());
    howToDialog?.addEventListener("click", event => {
        if (event.target === howToDialog) howToDialog.close();
    });
    howToDialog?.addEventListener("close", () => openHowToButton?.focus());

    resetView();
});
