# UX/UI Implementation Plan: `working-fsm.html`

## เป้าหมาย

ปรับ Lesson 03 ให้เป็น **prediction workbench** ที่ผู้เรียนทำตามลำดับ `Build Input → Predict Output → Run & Inspect` ได้โดยไม่สับสน พร้อมเห็นความสัมพันธ์ระหว่าง state path, current step, คำตอบที่เดา และ simulation table

คงแนวทางภาพของเว็บไซต์: technical academic, sidebar สี navy, พื้นเนื้อหาสว่าง, teal สำหรับสถานะหลัก, amber สำหรับข้อมูลระหว่างทาง และ orange สำหรับคำตอบผิด

## แหล่งที่ใช้วิเคราะห์

- `working-fsm.html`
- `styles/base.css`
- `styles/sidebar.css`
- `styles/content-sections.css`
- `scripts/sidebar.js`
- `scripts/workingFsm.js`

ห้ามอ่านหรืออ้างอิงไฟล์ในโฟลเดอร์ `content`

## ขอบเขตไฟล์ที่อนุญาตให้แก้

- แก้โครงสร้างและ accessibility ใน `working-fsm.html`
- แก้เฉพาะ selector ที่ scope ด้วย `#page-working-fsm` ใน `styles/content-sections.css`
- แก้ `scripts/workingFsm.js` ได้เฉพาะ accessibility, focus management และการ sync visual state ที่ไม่เปลี่ยนผลคำนวณ
- ห้ามแก้ `rules`, `allowedInputs`, `autoStepDelay`, วิธี parse input, วิธีตรวจ prediction และลำดับ auto-run
- ไม่แก้ `styles/base.css`, `styles/sidebar.css`, `scripts/sidebar.js` หรือหน้า HTML อื่น

## สัญญา DOM และระบบที่ห้ามเปลี่ยน

### ID ที่ JavaScript ใช้งาน

คง ID ต่อไปนี้แบบตรงตัว ห้ามลบ เปลี่ยนชื่อ หรือใช้ซ้ำ:

- `working-fsm-form`, `input-string`, `prediction-string`
- `input-error`, `prediction-limit-status`, `prediction-track`
- `simulation-body`, `state-path`
- `step-focus-title`, `step-focus-detail`, `step-answer-status`
- `step-slider`, `previous-step`, `next-step`
- `run-working-fsm`, `run-working-fsm-label`, `reset-working-fsm`
- `working-how-to-dialog`, `working-how-to-title`
- `open-working-how-to`, `close-working-how-to`

### Class และ data attribute ที่ JavaScript ใช้งาน

- คง `.step-focus`, `.string-form`, `.symbol-chip`, `.builder-tool`, `.step-answer-status`
- คง `[data-string-target]`, `data-symbol`, `data-action`, `data-step-index` และ `data-path-index`
- คงค่า `data-symbol` ของ input: `5`, `10`, `O`, `R`
- คงค่า `data-symbol` ของ prediction: `n`, `5`, `10`, `Cornae`, `Party`
- คงค่า `data-action="undo"` และ `data-action="clear"`
- รองรับ class ที่ JavaScript เพิ่ม/ลบ: `.is-success`, `.is-locked`, `.is-running`, `.is-correct`, `.is-wrong`, `.is-active`, `.has-wrong-answer`, `.is-wrong-answer`

### พฤติกรรมที่ต้องคงเดิม

- Input รับ symbol จาก `I = {5, 10, O, R}` และแปลงตัวอักษรเป็น uppercase ตามเดิม
- Prediction มีจำนวน symbol ได้ไม่เกินจำนวน input และถูกตัดให้สั้นลงเมื่อ input ลดลง
- กด Run ครั้งเดียวแล้วแสดงผลอัตโนมัติทีละ step ทุก 1,100ms
- ระหว่าง auto-run ช่อง input/prediction เป็น readonly และปุ่ม builder ถูก disabled
- ระหว่าง auto-run ปุ่ม Previous, Next และ slider ถูก disabled
- เมื่อ run จบ ผู้ใช้ย้อนดู step ที่เปิดเผยแล้วได้ด้วยปุ่มและ slider
- Run ซ้ำไม่ได้จนกด Reset
- Reset ยกเลิก timer, ล้าง input/prediction/result และปลดล็อก editor
- ปุ่มวิธีเล่นเปิด native dialog และปิดได้จาก ×, Escape และ backdrop
- Previous ไป `fsm-output.html`; Next ไป `recognition-fsm.html`

## ปัญหาที่พบ

1. หน้าไม่มีทางลัดจาก hero ไป lab ทำให้กิจกรรมหลักอยู่ต่ำกว่าส่วนอธิบายโดยไม่มี CTA
2. ขั้น Input, Prediction และ Run ยังพึ่งข้อความอธิบาย ผู้ใช้ต้องอ่านก่อนจึงเข้าใจลำดับ
3. Input composer และ Prediction composer มีน้ำหนักภาพใกล้กัน แต่ยังไม่มีเลขขั้นหรือเส้นทางที่เชื่อมกัน
4. `#input-error` ใช้แสดงทั้ง error, success และสถานะกำลังรัน แต่กำหนด `role="alert"`; screen reader จึงอาจประกาศข้อความทั่วไปแบบเร่งด่วนเกินไป
5. มี live region พร้อมกันหลายจุด ได้แก่ prediction limit, prediction track, form message และ step focus ทำให้ระหว่าง auto-run มีโอกาสประกาศซ้ำทุก step
6. prediction slot ที่สร้างด้วย JavaScript มีเพียง `title`; ข้อมูลถูก/ผิดควรมี accessible name โดยตรง
7. state path สร้างจาก `<span>` และ `<i>` โดยไม่มี list semantics ทำให้ screen reader ไม่ทราบว่าเป็นลำดับ state
8. simulation table ไม่มี caption และ row แรกของแต่ละ step ไม่ถูกกำหนดเป็น row header
9. ตาราง scroll แนวนอนได้แต่ container ไม่มีชื่อ ไม่มี focus target และไม่มีคำบอกบน mobile
10. ปุ่ม symbol สูง 40px, How-to 38px, Step 38px และปุ่มปิด dialog 34px เล็กเกินไปสำหรับ touch
11. focus ของ text input ใช้ `outline: none` และพึ่ง box-shadow โปร่ง ทำให้ focus indicator ไม่ชัดในบางหน้าจอ
12. status สีถูก/ผิดใช้สีชัด แต่จุด active ใน state path และ table ยังต้องพึ่งสีเป็นหลัก
13. challenge strings ด้านล่างแสดงเหมือน chip แต่คลิกไม่ได้ อาจทำให้ผู้ใช้เข้าใจว่าเป็น preset button
14. `.working-lab` ถูกกำหนด `max-width: 1180px` ช่วงต้นไฟล์ แต่ถูก override เป็น `max-width: none` ที่บรรทัดหลัง ทำให้ความกว้างไม่มี source of truth เดียว
15. `styles/content-sections.css` เป็นไฟล์ร่วมกับหน้า FSA จึงมีความเสี่ยงหากแก้ selector แบบ global

## คำสั่งแก้ไข `working-fsm.html`

### 1. เพิ่ม CTA ใน hero

ภายใน `.working-hero` ให้คง kicker, `h1` และข้อความเดิม จากนั้นเพิ่ม `.working-hero__actions`:

- ลิงก์หลัก `เริ่มสร้าง Input String` ไป `#working-lab`
- ลิงก์รอง `อ่านหลักการก่อน` ไป `#input-string-concept`

เพิ่ม `id="input-string-concept"` ให้ lesson section แรก และเพิ่ม `id="working-lab"` ให้ section `.working-lab`

ใช้ native anchor เท่านั้น ไม่เพิ่ม JavaScript สำหรับ scroll

### 2. เพิ่ม workflow 3 ขั้นในหัว lab

ภายใน `.working-lab__header` หลังข้อความอธิบาย เพิ่ม ordered list `.working-workflow`:

1. `Build Input` — สร้างลำดับที่เครื่องจะอ่าน
2. `Predict Output` — เดาผลลัพธ์ให้ครบจำนวน step
3. `Run & Inspect` — ดู state และตรวจคำตอบทีละขั้น

- ใช้เลข 01–03 และเส้นเชื่อมเพื่อบอกลำดับ
- ไม่ทำเป็น progress ที่บันทึกสถานะ
- ไม่ใช้ปุ่มหรือ role ที่สื่อว่าคลิกได้

### 3. ทำ Input และ Prediction เป็นสองขั้นที่สัมพันธ์กัน

- เพิ่มข้อความเลขขั้น `01` ใน Input composer และ `02` ใน Prediction composer
- คง `<label>` และ `for` ของ input ทั้งสองช่อง
- คงปุ่ม builder และ data attribute ทุกตัว
- ย้าย `#alphabet-note` เข้าไปอยู่ท้าย Input composer เพื่อให้ขอบเขตคำอธิบายชัด
- คง `#prediction-limit-status` ใน Prediction composer และเปลี่ยนข้อความเริ่มต้นเป็น `Prediction 0 / 0 symbols`
- เพิ่มข้อความกำกับสั้นว่า `จำนวน prediction ต้องเท่ากับจำนวน input เพื่อให้ตรวจครบทุก step` โดยเชื่อมผ่าน `aria-describedby`
- ห้ามบังคับว่าต้องกรอก prediction ครบก่อน Run เพราะจะเปลี่ยนพฤติกรรมเดิม

### 4. แยก Run status ออกจาก error semantics

- คง ID `#input-error` เพราะ JavaScript ใช้งาน แต่เปลี่ยน `role="alert"` เป็น `role="status"`, `aria-live="polite"`, `aria-atomic="true"`
- เมื่อ input ว่างหรือมี symbol ผิด ให้ `workingFsm.js` ตั้ง `aria-invalid="true"` ที่ `#input-string` และ focus กลับไปช่องนี้
- เมื่อ input ถูกต้องหรือ Reset ให้ลบ `aria-invalid`
- ห้ามสร้าง live region เพิ่มสำหรับข้อความเดียวกัน

### 5. ลดการประกาศซ้ำระหว่าง auto-run

- นำ `aria-live` ออกจาก `#prediction-track`
- นำ `aria-live` ออกจาก container `.step-focus`
- เพิ่ม visually hidden element `#working-step-announcement` พร้อม `role="status"`, `aria-live="polite"`, `aria-atomic="true"` ภายใน simulation panel
- อัปเดต element นี้หนึ่งครั้งต่อ step ใน `updateStepFocus()` ด้วยข้อความ:

`Step {n}: {current state} รับ {input} ไป {next state}; output {output}; คำตอบ {ถูกหรือผิด}`

- `#prediction-limit-status` คง `aria-live="polite"` ได้ แต่ประกาศเฉพาะเมื่อจำนวนเปลี่ยนจากการแก้ input/prediction ไม่ใช่ทุก render

### 6. ปรับ Run actions ให้สื่อสถานะ

- เพิ่ม label `03 Run & Inspect` เหนือ `.form-actions`
- คงปุ่ม Run และ Reset พร้อม ID/class เดิม
- ขณะ `.string-form.is-running` ให้แสดง status text `กำลังรันอัตโนมัติ` ใกล้ปุ่ม โดยใช้ข้อความจาก button label หรือ element ที่มีอยู่ ไม่สร้างปุ่ม Pause
- เมื่อ run จบ ให้แสดงข้อความ `รันครบแล้ว — ใช้ลูกศรหรือ slider เพื่อย้อนดู`
- ห้ามเพิ่ม Pause, Resume, Run again หรือแก้ auto-run flow

### 7. ปรับ simulation panel

- เพิ่ม header ของ panel ก่อน `.step-focus`:
  - eyebrow `RESULT TRACE`
  - heading `Step-by-step Simulation`
  - คำอธิบาย `ผลจะแสดงอัตโนมัติและเปิดให้ย้อนดูเมื่อรันครบ`
- คง Current Step เป็น visual anchor หลัก
- เพิ่ม label ที่มองเห็น `State Path` เหนือ `#state-path`
- เพิ่ม label `Review Step` เหนือ `.step-controls`
- เพิ่ม output text ข้าง slider เช่น `Step 0 / 4`; ใช้ ID ใหม่และอัปเดตพร้อม `currentStepIndex`
- อัปเดต `aria-valuetext` ของ `#step-slider` ให้บอก step ปัจจุบันและจำนวน step ที่เปิดดูได้

### 8. เพิ่ม semantics ให้ state path

- กำหนด `role="list"` ให้ `#state-path`
- ใน `renderStatePath()` กำหนด `role="listitem"` และ accessible label ให้ state node แต่ละตัว เช่น `ลำดับที่ 2: s1`
- เส้น `<i>` ต้องคง `aria-hidden="true"`
- active state ต้องมีทั้งสีและ marker ที่ไม่พึ่งสี เช่นวงแหวนหรือข้อความ `Current` แบบ visually hidden

### 9. ปรับ simulation table

- เพิ่ม `<caption>` แบบ visually hidden ว่า `ผลการทำงานของ FSM แยกตาม step`
- เพิ่ม `scope="col"` ให้ `<th>` ทั้ง 5 ช่องใน `<thead>`
- ใน `renderTable()` เปลี่ยน cell Step แรกของแต่ละแถวเป็น `<th scope="row">` และคงค่า `data-step-index` บน `<tr>`
- คง class `.is-active`, `.has-wrong-answer` และ `.is-wrong-answer`
- เพิ่มข้อความ mobile-only ก่อนตารางว่า `เลื่อนตารางในแนวนอนเพื่อดูผลทุกคอลัมน์`
- กำหนด `.simulation-table-wrap` เป็น `tabindex="0"`, `role="region"`, `aria-label="ผล simulation เลื่อนได้ในแนวนอน"`

### 10. ปรับ dialog วิธีเล่น

- คง native `<dialog>`, ID, หัวข้อ, legend และขั้นตอน 4 ข้อเดิม
- เพิ่มข้อความใต้หัว dialog ว่า `ใช้เวลาประมาณ 1 นาที`
- หลัง dialog ปิด ให้คืน focus ไป `#open-working-how-to` ผ่าน event `close`
- คงการปิดด้วย Escape และ backdrop
- ห้ามสร้าง custom modal แทน `<dialog>`

### 11. ปรับ Reflection และ navigation

- เปลี่ยน `.challenge-list` เป็น `<ul>` และแต่ละตัวอย่างเป็น `<li>`
- เพิ่มหัวนำ `Input strings สำหรับลองรอบถัดไป`
- ออกแบบให้เป็น code sample list ไม่ใช่ปุ่ม: ไม่มี cursor pointer, hover lift หรือ button role
- เปลี่ยนข้อความ Previous เป็น `← กลับไป FSM with Output`
- เปลี่ยนข้อความ Next เป็น `เรียน FSM Recognition →`
- คง URL เดิม

## คำสั่งแก้ไข `styles/content-sections.css`

### 1. จำกัดผลกระทบต่อหน้าอื่น

- แก้เฉพาะ section `Lesson 03: Working with FSM` และ selector ที่ขึ้นต้นด้วย `#page-working-fsm`
- ห้ามแก้ selector ของ `#page-fsa` หรือ shared selector ที่ไม่มี `#page-working-fsm`
- รวมกฎความกว้างของ `.working-lab` ให้เหลือจุดเดียว และลบเฉพาะ override `#page-working-fsm .working-lab` จากกลุ่ม Desktop width normalization
- ห้ามย้ายกฎของ Working FSM ไปเป็น global component ในรอบนี้

### 2. Content width และ page rhythm

- กำหนด `#page-working-fsm` เป็น `width: 100%`, `max-width: 1400px` และจัดกึ่งกลาง
- hero และ lesson intro จำกัดความยาวข้อความประมาณ `68–74ch`
- `.working-lab` ใช้ `width: 100%`, `max-width: 1240px` และจัดกึ่งกลาง
- รักษาระยะหลักตามระบบ 8px: 16, 24, 32 และ 48px
- อย่าเปลี่ยนทุก section เป็น card; ให้ lab เท่านั้นเป็นพื้นที่ surface หลัก

### 3. Hero และ workflow

- คง hero แบบ editorial พื้นโปร่งและเส้นด้านล่าง
- `.working-hero__actions` แสดง inline บน desktop และ stack ต่ำกว่า 480px
- CTA หลักใช้ teal, CTA รองเป็น text link และทุกลิงก์มี min-height 44px
- `.working-workflow` ใช้ 3 คอลัมน์บน desktop, 1 คอลัมน์ต่ำกว่า 700px
- ใช้ teal กับขั้น 01–02 และ amber กับขั้น 03; ห้ามใช้ gradient ฉูดฉาดหรือสถานะ completed

### 4. Control panel

- คงแถบ accent teal–amber ด้านบน panel แต่ลดจำนวนสีเหลือ teal → amber ไม่ต้องต่อ blue
- ที่ความกว้างตั้งแต่ 980px จัด Input และ Prediction composer เป็น grid 2 คอลัมน์เท่ากัน
- `.alphabet-note`, form status และ `.form-actions` ต้องจัดอยู่ในคอลัมน์ที่สัมพันธ์กับเนื้อหา หรือ span เต็ม grid อย่างชัดเจน
- ต่ำกว่า 980px เรียง Input ก่อน Prediction ตาม DOM
- ใช้พื้นขาวสำหรับ input และพื้น `#f8fafc` สำหรับ composer; ลดเงาซ้อน
- เปลี่ยน chip radius จาก pill เต็มรูปแบบเป็น 6–8px เพื่อให้ดูเป็น builder control ไม่ใช่ tag

### 5. Input, chip และ focus

- เพิ่ม `:focus-visible` ให้ input โดยใช้ outline อย่างน้อย 3px และ `outline-offset: 2px`; ห้ามใช้ `outline: none` โดยไม่มีตัวทดแทน
- เพิ่ม focus state ให้ Run, Reset, Previous, Next และ slider นอกเหนือจาก chip/how-to ที่มีอยู่
- focus outline ใช้สี teal เข้มหรือขาวสลับตามพื้น และต้องไม่ใช้ alpha ต่ำเพียงอย่างเดียว
- control ทุกตัวมี touch target อย่างน้อย 44×44px บน mobile
- disabled state ต้องมีทั้ง opacity, cursor และความต่างของพื้น/border แต่ข้อความยังอ่านได้
- readonly input ระหว่าง run ต้องยังมี contrast ผ่าน และเพิ่มข้อความสถานะ locked ที่มองเห็นได้

### 6. Simulation panel

- ใช้ background ขาวและเส้นแบ่งแทน card ย่อยหลายชั้น
- `.step-focus` เป็นส่วนเด่น ใช้ technical grid background จางตามเดิม
- สถานะตอบถูกใช้ teal soft; ตอบผิดใช้ orange soft และต้องมี icon/text ประกอบสี
- state path ใช้ node ทรงเหลี่ยมมน 6px พร้อมเส้น amber; active node ใช้วงแหวนเพิ่มจากพื้น teal
- อนุญาตให้ state path scroll แนวนอนเมื่อ string ยาว แทนการบีบ node หรือทำให้ทั้งหน้า overflow
- step control กว้างอย่างน้อย 44px และ slider มี track/thumb contrast ชัด

### 7. Table

- คง header navy และ active row teal soft
- เพิ่ม marker `Current` หรือ pseudo-element ใน active row เพื่อไม่พึ่งสีเพียงอย่างเดียว
- wrong answer ใช้ orange border พร้อมสัญลักษณ์/ข้อความที่มีอยู่
- `.simulation-table-wrap:focus-visible` ต้องมี outline ชัดเจน
- บน mobile ให้ table มี `min-width` ประมาณ 620–660px และ scroll ภายใน region เท่านั้น
- เพิ่ม gradient hint ด้านขวาของ scroll region ก่อนผู้ใช้เลื่อน โดยต้องไม่บังข้อความหรือจับ pointer event
- ใช้ `scrollbar-gutter: stable` เมื่อรองรับ

### 8. Dialog และ sample list

- dialog กว้างไม่เกิน 520px และสูงไม่เกิน `calc(100dvh - 32px)` พร้อม scroll ภายใน
- ปุ่มปิดมีพื้นที่กดอย่างน้อย 44px และ focus ring
- `.challenge-list` ใหม่ใช้เส้น divider และ code typography ไม่ใช้พื้น/เงาแบบปุ่ม
- sample แต่ละรายการมีเลขกำกับด้วย CSS counter ได้ แต่ห้ามสื่อว่าคลิกได้

### 9. Motion

- คง pulse ที่ปุ่ม Run เพื่อบอกว่ากำลังทำงาน แต่ลดความต่าง scale ให้ละเอียดขึ้น
- ใช้ transition 160–220ms สำหรับ hover/focus visual เท่านั้น
- คง smooth scroll ที่ JavaScript มีอยู่และเคารพ `prefers-reduced-motion`
- ขยาย reduced-motion rule ให้ครอบคลุม transition/animation ใหม่ทั้งหมดภายใต้ `#page-working-fsm`
- ห้ามใช้ animation เพื่อซ่อน/เปิดเผยผลที่จำเป็นต่อความเข้าใจ

## คำสั่งแก้ไข `scripts/workingFsm.js` เฉพาะ UX/accessibility

อนุญาตเฉพาะรายการต่อไปนี้:

1. อัปเดต `#working-step-announcement` ครั้งเดียวต่อ step
2. ตั้ง/ลบ `aria-invalid` และ focus ช่อง `#input-string` เมื่อ validation ไม่ผ่าน
3. เพิ่ม `role="listitem"` และ accessible label ให้ node ใน `renderStatePath()`
4. สร้าง `<th scope="row">` สำหรับคอลัมน์ Step ใน `renderTable()`
5. อัปเดตข้อความ Step n / total และ `aria-valuetext` ของ slider
6. คืน focus ไปปุ่มเปิด dialog เมื่อ dialog ปิด
7. ลดการประกาศ `prediction-limit-status` ที่ไม่ได้เกิดจากค่าจำนวนเปลี่ยน

ห้าม refactor หรือแก้ `rules`, `buildSimulation()`, `parseInput()`, `isPredictionCorrect()`, timer, editor locking และเงื่อนไข Run/Reset

## Design tokens ที่ให้ใช้

- Navy: `#09111f`, `#0f172a`, `#162033`
- Teal: `#0f766e`
- Teal hover: `#0b615b`
- Teal soft: `#ecfdf5`, `#f0fdfa`
- Amber: `#f59e0b`
- Amber soft: `#fffbeb`
- Wrong/error: `#c2410c`
- Wrong soft: `#fff7ed`
- Heading: `#0f172a`
- Body: `#475569`
- Muted: `#64748b`
- Border: `#d6e0eb` หรือ `var(--border-color)`
- Radius: 8px สำหรับ panel และ 6px สำหรับ control

ห้ามเพิ่มสีม่วง, neon gradient, glassmorphism หนัก หรือเปลี่ยน lab ให้เป็น dashboard card สำเร็จรูป

## เกณฑ์ตรวจรับด้านระบบ

- `5 10 10 O` ให้ state path `s0 → s1 → s3 → s4 → s0` และ output `n n 5 Cornae`
- `10 10 O` ให้ output `n n Cornae`
- `O` จาก `s0` อยู่ `s0` และ output `n`
- ตัวอักษร `o`/`r` ที่พิมพ์เองถูกแปลงและทำงานเหมือน `O`/`R`
- symbol นอก alphabet แสดง error และไม่เริ่ม simulation
- prediction ยาวเกิน input ถูกตัดตามเดิม
- auto-run เปิดทีละ step ทุก 1,100ms และ control ที่ต้องล็อกถูก disabled ตามเดิม
- หลัง run จบ Previous, Next และ slider ย้อนดูได้เฉพาะ step ที่เปิดเผยแล้ว
- Reset ระหว่าง run ยกเลิก timer และคืนหน้าเริ่มต้นโดยไม่มี step เก่าโผล่ภายหลัง
- dialog เปิด/ปิดครบทุกวิธีและคืน focus ให้ปุ่มเปิด
- Previous/Next และ sidebar navigation ไป URL เดิม
- Console ไม่มี error ใหม่

## เกณฑ์ตรวจรับด้าน UX/UI

- เห็นลำดับ Build Input → Predict Output → Run & Inspect ชัดโดยไม่ต้องเปิด dialog
- ที่ 1440×900 มองเห็น Input และ Prediction composer พร้อมกันโดยไม่บีบปุ่มหรือข้อความ
- ที่ 1024×768 panel ไม่ชน sidebar และลำดับการอ่านยังเป็น Input ก่อน Prediction
- ที่ 768×1024, 390×844 และ 320px ไม่มี horizontal scroll ของทั้งหน้า; อนุญาตเฉพาะ state path/table region
- control ทุกตัวใช้ Tab/Enter/Space ได้ตามชนิดและมี focus indicator
- touch target บน mobile ไม่น้อยกว่า 44px
- สถานะ idle, running, complete, correct, wrong, readonly และ disabled แยกจากกันได้โดยไม่พึ่งสีอย่างเดียว
- screen reader ได้ยินผลแต่ละ step หนึ่งครั้ง ไม่ประกาศซ้ำจาก prediction track, form message และ step focus
- state path มีลำดับเชิง semantic และ table มี caption/column header/row header
- challenge strings ดูเป็นตัวอย่างข้อความ ไม่ดูเหมือนปุ่ม
- reduced motion ไม่กระทบการมองเห็นผล simulation

## หมายเหตุสำหรับ AI ผู้แก้โค้ด

`styles/content-sections.css` ใช้ร่วมกับหน้าอื่น ให้จำกัดทุกกฎใหม่ภายใต้ `#page-working-fsm` และตรวจ diff ว่าไม่มี selector ของ `#page-fsa` ถูกเปลี่ยน ก่อนแก้ JavaScript ให้เก็บ test cases ด้านบนเป็น baseline และเปรียบเทียบผลทุก sequence หลังแก้
