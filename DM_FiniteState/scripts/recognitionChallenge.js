document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("recognition-form");
    const binaryInput = document.getElementById("binary-string");
    const errorMessage = document.getElementById("binary-error");
    const feedback = document.getElementById("recognition-feedback");
    const finalBit = document.getElementById("final-bit");
    const conclusionOutput = document.getElementById("conclusion-output");
    const verdictIcon = document.getElementById("result-verdict-icon");
    const inputBitStream = document.getElementById("input-bit-stream");
    const outputBitStream = document.getElementById("output-bit-stream");
    const triggerNote = document.getElementById("trigger-note");
    const tableBody = document.getElementById("recognition-body");
    const resetButton = document.getElementById("reset-recognition");
    const removeLastBitButton = document.getElementById("remove-last-bit");
    const clearBinaryButton = document.getElementById("clear-binary");
    const resultsSection = document.getElementById("recognition-results");
    const simulationStatus = document.getElementById("simulation-status");
    const stepToolbar = document.getElementById("step-toolbar");
    const previousStepButton = document.getElementById("previous-step");
    const nextStepButton = document.getElementById("next-step");
    const stepCounter = document.getElementById("step-counter");
    const stepProgressBar = document.getElementById("step-progress-bar");
    const conclusion = document.getElementById("recognition-conclusion");
    const announcement = document.getElementById("recognition-announcement");
    const recognitionDecision = document.getElementById("recognition-decision");
    const sortList = document.getElementById("sort-list");
    const howToDialog = document.getElementById("recognizer-how-to-dialog");
    const openHowToButton = document.getElementById("open-recognizer-how-to");
    const closeHowToButton = document.getElementById("close-recognizer-how-to");

    if (!form || !binaryInput || !tableBody) return;

    const stateMeanings = {
        s0: "ยังไม่มี suffix ที่ช่วยให้ครบ 111",
        s1: "suffix ล่าสุดคือ 1",
        s2: "suffix ล่าสุดคือ 11",
        s3: "พบ 111 แล้ว"
    };

    const transitions = {
        s0: { "0": { next: "s0", output: "0" }, "1": { next: "s1", output: "0" } },
        s1: { "0": { next: "s0", output: "0" }, "1": { next: "s2", output: "0" } },
        s2: { "0": { next: "s0", output: "0" }, "1": { next: "s3", output: "1" } },
        s3: { "0": { next: "s3", output: "1" }, "1": { next: "s3", output: "1" } }
    };

    const sortStrings = [
        { value: "111", expected: "recognized" },
        { value: "01110", expected: "recognized" },
        { value: "11011", expected: "not-recognized" },
        { value: "101010", expected: "not-recognized" },
        { value: "111000", expected: "recognized" }
    ];

    const MAX_INPUT_BITS = 8;

    let activeRun = null;
    let visibleStep = 0;
    let autoplayTimer = null;
    let lastAnnouncedStep = -1;
    let lastAnnouncedComplete = false;

    function sanitizeBinary(value) {
        return value.trim().replace(/\s+/g, "");
    }

    function setError(message, isSuccess = false) {
        if (!errorMessage) return;
        errorMessage.textContent = message;
        errorMessage.classList.toggle("is-success", isSuccess);
    }

    function simulate(binaryString) {
        let currentState = "s0";
        let firstTriggerStep = null;
        const rows = binaryString.split("").map((bit, index) => {
            const transition = transitions[currentState][bit];
            const foundNow = currentState !== "s3" && transition.next === "s3";
            if (foundNow) firstTriggerStep = index + 1;

            const row = {
                step: index + 1,
                current: currentState,
                input: bit,
                next: transition.next,
                output: transition.output,
                foundNow
            };
            currentState = transition.next;
            return row;
        });

        return {
            rows,
            outputStream: rows.map(row => row.output).join(""),
            finalOutputBit: rows.at(-1)?.output ?? "0",
            firstTriggerStep
        };
    }

    function stopAutoplay() {
        window.clearTimeout(autoplayTimer);
        autoplayTimer = null;
    }

    function setSimulationStatus(text, state = "idle") {
        if (!simulationStatus) return;
        simulationStatus.textContent = text;
        simulationStatus.classList.toggle("is-running", state === "running");
        simulationStatus.classList.toggle("is-complete", state === "complete");
    }

    function createBitStream(container, bits, options = {}) {
        if (!container) return;
        if (!bits) {
            container.textContent = "ยังไม่มี bit";
            return;
        }

        const { revealedCount = bits.length, currentIndex = null, triggerStartIndex = null } = options;
        const streamLabel = container === inputBitStream ? "Input" : "Output";
        const nodes = bits.split("").map((bit, index) => {
            const node = document.createElement("span");
            node.textContent = bit;
            node.classList.toggle("is-pending", index >= revealedCount);
            node.classList.toggle("is-current", index === currentIndex);
            if (triggerStartIndex !== null && index >= triggerStartIndex && index < triggerStartIndex + 3) {
                node.classList.add("is-trigger");
            }
            if (triggerStartIndex !== null && index === triggerStartIndex) {
                node.dataset.triggerStart = "true";
            }
            const pendingLabel = index >= revealedCount ? ", ยังไม่เปิดเผย" : "";
            const currentLabel = index === currentIndex ? ", current" : "";
            const triggerLabel = node.classList.contains("is-trigger") ? ", เป็นส่วนของ 111 ที่พบ" : "";
            node.setAttribute("aria-label", `${streamLabel} step ${index + 1}: ${bit}${pendingLabel}${currentLabel}${triggerLabel}`);
            node.dataset.stepIndex = String(index + 1);
            return node;
        });
        container.replaceChildren(...nodes);
    }

    function renderTable(rows) {
        if (rows.length === 0) {
            tableBody.innerHTML = '<tr class="is-empty"><td colspan="6">กำลังรอ step แรก...</td></tr>';
            return;
        }

        tableBody.replaceChildren(...rows.map((row, index) => {
            const tr = document.createElement("tr");
            tr.classList.toggle("is-trigger", row.foundNow);
            tr.classList.toggle("is-latest", index === rows.length - 1);
            [
                String(row.step), row.current, row.input, row.next, row.output,
                row.foundNow ? "พบ 111 และเข้าสู่ s3" : stateMeanings[row.next]
            ].forEach((value, cellIndex) => {
                const cell = document.createElement(cellIndex === 0 ? "th" : "td");
                if (cell.tagName === "TH") cell.scope = "row";
                cell.textContent = value;
                if (cellIndex === 0) {
                    const markers = [];
                    if (index === rows.length - 1) markers.push("Current");
                    if (row.foundNow) markers.push("พบ 111");
                    if (markers.length > 0) {
                        const marker = document.createElement("span");
                        marker.className = "visually-hidden";
                        marker.textContent = ` ${markers.join(" ")}`;
                        cell.appendChild(marker);
                    }
                }
                tr.appendChild(cell);
            });
            return tr;
        }));
    }

    function updateStateNodes(state) {
        document.querySelectorAll("[data-state-node]").forEach(node => {
            const isActive = node.dataset.stateNode === state;
            node.classList.toggle("is-active", isActive);
            if (isActive) {
                node.setAttribute("aria-current", "step");
            } else {
                node.removeAttribute("aria-current");
            }
            const currentLabel = node.querySelector(".state-node__current-label");
            currentLabel?.setAttribute("aria-hidden", isActive ? "false" : "true");
        });
    }

    function clearSimulationView(note = "ยังไม่พบ substring 111") {
        stopAutoplay();
        activeRun = null;
        visibleStep = 0;
        lastAnnouncedStep = -1;
        lastAnnouncedComplete = false;
        createBitStream(inputBitStream, "");
        createBitStream(outputBitStream, "");
        if (announcement) announcement.textContent = "";
        resultsSection?.classList.add("is-idle");
        tableBody.innerHTML = '<tr class="is-empty"><td colspan="6">ยังไม่มี simulation</td></tr>';
        updateStateNodes("s0");

        if (triggerNote) {
            triggerNote.textContent = note;
            triggerNote.classList.remove("is-found");
        }
        if (stepToolbar) stepToolbar.hidden = true;
        if (conclusion) conclusion.hidden = true;
        setSimulationStatus("รอการ Run");
    }

    function showConclusion() {
        if (!activeRun || !conclusion) return;
        const { result, prediction, expectedPrediction } = activeRun;

        const predictionIsCorrect = prediction === expectedPrediction;
        if (finalBit) finalBit.textContent = result.finalOutputBit;
        if (conclusionOutput) conclusionOutput.textContent = result.outputStream;
        if (recognitionDecision) {
            recognitionDecision.textContent = result.finalOutputBit === "1" ? "Recognized" : "Not recognized";
        }
        if (verdictIcon) verdictIcon.textContent = predictionIsCorrect ? "✓" : "!";
        if (feedback) {
            feedback.textContent = predictionIsCorrect ? "Correct" : "Incorrect";
        }
        conclusion.classList.toggle("is-correct", predictionIsCorrect);
        conclusion.classList.toggle("is-wrong", !predictionIsCorrect);
        conclusion.hidden = false;
    }

    function updateStepView(step) {
        if (!activeRun) return;
        const { value, result } = activeRun;
        const totalSteps = result.rows.length;
        visibleStep = Math.max(0, Math.min(step, totalSteps));
        const currentRow = result.rows[visibleStep - 1];
        const triggerStartIndex = result.firstTriggerStep === null || visibleStep < result.firstTriggerStep
            ? null
            : result.firstTriggerStep - 3;

        createBitStream(inputBitStream, value, {
            revealedCount: visibleStep,
            currentIndex: visibleStep > 0 ? visibleStep - 1 : null,
            triggerStartIndex
        });
        createBitStream(outputBitStream, result.outputStream.slice(0, visibleStep), {
            currentIndex: visibleStep > 0 ? visibleStep - 1 : null,
            triggerStartIndex
        });
        renderTable(result.rows.slice(0, visibleStep));
        updateStateNodes(currentRow?.next ?? "s0");

        if (stepCounter) stepCounter.textContent = `Step ${visibleStep} / ${totalSteps}`;
        if (stepProgressBar) {
            stepProgressBar.style.width = `${(visibleStep / totalSteps) * 100}%`;
            stepProgressBar.setAttribute("aria-valuenow", String(visibleStep));
            stepProgressBar.setAttribute("aria-valuetext", `Step ${visibleStep} จาก ${totalSteps}`);
        }
        if (previousStepButton) previousStepButton.disabled = visibleStep === 0;
        if (nextStepButton) nextStepButton.disabled = visibleStep === totalSteps;

        if (triggerNote) {
            if (visibleStep === 0) {
                triggerNote.textContent = "เครื่องจะอ่าน input จากซ้ายไปขวาทีละ bit";
            } else if (currentRow.foundNow) {
                triggerNote.textContent = `Step ${visibleStep}: พบ substring 111 — output เปลี่ยนเป็น 1 และเข้าสู่ s3`;
            } else if (currentRow.next === "s3") {
                triggerNote.textContent = `Step ${visibleStep}: พบ 111 ไปแล้ว เครื่องจึงคงอยู่ที่ s3 และ output เป็น 1`;
            } else {
                triggerNote.textContent = `Step ${visibleStep}: อ่าน ${currentRow.input}, ย้ายจาก ${currentRow.current} ไป ${currentRow.next} — ${stateMeanings[currentRow.next]}`;
            }
            triggerNote.classList.toggle("is-found", currentRow?.next === "s3");
        }

        const isComplete = visibleStep === totalSteps;
        if (announcement && visibleStep > 0 && currentRow && lastAnnouncedStep !== visibleStep) {
            announcement.textContent = `Step ${visibleStep} จาก ${totalSteps}: อ่าน ${currentRow.input}, ย้ายจาก ${currentRow.current} ไป ${currentRow.next}, output ${currentRow.output}${currentRow.foundNow ? ", พบ 111" : ""}`;
            lastAnnouncedStep = visibleStep;
        }
        if (conclusion) conclusion.hidden = !isComplete;
        if (isComplete) {
            stopAutoplay();
            setError("");
            setSimulationStatus("เฉลยครบแล้ว", "complete");
            showConclusion();
            if (announcement && !lastAnnouncedComplete) {
                const predictionText = activeRun.prediction === activeRun.expectedPrediction ? "prediction ถูกต้อง" : "prediction ไม่ถูกต้อง";
                announcement.textContent = `สรุปผล: ${predictionText}, output stream คือ ${result.outputStream}, last output bit คือ ${result.finalOutputBit}, เครื่องตัดสิน ${result.finalOutputBit === "1" ? "Recognized" : "Not recognized"}`;
                lastAnnouncedComplete = true;
            }
        } else {
            setSimulationStatus(`กำลังเฉลย ${visibleStep}/${totalSteps}`, "running");
        }
    }

    function scheduleNextStep() {
        if (!activeRun || visibleStep >= activeRun.result.rows.length) return;
        const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 250 : 650;
        autoplayTimer = window.setTimeout(() => {
            updateStepView(visibleStep + 1);
            scheduleNextStep();
        }, delay);
    }

    function resetView() {
        binaryInput.value = "";
        setError("");
        binaryInput.removeAttribute("aria-invalid");
        clearSimulationView();
    }

    function runRecognition() {
        const value = sanitizeBinary(binaryInput.value);
        if (!value) {
            clearSimulationView();
            setError("กรุณาใส่ binary string อย่างน้อย 1 bit");
            binaryInput.setAttribute("aria-invalid", "true");
            binaryInput.focus();
            return;
        }
        if (/[^01]/.test(value)) {
            clearSimulationView("input ต้องประกอบด้วย 0 และ 1 เท่านั้น จึงยังไม่ run simulation");
            setError("Binary string ใช้ได้เฉพาะ symbol 0 และ 1");
            binaryInput.setAttribute("aria-invalid", "true");
            binaryInput.focus();
            return;
        }
        if (value.length > MAX_INPUT_BITS) {
            clearSimulationView(`input ยาวเกินกำหนด — จำกัดไว้ไม่เกิน ${MAX_INPUT_BITS} bit`);
            setError(`Binary string ใส่ได้ไม่เกิน ${MAX_INPUT_BITS} bit`);
            binaryInput.setAttribute("aria-invalid", "true");
            binaryInput.focus();
            return;
        }

        binaryInput.value = value;
        binaryInput.removeAttribute("aria-invalid");
        const result = simulate(value);
        const recognized = result.finalOutputBit === "1";
        const prediction = form.querySelector('input[name="recognition-prediction"]:checked')?.value;
        activeRun = {
            value,
            result,
            prediction,
            expectedPrediction: recognized ? "recognized" : "not-recognized"
        };
        resultsSection?.classList.remove("is-idle");

        if (stepToolbar) stepToolbar.hidden = false;
        setError("");
        updateStepView(0);
        setSimulationStatus("กำลังเฉลยผลทีละ step...", "running");
        window.requestAnimationFrame(() => {
            const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
            resultsSection?.scrollIntoView({ behavior, block: "start" });
            resultsSection?.focus({ preventScroll: true });
        });
        scheduleNextStep();
    }

    function insertBit(bit) {
        const inputIsFocused = document.activeElement === binaryInput;
        const start = inputIsFocused ? (binaryInput.selectionStart ?? binaryInput.value.length) : binaryInput.value.length;
        const end = inputIsFocused ? (binaryInput.selectionEnd ?? start) : start;
        const currentBits = sanitizeBinary(binaryInput.value);
        const selectedBits = inputIsFocused ? sanitizeBinary(binaryInput.value.slice(start, end)) : "";
        if (!/[^01]/.test(currentBits) && currentBits.length - selectedBits.length >= MAX_INPUT_BITS) {
            setError(`Binary string ใส่ได้ไม่เกิน ${MAX_INPUT_BITS} bit`);
            binaryInput.focus();
            return;
        }
        binaryInput.setRangeText(bit, start, end, "end");
        binaryInput.dispatchEvent(new Event("input", { bubbles: true }));
        binaryInput.focus();
    }

    function renderSortActivity() {
        if (!sortList) return;
        sortList.replaceChildren(...sortStrings.map(item => {
            const article = document.createElement("article");
            article.className = "sort-card";
            article.setAttribute("role", "group");
            const title = document.createElement("strong");
            const titleId = `sort-string-${item.value}`;
            title.id = titleId;
            article.setAttribute("aria-labelledby", titleId);
            title.textContent = item.value;
            const actions = document.createElement("div");
            actions.className = "sort-card__actions";
            const recognizedButton = document.createElement("button");
            recognizedButton.type = "button";
            recognizedButton.textContent = "Recognized";
            recognizedButton.dataset.answer = "recognized";
            recognizedButton.setAttribute("aria-pressed", "false");
            const notRecognizedButton = document.createElement("button");
            notRecognizedButton.type = "button";
            notRecognizedButton.textContent = "Not recognized";
            notRecognizedButton.dataset.answer = "not-recognized";
            notRecognizedButton.setAttribute("aria-pressed", "false");
            const note = document.createElement("p");
            note.textContent = "เลือกคำตอบ";
            note.setAttribute("role", "status");
            note.setAttribute("aria-live", "polite");
            note.setAttribute("aria-atomic", "true");
            actions.append(recognizedButton, notRecognizedButton);
            article.append(title, actions, note);

            actions.querySelectorAll("button").forEach(button => {
                button.addEventListener("click", () => {
                    const result = simulate(item.value);
                    const isCorrect = button.dataset.answer === item.expected;
                    actions.querySelectorAll("button").forEach(activeButton => {
                        activeButton.classList.toggle("is-selected", activeButton === button);
                        activeButton.setAttribute("aria-pressed", activeButton === button ? "true" : "false");
                    });
                    article.classList.toggle("is-correct", isCorrect);
                    article.classList.toggle("is-wrong", !isCorrect);
                    note.textContent = `${isCorrect ? "✓ ถูกต้อง" : "! ยังไม่ใช่ — ลองใหม่ได้"}: output stream = ${result.outputStream}, last output bit = ${result.finalOutputBit}, so ${item.value} is ${item.expected === "recognized" ? "recognized" : "not recognized"}.`;
                });
            });
            return article;
        }));
    }

    form.addEventListener("submit", event => {
        event.preventDefault();
        runRecognition();
    });

    binaryInput.addEventListener("input", () => {
        binaryInput.removeAttribute("aria-invalid");
        const rawValue = binaryInput.value;
        const normalizedValue = sanitizeBinary(rawValue);
        const exceeded = /^[01\s]*$/.test(rawValue) && normalizedValue.length > MAX_INPUT_BITS;
        if (exceeded) {
            binaryInput.value = normalizedValue.slice(0, MAX_INPUT_BITS);
        }
        if (activeRun) {
            clearSimulationView();
        }
        setError(exceeded ? `Binary string ใส่ได้ไม่เกิน ${MAX_INPUT_BITS} bit` : "");
    });

    document.querySelectorAll("[data-bit]").forEach(button => {
        button.addEventListener("click", () => insertBit(button.dataset.bit));
    });

    removeLastBitButton?.addEventListener("click", () => {
        if (binaryInput.value.length > 0) {
            binaryInput.value = binaryInput.value.slice(0, -1);
            binaryInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
        binaryInput.focus();
    });

    clearBinaryButton?.addEventListener("click", () => {
        binaryInput.value = "";
        binaryInput.dispatchEvent(new Event("input", { bubbles: true }));
        setError("");
        binaryInput.removeAttribute("aria-invalid");
        binaryInput.focus();
    });

    openHowToButton?.addEventListener("click", () => howToDialog?.showModal());
    closeHowToButton?.addEventListener("click", () => howToDialog?.close());
    howToDialog?.addEventListener("close", () => openHowToButton?.focus());
    howToDialog?.addEventListener("click", event => {
        if (event.target === howToDialog) {
            howToDialog.close();
        }
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
    renderSortActivity();
    resetView();
});
