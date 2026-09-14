# Copy Review Plan: DM Finite State

## เป้าหมาย

ตรวจและปรับข้อความใน Root และ Lesson 01–07 ให้สั้น ชัด และใช้คำทางวิชาให้สม่ำเสมอ โดยเก็บเนื้อหาที่จำเป็นต่อการเรียนรู้และ feedback ที่ช่วยให้ผู้ใช้ทำงานต่อได้ และตัดคำอธิบายถาวรที่ซ้ำกับหัวข้อ ปุ่ม ตาราง หรือสถานะบนหน้าจอ

แผนนี้เป็น copy/content pass เท่านั้น ยังไม่ให้แก้ logic ของ simulator, สูตร, transition rule, test case, navigation หรือ layout นอกเหนือจากการลบ element ข้อความที่ระบุไว้

## กติกากลางสำหรับทุกหน้า

### เก็บไว้

- ชื่อบท, หัวข้อ section, label ของ input/control และชื่อปุ่มที่บอกการกระทำ
- นิยาม สูตร กฎ transition ตาราง state และคำอธิบายที่เป็นเนื้อหาวิชา
- ข้อความสถานะที่เปลี่ยนตามการทำงานจริง เช่น `รอการ Run`, `กำลังรัน`, `Accepted`, `Rejected`
- ข้อความ error, validation, success และ empty state ที่บอกว่าต้องทำอะไรต่อ
- ผลลัพธ์ dynamic ของ simulator และคำอธิบาย step ที่ช่วยตรวจ state path
- Quick-start dialog ที่เปิดเมื่อผู้ใช้กด `วิธีเล่น` แต่ตัดข้อความซ้ำหรือ metadata ที่ไม่จำเป็นภายใน dialog
- `caption`, `aria-label`, `aria-describedby`, `aria-live` และข้อความ visually hidden ที่ทำหน้าที่ด้าน accessibility แม้จะไม่แสดงบนจอ

### ตัดหรือย่อ

- คำอธิบายใต้หัวข้อที่บอกสิ่งเดียวกับ label, ปุ่ม หรือสถานะที่เห็นอยู่แล้ว
- helper text ถาวรใต้ composer เช่น alphabet note, count requirement และคำบอกวิธีเลื่อนตาราง
- คำอธิบายใต้ชื่อขั้นใน workflow map ให้เหลือเลขและชื่อขั้นที่จำเป็น
- ข้อความบอกพฤติกรรม autoplay/scroll ที่ผู้ใช้เห็นจาก control และ status อยู่แล้ว
- เวลาโดยประมาณใน dialog เช่น `ใช้เวลาประมาณ 1 นาที`

### คำศัพท์หลัก

- คงศัพท์เทคนิคภาษาอังกฤษใน UI เช่น `Input string`, `Output`, `state`, `transition`, `Run`, `Reset`
- `End state` หมายถึง state หลังอ่าน input ครบ; `Final state` หมายถึง state ที่อยู่ในเซต `F` ห้ามใช้สองคำนี้แทนกันโดยไม่ดูบริบท
- ใช้ `Accepted` / `Rejected` เป็นผลการตัดสิน string และใช้ `Recognized` / `Not recognized` เฉพาะหน้าที่กำลังสอนคำว่า recognize
- ใช้ `Input alphabet` เฉพาะบริบทนิยามหรือ error ที่จำเป็น ไม่ต้องแสดงซ้ำใต้ช่อง input ที่มี chip ให้เลือกอยู่แล้ว
- ในตารางหรือ prediction ถ้า `n` หมายถึงไม่มี output ให้ใช้คำเดียวกันทั้งระบบ เช่น `n — ไม่มี output` ใน legend เดียว ไม่ต้องใส่คำอธิบายซ้ำทุก control
- ใช้ชื่อสินค้า `Cornae` เป็นรูปแบบภาษาอังกฤษมาตรฐานใน UI; ชื่อไทย `คอร์เน่` ใช้ได้ในคำอธิบายภาษาไทย แต่ไม่ใช้ `CORNAE` ปะปนในข้อความปกติ

### ข้อจำกัดสำหรับ AI ผู้ลงมือแก้

- ห้ามเปลี่ยน `id`, `class`, `data-*`, `name`, `value`, selector ที่ JavaScript ใช้ และห้ามแก้ behavior เพียงเพราะลบข้อความ
- เมื่อลบ element ที่ถูกอ้างใน `aria-describedby` ให้แก้ reference ให้ชี้ไปยังข้อความ error/status ที่ยังมีอยู่ ไม่ปล่อย id ที่หายไป
- อย่าลบข้อความ dynamic ใน JavaScript เพียงเพราะไม่อยู่ใน HTML; ให้ตรวจว่าเป็น error, progress, result หรือ accessibility announcement ก่อน
- ห้ามลบ table caption หรือ region label ที่มองไม่เห็นเพื่อความรกบนจอ เพราะเป็น accessibility content
- หลังแก้แต่ละหน้าให้ตรวจข้อความบนจอ, validation, reset, run และ console โดยไม่เปลี่ยน test case เดิม

## ลำดับการทำงาน

ให้ทำทีละหน้าและตรวจผลก่อนขึ้นหน้าถัดไป:

1. Root — `index.html`
2. Lesson 01 — `pages/introduction.html`
3. Lesson 02 — `pages/fsm-output.html` + `scripts/vendingMachine.js`
4. Lesson 03 — `pages/working-fsm.html` + `scripts/workingFsm.js`
5. Lesson 04 — `pages/recognition-fsm.html` + `scripts/recognitionChallenge.js`
6. Lesson 05 — `pages/fsa.html` + `scripts/fsaSimulator.js`
7. Lesson 06 — `pages/language-recognition.html` + `scripts/languageChallenge.js`
8. Lesson 07 — `pages/designing-fsa.html` + `scripts/fsaBuilder.js`

---

## หน้า Root — Learning Tree

ไฟล์: `index.html`

### เก็บไว้

- `Models of Computation Study Guide` และประโยคสรุปเส้นทางจากแนวคิดไปสู่ simulator/builder
- `7 Lessons`, `3 Learning Phases` และเส้นทาง `Concept → Simulator → Builder`
- ชื่อ phase ทั้งสามและคำอธิบายสั้น ๆ เพราะช่วยให้เห็นลำดับการเรียน
- คำอธิบายการ์ดบทเรียน 01–07 และ CTA `เปิดบทเรียน` เพราะทำหน้าที่เป็น navigation ไม่ใช่ helper ซ้ำ

### ปรับคำถ้าจำเป็น

- ตรวจให้การใช้ `model`, `state`, `input`, `output`, `FSA` ในคำอธิบายการ์ดตรงกับคำที่ใช้ในบทจริง
- รักษาคำอธิบายการ์ดให้ไม่เกินหนึ่งประโยคและไม่เพิ่มคำอธิบายใหม่ใต้ CTA

### ไม่ต้องลบ

- `Course Roadmap`, phase description และ card description ถือเป็น orientation ของหน้า root ไม่ใช่ข้อความอธิบายใต้ control

### ตรวจรับ

- หน้า root อ่านแล้วรู้ลำดับบท 01–07 ได้โดยไม่ต้องเปิดการ์ด
- ไม่มีข้อความที่บอก progress/completed/locked ซึ่งระบบไม่ได้รองรับจริง

## Lesson 01 — Introduction to Models of Computation

ไฟล์: `pages/introduction.html`

### เก็บไว้

- hero description และ learning outcomes 3 ข้อ
- นิยาม `Modeling Computation`, computation flow: `Input → State → Rule / Transition → Output / Decision`
- คำถามสำคัญ, ตาราง `Grammars / Finite-State Machines / Turing Machines`, เหตุผลที่ FSM สำคัญ และตัวอย่างการใช้งาน
- glossary `State`, `Input`, `Transition`, `Output`, `Start State`, `Final State`

### ปรับคำ

- ใช้คำไทยเป็นหลักในประโยค และคงศัพท์อังกฤษไว้ในชื่อแนวคิด/term ที่ผู้เรียนต้องจำ
- ตรวจคำอธิบาย `Output` ให้สอดคล้องกับโมเดลที่บทถัดไปใช้ เช่น “ผลลัพธ์ที่เครื่องสร้างจาก state และ input”
- คงความแตกต่างระหว่าง `Final State` ใน FSA กับ `Output/Decision` ไม่อธิบายเพิ่มซ้ำใน glossary

### ไม่ต้องลบเนื้อหา

หน้านี้เป็นพื้นฐานการเรียน ไม่ใช่ simulator helper; อย่าลบ paragraph, inquiry list, comparison table หรือ glossary เพียงเพราะเป็นคำอธิบาย

### ตรวจรับ

- ไม่มีศัพท์เดียวกันที่สะกดหลายแบบในหน้าเดียว
- เนื้อหาอธิบายครบ แต่ไม่เพิ่ม note ซ้ำใต้หัวข้อเดิม

## Lesson 02 — FSM with Output

ไฟล์: `pages/fsm-output.html`, `scripts/vendingMachine.js`

### เก็บไว้

- นิยาม FSM, tuple `M = (S, I, O, f, g, s0)` และ component definitions
- โมเดลยอดเงิน `s0–s4`, ราคา 20 บาท, เหรียญ 5/10 และกฎการทอน/จ่ายสินค้า
- ขั้นทดลอง `เลือก Input → ดู State Transition → ตรวจ Output`
- transition panel, transition history, transition table และคำถาม `Reading the Table` / `Check Yourself`
- dialog `Tips การเล่น` และขั้นตอนการทดลองที่ผู้ใช้เปิดเอง
- สถานะ dynamic เช่น `INSERT COIN`, `SELECT ITEM`, `รอ Input`, `รอการทำงาน`, output ที่เกิดจริง และ announcement ใน `vendingMachine.js`

### ตัดหรือย่อ

- ลบ `product-help` ที่แสดงค้างว่าเลือกสินค้าได้ทุกเวลา/ให้หยอดเหรียญ เพราะซ้ำกับ machine prompt และ transition result; ถ้าพฤติกรรมนี้ต้องสื่อ ให้แสดงเฉพาะใน state ที่เงินยังไม่ครบ
- ลบประโยคใต้ `State Diagram & Transition Table` ที่บอกว่า diagram แสดง current state และ table แสดง rule เพราะชื่อหัวข้อสื่อความหมายแล้ว
- ลบ `table-scroll-hint` ที่บอกให้เลื่อนตาราง แต่คง `role="region"`, `aria-label` และ keyboard scroll
- ลบเวลา `ใช้เวลาประมาณ 1 นาที` ใน tips dialog แต่คงขั้นตอน 1–4

### แก้คำ/ความชัดเจน

- เพิ่ม legend สั้นเพียงจุดเดียวว่า `n = ไม่มี output` หากตารางยังใช้ `n` โดยไม่มีคำอธิบายที่มองเห็นได้
- ใช้คำเรียก `เหรียญ`, `ปุ่มสินค้า`, `สินค้า`, `เงินทอน` ให้ตรงกันระหว่าง simulator, history และ table
- ใช้ `Cornae` เป็นชื่ออังกฤษมาตรฐาน และ `คอร์เน่` เป็นชื่อไทย; ใช้ `Party` / `ปาร์ตี้` ในรูปแบบเดียวกันกับบริบทภาษา

### ตรวจรับ

- กดเหรียญ/สินค้าแล้วผู้ใช้ยังรู้ว่าเกิด input, state transition และ output อะไร
- ตารางยังมีข้อมูลครบและไม่ลบข้อความที่เป็นกฎจริง เช่น `แนะนำหยอดเหรียญ`, `ทอน 5 บาท`, `จ่ายสินค้า`

## Lesson 03 — Working with FSM

ไฟล์: `pages/working-fsm.html`, `scripts/workingFsm.js`

### เก็บไว้

- hero summary, concept paragraph เรื่อง state memory และตัวอย่าง `5 10 10 O`
- ชื่อขั้น `Build Input`, `Predict Output`, `Run & Inspect`
- field label, placeholder, chip labels ที่บอก input/output จริง และปุ่ม `Run` / `Reset`
- `Prediction 0 / N symbols` ซึ่งเป็น dynamic constraint status
- error/success dynamic ทั้งหมด เช่น input ว่าง, symbol ไม่อยู่ใน alphabet, เกินจำนวน, กำลังรัน, รันครบ, คำตอบถูก/ผิด
- current step, state path, prediction track, simulation table และคำอธิบาย transition ที่สร้างจาก `workingFsm.js`
- quick-start steps และ mini reflection เพราะเป็นเนื้อหาที่เปิดอ่านได้เมื่อผู้ใช้ต้องการ
- challenge strings สำหรับการทดลองรอบถัดไป

### ลบข้อความถาวรตามตัวอย่างของผู้ใช้

- ลบ `#input-builder-hint` — `สูงสุด 8 symbols`
- ลบ `.alphabet-note` — `Input alphabet: {5, 10, O, R}`
- ลบ `#prediction-builder-hint` — `คาดการณ์ Output` เพราะ field label บอกอยู่แล้ว
- ลบ `.prediction-count-hint` — `จำนวน prediction ต้องเท่ากับจำนวน input เพื่อให้ตรวจครบทุก step`
- ลบข้อความอธิบายคงที่ใต้ simulation header ว่าผลจะแสดงอัตโนมัติและย้อนดูได้เมื่อรันครบ
- ลบ `simulation-table__mobile-hint` และคำอธิบายใต้ workflow ที่เป็นประโยคย่อย ให้เหลือชื่อขั้นหลัก
- ลบเวลาใน quick-start dialog แต่คงขั้นตอนการเล่น

### ปรับ label และ accessibility

- ใช้ label หลักเป็น `Input string` และ `Output prediction` หรือรูปแบบเดียวกันทั้งสองช่อง ห้ามใช้ `Prediction: output string` และ `คาดการณ์ Output` ปะปนกัน
- หลังลบ helper ให้ปรับ `aria-describedby` ของ `#input-string` และ `#prediction-string` ไม่ให้ชี้ไปยัง id ที่ถูกลบ; คง reference ไปยัง `#input-error` และ dynamic `#prediction-limit-status` ตามความเหมาะสม
- คง dynamic prediction counter และ validation ใน `workingFsm.js`; ห้ามย้าย validation มาเป็นข้อความถาวรแทน

### ตรวจรับ

- ตัวอย่าง `5 10 10 O` ยังสร้าง state path `s0 → s1 → s3 → s4 → s0` และ output ที่ถูกต้อง
- เมื่อ prediction ไม่ครบ ระบบยังแจ้งผ่านสถานะ/validation ตอนจำเป็น แต่หน้า idle ไม่แสดง paragraph ยาวค้างไว้

## Lesson 04 — FSM Recognition

ไฟล์: `pages/recognition-fsm.html`, `scripts/recognitionChallenge.js`

### เก็บไว้

- hero rule: ตรวจ substring `111` และตัดสินจาก last output bit
- ชื่อขั้น `Enter Bits`, `Predict`, `Run & Trace`
- state memory ใน state strip: `ยังไม่พบ`, `ลงท้ายด้วย 1`, `ลงท้ายด้วย 11`, `พบ 111` เพราะเป็นเนื้อหาที่อธิบาย state
- decision rule `Last output bit = 1/0`, trigger note, output stream, result facts และ dynamic step description
- sort activity, key idea เรื่อง `11011` และ state meaning list
- quick-start steps แต่ลบเวลาโดยประมาณ

### ตัดหรือย่อ

- ลบ `.stream-helper` ที่เขียนว่า `หนึ่งช่องแทนหนึ่ง step` ใต้ทั้ง input/output เพราะ stream และ step counter สื่ออยู่แล้ว
- ลบ paragraph ใต้ `การทำงานของเครื่อง` ที่บอกทิศทางอ่านและ autoplay; status/control ทำหน้าที่นี้อยู่แล้ว
- ลบข้อความเลื่อนตารางและข้อความย่อยใต้ workflow ให้เหลือชื่อขั้น
- คง `คำอธิบาย` ใน simulation table เพราะเป็นคำอธิบาย per-step ที่ช่วยเรียนรู้ ไม่ใช่ helper ซ้ำ

### ปรับคำ

- ใช้ `Recognized` / `Not recognized` ให้เหมือนกันใน radio, result, sorting activity และ dynamic feedback
- ถ้าใช้ `recognized` เป็นคำกริยาหลัก ให้ไม่สลับเป็น `accepted` ในผลหน้าเดียว ยกเว้นส่วนที่อธิบายความสัมพันธ์ทางทฤษฎี

### ตรวจรับ

- `111`, `01110`, `111000` ต้องเป็น recognized; `11011`, `101010` ต้องเป็น not recognized
- การลบ helper ต้องไม่กระทบ output stream, autoplay, step controls หรือ feedback dynamic

## Lesson 05 — FSM with No Output / FSA

ไฟล์: `pages/fsa.html`, `scripts/fsaSimulator.js`

### เก็บไว้

- hero definition, decision summary, 5-tuple, symbol definitions และ comparison table
- ความหมายของ `End state`, `Final states`, `F`, final-state double circle และ transition rule
- workflow ชื่อ `Read Rule`, `Build String`, `Predict`, `Trace & Decide`
- simulator input, end-state prediction, state diagram, status strip, path table และ conclusion
- quick-start steps และ reflection ที่เปรียบเทียบกับ FSM with output
- dynamic error/status/feedback/announcement ใน `fsaSimulator.js`

### ตัดหรือย่อ

- ลบ `fsa-table-mobile-hint`, `simulation-table__mobile-hint` และข้อความย่อยใต้ step progress ที่บอกให้เลื่อน/หยุด autoplay
- ลบ `fsa-problem-emphasis` ที่ซ้ำกับ `F = {s0, s1, s2, s3}` และ workflow prediction; คง formal machine definition กับ summary
- ลบ paragraph ใต้ `Machine decision` ที่อธิบายว่า Accepted ทุก binary string หาก `Why: End state ∈ F` และ `F = S` แสดงอยู่แล้ว; ถ้าต้องการเก็บเหตุผล ให้ย่อเป็นบรรทัดเดียวใน `Why`
- ลบเวลาใน quick-start dialog แต่คงขั้นตอนการใช้

### แก้คำให้แม่น

- คง `End state` สำหรับ state ที่ได้หลังอ่านครบ และ `Final states` สำหรับสมาชิกของ `F`
- ประโยคสรุปควรเป็น “ทุก state ในโจทย์นี้อยู่ใน F จึงยอมรับทุก binary string ที่ถูกต้อง” แทนรูปแบบที่อาจตีความว่า input อะไรก็ได้
- ใช้ `Accepted` / `Rejected` เป็นผล machine decision และ `ทาย end state ถูกต้อง` เป็นผล prediction แยกกัน

### ตรวจรับ

- `F = S` ยังแสดงชัดใน definition/summary และผล simulator ยังเป็น Accepted ตามโจทย์เดิม
- ไม่มีการลบ `caption`, diagram description หรือ announcement ที่เป็น accessibility text

## Lesson 06 — Language Recognition

ไฟล์: `pages/language-recognition.html`, `scripts/languageChallenge.js`

### เก็บไว้

- นิยาม accepted string, `f(s0, x) ∈ F`, ขั้นตอน 1–3 และนิยาม `L(M)`
- pipeline `String x → Read every symbol → End state → Compare with F → Membership result`
- machine selector, string builder, `epsilon` note, `Test`, `Reset`, membership result และ transition table
- dynamic machine summary, state path, accepted/rejected result, error/status และ guess-language activity
- quick-start steps แต่ลบเวลาโดยประมาณ
- reflection ที่แยก `x` ออกจาก `L(M)`

### ตัดหรือย่อ

- ลบ paragraph ใต้ `Test whether x is in L(M)` ที่ซ้ำกับ quick-start/workflow
- ลบคำอธิบายย่อยใต้ workflow (`เลือก machine / language`, `ต่อ 0, 1 หรือ epsilon`, ฯลฯ) ให้เหลือชื่อขั้น
- ลบ paragraph ใต้ `From String to Language` ที่ซ้ำกับ pipeline
- ลบ `simulation-table__mobile-hint`; คง region label และ keyboard scroll

### แก้ notation ที่เห็นเป็นชื่อ machine

- ตรวจชื่อ machine ให้ใช้ notation เดียวกัน ไม่ผสม `{0}* U {0}*{10}{0,1}*`
- แนะนำใช้ `0* ∪ 0*10{0,1}*` หรือ notation ที่ผู้สอนกำหนด แล้วคง semantics/test cases ใน `languageChallenge.js` เดิม
- อย่าแก้ rule, accepted/rejected examples หรือ transition เพียงเพื่อเปลี่ยนการแสดงผลชื่อ
- คงคำอธิบาย `epsilon` เพราะเป็นศัพท์ใหม่และจำเป็นต่อการใช้งาน

### ตรวจรับ

- `epsilon` ยังแสดงว่าเป็น string ว่างและทดสอบได้
- ผล `x ∈ L(M)` / `x ∉ L(M)` ต้องตรงกับ final state และ examples เดิม

## Lesson 07 — Designing FSA

ไฟล์: `pages/designing-fsa.html`, `scripts/fsaBuilder.js`

### เก็บไว้

- hero ที่บอกว่ามีโจทย์ 5 รูปแบบ และ challenge selector ทั้ง 5 รายการ
- ชื่อ process หลัก `Choose`, `Remember`, `Build`, `Test`, `Debug`
- warning ว่าเปลี่ยนโจทย์แล้ว machine/hints ถูกล้าง เพราะเป็นข้อมูลสำคัญก่อนทำลาย state ผู้ใช้
- Step 1 ที่อธิบาย state memory, state planner feedback และ hint ladder
- Step 2 ที่บอกให้เลือก start state, final states และ transition ให้ครบ
- dynamic status `Start / Finals / Transitions`, validation, `Not set`, `Goes to`, hint feedback และ run progress
- Step 3 accepted/rejected results, pass/fail counts และ Step 4 first failing path
- checklist และหลัก `state = limited memory`

### ตัดหรือย่อ

- ลบ paragraph ใต้ `Design Workspace` ที่ซ้ำกับ process map
- ลบคำอธิบายย่อยใต้ process map ให้เหลือชื่อขั้นหลัก
- ลบ `table-mobile-hint` จาก transition, test result และ path table แต่คง region label/keyboard scroll
- ย่อคำอธิบาย Step 3 เป็น “ตรวจ accepted/rejected จาก machine นี้” หากต้องการลดข้อความ; ไม่ลบผล test
- ลบเวลาใน dialog ถ้ามีการเพิ่ม dialog ภายหลัง โดยคงขั้นตอนการทำงาน

### ปรับคำ

- ใช้ `transition` หรือ `transition function` ให้สม่ำเสมอ ไม่สลับกับ `rule` ใน label เดียวกันโดยไม่จำเป็น
- ใช้ `Accepted`, `Rejected`, `Pass`, `Fail` เป็น status ชุดเดียวกันใน table, summary และ dynamic feedback
- ตรวจ `At least two 0s`, `Do not contain 00`, `End with 00` ให้ใช้รูปแบบตัวพิมพ์และ spacing เดียวกันทั้ง challenge chip, title และ rule

### ตรวจรับ

- เปลี่ยนโจทย์แล้วยัง reset machine/hints ตามเดิม
- Run Tests ยังตรวจ accepted/rejected ทั้งหมดและ Debug แสดง first failing case ตามเดิม
- ไม่แก้ลิงก์ Final Challenge ที่ยังชี้ไปยัง `content/08-final-challenge.md` ในงาน copy pass นี้

## รายการแก้แบบ global ที่ควรทำหลังผ่านทีละหน้า

ทำเมื่อ copy ของทุกหน้าผ่านแล้วเท่านั้น:

- ลบ visible mobile-scroll helper ทั้งหมด แต่คง semantic scroll region
- ลบ duration line ใน quick-start/tips dialog ทั้งหมด แต่คง dialog steps
- ตรวจชื่อปุ่ม `วิธีเล่น`, `Run`, `Reset`, `Test` ให้ใช้รูปแบบเดียวกันเมื่อทำหน้าที่เดียวกัน
- ตรวจข้อความใน HTML และ JavaScript ไม่ให้สถานะเดียวกันมีหลายสำนวน เช่น `รอการ Run`, `ยังไม่ได้ run`, `รอการทำงาน` โดยเปลี่ยนเฉพาะเมื่อความหมายเดียวกันจริง
- ตรวจ `aria-describedby` หลังลบ helper ทุกหน้า

## ข้อกำหนดที่ผู้ใช้ยืนยันแล้ว

1. คงศัพท์เทคนิคภาษาอังกฤษใน UI
2. ใช้ชื่อสินค้า `Cornae` เป็น canonical English name
3. คง Quick-start/Tips dialog ไว้ และตัดเฉพาะข้อความซ้ำหรือเวลาโดยประมาณ
