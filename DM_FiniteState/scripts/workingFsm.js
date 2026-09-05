document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("working-fsm-form");
    const inputString = document.getElementById("input-string");
    const predictionString = document.getElementById("prediction-string");
    const inputError = document.getElementById("input-error");
    const predictionLimitStatus = document.getElementById("prediction-limit-status");
    const predictionTrack = document.getElementById("prediction-track");
    const simulationBody = document.getElementById("simulation-body");
    const statePath = document.getElementById("state-path");
    const stepFocusTitle = document.getElementById("step-focus-title");
    const stepFocusDetail = document.getElementById("step-focus-detail");
    const stepCount = document.getElementById("step-count");
    const stepAnnouncement = document.getElementById("working-step-announcement");
    const stepFocus = document.querySelector("#page-working-fsm .step-focus");
    const stepSlider = document.getElementById("step-slider");
    const previousStep = document.getElementById("previous-step");
    const nextStep = document.getElementById("next-step");
    const runButton = document.getElementById("run-working-fsm");
    const runButtonLabel = document.getElementById("run-working-fsm-label");
    const runStatus = document.getElementById("run-status");
    const resetButton = document.getElementById("reset-working-fsm");
    const stepAnswerStatus = document.getElementById("step-answer-status");
    const howToDialog = document.getElementById("working-how-to-dialog");
    const openHowToButton = document.getElementById("open-working-how-to");
    const closeHowToButton = document.getElementById("close-working-how-to");

    if (!form || !inputString || !predictionString || !simulationBody) {
        return;
    }

    const allowedInputs = new Set(["5", "10", "O", "R"]);
    const MAX_INPUT_SYMBOLS = 8;
    const stateMeanings = {
        s0: "เงินสะสม 0 บาท",
        s1: "เงินสะสม 5 บาท",
        s2: "เงินสะสม 10 บาท",
        s3: "เงินสะสม 15 บาท",
        s4: "เงินสะสม 20 บาท พร้อมเลือกสินค้า"
    };
    const rules = {
        s0: {
            "5": { next: "s1", output: "n" },
            "10": { next: "s2", output: "n" },
            O: { next: "s0", output: "n" },
            R: { next: "s0", output: "n" }
        },
        s1: {
            "5": { next: "s2", output: "n" },
            "10": { next: "s3", output: "n" },
            O: { next: "s1", output: "n" },
            R: { next: "s1", output: "n" }
        },
        s2: {
            "5": { next: "s3", output: "n" },
            "10": { next: "s4", output: "n" },
            O: { next: "s2", output: "n" },
            R: { next: "s2", output: "n" }
        },
        s3: {
            "5": { next: "s4", output: "n" },
            "10": { next: "s4", output: "5" },
            O: { next: "s3", output: "n" },
            R: { next: "s3", output: "n" }
        },
        s4: {
            "5": { next: "s4", output: "5" },
            "10": { next: "s4", output: "10" },
            O: { next: "s0", output: "Cornae" },
            R: { next: "s0", output: "Party" }
        }
    };

    let currentRows = [];
    let currentStepIndex = 0;
    let revealedStepIndex = 0;
    let autoRunTimer = null;
    let isAutoRunning = false;
    let lastPredictionStatus = "";
    let lastAnnouncedStepIndex = -1;
    const autoStepDelay = 1100;

    function parseInput(value) {
        return value
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .map(symbol => symbol.toUpperCase());
    }

    function normalizeToken(value) {
        return String(value ?? "").trim().toLowerCase();
    }

    function getStringTokens(field) {
        return field.value.trim().split(/\s+/).filter(Boolean);
    }

    function updateStringField(field, tokens) {
        field.value = tokens.join(" ");
        field.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function getInputLimit() {
        return parseInput(inputString.value).length;
    }

    function updatePredictionLimit(message = "") {
        const limit = getInputLimit();
        const tokens = getStringTokens(predictionString);

        if (tokens.length > limit) {
            tokens.length = limit;
            predictionString.value = tokens.join(" ");
        }

        const nextPredictionStatus = `Prediction ${tokens.length} / ${limit} symbols`;
        if (predictionLimitStatus && nextPredictionStatus !== lastPredictionStatus) {
            predictionLimitStatus.textContent = nextPredictionStatus;
            lastPredictionStatus = nextPredictionStatus;
        }

        if (message) {
            setMessage(message);
        }

        renderPredictionTrack();
    }

    function handleBuilderButton(button) {
        const field = document.getElementById(button.dataset.stringTarget);
        if (!(field instanceof HTMLInputElement)) {
            return;
        }

        const tokens = getStringTokens(field);
        if (button.dataset.action === "undo") {
            tokens.pop();
        } else if (button.dataset.action === "clear") {
            tokens.length = 0;
        } else if (button.dataset.symbol) {
            if (field === inputString && tokens.length >= MAX_INPUT_SYMBOLS) {
                setMessage(`Input ใส่ได้ไม่เกิน ${MAX_INPUT_SYMBOLS} symbols`);
                return;
            }
            if (field === predictionString && tokens.length >= getInputLimit()) {
                const limit = getInputLimit();
                setMessage(limit === 0
                    ? "กรุณาสร้าง Input string ก่อนใส่ prediction"
                    : `Prediction ใส่ได้ไม่เกิน ${limit} symbols ตามจำนวน input`);
                return;
            }
            tokens.push(button.dataset.symbol);
        }

        updateStringField(field, tokens);
    }

    function setMessage(message, type = "error") {
        if (!inputError) {
            return;
        }

        inputError.textContent = message;
        inputError.classList.toggle("is-success", type === "success");
    }

    function isPredictionCorrect(stepIndex) {
        if (stepIndex < 1 || !currentRows[stepIndex]) {
            return null;
        }

        const prediction = getStringTokens(predictionString)[stepIndex - 1];
        return normalizeToken(prediction) === normalizeToken(currentRows[stepIndex].output);
    }

    function renderPredictionTrack() {
        if (!predictionTrack) {
            return;
        }

        const inputCount = getInputLimit();
        const predictionTokens = getStringTokens(predictionString);
        const slots = Array.from({ length: inputCount }, (_, index) => {
            const stepIndex = index + 1;
            const slot = document.createElement("span");
            const prediction = predictionTokens[index] || "?";
            slot.textContent = prediction;
            slot.dataset.stepIndex = String(stepIndex);
            slot.title = `Prediction ของ Step ${stepIndex}`;
            slot.setAttribute("aria-label", `Prediction Step ${stepIndex}: ${prediction}`);

            if (currentRows.length && stepIndex <= revealedStepIndex) {
                const correct = isPredictionCorrect(stepIndex);
                slot.classList.add(correct ? "is-correct" : "is-wrong");
                if (!correct) {
                    slot.textContent = `${prediction} → ${currentRows[stepIndex].output}`;
                    slot.title = `Step ${stepIndex}: ตอบ ${prediction} แต่คำตอบคือ ${currentRows[stepIndex].output}`;
                    slot.setAttribute("aria-label", `Step ${stepIndex}: ตอบ ${prediction} แต่คำตอบคือ ${currentRows[stepIndex].output}`);
                }
            } else if (currentRows.length) {
                slot.classList.add("is-locked");
            }

            return slot;
        });

        predictionTrack.replaceChildren(...slots);
        predictionTrack.hidden = slots.length === 0;
    }

    function clearSimulationView(title, detail) {
        currentRows = [];
        currentStepIndex = 0;
        revealedStepIndex = 0;
        lastAnnouncedStepIndex = -1;

        if (statePath) {
            const start = document.createElement("span");
            start.textContent = "s0";
            start.dataset.pathIndex = "0";
            start.setAttribute("role", "listitem");
            start.setAttribute("aria-label", "ลำดับที่ 1: s0");
            statePath.replaceChildren(start);
        }

        simulationBody.innerHTML = '<tr class="is-empty"><td colspan="5">ยังไม่มี simulation</td></tr>';

        if (stepFocusTitle) {
            stepFocusTitle.textContent = title;
        }

        if (stepFocusDetail) {
            stepFocusDetail.textContent = detail;
        }

        if (stepAnswerStatus) {
            stepAnswerStatus.textContent = "";
            stepAnswerStatus.className = "step-answer-status";
        }
        stepFocus?.classList.remove("has-wrong-answer");

        if (stepSlider) {
            stepSlider.value = "0";
            stepSlider.max = "0";
            stepSlider.disabled = true;
            stepSlider.setAttribute("aria-valuetext", "Step 0 จาก 0 ที่เปิดดูได้");
        }

        if (stepCount) {
            stepCount.textContent = "Step 0 / 0";
        }

        if (stepAnnouncement) {
            stepAnnouncement.textContent = "";
        }

        if (previousStep) previousStep.disabled = true;
        if (nextStep) nextStep.disabled = true;

        renderPredictionTrack();
    }

    function makeCell(value, tagName = "td") {
        const cell = document.createElement(tagName);
        cell.textContent = value;
        return cell;
    }

    function renderTable(rows) {
        simulationBody.replaceChildren(...rows.map(row => {
            const tr = document.createElement("tr");
            tr.dataset.stepIndex = String(row.step);
            [
                String(row.step),
                row.current,
                row.input,
                row.next,
                row.output
            ].forEach((value, index) => {
                const cell = makeCell(value, index === 0 ? "th" : "td");
                if (index === 0) {
                    cell.scope = "row";
                }
                tr.appendChild(cell);
            });

            if (row.step > 0 && !isPredictionCorrect(row.step)) {
                tr.classList.add("has-wrong-answer");
                tr.lastElementChild?.classList.add("is-wrong-answer");
            }
            return tr;
        }));
    }

    function renderStatePath(rows) {
        if (!statePath) {
            return;
        }

        const pathStates = [rows[0].current, ...rows.slice(1).map(row => row.next)];
        const nodes = [];
        pathStates.forEach((state, index) => {
            const stateNode = document.createElement("span");
            stateNode.textContent = state;
            stateNode.dataset.pathIndex = String(index);
            stateNode.setAttribute("role", "listitem");
            stateNode.setAttribute("aria-label", `ลำดับที่ ${index + 1}: ${state}`);
            nodes.push(stateNode);

            if (index < pathStates.length - 1) {
                const line = document.createElement("i");
                line.setAttribute("aria-hidden", "true");
                nodes.push(line);
            }
        });
        statePath.replaceChildren(...nodes);
    }

    function updateStepFocus() {
        const activeRow = currentRows[currentStepIndex];
        const maxIndex = revealedStepIndex;

        document.querySelectorAll("#simulation-body tr").forEach(row => {
            row.classList.toggle("is-active", Number(row.dataset.stepIndex) === currentStepIndex);
        });

        document.querySelectorAll("#state-path span").forEach(node => {
            const isActive = Number(node.dataset.pathIndex) === currentStepIndex;
            node.classList.toggle("is-active", isActive);
            if (isActive) {
                node.setAttribute("aria-current", "step");
            } else {
                node.removeAttribute("aria-current");
            }
        });

        if (stepSlider) {
            stepSlider.max = String(maxIndex);
            stepSlider.value = String(currentStepIndex);
            stepSlider.disabled = isAutoRunning || maxIndex === 0;
            stepSlider.setAttribute("aria-valuetext", `Step ${currentStepIndex} จาก ${maxIndex} ที่เปิดดูได้`);
        }

        if (stepCount) {
            stepCount.textContent = `Step ${currentStepIndex} / ${maxIndex}`;
        }

        if (previousStep) {
            previousStep.disabled = isAutoRunning || currentStepIndex === 0;
        }

        if (nextStep) {
            nextStep.disabled = isAutoRunning || currentStepIndex === maxIndex;
            nextStep.setAttribute("aria-label", "ดู step ถัดไป");
            nextStep.title = "Step ถัดไป";
        }

        if (!activeRow || !stepFocusTitle || !stepFocusDetail) {
            return;
        }

        if (activeRow.step === 0) {
            stepFocusTitle.textContent = "Step 0: start at s0";
            stepFocusDetail.textContent = "เริ่มต้นที่ s0 ยังไม่มี input และยังไม่มี output";
            if (stepAnswerStatus) {
                stepAnswerStatus.textContent = "";
                stepAnswerStatus.className = "step-answer-status";
            }
            stepFocus?.classList.remove("has-wrong-answer");
            if (stepAnnouncement) {
                stepAnnouncement.textContent = "";
            }
            return;
        }

        stepFocusTitle.textContent = `Step ${activeRow.step}: ${activeRow.current} + ${activeRow.input} -> ${activeRow.next}`;
        stepFocusDetail.textContent = `current state คือ ${activeRow.current} (${stateMeanings[activeRow.current]}) อ่าน input ${activeRow.input} จึงไป ${activeRow.next} และให้ output ${activeRow.output}`;

        const prediction = getStringTokens(predictionString)[activeRow.step - 1] || "ไม่ได้ตอบ";
        const correct = isPredictionCorrect(activeRow.step);
        if (stepAnswerStatus) {
            stepAnswerStatus.textContent = correct
                ? `✓ ถูกต้อง — คุณตอบ ${prediction}`
                : `✕ จุดนี้ตอบผิด — คุณตอบ ${prediction} แต่ output ที่ถูกคือ ${activeRow.output}`;
            stepAnswerStatus.className = `step-answer-status ${correct ? "is-correct" : "is-wrong"}`;
        }

        stepFocus?.classList.toggle("has-wrong-answer", !correct);

        if (stepAnnouncement && lastAnnouncedStepIndex !== activeRow.step) {
            stepAnnouncement.textContent = `Step ${activeRow.step}: ${activeRow.current} รับ ${activeRow.input} ไป ${activeRow.next}; output ${activeRow.output}; คำตอบ ${correct ? "ถูก" : "ผิด"}`;
            lastAnnouncedStepIndex = activeRow.step;
        }
    }

    function buildSimulation(symbols) {
        let state = "s0";
        const rows = [{
            step: 0,
            current: "s0",
            input: "-",
            next: "s0",
            output: "-"
        }];

        symbols.forEach((symbol, index) => {
            const transition = rules[state][symbol];
            rows.push({
                step: index + 1,
                current: state,
                input: symbol,
                next: transition.next,
                output: transition.output
            });
            state = transition.next;
        });

        return rows;
    }

    function setEditorLocked(locked) {
        inputString.readOnly = locked;
        predictionString.readOnly = locked;
        form.querySelectorAll("[data-string-target]").forEach(button => {
            button.disabled = locked;
        });
        form.classList.toggle("is-locked", locked);
    }

    function updateRunControl() {
        if (!runButton || !runButtonLabel) {
            return;
        }

        const totalSteps = Math.max(currentRows.length - 1, 0);
        const isComplete = totalSteps > 0 && revealedStepIndex >= totalSteps;
        runButton.disabled = isAutoRunning || isComplete;
        if (isAutoRunning) {
            runButtonLabel.textContent = `กำลังรัน Step ${Math.min(revealedStepIndex + 1, totalSteps)} / ${totalSteps}`;
        } else {
            runButtonLabel.textContent = isComplete ? "รันครบทุก Step แล้ว" : "เริ่ม Run ทีละ Step";
        }

        if (runStatus) {
            runStatus.textContent = isAutoRunning
                ? "กำลังรันอัตโนมัติ"
                : isComplete
                    ? "รันครบแล้ว — ใช้ลูกศรหรือ slider เพื่อย้อนดู"
                    : "";
            runStatus.classList.toggle("is-complete", isComplete);
        }
    }

    function clearAutoRunTimer() {
        if (autoRunTimer !== null) {
            window.clearTimeout(autoRunTimer);
            autoRunTimer = null;
        }
    }

    function revealNextStep() {
        if (!isAutoRunning || revealedStepIndex >= currentRows.length - 1) {
            return;
        }

        revealedStepIndex = Math.min(revealedStepIndex + 1, currentRows.length - 1);
        currentStepIndex = revealedStepIndex;
        const visibleRows = currentRows.slice(0, revealedStepIndex + 1);

        renderPredictionTrack();
        renderTable(visibleRows);
        renderStatePath(visibleRows);
        updateStepFocus();
        updateRunControl();

        const isComplete = revealedStepIndex === currentRows.length - 1;

        if (isComplete) {
            isAutoRunning = false;
            autoRunTimer = null;
            form.classList.remove("is-running");
            updateRunControl();
            updateStepFocus();
            return;
        }

        updateRunControl();
        autoRunTimer = window.setTimeout(revealNextStep, autoStepDelay);
    }

    function runSimulation() {
        if (isAutoRunning || currentRows.length > 0) {
            return;
        }

        const symbols = parseInput(inputString.value);
        const invalidSymbol = symbols.find(symbol => !allowedInputs.has(symbol));

        if (symbols.length === 0) {
            clearSimulationView("ยังไม่ได้ run", "กรุณาใส่ input string อย่างน้อย 1 symbol");
            setMessage("กรุณาใส่ input string อย่างน้อย 1 symbol");
            inputString.setAttribute("aria-invalid", "true");
            inputString.focus();
            return;
        }

        if (invalidSymbol) {
            clearSimulationView("Input ไม่อยู่ใน alphabet", `${invalidSymbol} ไม่อยู่ใน I = {5, 10, O, R} จึงไม่เริ่ม simulation`);
            setMessage(`${invalidSymbol} is not in the input alphabet.`);
            inputString.setAttribute("aria-invalid", "true");
            inputString.focus();
            return;
        }
        if (symbols.length > MAX_INPUT_SYMBOLS) {
            clearSimulationView("Input ยาวเกินกำหนด", `จำกัด input ไว้ไม่เกิน ${MAX_INPUT_SYMBOLS} symbols จึงยังไม่เริ่ม simulation`);
            setMessage(`Input ใส่ได้ไม่เกิน ${MAX_INPUT_SYMBOLS} symbols`);
            inputString.setAttribute("aria-invalid", "true");
            inputString.focus();
            return;
        }

        inputString.removeAttribute("aria-invalid");
        updatePredictionLimit();
        currentRows = buildSimulation(symbols);
        setEditorLocked(true);
        isAutoRunning = true;
        form.classList.add("is-running");
        updateRunControl();
        setMessage(`กำลังรัน 1 symbol ต่อ 1 step ทั้งหมด ${symbols.length} steps`, "success");

        stepFocus?.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
            block: "start"
        });

        autoRunTimer = window.setTimeout(revealNextStep, 450);
    }

    function resetSimulation() {
        clearAutoRunTimer();
        isAutoRunning = false;
        form.classList.remove("is-running");
        inputString.value = "";
        predictionString.value = "";
        inputString.removeAttribute("aria-invalid");
        predictionString.removeAttribute("aria-invalid");
        setMessage("");
        setEditorLocked(false);
        clearSimulationView("ยังไม่ได้ run", "ป้อน input string แล้วกดเริ่ม Run ระบบจะเลื่อนมาที่ Current Step อัตโนมัติ");
        updatePredictionLimit();
        updateRunControl();
    }

    form.addEventListener("submit", event => {
        event.preventDefault();
        runSimulation();
    });

    form.addEventListener("click", event => {
        if (!(event.target instanceof Element)) {
            return;
        }

        const builderButton = event.target.closest("[data-string-target]");
        if (builderButton instanceof HTMLButtonElement) {
            handleBuilderButton(builderButton);
        }
    });

    inputString.addEventListener("input", () => {
        const before = getStringTokens(predictionString).length;
        const inputTokens = getStringTokens(inputString);
        const exceeded = inputTokens.length > MAX_INPUT_SYMBOLS;
        if (exceeded) {
            inputString.value = inputTokens.slice(0, MAX_INPUT_SYMBOLS).join(" ");
        }
        const parsedInput = parseInput(inputString.value);
        const hasInvalidInput = parsedInput.length > 0 && parsedInput.some(symbol => !allowedInputs.has(symbol));
        inputString.toggleAttribute("aria-invalid", hasInvalidInput);
        updatePredictionLimit();
        const after = getStringTokens(predictionString).length;
        if (exceeded) {
            setMessage(`Input ใส่ได้ไม่เกิน ${MAX_INPUT_SYMBOLS} symbols`);
        } else if (after < before) {
            setMessage(`Prediction ถูกปรับเหลือ ${after} symbols ให้ไม่เกินจำนวน input`);
        } else {
            setMessage("");
        }
    });

    predictionString.addEventListener("input", () => {
        const before = getStringTokens(predictionString).length;
        updatePredictionLimit();
        const after = getStringTokens(predictionString).length;
        if (after < before) {
            setMessage(`Prediction ใส่ได้ไม่เกิน ${getInputLimit()} symbols ตามจำนวน input`);
        } else {
            setMessage("");
        }
    });

    resetButton?.addEventListener("click", resetSimulation);

    stepSlider?.addEventListener("input", () => {
        currentStepIndex = Number(stepSlider.value);
        updateStepFocus();
    });

    previousStep?.addEventListener("click", () => {
        currentStepIndex = Math.max(0, currentStepIndex - 1);
        updateStepFocus();
    });

    nextStep?.addEventListener("click", () => {
        currentStepIndex = Math.min(revealedStepIndex, currentStepIndex + 1);
        updateStepFocus();
    });

    openHowToButton?.addEventListener("click", () => howToDialog?.showModal());
    closeHowToButton?.addEventListener("click", () => howToDialog?.close());
    howToDialog?.addEventListener("click", event => {
        if (event.target === howToDialog) {
            howToDialog.close();
        }
    });
    howToDialog?.addEventListener("close", () => openHowToButton?.focus());

    resetSimulation();
});
