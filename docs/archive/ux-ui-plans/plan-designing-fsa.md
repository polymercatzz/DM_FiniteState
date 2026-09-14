# UX/UI Implementation Plan: `designing-fsa.html`

## เป้าหมาย

ปรับ Lesson 07 ให้เป็น **FSA Design Studio** ที่ผู้เรียนออกแบบและตรวจ machine ตามลำดับ `Choose Challenge → Define Memory → Build Machine → Run Tests → Debug a Path` โดยไม่สับสนว่าการเลือก state role, การตั้ง start/final state และการกำหนด transition เป็นคนละขั้นที่สัมพันธ์กัน

จุดเด่นที่ต้องจดจำคือ workbench ที่เปลี่ยนแนวคิด `state = limited memory` ให้กลายเป็น machine ที่ทดสอบได้จริง คงแนวทางภาพเดิม: technical academic, sidebar สี navy, พื้นสว่าง, teal สำหรับ selected/pass, amber สำหรับ missing/current และ orange สำหรับ wrong/fail

## แหล่งที่ใช้วิเคราะห์

- `designing-fsa.html`
- `styles/base.css`
- `styles/sidebar.css`
- `styles/challenge-sections.css`
- `scripts/sidebar.js`
- `scripts/fsaBuilder.js`

ห้ามอ่านหรืออ้างอิงไฟล์ในโฟลเดอร์ `content`

## ขอบเขตไฟล์ที่อนุญาตให้แก้

- แก้โครงสร้าง, semantic และ accessibility ใน `designing-fsa.html`
- แก้เฉพาะ selector ที่ scope ด้วย `#page-designing-fsa` ใน `styles/challenge-sections.css`
- แก้ `scripts/fsaBuilder.js` ได้เฉพาะ accessible state, focus management, progress semantics และ markup ที่ JavaScript สร้าง
- ห้ามแก้ object `challenges`, test cases, correct state roles, start/final answers, transitions, hints, `simulate()`, `parseInput()`, autoplay และค่า `testDelay`/`pathDelay`
- ไม่แก้ `styles/base.css`, `styles/sidebar.css`, `scripts/sidebar.js` หรือหน้า HTML อื่น
- ห้ามเปิด อ่าน หรือตรวจเนื้อหาปลายทาง `content/08-final-challenge.md`; คง URL นี้ตามระบบเดิม

## สัญญา DOM และระบบที่ห้ามเปลี่ยน

### ID ที่ JavaScript ใช้งาน

คง ID ต่อไปนี้แบบตรงตัว ห้ามลบ เปลี่ยนชื่อ หรือใช้ซ้ำ:

- `design-challenge-chips`, `design-challenge-rule`, `design-challenge-examples`
- `builder-title`, `state-planner-options`, `state-planner-feedback`
- `hint-next`, `hint-list`
- `fsa-builder-form`, `builder-transition-body`, `builder-message`, `builder-reset`
- `builder-results`, `builder-test-body`, `builder-path-body`, `builder-summary`
- `builder-playback`, `builder-playback-label`, `builder-playback-status`, `builder-playback-progress`

### Class และ data attribute ที่ JavaScript ใช้งาน

- คง `[data-challenge]` และค่า `begin-00`, `contain-00`, `avoid-00`, `end-00`, `two-zeros`
- คง `.builder-start-states`, `.builder-final-states`, `.transition-chip-group`
- คง radio `name="builder-start-state"` และ checkbox `name="builder-final-state"`
- คง `[data-planner-state]`, `[data-planner-value]`, `[data-transition-state]`, `[data-transition-symbol]`, `[data-target-state]`
- คง `.planner-state`, `.planner-role-chips`, `.builder-panel--path`, `.run-button`
- คง class ที่ JavaScript เพิ่ม/ลบ: `.is-selected`, `.is-correct`, `.is-wrong`, `.is-success`, `.is-warning`, `.is-missing`, `.is-pass`, `.is-fail`, `.is-latest`, `.is-complete`, `.has-failures`

### พฤติกรรมที่ต้องคงเดิม

- challenge เริ่มต้นคือ `begin-00`
- การเปลี่ยน challenge ยกเลิก run ปัจจุบัน, สร้าง planner/builder ใหม่ และ reset ทุกค่าของ challenge นั้น
- start state เริ่มต้นเลือกค่าที่โจทย์กำหนด
- final states เริ่มต้นไม่เลือกค่าใด ผู้เรียนต้องเลือกเอง
- state planner ให้ feedback ทันที แต่ไม่เป็นเงื่อนไขบังคับก่อน Run Tests
- Hint เปิดทีละข้อ รวม 3 ข้อต่อ challenge แล้วปุ่ม disabled
- Run Tests ต้องมี start state และ transition ครบทุก state × input; final states ว่างยังอนุญาตตามเดิม
- ระหว่าง run ต้อง disable challenge, start/final controls, transition buttons, planner buttons และ Run
- Reset และ Hint ยังทำงานได้ระหว่าง run ตามพฤติกรรมเดิม; Reset ต้องยกเลิก async run
- test harness แสดงทุก test ตามลำดับใน challenge
- state path ตรวจ case แรกที่ Fail; ถ้าทุก test ผ่านให้ตรวจ case แรก
- epsilon ไม่มี transition และ end state เท่ากับ start state
- Reset ล้าง final states, transitions, planner, hints และ results แต่คง challenge ปัจจุบัน
- Previous ไป `language-recognition.html`; Next คงไป `content/08-final-challenge.md`

## ปัญหาที่พบ

1. หน้าเริ่มด้วย challenge picker แล้วต่อด้วย planner/builder/results หลาย panel แต่ไม่มีภาพรวมว่าต้องทำตามลำดับใด
2. challenge picker มี 5 ตัวเลือกในแถวเดียว ทำให้ชื่อโจทย์ถูกบีบ และบน tablet กระโดดเป็น 2 คอลัมน์โดยข้อสุดท้ายเหลือเดี่ยว
3. rule และ examples เป็น live region แยกกัน เมื่อเปลี่ยน challenge อาจประกาศข้อมูลสองชุดต่อเนื่อง
4. `#state-planner-options` เป็น live region ครอบ controls ที่สร้างใหม่ทั้งชุด ทำให้ screen reader อาจประกาศทุกปุ่ม
5. planner แสดง correct/wrong ทันที แต่ปุ่มไม่มี `aria-pressed` และ card ไม่มี status text ที่ไม่พึ่งสี
6. ยังไม่ชัดว่า State Planner เป็นขั้นช่วยคิดและไม่บังคับก่อน Run
7. Hint ใหม่ถูกเพิ่มใน list แต่ไม่มีจุดประกาศเฉพาะ hint ล่าสุด
8. Start/Final state controls ถูกสร้างใหม่และซ่อน native inputs แต่ไม่มี focus ring ที่ visual segment
9. transition groups มีปุ่มจำนวนมากและไม่มี `aria-pressed`; keyboard user ไม่ทราบ target ที่เลือก
10. transition ที่ขาดใช้เพียง border/background amber และข้อความรวมด้านล่าง ไม่มีการเชื่อม error ไป group ที่ขาดแต่ละจุด
11. `#builder-message` ใช้ทั้ง instruction, validation, running, pass และ fail แต่กำหนด `role="alert"`
12. มี live regions พร้อมกันหลายจุด ได้แก่ challenge rule, examples, planner, builder message, playback และ summary ทำให้ autoplay มีโอกาสประกาศซ้ำมาก
13. builder lab และ result panels เป็นคอลัมน์เดียวทุกขนาด ทำให้ desktop ยาวและความสัมพันธ์ Memory → Machine → Test → Debug ไม่ชัด
14. transition table กว้างอย่างน้อย 720px แต่ scroll wrapper ไม่มีชื่อ ไม่มี focus target และไม่มี mobile hint
15. ตาราง builder/test/path ไม่มี caption และ column header scope ครบ
16. test/path rows ที่ JavaScript สร้างไม่มี row header
17. pass/fail มีข้อความในคอลัมน์ Result แล้ว แต่ latest row ยังใช้ animation/เส้นสีเป็นหลัก
18. autoplay progress ไม่มี progress semantics และไม่มี `aria-busy` บริเวณ results
19. ระหว่าง run หน้าเลื่อนไป results แล้วเลื่อนไป path panel อีกครั้ง อาจทำให้ผู้ใช้อ่าน test table ไม่ทันหรือเสียตำแหน่ง
20. path แสดงเป็นข้อความลูกศรยาวใน `<strong>` เดียว เมื่อ input ยาวจะอ่านย้อนกลับยาก
21. control เล็กหลายจุด: planner/transition 34px, select 42px, state choice 42px และ focus outline บางส่วนใช้ alpha ต่ำ
22. disabled transition/state controls ใช้ `cursor: wait` ทั้งที่สถานะกำลังรันควรแสดงใน playback ไม่ใช่ทุก control
23. Reset ไม่มีคำเตือนขอบเขตว่าล้าง machine/planner/hints ของ challenge ปัจจุบัน
24. Next Lesson ชี้ไปไฟล์ Markdown ใน `content`; ตามข้อกำหนดรอบนี้ตรวจปลายทางไม่ได้และต้องคง URL เดิม

## คำสั่งแก้ไข `designing-fsa.html`

### 1. เพิ่ม CTA และ process map ใน hero

ภายใน `.designing-hero` ให้คง kicker, `h1` และข้อความเดิม จากนั้นเพิ่ม `.designing-hero__actions`:

- ลิงก์หลัก `เริ่มออกแบบ FSA` ไป `#design-challenges`
- ลิงก์รอง `ดู Checklist` ไป `#design-checklist`

เพิ่ม `id="design-challenges"` ให้ `.design-challenge-picker` และ `id="design-checklist"` ให้ `.designing-reflection`

เพิ่ม ordered process map `.design-process-map`:

1. Choose
2. Remember
3. Build
4. Test
5. Debug

- เป็น visual guide ไม่ใช่ interactive stepper
- ใช้ native anchor ไม่เพิ่ม JavaScript scroll

### 2. ปรับ Challenge Picker

- คงปุ่ม 5 ข้อ, `data-challenge` และ `aria-pressed`
- เพิ่มคำอธิบายสั้นใต้ heading ว่า `การเปลี่ยนโจทย์จะล้าง machine และ hints ของโจทย์ปัจจุบัน`
- จัดปุ่มเป็น numbered challenge tabs ที่ยังเป็น `<button>`
- ให้ชื่อรูปแบบ `Prefix`, `Substring`, `Forbidden`, `Suffix`, `Counting` เป็น label รอง โดยไม่เปลี่ยนชื่อโจทย์หลัก
- รวมการประกาศ `#design-challenge-rule` และ `#design-challenge-examples` ผ่าน live region เดียว `#design-challenge-announcement`
- นำ `aria-live` ออกจาก rule และ examples ที่มองเห็นได้
- announcement ใช้ข้อความสั้น: `เลือกโจทย์ {n}: {title}; {rule}`

### 3. ทำ Rule และ Examples เป็น challenge brief

- คง title, rule, memory, accepted examples และ rejected examplesครบ
- เพิ่ม label `What the state must remember` ให้ข้อความ memory
- เปลี่ยน accepted/rejected examples เป็น semantic list ไม่ใช้ code หลายชิ้นต่อใน paragraph เดียว
- ใช้ `Accepted examples` และ `Rejected examples` เป็น heading ระดับย่อย
- ตัวอย่างเป็น reference ไม่ใช่ปุ่ม: ห้ามมี hover lift, cursor pointer หรือ button role
- แสดง `epsilon` เป็น `ε (epsilon)` ครั้งแรกในแต่ละ challenge เพื่อช่วยความเข้าใจ โดยค่าที่ส่งเข้า test ยังคง `epsilon`

### 4. แบ่ง Builder Lab เป็นสองขั้นชัดเจน

- เพิ่ม heading รวมเหนือ `.builder-lab`: `Design Workspace`
- กำหนด control panel เป็น Step 1 `Define State Memory`
- กำหนด builder panel เป็น Step 2 `Configure Machine`
- เพิ่มข้อความใน State Planner ว่า `ขั้นนี้ช่วยวางแนวคิด แต่ไม่บังคับก่อน Run Tests`
- เพิ่ม anchor/link ภายในเมื่อ planner ตอบครบเพื่อเลื่อนไป `#machine-builder` โดยผู้ใช้เป็นคนกดเอง
- เพิ่ม `id="machine-builder"` ให้ `.builder-panel--builder`
- ห้ามให้ planner selection กำหนด transition หรือ final states อัตโนมัติ

### 5. ปรับ State Planner ที่ JavaScript สร้าง

- นำ `aria-live` ออกจาก `#state-planner-options`
- ใน `renderPlanner()` กำหนดแต่ละ `.planner-state` เป็น `role="group"` และเชื่อมชื่อด้วย ID เฉพาะ state
- ปุ่ม role ทุกปุ่มเริ่มด้วย `aria-pressed="false"` และ sync กับ `.is-selected`
- เพิ่ม status text ภายใน card เช่น `ยังไม่เลือก`, `ถูกต้อง`, `ลองอีกครั้ง`
- feedback รวม `#state-planner-feedback` ใช้ `role="status"`, `aria-live="polite"`, `aria-atomic="true"`
- คงการเลือกใหม่ได้เสมอและ feedback ถูก/ผิดทันที
- ห้ามเปลี่ยน `roleAnswers` หรือบังคับให้ตอบถูกก่อน build

### 6. ปรับ Hint Ladder

- คงการเปิด hint ทีละข้อและจำนวน 3 ข้อ
- เพิ่มข้อความ `Hints 0 / 3` และ sync กับ `hintLevel`
- เพิ่ม visually hidden `#hint-announcement` พร้อม `role="status"`, `aria-live="polite"`, `aria-atomic="true"`
- เมื่อเปิด hint ให้ประกาศเฉพาะ hint ใหม่ ไม่ประกาศ list ทั้งหมด
- เมื่อครบให้ปุ่มแสดง `Hints complete` และ disabled ตามเดิม
- Hint ต้องไม่เปิด transition/final answer อัตโนมัติ

### 7. ทำ Machine Builder เป็นลำดับย่อย

ภายใน `.builder-panel--builder` แสดงลำดับ:

1. `Start state` — เลือกได้หนึ่งค่า
2. `Final states` — เลือกได้หลายค่าหรือไม่เลือกเลย
3. `Transition function` — เลือก target ให้ทุก state เมื่อรับ 0 และ 1
4. `Run Tests`

- คง fieldset, radio, checkbox และ transition table
- เพิ่ม status summary ก่อน actions: `Start: s0 · Finals: 0 selected · Transitions: 0/8 complete`
- status summary ต้อง sync เมื่อเลือกค่า และเปลี่ยนจำนวนตาม state count ของ challenge
- ระบุให้ชัดว่า final states ว่างเป็น machine ที่ valid ตามระบบ แม้อาจไม่ผ่านโจทย์
- ห้ามเติม correct machine เป็นค่าเริ่มต้น

### 8. ปรับ Start/Final state controls ที่สร้างด้วย JavaScript

- คง native radio/checkbox เพื่อใช้ keyboard semantics เดิม
- เพิ่ม accessible description แยก `เลือกหนึ่งค่า` และ `เลือกได้หลายค่า`
- เพิ่ม `input:focus-visible + span`
- selected state ต้องมี check/radio marker และข้อความ ไม่พึ่งพื้น teal อย่างเดียว
- disabled state ระหว่าง run ต้องคง label อ่านได้
- ห้ามเปลี่ยน default start state หรือเลือก final state ให้อัตโนมัติ

### 9. ปรับ Transition Table Builder

- เพิ่ม `<caption>` แบบ visually hidden ว่า `Transition function ของ FSA ที่กำลังออกแบบ`
- เพิ่ม `scope="col"` ให้หัว State, On input 0, On input 1
- คง `<th scope="row">` ที่ JavaScript สร้างให้ชื่อ state
- กำหนด wrapper เป็น `tabindex="0"`, `role="region"`, `aria-label="Transition table เลื่อนได้ในแนวนอน"`
- เพิ่ม mobile hint `เลื่อนตารางในแนวนอนเพื่อกำหนด transition ทุกช่อง`
- ในแต่ละ `.transition-chip-group` ให้ปุ่ม target เริ่มด้วย `aria-pressed="false"` และ sync กับ `.is-selected`
- เพิ่ม status ที่มองเห็นใน group ว่า `Not set` หรือ `Goes to {state}`
- เมื่อ group ขาด ให้ตั้ง `aria-invalid="true"` ที่ group และเชื่อมกับข้อความ `กรุณาเลือก target state`
- เมื่อเลือกแล้วให้ลบ `aria-invalid` และ `.is-missing`
- ห้ามเปลี่ยนจาก button group เป็น `<select>` เพราะจะเปลี่ยนรูปแบบ interaction หลักของ builder

### 10. แยก validation, running และ result message

- คง `#builder-message` แต่เปลี่ยนเป็น `role="status"`, `aria-live="polite"`, `aria-atomic="true"`
- ใช้ข้อความนี้สำหรับ validation/result สรุป ไม่ประกาศทุก autoplay step
- เมื่อไม่มี start state ให้เชื่อม error กับ fieldset และ focus ตัวเลือก start state ตัวแรก
- เมื่อ transition ไม่ครบ ให้ focus group แรกที่ขาด และประกาศจำนวนที่ขาดก่อนรายการ เช่น `ขาด 3 transitions: ...`
- ระหว่าง run ให้สถานะหลักอยู่ที่ playback และตั้ง `aria-busy="true"` ที่ `#builder-results`
- เมื่อจบ/Reset/เปลี่ยน challenge ให้ลบ `aria-busy`
- pass/fail ต้องมี icon/text ร่วมกับสี

### 11. ปรับ Reset ให้ขอบเขตชัด

- คงปุ่ม `#builder-reset` และ behavior เดิมทั้งหมด
- เปลี่ยน label เป็น `Reset Current Design`
- เพิ่ม accessible description หรือ `title` ว่า `ล้าง state roles, final states, transitions, hints และผลทดสอบของโจทย์นี้`
- ไม่ต้องเพิ่ม confirmation dialog เพราะข้อมูลเป็นแบบฝึกหัดที่สร้างใหม่ได้ทันที
- Reset ต้องยังยกเลิก autoplay และคง challenge ปัจจุบัน

### 12. เพิ่ม focus target และ status ให้ Test Harness

- เพิ่ม `tabindex="-1"` ให้ `#builder-results`
- เมื่อ Run ผ่าน validation ให้ scroll และ focus `#builder-results` หลังแสดง playback โดยเคารพ reduced motion
- ห้ามย้าย focus ทุก test case
- เพิ่ม summary strip เหนือตาราง: `Tests complete`, `Passed`, `Failed`
- ก่อนจบให้ค่าที่ไม่พร้อมแสดง `—` หรือ `กำลังตรวจ` ไม่แสดงผลล่วงหน้า
- เมื่อจบให้ Pass count เป็นข้อมูลหลัก และใช้ `ผ่าน n / total tests`

### 13. ลด live region ระหว่าง autoplay

- นำ `aria-live` ออกจาก `#builder-playback` และ `#builder-summary`
- เพิ่ม visually hidden `#builder-announcement` ภายใน `#builder-results` พร้อม `role="status"`, `aria-live="polite"`, `aria-atomic="true"`
- ระหว่าง test phase ประกาศหนึ่งครั้งต่อ case:

`Test {n} จาก {total}: {input}; expected {expected}; machine {actual}; Pass/Fail`

- ระหว่าง path phase ประกาศหนึ่งครั้งต่อ step:

`Inspect {input}, step {n} จาก {total}: อ่าน {symbol}, ย้ายจาก {current} ไป {next}`

- เมื่อจบประกาศ `ผ่าน {passed} จาก {total} tests; case ที่ตรวจคือ {featured}`
- epsilon ประกาศว่าไม่มี transition และ end state เท่ากับ start state
- ห้ามให้ builder message, playback และ summary ประกาศข้อความเดียวกันซ้ำ

### 14. ปรับ Playback Progress

- คง `#builder-playback`, label, status และ progress bar
- กำหนด track เป็น `role="progressbar"` พร้อม `aria-valuemin="0"`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`
- แยก phase ในข้อความที่มองเห็น: `Testing cases` และ `Inspecting path`
- progress ยังใช้ `results.length + max(path length, 1)` ตามระบบเดิม
- ในกรณี epsilon ให้ sync progress หลัง path step ก่อนจบ ไม่กระโดดจาก test phase ไป 100% โดยไม่มีสถานะ
- ห้ามเพิ่ม Pause, Previous, Next หรือเปลี่ยน delay

### 15. ปรับ Test Results Table

- เพิ่ม `<caption>` แบบ visually hidden ว่า `ผล accepted และ rejected test cases ของ FSA ที่สร้าง`
- เพิ่ม `scope="col"` ให้หัวทั้ง 4 คอลัมน์
- ใน `makeTestRow()` สร้างคอลัมน์ String เป็น `<th scope="row">`
- คง `.is-pass`, `.is-fail`, `.is-latest`
- เพิ่ม marker `Current test` ให้ latest row และ ✓/× ร่วมกับ Pass/Fail
- wrapper เป็น `tabindex="0"`, `role="region"`, `aria-label="ผล test cases เลื่อนได้ในแนวนอน"`
- เพิ่ม mobile hint ก่อนตาราง
- การแสดงผลต้องคงลำดับ test ตาม array เดิม

### 16. ปรับ Debug / Inspect a Case

- เปลี่ยนหัว panel ให้ชัดว่า `Debug First Failing Case`
- เมื่อทุก test ผ่าน ให้เปลี่ยน subtitle เป็น `Inspecting first passing case for verification`
- คงกฎเลือก first fail หรือ first test เดิม
- หลีกเลี่ยงการ auto-scroll ครั้งที่สองระหว่าง run: ให้ path update ใน viewport เดิมของ results grid หรือเลื่อนเฉพาะเมื่อ path panel อยู่นอก viewport ทั้งหมด โดยไม่ย้าย focus
- แสดง featured case, expected, actual, end state และ final states ใน summary
- เปลี่ยน state path ข้อความยาวเป็น ordered list ของ state nodes/connector โดยใช้ `featured.simulation.path` เดิม
- node แรกมี label `Start`, node สุดท้ายมี label `End`
- path ยาวต้อง scroll แนวนอนภายใน

### 17. ปรับ Path Table

- เพิ่ม `<caption>` แบบ visually hidden ว่า `State path ของ test case ที่กำลังตรวจ`
- เพิ่ม `scope="col"` ให้หัวทั้ง 4 ช่อง
- ใน `makePathRow()` สร้าง Step เป็น `<th scope="row">`
- คง `.is-latest` และ empty row สำหรับ epsilon
- epsilon row ต้องระบุ `Step 0 · ไม่มี transition · end state = start state`
- wrapper เป็น `tabindex="0"`, `role="region"`, `aria-label="State path table เลื่อนได้ในแนวนอน"`
- latest row มี marker Current ไม่พึ่ง animation/สี

### 18. ปรับ Checklist และ navigation

- คง checklist เดิมครบและแยกเป็น semantic list:
  - มี start state ชัดเจน
  - final states ตรง rule
  - transition ครบทุก state × input
  - ทดสอบ accepted/rejected และ epsilon
- คง `state = limited memory` เป็น principle card
- เปลี่ยนข้อความ Previous เป็น `← กลับไป Language Recognition`
- เปลี่ยนข้อความ Next เป็น `ไป Final Challenge →`
- คง URL `content/08-final-challenge.md` โดยไม่เปิดอ่านหรือเปลี่ยนปลายทาง

## คำสั่งแก้ไข `styles/challenge-sections.css`

### 1. จำกัดผลกระทบ

- แก้เฉพาะ section `Lesson 07: Designing FSA` และ selector ที่ขึ้นต้นด้วย `#page-designing-fsa`
- ห้ามแก้ selector ของ Recognition หรือ Language Recognition
- ห้ามสร้าง shared selector ที่ไม่มี page scope ในรอบนี้

### 2. Content width และ page rhythm

- กำหนด `#page-designing-fsa` เป็น `width: 100%`, `max-width: 1440px` และจัดกึ่งกลาง
- จำกัดข้อความ hero ประมาณ `68–74ch`
- challenge picker, builder lab, results และ reflection ใช้ `width: 100%`, `max-width: 1320px` และจัดกึ่งกลาง
- ใช้ระยะหลัก 16, 24, 32 และ 48px
- builder เป็นหน้าที่มีข้อมูลหนาแน่น จึงใช้เส้นแบ่งและพื้นต่างระดับแทน card ซ้อน/เงาหนัก

### 3. Hero และ process map

- hero คง editorial layout พื้นโปร่งและเส้นด้านล่าง
- CTA inline บน desktop และ stack ต่ำกว่า 480px; touch target อย่างน้อย 44px
- process map ใช้ 5 จุดต่อเนื่องแบบ blueprint บน desktop และ scroll ภายในหรือเรียงแนวตั้งบน mobile
- ใช้ teal เป็นสีหลักและ amber เฉพาะ Test/Debug; ไม่ทำเป็น progress ที่เปลี่ยนตาม state

### 4. Challenge Picker

- ตั้งแต่ 1180px ใช้ 5 คอลัมน์, 760–1179px ใช้ 3 คอลัมน์โดยข้อ 4–5 จัดสมดุล, ต่ำกว่า 760px ใช้ 1 คอลัมน์
- ปุ่มสูงอย่างน้อย 52px และรองรับชื่อสองบรรทัดโดยไม่ตัด
- selected ใช้ teal fill + check/เลขขั้น; hover/focus/selected ต้องต่างกันชัด
- challenge brief ใช้ grid rule 1 ส่วน / examples 1.3 ส่วนบน desktop และ stack บน mobile
- accepted/rejected examples ใช้ teal/orange label พร้อมข้อความ ไม่พึ่งสี
- ลด radius ของปุ่ม/card เป็น 6–8px ไม่ใช้ pill

### 5. Builder Lab Layout

- ตั้งแต่ 1200px จัด `.builder-lab` เป็นสองคอลัมน์: planner `minmax(340px, 0.72fr)` และ builder `minmax(0, 1.28fr)`
- จัด `.builder-panel--control` เป็น `align-self: start`; sticky ได้เมื่อไม่ชน viewport และต้องยกเลิกต่ำกว่า 1200px
- ต่ำกว่า 1200px เรียง planner ก่อน builder ตาม DOM
- ลด accent bar จาก teal–amber–blue ให้เหลือ teal → amber
- panel ต้อง `min-width: 0`; table scroll ภายในโดยไม่ทำให้หน้า overflow

### 6. State Planner และ Hint

- planner state ใช้ 1 คอลัมน์ใน control panel เมื่อ layout สองคอลัมน์ และ 2 คอลัมน์เมื่อ panel เต็มความกว้าง
- role buttons สูงอย่างน้อย 44px, radius 6px และ wrap ได้
- correct ใช้ teal + ✓; wrong ใช้ orange + `ลองอีกครั้ง`
- selected, focus และ correct/wrong ต้องเป็นคนละ visual state
- Hint Ladder ใช้เส้นลำดับแนวตั้งและเปิดเผยทีละข้อโดยไม่ใช้ animation สูง
- hint button และ disabled state มี contrast ผ่าน

### 7. Machine Settings และ Controls

- start/final controls มี min-height 44px และ 2–4 คอลัมน์ตามจำนวน states/พื้นที่
- radio/checkbox visual ต้องมี markerรูปทรงต่างกัน ไม่ใช้ style selected แบบเดียวกันทั้งหมด
- เพิ่ม `input:focus-visible + span` ด้วย outline ทึบอย่างน้อย 3px และ `outline-offset: 2px`
- Run, Reset, Hint, challenge, planner และ transition buttons มี focus-visible ชัด
- disabled controls ใช้ `cursor: not-allowed` แทน `wait`; playback เป็นจุดสื่อ running
- Reset ใช้ secondary/destructive-neutral style ไม่ใช้สีแดงเพราะเป็น action ย้อนกลับที่กู้คืนได้

### 8. Transition Table

- คง header navy และ row header teal
- transition groups ใช้ grid ตามจำนวน target states และปุ่มอย่างน้อย 44px
- selected target ใช้ teal + check; missing group ใช้ amber border, icon และข้อความ
- table desktop ต้องอ่านได้ใน builder panel โดย `min-width` ประมาณ 680–720px
- mobile `min-width` ประมาณ 560–620px และ scrollเฉพาะ wrapper
- wrapper focus มี outline และ gradient scroll hint ที่ `pointer-events: none`
- ใช้ `scrollbar-gutter: stable` เมื่อรองรับ

### 9. Results Layout

- ตั้งแต่ 1100px จัด `.builder-results` เป็นสองคอลัมน์: Test Harness `minmax(0, 1.2fr)` และ Debug `minmax(340px, 0.8fr)`
- ต่ำกว่า 1100px เรียง Test Harness ก่อน Debug
- results summary ใช้ stat strip 3 ค่าโดยไม่สร้าง card ย่อยมาก
- playback วางเต็มความกว้างเหนือ table และแสดง phase ชัด
- `#builder-results:focus-visible` มี outline ที่ไม่ดัน layout

### 10. Test/Path Tables และ Summary

- table header navy, pass row teal soft, fail row amber/orange soft
- Result column มี ✓ Pass หรือ × Fail เพื่อไม่พึ่งสี
- latest row ใช้ marker Current และ motionละเอียด 160–260ms
- path summary ใช้ featured string และ end state เป็น visual anchor
- state path nodes ใช้ technical square 6px และ connector amber; scrollแนวนอนภายใน
- epsilon แสดง Step 0 เป็นข้อมูลจริง ไม่ใช้ empty/error appearance
- mobile table `min-width` ประมาณ 560–600px และ wrapper เท่านั้นที่ scroll

### 11. Messages, touch targets และ motion

- ทุก interactive control มี touch target อย่างน้อย 44×44px
- instruction ใช้ neutral, validation/missing ใช้ amber, passใช้ teal และ failใช้ orange พร้อม icon/text
- focus outline ใช้สีทึบ ไม่พึ่ง alpha shadowเพียงอย่างเดียว
- reduced-motion rule ครอบคลุม transition/animation ใหม่ทั้งหมดภายใต้ `#page-designing-fsa`
- autoplay ยังใช้ delayเดิม และ scroll ใช้ `auto` เมื่อ reduced motion
- ห้าม animate layout height ของ table/path จนทำให้หน้ากระโดด

## คำสั่งแก้ไข `scripts/fsaBuilder.js` เฉพาะ UX/accessibility

อนุญาตเฉพาะรายการต่อไปนี้:

1. รวม announcement เมื่อเปลี่ยน challenge ผ่าน `#design-challenge-announcement`
2. เพิ่ม group label, status text และ `aria-pressed` ให้ planner controls ที่สร้างใน `renderPlanner()`
3. sync `#state-planner-feedback` และ `#hint-announcement` โดยไม่เปลี่ยนคำตอบ/hints
4. เพิ่ม accessible description และ focus state ให้ start/final controls ใน `renderBuilderControls()`
5. เพิ่ม `aria-pressed`, selected status และ `aria-invalid` ให้ transition groups
6. อัปเดต machine status summary: start, final count, completed transitions
7. focus start control หรือ transition group แรกที่ขาดเมื่อ validation ไม่ผ่าน
8. ตั้ง/ลบ `aria-busy` และ focus results ครั้งเดียวเมื่อเริ่ม run
9. อัปเดต `#builder-announcement` หนึ่งครั้งต่อ test/path step และหนึ่งครั้งเมื่อจบ
10. sync progress ARIA รวม epsilon path step
11. สร้าง row headers ใน `makeTestRow()` และ `makePathRow()`
12. render featured state path เป็น semantic list จาก `simulation.path` เดิม
13. ลด auto-scroll ครั้งที่สองโดยไม่เปลี่ยน featured case หรือ path autoplay

ห้าม refactor หรือแก้ `challenges`, `currentKey`, correct roles, answer machine, tests, hints, `getMachine()`, `simulate()`, `testDelay`, `pathDelay`, `activeRunId`, first-failure selection และ Reset behavior

## Design tokens ที่ให้ใช้

- Navy: `#09111f`, `#0f172a`, `#162033`
- Teal: `#0f766e`
- Teal hover: `#0b615b`
- Teal soft: `#ecfdf5`, `#f0fdfa`, `#ccfbf1`
- Amber/current/missing: `#d97706`, `#f59e0b`
- Amber soft: `#fffbeb`
- Wrong/fail: `#b45309`, `#c2410c`
- Wrong soft: `#fff7ed`
- Heading: `#0f172a`
- Body: `#475569`
- Muted: `#64748b`
- Border: `#d6e0eb` หรือ `var(--border-color)`
- Radius: 8px สำหรับ panel/card และ 6px สำหรับ control

ห้ามเพิ่มสีม่วง, neon gradient, glassmorphism หนัก, pill จำนวนมาก หรือเปลี่ยนหน้าให้เป็น dashboard สำเร็จรูป

## เกณฑ์ตรวจรับด้านระบบ

### Challenge และ Builder

- หน้าเริ่มที่ `begin-00`; challenge chip แรก selected และ `aria-pressed="true"`
- เปลี่ยน challenge แล้ว title, rule, memory, examples, states, roles, start state, transition choices, tests และ hintsตรงกับ object เดิม
- final states เริ่มว่างทุกครั้ง; ห้าม auto-fill correct answer
- planner ตอบใหม่ได้และไม่บล็อก Run Tests
- Hint แสดงตามลำดับ 1–3 ของ challenge ปัจจุบันแล้ว disabled
- ไม่มี start state ต้องไม่ run
- transition ขาดหนึ่งช่องขึ้นไปต้องไม่ run และระบุทุกช่องที่ขาด
- final states ว่างแต่ transitions ครบยัง run ได้
- Reset คง challenge แต่ล้าง planner/finals/transitions/hints/results และยกเลิก run

### Expected Languages

- `begin-00`: accepted `00`, `000`, `001`, `00101`; rejected `epsilon`, `0`, `1`, `01`, `10`, `100`
- `contain-00`: accepted `00`, `100`, `001`, `110011`; rejected `epsilon`, `0`, `1`, `01`, `10`, `10101`
- `avoid-00`: accepted `epsilon`, `0`, `1`, `01`, `10`, `10101`; rejected `00`, `100`, `001`, `110011`
- `end-00`: accepted `00`, `100`, `1100`, `10100`; rejected `epsilon`, `0`, `1`, `001`, `1001`, `1010`
- `two-zeros`: accepted `00`, `010`, `1010`, `00111`; rejected `epsilon`, `1`, `111`, `10`, `0111`

### Test Harness และ Autoplay

- correct machine ของแต่ละ challenge ผ่านทุก test เดิม
- machine ที่ผิดแสดงทุก case ตามลำดับและเลือก first failing case สำหรับ path
- machine ที่ผ่านทั้งหมดเลือก test แรกสำหรับ path
- epsilon ไม่มี transition และ end state เท่ากับ start state
- playback progress ใช้จำนวน tests รวมกับ path steps ตามสูตรเดิม
- ระหว่าง run controls ที่กำหนดถูก disable และเปิดกลับเมื่อจบ
- Reset หรือเปลี่ยน challenge ระหว่าง run ยกเลิก async loop โดยไม่มี row เก่าแสดงตามหลัง
- reduced motion ใช้ `testDelay`/`pathDelay` เดิมของระบบ
- Previous/Next lesson และ sidebar ไป URL เดิม
- ไม่เปิดอ่านหรือเปลี่ยน `content/08-final-challenge.md`
- Console ไม่มี error ใหม่

## เกณฑ์ตรวจรับด้าน UX/UI

- ผู้ใช้เห็นลำดับ Choose → Remember → Build → Test → Debug ก่อนเริ่ม
- ชัดเจนว่า State Planner ช่วยคิดแต่ไม่ใช่ validation gate
- ชัดเจนว่า start เลือกหนึ่ง, final เลือกหลาย/ไม่เลือกได้ และ transition ต้องครบ
- ที่ 1440×900 planner กับ builder และ test กับ debug ใช้พื้นที่ร่วมกันโดยตารางไม่ดันหน้า
- ที่ 1024×768 และ 768×1024 panels เรียงตามขั้นตอน DOM
- ที่ 390×844 และ 320px ไม่มี horizontal scroll ของทั้งหน้า; อนุญาตเฉพาะ process/path/table region
- challenge, planner, hints, start/final states, transitions, Run และ Reset ใช้ keyboard ได้พร้อม focus indicator
- touch target ทุก control บน mobile ไม่น้อยกว่า 44px
- selected, correct, wrong, missing, running, pass, fail และ disabled แยกได้โดยไม่พึ่งสีอย่างเดียว
- screen reader ได้ยิน challenge change หนึ่งครั้ง, planner/hint เฉพาะ action และ autoplay หนึ่งข้อความต่อ step
- ตารางทั้งสามมี caption, header scope, row header และ scroll region ที่มีชื่อ
- path auto-update ไม่แย่ง focus หรือเลื่อนหน้าซ้ำจนผู้ใช้เสียตำแหน่ง
- epsilon แสดงเป็น Step 0 ที่มีผล ไม่เป็น empty/error state
- reduced motion ไม่ทำให้ข้อมูลหรือ interaction หาย

## หมายเหตุสำหรับ AI ผู้แก้โค้ด

หน้านี้สร้าง controls ใหม่ทุกครั้งที่เปลี่ยน challenge จึงต้องเพิ่ม ARIA ใน `renderPlanner()` และ `renderBuilderControls()` ไม่ใช่เฉพาะ HTML เริ่มต้น การแก้ autoplay ต้องคง `activeRunId`, first failing case และ delay เดิมทั้งหมด ส่วนลิงก์ Next Lesson ชี้ไป `content/08-final-challenge.md`; ตามข้อกำหนดห้ามอ่านหรือตรวจปลายทางและห้ามเปลี่ยน URL
