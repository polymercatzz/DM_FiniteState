# UX/UI Implementation Plan: `fsa.html`

## เป้าหมาย

ปรับ Lesson 05 ให้เป็น **End State Detective** ที่ผู้เรียนเห็นความต่างระหว่าง FSM with Output และ FSA อย่างชัดเจน แล้วทำกิจกรรมตามลำดับ `Read Rule → Build String → Predict End State → Trace Path → Decide`

จุดเด่นที่ต้องจดจำคือ state diagram แบบ technical blueprint ซึ่งแสดง state ปัจจุบันและ input tape พร้อมกัน โดยคงแนวทางภาพเดิมของเว็บไซต์: sidebar สี navy, พื้นเนื้อหาสว่าง, teal สำหรับ final/active state, amber สำหรับ step ปัจจุบัน และ orange สำหรับ prediction ผิด

## แหล่งที่ใช้วิเคราะห์

- `fsa.html`
- `styles/base.css`
- `styles/sidebar.css`
- `styles/content-sections.css`
- `scripts/sidebar.js`
- `scripts/fsaSimulator.js`

ห้ามอ่านหรืออ้างอิงไฟล์ในโฟลเดอร์ `content`

## ขอบเขตไฟล์ที่อนุญาตให้แก้

- แก้โครงสร้าง, semantic และ accessibility ใน `fsa.html`
- แก้เฉพาะ selector ที่ scope ด้วย `#page-fsa` ใน `styles/content-sections.css`
- แก้ `scripts/fsaSimulator.js` ได้เฉพาะ accessible state, focus management, progress semantics และ markup ที่ JavaScript สร้าง
- ห้ามแก้ `finalStates`, `finalStatesLabel`, `transitions`, `simulate()`, วิธีตรวจ prediction, autoplay และค่า delay `700ms`/`250ms`
- ไม่แก้ `styles/base.css`, `styles/sidebar.css`, `scripts/sidebar.js` หรือหน้า HTML อื่น

## ข้อเท็จจริงของโจทย์ที่ต้องยึดตามระบบปัจจุบัน

- `S = {s0, s1, s2, s3}`
- `I = {0, 1}`
- `F = {s0, s1, s2, s3}`
- ทุก state เป็น final state ดังนั้นทุก binary string ที่ผ่าน validation ให้ผล `Accepted`
- เป้าหมายหลักของกิจกรรมคือทาย **end state** ไม่ใช่ทาย Accepted/Rejected
- ข้อความ `<desc>` ใน SVG ปัจจุบันระบุว่า final states มี `s0` กับ `s3` เท่านั้น ซึ่งไม่ตรงกับ HTML, วงกลมสองชั้นทั้ง 4 state และ JavaScript ต้องแก้คำอธิบาย SVG ให้เป็น final states ทั้ง 4 โดยห้ามเปลี่ยนระบบให้เหลือสอง state

## สัญญา DOM และระบบที่ห้ามเปลี่ยน

### ID ที่ JavaScript ใช้งาน

คง ID ต่อไปนี้แบบตรงตัว ห้ามลบ เปลี่ยนชื่อ หรือใช้ซ้ำ:

- `fsa-form`, `fsa-input`, `fsa-error`
- `fsa-feedback`, `fsa-end-state`, `fsa-result`
- `fsa-current-state`, `fsa-cursor`, `fsa-bit-tape`, `fsa-body`
- `fsa-reset`, `fsa-remove-bit`, `fsa-clear-input`
- `fsa-results`, `fsa-simulation-status`, `fsa-step-note`
- `fsa-step-toolbar`, `fsa-previous-step`, `fsa-next-step`
- `fsa-step-counter`, `fsa-step-progress-bar`, `fsa-conclusion`
- `fsa-how-to-dialog`, `fsa-how-to-title`
- `open-fsa-how-to`, `close-fsa-how-to`
- `fsa-diagram-title`, `fsa-diagram-desc`, `fsa-arrow`

### Class และ data attribute ที่ JavaScript ใช้งาน

- คง `[data-fsa-bit]` และค่า `data-fsa-bit="0"`, `data-fsa-bit="1"`
- คง `[data-fsa-state]` และค่า `s0`, `s1`, `s2`, `s3`
- คง radio `name="end-state-prediction"` และค่า `s0`, `s1`, `s2`, `s3`
- คง class ที่ JavaScript เพิ่ม/ลบ: `.is-success`, `.is-running`, `.is-complete`, `.is-read`, `.is-current`, `.is-pending`, `.is-active`, `.is-accepted`, `.is-rejected`, `.is-wrong`
- คง `.diagram-state`, `.fsa-bit-tape`, `.fsa-step-toolbar`, `.fsa-conclusion`, `.simulation-table-wrap`

### พฤติกรรมที่ต้องคงเดิม

- input ลบ whitespace ก่อนตรวจและยอมรับเฉพาะ `0` กับ `1`
- input ว่างหรือมี symbol อื่นต้องไม่เริ่ม simulation
- ปุ่ม `0`/`1` แทรกที่ caret หรือแทน selection เมื่อช่อง input มี focus
- ปุ่มลบล่าสุดลบอักขระท้ายสุด และ Clear ล้างทั้ง string
- หน้าเริ่มต้นและ Reset เลือก prediction `s0`
- Run บันทึก prediction แล้วเริ่มที่ Step 0 ก่อนเฉลยอัตโนมัติ
- Previous/Next หยุด autoplay และเดินได้เฉพาะขอบเขต Step 0 ถึง Step สุดท้าย
- การแก้ input หลัง Run ยกเลิกผลเดิมและกลับสู่สถานะรอ
- Reset ยกเลิก timer ล้าง input/result และเลือก `s0` ใหม่
- dialog เปิดด้วย `showModal()` และปิดด้วยปุ่ม ×, Escape หรือ backdrop
- Previous ไป `recognition-fsm.html`; Next ไป `language-recognition.html`

## ปัญหาที่พบ

1. หน้าเริ่มด้วย Definition และ Compare ที่มีน้ำหนักเป็น card ใกล้เคียงกัน ทำให้กิจกรรมหลักอยู่ลึกและไม่มี CTA จาก hero
2. ความต่างสำคัญ “FSM ใช้ output / FSA ใช้ end state” อยู่ในตาราง แต่ยังไม่มี visual bridge ที่พาผู้เรียนเข้าสู่ lab
3. ขั้น Build String, Predict และ Run ยังพึ่งคำอธิบายมากกว่าลำดับภาพ
4. control panel และ simulation panel ถูก override เป็นคอลัมน์เดียวแบบถาวร แม้ desktop มีพื้นที่เพียงพอ
5. transition table อยู่ใน control panel แต่ไม่มี caption และ header scope ครบ
6. SVG diagram เป็น visual anchor ที่ดี แต่คำอธิบายระบุ final states ผิดจากระบบจริง
7. active state ใน SVG ใช้สีเป็นหลัก และไม่มี accessible state ที่เปลี่ยนตาม simulation
8. เส้น transition ใน SVG ไม่ถูก highlight ตาม step จึงต้องเทียบ diagram กับข้อความ/ตารางเอง
9. input tape ใช้สีและ opacity แยก read/current/pending แต่ไม่มี accessible label ราย bit
10. `#fsa-error` ใช้แสดงทั้ง validation error และข้อความกำลังเฉลย แต่กำหนด `role="alert"`
11. `#fsa-simulation-status`, `#fsa-step-note` และ `#fsa-conclusion` เป็น live region พร้อมกัน ทำให้ autoplay อาจประกาศซ้ำ
12. progress bar ไม่มี progress semantics และปุ่ม Step ไม่มี `aria-label`
13. simulation table ไม่มี caption, column scope, row header และชื่อของ scroll region
14. compare table เลื่อนได้ในแนวนอน แต่ wrapper รับ keyboard focus ไม่ได้และไม่มี mobile hint
15. radio ถูกซ่อนด้วย `pointer-events: none` และยังไม่มี focus ring บน visual segment
16. How-to 38px, bit chip 42px, Step 40px และปุ่มปิด dialog 36px เล็กกว่า touch target 44px
17. conclusion แสดง End state, Decision และ feedback แต่น้ำหนักของ Accepted อาจทำให้เข้าใจผิดว่าเป็น challenge ทั้งที่ทุก state อยู่ใน F
18. `.fsa-lab` และ CSS บาง component ถูกประกาศซ้ำ/override หลายช่วง รวมถึง selector legacy ที่ไม่มีใน HTML ปัจจุบัน ทำให้แก้ต่อยาก
19. ยังไม่มี `prefers-reduced-motion` สำหรับ animation/transition ของ FSA โดยเฉพาะ
20. `styles/content-sections.css` ใช้ร่วมกับ Working FSM จึงมีความเสี่ยงหากแก้ selector ที่ไม่ได้ scope

## คำสั่งแก้ไข `fsa.html`

### 1. เพิ่ม CTA และ decision summary ใน hero

ภายใน `.fsa-hero` ให้คง kicker, `h1` และคำอธิบายเดิม จากนั้นเพิ่ม `.fsa-hero__actions`:

- ลิงก์หลัก `เริ่มตามหา End State` ไป `#fsa-lab`
- ลิงก์รอง `เปรียบเทียบ FSM กับ FSA` ไป `#fsa-compare`

เพิ่ม `id="fsa-lab"` ให้ `.fsa-lab` และ `id="fsa-compare"` ให้ `.fsa-compare-section`

เพิ่ม summary สั้นที่ไม่เป็น card ซ้ำ:

- `FSM with Output → ตัดสินจาก Output`
- `FSA → ตัดสินจาก End State ∈ F`

ใช้ native anchor เท่านั้น ไม่เพิ่ม JavaScript สำหรับ scroll

### 2. ปรับ Definition ให้เป็น reference ที่สแกนเร็ว

- คงสูตร `M = (S, I, f, s0, F)` และคำอธิบายสมาชิกทั้ง 5 ตัว
- เพิ่มข้อความกำกับสูตรว่า `ไม่มี O และ g`
- คง `<dl>` สำหรับ symbol grid
- เรียงข้อมูลตามสูตร: `S → I → f → s0 → F`
- ทำ `f` เป็นรายการกว้างเต็มแถวได้ แต่ห้ามเปลี่ยนเนื้อหา
- ไม่เพิ่ม card ซ้อนในแต่ละคำอธิบายเกินหนึ่งระดับ

### 3. ปรับ Compare table

- เพิ่ม `<caption>` แบบ visually hidden ว่า `เปรียบเทียบ FSM with Output กับ FSA`
- เพิ่ม `scope="col"` ให้หัวคอลัมน์ทั้งสอง
- เพิ่มหัวแถวที่มองเห็นได้หรือ visually hidden ในแต่ละ row เช่น `Output`, `Output alphabet`, `Decision source`; ถ้าเพิ่มคอลัมน์จะต้องคงข้อมูลเดิมครบ
- กำหนด wrapper เป็น `tabindex="0"`, `role="region"`, `aria-label="ตารางเปรียบเทียบ เลื่อนได้ในแนวนอน"`
- เพิ่มข้อความ mobile-only ว่า `เลื่อนตารางในแนวนอนเพื่อดูทั้งสองคอลัมน์`
- คง final-state note เรื่องวงกลมสองชั้นไว้ใต้ตาราง

### 4. เพิ่ม workflow ในหัว lab

ภายในหัว `.fsa-panel--control` เพิ่ม ordered list `.fsa-workflow`:

1. `Read Rule` — ดู transition table
2. `Build String` — สร้าง binary input
3. `Predict` — เลือก end state
4. `Trace & Decide` — ตรวจเส้นทางและสมาชิกของ F

- ใช้เลข 01–04 เป็น visual guide
- ไม่ทำเป็นปุ่มหรือ progress ที่บันทึกสถานะ
- คง dialog วิธีเล่นสำหรับรายละเอียด

### 5. ทำ problem statement และ transition table เป็นโจทย์เดียวกัน

- เพิ่มหัวระดับย่อย `Machine Definition` เหนือ tuple และ `Transition Rule` เหนือตาราง
- แสดง `S`, `I`, `s0` และ `F` เป็นแถวสรุปสั้นที่สแกนได้
- เน้นข้อความว่า `ทุก state อยู่ใน F; สิ่งที่ต้องทายคือ end state`
- เพิ่ม `<caption>` ให้ตารางว่า `Transition function f ของ End State Detective`
- เพิ่ม `scope="col"`, `scope="row"`, `rowspan` และ `colspan` ให้ครบตาม semantic table
- wrapper ของตารางเป็น region ที่มีชื่อและรับ focus ได้เมื่อเกิด overflow
- ห้ามแก้ค่าการ transition ทุกช่อง

### 6. จัด form เป็นขั้นชัดเจน

- เพิ่ม label `02 Build String` เหนือช่อง input/keypad
- เพิ่ม label `03 Predict End State` เหนือ fieldset
- เพิ่ม label `04 Run & Trace` เหนือ actions
- เพิ่ม helper text `ใช้เฉพาะ 0 และ 1; ระบบจะตัดช่องว่างออกก่อน Run`
- `aria-describedby` ของ `#fsa-input` ต้องอ้าง helper และ `#fsa-error`
- คง radio 4 ค่าและค่าเริ่มต้น `s0`
- ห้ามบังคับให้ผู้ใช้เลือกใหม่ก่อน Run เพราะจะเปลี่ยน behavior เดิม

### 7. แยก validation error ออกจาก run status

- คง `#fsa-error` แต่เปลี่ยนเป็น `role="status"`, `aria-live="polite"`, `aria-atomic="true"`
- เมื่อ input ว่างหรือมี symbol อื่น ให้ JavaScript ตั้ง `aria-invalid="true"` และ focus `#fsa-input`
- เมื่อผู้ใช้แก้ input, validation ผ่าน หรือ Reset ให้ลบ `aria-invalid`
- error ที่มองเห็นต้องมี icon/prefix และข้อความ ไม่พึ่งสีแดง
- ข้อความ `กำลังเฉลยเส้นทาง state ทีละ step...` ให้แสดงผ่าน `#fsa-simulation-status` ไม่ใช้ `#fsa-error`

### 8. แก้คำอธิบายและ accessible state ของ SVG

- แก้ `#fsa-diagram-desc` เป็นคำอธิบายที่ตรงระบบ: start state คือ `s0` และ final states คือ `s0`, `s1`, `s2`, `s3`
- คงวงกลมสองชั้นและ class `.is-final` ของทั้ง 4 state
- ใส่ accessible label ให้ state group แต่ละตัว เช่น `s1, final state`
- JavaScript ต้องอัปเดต `aria-current="step"` เฉพาะ state ที่ active
- เพิ่มชื่อ/คำอธิบาย edge แต่ละเส้นใน SVG หรือมีรายการ transition ที่ screen reader เข้าถึงได้จากตารางเดิม; ห้ามซ่อนข้อมูลทั้ง diagram และ table พร้อมกัน
- เพิ่ม `data-fsa-edge` ที่ระบุ `current-input-next` ให้ path แต่ละ transition เพื่อใช้ visual highlight เท่านั้น
- ใน step ปัจจุบันให้ JavaScript เพิ่ม `.is-active-edge` ที่เส้น transition ตรงกับ row นั้น
- การเพิ่ม edge highlight ห้ามเปลี่ยน `transitions` หรือเส้นทาง simulation

### 9. ปรับ status strip และ input tape

- คง Current state, Input cursor และ Final states
- เปลี่ยน status strip เป็น `<dl>` หรือคงโครงสร้างเดิมพร้อม semantics ที่เทียบเท่า
- เพิ่มข้อมูล `Start state: s0` โดยหลีกเลี่ยง card ย่อยเกินจำเป็น
- เพิ่ม label ที่มองเห็น `Input Tape` เหนือ `#fsa-bit-tape`
- ใน `renderTape()` เพิ่ม accessible label ราย bit เช่น `Step 2: input 1, อ่านแล้วและเป็นตำแหน่งปัจจุบัน`
- pending bit ต้องถูกซ่อนจาก screen reader จนกว่าจะเปิดเผย หรือระบุว่า pending; เลือกวิธีเดียวและใช้สม่ำเสมอ
- read/current/pending ต้องมี marker ที่ไม่พึ่งสีหรือ opacity อย่างเดียว
- ห้ามเปลี่ยนจำนวน bit หรือลำดับ reveal

### 10. ลดการประกาศซ้ำระหว่าง autoplay

- นำ `aria-live` ออกจาก `#fsa-simulation-status`, `#fsa-step-note` และ `#fsa-conclusion`; คงเป็นข้อความที่มองเห็นได้
- เพิ่ม visually hidden `#fsa-announcement` ภายใน `#fsa-results` พร้อม `role="status"`, `aria-live="polite"`, `aria-atomic="true"`
- ประกาศหนึ่งครั้งต่อ step:

`Step {n} จาก {total}: อ่าน {bit}, ย้ายจาก {current} ไป {next}`

- เมื่อจบประกาศครั้งเดียว:

`จบที่ {endState}; prediction ถูก/ผิด; Accepted เพราะ {endState} อยู่ใน F`

- เมื่อกด Previous/Next ให้ประกาศเฉพาะ step ที่ผู้ใช้เลือก
- ห้ามให้ status/error/step note ประกาศข้อความเดียวกันซ้ำ

### 11. ปรับ step controls และ progress

- เพิ่ม `aria-label="ย้อนกลับหนึ่ง step"` และ `aria-label="ไปยัง step ถัดไป"` ให้ปุ่ม
- คงเงื่อนไข disabled และ behavior ที่หยุด autoplay
- กำหนด progress track เป็น `role="progressbar"` พร้อม `aria-valuemin="0"`, `aria-valuemax`, `aria-valuenow` และ `aria-valuetext="Step n จาก total"`
- เพิ่มข้อความที่มองเห็น `กดปุ่มเพื่อหยุด autoplay และตรวจเส้นทางเอง`
- ห้ามเพิ่ม Pause, Resume, Restart หรือเปลี่ยน autoplay flow

### 12. ปรับ simulation table

- เพิ่ม `<caption>` แบบ visually hidden ว่า `ตารางเส้นทาง state ของ FSA แยกตาม input step`
- เพิ่ม `scope="col"` ให้ `<th>` ทั้ง 5 ช่องใน `<thead>`
- ใน `renderTable()` สร้างคอลัมน์ Step เป็น `<th scope="row">`
- คง `.is-active` และ `.is-empty`
- เพิ่มข้อความ mobile-only ก่อนตารางว่า `เลื่อนตารางในแนวนอนเพื่อดูทุกคอลัมน์`
- กำหนด `.simulation-table-wrap` เป็น `tabindex="0"`, `role="region"`, `aria-label="ผล simulation เลื่อนได้ในแนวนอน"`
- active row ต้องมี marker `Current` หรือข้อความที่ไม่พึ่งสี

### 13. ปรับ conclusion ให้แยก Prediction กับ Machine Decision

- คง `#fsa-end-state`, `#fsa-result`, `#fsa-feedback`
- จัดลำดับสายตาเป็น:
  1. `End state` เป็นข้อมูลหลัก
  2. `Your prediction` แสดงค่าที่ผู้ใช้เลือกและ Correct/Incorrect
  3. `Machine decision` แสดง Accepted
  4. เหตุผล `{endState} ∈ F`
- เพิ่ม element สำหรับแสดง prediction ที่เลือก โดย sync จาก `activeRun.prediction`
- ระบุข้อความคงที่ใกล้ decision ว่า `โจทย์นี้ทุก state เป็น final state จึง Accepted ทุกคำตอบที่เป็น binary string`
- ใช้ teal สำหรับ Accepted และ orange สำหรับ prediction ผิด พร้อม icon/text
- ห้ามทำให้ `Accepted` ดูเป็นรางวัลของการทายถูก เพราะสองสถานะเป็นคนละเรื่องกัน

### 14. ปรับ dialog วิธีเล่น

- คง native `<dialog>`, ID และขั้นตอน 4 ข้อเดิม
- เพิ่มข้อความใต้หัวว่า `ใช้เวลาประมาณ 1 นาที`
- ปุ่มปิดมีพื้นที่กดอย่างน้อย 44×44px
- dialog body ต้อง scroll ได้เมื่อความสูงไม่พอ
- เพิ่ม event `close` เพื่อคืน focus ไป `#open-fsa-how-to`
- คง Escape และ backdrop close

### 15. ปรับ Reflection และ navigation

- เพิ่ม `id="fsa-key-idea"` ให้ `.fsa-reflection`
- คงการเปรียบเทียบว่า FSA ตัดสินจาก end state และคงสูตรเดิม
- เพิ่ม rule line สั้น `End state ∈ F → Accepted; End state ∉ F → Rejected`
- ระบุใต้ rule ว่าในโจทย์ของหน้านี้ `F = S`
- เปลี่ยนข้อความ Previous เป็น `← กลับไป FSM Recognition`
- เปลี่ยนข้อความ Next เป็น `เรียน Language Recognition →`
- คง URL เดิม

## คำสั่งแก้ไข `styles/content-sections.css`

### 1. จำกัดผลกระทบและรวม source of truth

- แก้เฉพาะ selector ที่ขึ้นต้นด้วย `#page-fsa`
- ห้ามแก้ selector `#page-working-fsm` ในกลุ่ม Desktop width normalization
- นำ `#page-fsa .fsa-lab` ออกจาก selector group ที่ใช้ร่วมหน้าอื่น แล้วกำหนด width/max-width ใน section FSA จุดเดียว
- รวมกฎ `.fsa-lab`, `.fsa-diagram`, `.form-actions` และ component ที่ประกาศซ้ำให้เหลือ source of truth เดียว โดยผลลัพธ์ยังตรงกับแผนนี้
- selector legacy เช่น `.final-state-activity`, `.fsa-example`, `.fsa-state`, `.start-arrow`, `.step-run-button`, `.fsa-feedback`, `.end-state-card` ให้ลบได้เฉพาะเมื่อค้นทั้ง `fsa.html` และ `fsaSimulator.js` แล้วยืนยันว่าไม่มีการใช้งาน

### 2. Content width และ page rhythm

- กำหนด `#page-fsa` เป็น `width: 100%`, `max-width: 1400px` และจัดกึ่งกลาง
- จำกัดข้อความ hero ประมาณ `68–74ch`
- `.fsa-foundations`, `.fsa-lab`, `.fsa-reflection` ใช้ `width: 100%`, `max-width: 1240px` และจัดกึ่งกลาง
- ใช้ระยะหลัก 16, 24, 32 และ 48px
- ลดเงาของ foundation cards และหลีกเลี่ยง card ซ้อนหลายชั้น

### 3. Hero, foundation และ compare

- hero คง editorial layout พื้นโปร่งและเส้นด้านล่าง
- CTA แสดง inline บน desktop และ stack ต่ำกว่า 480px; touch target อย่างน้อย 44px
- decision summary ใช้เส้น/ลูกศรแบบ equation ไม่ใช้ badge pill จำนวนมาก
- Definition ใช้ layout 2 คอลัมน์เมื่อกว้างตั้งแต่ 900px และ 1 คอลัมน์เมื่อแคบกว่า
- tuple formula ใช้ navy surface กับเส้น teal ตามเดิม แต่ลดความรู้สึกเป็น banner แยกส่วน
- compare table คง navy สำหรับ FSM และ teal สำหรับ FSA พร้อม row label ที่พื้น neutral
- scroll wrapper ทุกตัวมี focus ring และ gradient hint ที่ `pointer-events: none`

### 4. Lab layout

- ที่ความกว้างตั้งแต่ 1180px จัด `.fsa-lab` เป็นสองคอลัมน์: control `minmax(340px, 0.78fr)` และ simulation `minmax(0, 1.22fr)`
- control panel ใช้ `align-self: start`; sticky ได้เฉพาะเมื่อไม่ชน viewport และต้องยกเลิกต่ำกว่า 1180px
- ต่ำกว่า 1180px เรียง control ก่อน simulation ตาม DOM
- diagram, table และ input tape ต้องไม่ดันความกว้างของทั้งหน้า
- ลดแถบ accent ด้านบน control จาก teal–amber–blue ให้เหลือ teal → amber

### 5. Workflow และ problem reference

- `.fsa-workflow` ใช้ 4 คอลัมน์บน desktop, 2 คอลัมน์บน tablet และ 1 คอลัมน์บน mobile
- ใช้เลขขั้นและเส้นเชื่อมแบบ blueprint; ห้ามทำให้ดูคลิกได้
- machine definition ใช้ compact key/value strip
- transition table ใช้ navy/teal ที่ contrast ผ่านและไม่กว้างเกิน control panel
- หาก control อยู่สองคอลัมน์กับ simulation ตารางโจทย์ต้องอ่านได้โดยไม่ scroll ที่ความกว้างขั้นต่ำของ panel

### 6. Form, radio และ focus

- input สูงอย่างน้อย 48px และใช้ technical typography ที่แยก bit ชัด
- end-state choices เป็น 4 segments ในแถวเดียวเมื่อพื้นที่พอ, 2×2 ต่ำกว่า 480px; ห้าม stack 4 แถวโดยไม่จำเป็น
- เพิ่ม `input:focus-visible + span` ด้วย outline ทึบอย่างน้อย 3px และ `outline-offset: 2px`
- Run, Reset, How-to, bit chip และ step button ทุกตัวมี `:focus-visible`
- touch target ทุก control อย่างน้อย 44×44px
- keypad wrap ได้ที่ 320px และ utility buttons ไม่ทำให้ overflow
- error, selected และ disabled state ต้องมี icon/text/border ร่วมกับสี

### 7. Diagram เป็น visual anchor หลัก

- คงพื้น technical grid จางและ SVG responsive
- กำหนด `min-width` ภายในเฉพาะ diagram wrapper หาก label/edge ชนกัน และให้ wrapper scroll ได้โดยหน้าไม่ overflow
- state ทั้ง 4 ใช้วงกลมสองชั้นตาม final-state notation
- active state ใช้ teal fill, white inner ring และ marker `Current`
- active edge ใช้ amber, stroke หนาขึ้น และ arrowhead สีเดียวกัน
- state/edge ที่ไม่ active ยังต้องมี contrast ผ่าน; ห้ามลด opacity จนอ่าน label ยาก
- motion ของ state/edge ใช้ transition 160–220ms และไม่ทำให้ diagram กระโดด

### 8. Status strip, tape และ step note

- status strip ใช้เส้นแบ่งแทน card ย่อย 3–4 ใบ
- Current state เป็นค่าที่เด่นสุด, cursor รองลงมา, start/final states เป็น reference
- tape cell อย่างน้อย 32×32px และ wrap/scroll ภายใน
- read ใช้ teal soft พร้อม check/marker, current ใช้ amber พร้อม ring, pending ใช้ neutral พร้อม pattern/label ไม่พึ่ง opacity อย่างเดียว
- step note เป็น amber callout ที่วางใกล้ tape และ diagram โดยไม่แย่งน้ำหนัก conclusion

### 9. Step controls, table และ conclusion

- step buttons สูงอย่างน้อย 44px และ progress trackสูง 6–8px
- mobile คงลำดับ Progress → Previous/Next โดยปุ่มอยู่สองคอลัมน์
- table headerใช้ navy, active row ใช้ teal soft และ marker Current
- mobile table มี `min-width` ประมาณ 620–660px และ scroll เฉพาะ wrapper
- conclusion ใช้ End state เป็นค่าขนาดใหญ่ แล้วแยก Prediction กับ Decision เป็นคนละ block
- mobile conclusion stack เป็นคอลัมน์เดียว ไม่บีบ feedback ใน 2 คอลัมน์
- wrong prediction ใช้ orange border/icon โดย Accepted ยังคง teal เพื่อแสดงว่าเป็นคนละสถานะ

### 10. Dialog และ reduced motion

- dialog กว้างไม่เกิน 560px และสูงไม่เกิน `calc(100dvh - 32px)` พร้อม scroll ภายใน
- ปุ่มปิด 44×44px พร้อม focus ring
- เพิ่ม `@media (prefers-reduced-motion: reduce)` ภายใต้ `#page-fsa`
- ปิด transition/animation ใหม่ของ state, edge, tape และ progress เมื่อ reduced motion เปิด
- ห้ามเปลี่ยน autoplay delay ที่ JavaScript กำหนด

## คำสั่งแก้ไข `scripts/fsaSimulator.js` เฉพาะ UX/accessibility

อนุญาตเฉพาะรายการต่อไปนี้:

1. ตั้ง/ลบ `aria-invalid` ของ `#fsa-input` ตาม validation
2. ย้าย run status ออกจาก `#fsa-error` ไป `#fsa-simulation-status`
3. อัปเดต `#fsa-announcement` หนึ่งครั้งต่อ step และหนึ่งครั้งเมื่อจบ
4. อัปเดต `aria-current="step"` ของ `[data-fsa-state]`
5. เพิ่ม/ลบ `.is-active-edge` ตาม `current`, `input`, `next` ของ row ปัจจุบัน
6. เพิ่ม accessible label ให้ bit ที่สร้างใน `renderTape()`
7. สร้าง `<th scope="row">` สำหรับคอลัมน์ Step ใน `renderTable()`
8. sync progress ARIA ได้แก่ `aria-valuemax`, `aria-valuenow`, `aria-valuetext`
9. แสดง prediction ที่เลือกใน conclusion โดยไม่เปลี่ยนวิธีเปรียบเทียบ
10. คืน focus ไปปุ่มเปิด dialog เมื่อ dialog ปิด

ห้าม refactor หรือแก้ `finalStates`, `finalStatesLabel`, `transitions`, `simulate()`, `scheduleNextStep()`, timer, prediction comparison และเงื่อนไข Run/Reset

## Design tokens ที่ให้ใช้

- Navy: `#09111f`, `#0f172a`, `#162033`
- Teal: `#0f766e`
- Teal hover: `#0b615b`
- Teal soft: `#ecfdf5`, `#f0fdfa`, `#ccfbf1`
- Amber/current: `#d97706`, `#f59e0b`
- Amber soft: `#fffbeb`
- Wrong/error: `#b91c1c`, `#c2410c`
- Wrong soft: `#fff7ed`
- Heading: `#0f172a`
- Body: `#475569`
- Muted: `#64748b`
- Border: `#d6e0eb` หรือ `var(--border-color)`
- Radius: 8px สำหรับ panel/card และ 6px สำหรับ control

ห้ามเพิ่มสีม่วง, neon gradient, glassmorphism หนัก, pill จำนวนมาก หรือเปลี่ยนหน้าให้เป็น dashboard สำเร็จรูป

## เกณฑ์ตรวจรับด้านระบบ

- `0` เดิน `s0 → s0`, end state `s0`, Accepted
- `1` เดิน `s0 → s1`, end state `s1`, Accepted
- `11` เดิน `s0 → s1 → s2`, end state `s2`, Accepted
- `111` เดิน `s0 → s1 → s2 → s3`, end state `s3`, Accepted
- `1110` จบ `s2` และ Accepted
- `1111` จบ `s1` และ Accepted
- `10110` จบ `s0` และ Accepted
- input เช่น `1 1 1` ถูก normalize เป็น `111` และได้ผลเดิม
- input ว่างหรือมี symbol อื่นไม่เริ่ม simulation, แสดง error และ focus ช่อง input
- ปุ่ม bit แทรกที่ caret/แทน selection และปุ่มลบ/Clear ทำงานเหมือนเดิม
- Run เริ่ม Step 0 และ autoplay ทีละ step ด้วย delay เดิม
- Previous/Next หยุด autoplay และไม่เดินเกินขอบเขต
- การแก้ input หรือ Reset ระหว่าง autoplay ยกเลิก timer และไม่มี step เก่าแสดงภายหลัง
- Reset เลือก prediction `s0`
- prediction ถูก/ผิดเทียบกับ end state และไม่กระทบ Accepted
- SVG, problem statement, status strip และ conclusion แสดง `F = {s0, s1, s2, s3}` ตรงกัน
- dialog เปิด/ปิดครบทุกวิธีและคืน focus ไปปุ่มเปิด
- Previous/Next lesson และ sidebar ไป URL เดิม
- Console ไม่มี error ใหม่

## เกณฑ์ตรวจรับด้าน UX/UI

- ผู้ใช้เห็นทันทีว่า FSA ตัดสินจาก end state และโจทย์นี้ให้ทาย end state
- Definition → Compare → Lab มีลำดับสายตาชัด โดยมีทางลัดจาก hero
- ที่ 1440×900 control และ simulation ใช้พื้นที่ร่วมกันโดย diagram/table ไม่ล้นหน้า
- ที่ 1024×768 และ 768×1024 panel เรียง control ก่อน simulation
- ที่ 390×844 และ 320px ไม่มี horizontal scroll ของทั้งหน้า; อนุญาตเฉพาะ table/diagram wrapper
- input, radio, keypad, actions, step controls, tables และ dialog ใช้ keyboard ได้และมี focus indicator
- touch target ทุก control บน mobile ไม่น้อยกว่า 44px
- active state, active edge, read/current/pending bit, prediction correct/wrong และ disabled แยกได้โดยไม่พึ่งสีอย่างเดียว
- screen reader ได้ยินผลหนึ่งข้อความต่อ step และสรุปหนึ่งครั้งโดยไม่ประกาศซ้ำ
- diagram description ระบุ final states ทั้ง 4 ถูกต้อง และ active state มี accessible state
- ตารางทุกชุดมี caption/header scope และ scroll region มีชื่อ
- conclusion แยกชัดระหว่าง `ทาย end state ถูกหรือผิด` กับ `เครื่อง Accepted`
- reduced motion ไม่ทำให้ข้อมูลหรือ controls หาย

## หมายเหตุสำหรับ AI ผู้แก้โค้ด

หน้า FSA มีความขัดแย้งเฉพาะคำอธิบาย SVG: `#fsa-diagram-desc` ระบุ final states ไม่ครบ แต่ระบบจริงกำหนดทุก state เป็น final state ให้แก้คำอธิบายให้ตรง `F = {s0, s1, s2, s3}` และห้ามแก้ logic นอกจากนี้ `styles/content-sections.css` มี FSA styles สองช่วงและ legacy selectors หลายตัว ต้องค้นการใช้งานก่อนลบและจำกัดทุกกฎใหม่ภายใต้ `#page-fsa`
