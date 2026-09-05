document.addEventListener("DOMContentLoaded", () => {
    let currentState = "s0";

    const stateValues = {
        s0: 0,
        s1: 5,
        s2: 10,
        s3: 15,
        s4: 20
    };

    const fsmRules = {
        "s0": {
            "5":  { next: "s1", output: "n" },
            "10": { next: "s2", output: "n" },
            "O":  { next: "s0", output: "แนะนำหยอดเหรียญ" },
            "R":  { next: "s0", output: "แนะนำหยอดเหรียญ" }
        },
        "s1": {
            "5":  { next: "s2", output: "n" },
            "10": { next: "s3", output: "n" },
            "O":  { next: "s1", output: "แนะนำหยอดเหรียญ" },
            "R":  { next: "s1", output: "แนะนำหยอดเหรียญ" }
        },
        "s2": {
            "5":  { next: "s3", output: "n" },
            "10": { next: "s4", output: "n" },
            "O":  { next: "s2", output: "แนะนำหยอดเหรียญ" },
            "R":  { next: "s2", output: "แนะนำหยอดเหรียญ" }
        },
        "s3": {
            "5":  { next: "s4", output: "n" },
            "10": { next: "s4", output: "ทอน 5 บาท" },
            "O":  { next: "s3", output: "แนะนำหยอดเหรียญ" },
            "R":  { next: "s3", output: "แนะนำหยอดเหรียญ" }
        },
        "s4": {
            "5":  { next: "s4", output: "คืนเหรียญ 5" },
            "10": { next: "s4", output: "คืนเหรียญ 10" },
            "O":  { next: "s0", output: "คอร์เน่" },
            "R":  { next: "s0", output: "ปาร์ตี้" }
        }
    };

    const stateLabels = {
        "s0": "s0 (มีเงินสะสม 0 บาท)",
        "s1": "s1 (มีเงินสะสม 5 บาท)",
        "s2": "s2 (มีเงินสะสม 10 บาท)",
        "s3": "s3 (มีเงินสะสม 15 บาท)",
        "s4": "s4 (มีเงินสะสม 20 บาท - พร้อมเลือกสินค้า)"
    };

    const machineDisplay = document.querySelector(".machine-display");
    const stateDisplay = document.getElementById("state-display");
    const balanceDisplay = document.getElementById("balance-display");
    const machinePrompt = document.getElementById("machine-prompt");
    const outputDisplay = document.getElementById("output-display");
    const coinSlot = document.getElementById("coin-slot");
    const dispensedProduct = document.getElementById("dispensed-product");
    const resetButton = document.getElementById("btn-reset");
    const coinButtons = document.querySelectorAll(".coin-btn");
    const actionButtons = document.querySelectorAll(".action-btn");
    const transitionPulse = document.getElementById("transition-pulse");
    const transitionInput = document.getElementById("transition-input");
    const transitionFrom = document.getElementById("transition-from");
    const transitionRule = document.getElementById("transition-rule");
    const transitionTo = document.getElementById("transition-to");
    const transitionPreviousLabel = document.getElementById("transition-previous-label");
    const transitionPreviousMeaning = document.getElementById("transition-previous-meaning");
    const transitionCurrentLabel = document.getElementById("transition-current-label");
    const transitionCurrentMeaning = document.getElementById("transition-current-meaning");
    const transitionOutputSymbol = document.getElementById("transition-output-symbol");
    const transitionOutputSeparator = document.getElementById("transition-output-separator");
    const transitionOutput = document.getElementById("transition-output");
    const transitionHistoryList = document.getElementById("transition-history");
    const liveTransitionPanel = document.querySelector(".live-transition");
    const transitionAnnouncement = document.getElementById("transition-announcement");
    const tipsDialog = document.getElementById("play-tips-dialog");
    const openTipsButton = document.getElementById("open-tips");
    const closeTipsButton = document.getElementById("close-tips");
    const transitionHistory = [];

    function getStateCenter(state) {
        const node = document.getElementById(`node-${state}`);
        if (!node) {
            return null;
        }

        return {
            x: node.getAttribute("cx"),
            y: node.getAttribute("cy")
        };
    }

    const animationTimers = new Map();

    function animateMachine(actionType, duration = 600) {
        if (!machineDisplay) {
            return;
        }

        const previousTimer = animationTimers.get(actionType);
        if (previousTimer) {
            window.clearTimeout(previousTimer);
        }

        machineDisplay.classList.remove(actionType);
        void machineDisplay.offsetWidth;
        machineDisplay.classList.add(actionType);

        animationTimers.set(actionType, window.setTimeout(() => {
            machineDisplay.classList.remove(actionType);
            animationTimers.delete(actionType);
        }, duration));
    }

    function animateCoin(button, value) {
        if (!button || !coinSlot || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        const source = button.querySelector(".coin-face") || button;
        const sourceRect = source.getBoundingClientRect();
        const slotRect = coinSlot.getBoundingClientRect();
        const flyingCoin = document.createElement("span");

        flyingCoin.className = `flying-coin flying-coin--${value}`;
        flyingCoin.textContent = value;
        flyingCoin.style.left = `${sourceRect.left}px`;
        flyingCoin.style.top = `${sourceRect.top}px`;
        flyingCoin.style.setProperty("--coin-x", `${slotRect.left + (slotRect.width / 2) - sourceRect.left - (sourceRect.width / 2)}px`);
        flyingCoin.style.setProperty("--coin-y", `${slotRect.top + (slotRect.height / 2) - sourceRect.top - (sourceRect.height / 2)}px`);
        document.body.appendChild(flyingCoin);
        flyingCoin.addEventListener("animationend", () => flyingCoin.remove(), { once: true });
    }

    function syncStateDisplay() {
        if (stateDisplay) {
            stateDisplay.innerText = stateLabels[currentState];
        }

        if (balanceDisplay) {
            balanceDisplay.innerText = String(stateValues[currentState]);
        }

        if (machinePrompt) {
            machinePrompt.innerText = currentState === "s4" ? "SELECT ITEM" : "INSERT COIN";
        }

    }

    function updateTransitionPanel(fromState, input, transition) {
        const inputLabels = {
            "5": "5 บาท",
            "10": "10 บาท",
            "O": "O — คอร์เน่",
            "R": "R — ปาร์ตี้",
            "Reset": "Reset"
        };
        const inputLabel = inputLabels[input] || input;
        const fromLabel = fromState.toUpperCase();
        const nextLabel = transition.next.toUpperCase();
        const outputLabel = getOutputLabel(input, transition);

        if (transitionInput) transitionInput.innerText = inputLabel;
        if (transitionFrom) transitionFrom.innerText = fromLabel;
        if (transitionRule) transitionRule.innerText = `${input} / ${transition.output}`;
        if (transitionTo) transitionTo.innerText = nextLabel;
        if (transitionPreviousLabel) transitionPreviousLabel.innerText = fromLabel;
        if (transitionPreviousMeaning) transitionPreviousMeaning.innerText = `เงินสะสม ${stateValues[fromState]} บาท`;
        if (transitionCurrentLabel) transitionCurrentLabel.innerText = nextLabel;
        if (transitionCurrentMeaning) transitionCurrentMeaning.innerText = `เงินสะสม ${stateValues[transition.next]} บาท`;
        if (transitionOutputSymbol) transitionOutputSymbol.innerText = transition.output;
        if (transitionOutputSeparator) transitionOutputSeparator.hidden = false;
        if (transitionOutput) transitionOutput.innerText = outputLabel;
        if (transitionAnnouncement) {
            transitionAnnouncement.innerText = `Input ${input}: จาก ${fromLabel} ไป ${nextLabel}; Output ${transition.output}`;
        }

        if (liveTransitionPanel) {
            liveTransitionPanel.classList.remove("is-updating");
            void liveTransitionPanel.offsetWidth;
            liveTransitionPanel.classList.add("is-updating");
        }

        transitionHistory.unshift({
            from: fromLabel,
            to: nextLabel,
            input: inputLabel,
            output: transition.output
        });
        transitionHistory.splice(3);

        if (transitionHistoryList) {
            transitionHistoryList.replaceChildren(...transitionHistory.map((item, index) => {
                const row = document.createElement("tr");
                [String(index + 1), `${item.from} → ${item.to}`, item.input, item.output]
                    .forEach(value => {
                        const cell = document.createElement("td");
                        cell.innerText = value;
                        row.appendChild(cell);
                    });
                return row;
            }));
        }
    }

    function getOutputLabel(input, transition) {
        if (input === "Reset") {
            return "กลับสู่สถานะเริ่มต้น";
        }

        if (transition.output === "n") {
            return "ยังไม่มีสินค้าออกมา";
        }

        if (transition.output === "คอร์เน่" || transition.output === "ปาร์ตี้") {
            return `จ่ายสินค้า ${transition.output}`;
        }

        return transition.output;
    }

    function highlightTableTransition(fromState, input) {
        document.querySelectorAll(".state-table .last-transition")
            .forEach(cell => cell.classList.remove("last-transition"));

        const transitionCell = document.querySelector(`#row-${fromState} td[data-input="${input}"]`);
        transitionCell?.classList.add("last-transition");
    }

    function syncVisualState() {
        const currentValue = stateValues[currentState];
        document.querySelectorAll(".state-node").forEach(node => node.classList.remove("active"));
        const activeNode = document.getElementById(`node-${currentState}`);
        if (activeNode) {
            activeNode.classList.add("active");
        }

        document.querySelectorAll(".state-table tbody tr").forEach(row => row.classList.remove("row-active"));
        const activeRow = document.getElementById(`row-${currentState}`);
        if (activeRow) {
            activeRow.classList.add("row-active");
        }

        if (machineDisplay) {
            machineDisplay.dataset.currentState = currentState;
            machineDisplay.dataset.currentValue = String(currentValue);
        }
    }

    function animateTransitionPath(fromState, toState) {
        if (!transitionPulse || fromState === toState) {
            return;
        }

        const fromCenter = getStateCenter(fromState);
        const toCenter = getStateCenter(toState);
        if (!fromCenter || !toCenter) {
            return;
        }

        transitionPulse.setAttribute("x1", fromCenter.x);
        transitionPulse.setAttribute("y1", fromCenter.y);
        transitionPulse.setAttribute("x2", toCenter.x);
        transitionPulse.setAttribute("y2", toCenter.y);
        transitionPulse.classList.remove("is-moving");
        void transitionPulse.getBoundingClientRect();
        transitionPulse.classList.add("is-moving");
    }

    function triggerTransition(input) {
        const transition = fsmRules[currentState][input];
        
        if (transition) {
            const previousState = currentState;
            currentState = transition.next;
            
            syncStateDisplay();
            if (outputDisplay) {
                outputDisplay.innerText = transition.output === "n"
                    ? "n (ไม่มีสินค้าออกมา)"
                    : transition.output;
            }
            
            syncVisualState();
            animateTransitionPath(previousState, currentState);
            highlightTableTransition(previousState, input);
            updateTransitionPanel(previousState, input, transition);

            if (input === "5" || input === "10") {
                animateMachine("is-coin");
            } else if (input === "O" || input === "R") {
                animateMachine("is-action");
            }

            if (transition.output !== "n") {
                animateMachine("is-output");
            }

            if (previousState === "s4" && (input === "O" || input === "R")) {
                if (dispensedProduct) {
                    dispensedProduct.className = `dispensed-product product-${input.toLowerCase()}`;
                }
                animateMachine("is-dispensing", 1100);
            }
        }
    }

    function updateVisuals() {
        syncStateDisplay();
        syncVisualState();
    }

    coinButtons.forEach(button => {
        button.addEventListener("click", () => {
            const inputVal = button.getAttribute("data-input");
            if (inputVal) {
                animateCoin(button, inputVal);
                triggerTransition(inputVal);
            }
        });
    });

    actionButtons.forEach(button => {
        button.addEventListener("click", () => {
            const inputVal = button.getAttribute("data-input");
            if (inputVal) {
                triggerTransition(inputVal);
            }
        });
    });

    if (resetButton) {
        resetButton.addEventListener("click", () => {
            const previousState = currentState;
            currentState = "s0";
            syncStateDisplay();
            if (outputDisplay) {
                outputDisplay.innerText = "พร้อมเริ่มรอบใหม่";
            }
            if (dispensedProduct) {
                dispensedProduct.className = "dispensed-product";
            }
            document.querySelectorAll(".state-table .last-transition")
                .forEach(cell => cell.classList.remove("last-transition"));
            animateTransitionPath(previousState, currentState);
            updateTransitionPanel(previousState, "Reset", { next: "s0", output: "n" });
            animateMachine("is-reset");
            updateVisuals();
        });
    }

    openTipsButton?.addEventListener("click", () => tipsDialog?.showModal());
    closeTipsButton?.addEventListener("click", () => tipsDialog?.close());
    tipsDialog?.addEventListener("click", event => {
        if (event.target === tipsDialog) {
            tipsDialog.close();
        }
    });
    tipsDialog?.addEventListener("close", () => openTipsButton?.focus());

    updateVisuals();
});
