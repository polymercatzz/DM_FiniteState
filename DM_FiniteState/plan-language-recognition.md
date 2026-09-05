# UX/UI Implementation Plan: `language-recognition.html`

## เป้าหมาย

ปรับ Lesson 06 ให้เป็น **Language Membership Lab** ที่ผู้เรียนเชื่อมความหมายของ string เดี่ยวกับ language ทั้งเซตได้ตามลำดับ `Choose Machine → Build x → Trace States → Check Membership`

จุดเด่นที่ต้องจดจำคือ membership pipeline `x → f(s0, x) → end state ∈/∉ F → x ∈/∉ L(M)` ซึ่งเปลี่ยนตาม machine และผลการ simulation โดยคงแนวทางภาพเดิม: technical academic, sidebar สี navy, พื้นสว่าง, teal สำหรับ accepted/final state, amber สำหรับ current step และ orange สำหรับ rejected/คำตอบผิด

## แหล่งที่ใช้วิเคราะห์

- `language-recognition.html`
- `styles/base.css`
- `styles/sidebar.css`
- `styles/challenge-sections.css`
- `scripts/sidebar.js`
- `scripts/languageChallenge.js`

ห้ามอ่านหรืออ้างอิงไฟล์ในโฟลเดอร์ `content`

## ขอบเขตไฟล์ที่อนุญาตให้แก้

- แก้โครงสร้าง, semantic และ accessibility ใน `language-recognition.html`
- แก้เฉพาะ selector ที่ scope ด้วย `#page-language-recognition` ใน `styles/challenge-sections.css`
- แก้ `scripts/languageChallenge.js` ได้เฉพาะ accessible state, focus management, progress semantics และ markup ที่ JavaScript สร้าง
- ห้ามแก้ object `machines`, `guessItems`, `parseInput()`, `simulate()`, transition, final states, expected answers, autoplay และค่า `stepDelay`
- ไม่แก้ `styles/base.css`, `styles/sidebar.css`, `scripts/sidebar.js` หรือหน้า HTML อื่น

## สัญญา DOM และระบบที่ห้ามเปลี่ยน

### ID ที่ JavaScript ใช้งาน

คง ID ต่อไปนี้แบบตรงตัว ห้ามลบ เปลี่ยนชื่อ หรือใช้ซ้ำ:

- `language-form`, `machine-select`, `language-input`, `language-error`
- `machine-summary`
- `language-playback`, `language-playback-label`, `language-playback-status`, `language-playback-progress`
- `language-state-path`, `language-end-state`, `language-final-states`, `language-body`
- `language-reset`, `guess-grid`
- `language-how-to-dialog`, `language-how-to-title`
- `open-language-how-to`, `close-language-how-to`
- `epsilon-note`

### Class และ data attribute ที่ JavaScript ใช้งาน

- คง `[data-string-action]`
- คงค่า `data-string-action="append"`, `epsilon`, `remove`, `clear`
- คง `data-symbol="0"` และ `data-symbol="1"`
- คง `.run-button`, `.string-chip`, `.language-panel--simulation`
- คง `[data-machine-state]` ที่ JavaScript สร้าง
- คง class ที่ JavaScript เพิ่ม/ลบ: `.is-success`, `.is-final`, `.is-current`, `.is-latest`, `.is-accepted`, `.is-rejected`, `.is-selected`, `.is-correct`, `.is-wrong`
- คง `.machine-state-row`, `.guess-card`, `.guess-card__choices`

### พฤติกรรมที่ต้องคงเดิม

- ค่าเริ่มต้นคือ machine `ones` และ string `epsilon`
- `epsilon`, `ε` หรือข้อความว่างถูก parse เป็น string ว่าง
- input อื่นถูกตัด whitespace ทุกตำแหน่งก่อน simulation
- ผู้ใช้สร้าง string ผ่าน chip เพราะ `#language-input` เป็น readonly
- ปุ่ม `0`/`1` ต่อ symbol ท้าย string; epsilon และ Clear กลับเป็น string ว่าง; Remove ลบ symbol ท้ายสุด
- เปลี่ยน machine แล้วต้องยกเลิก run ปัจจุบัน, คง string ที่สร้างไว้ และ reset เฉพาะผลลัพธ์
- ระหว่าง autoplay ต้อง disable machine select, input, string chips และปุ่ม Test
- Reset ยังใช้งานได้ระหว่าง run และต้องยกเลิก async run ด้วย `activeRunId`
- Reset กลับ machine `ones`, input `epsilon` และผลเริ่มต้น
- epsilon ไม่มี transition row แต่ยังต้องสรุป membership จาก start state
- dialog เปิดด้วย `showModal()` และปิดด้วยปุ่ม ×, Escape หรือ backdrop
- Guess the Language มี 3 ชุดเดิม เลือกคำตอบใหม่ได้หลังตอบผิด
- Previous ไป `fsa.html`; Next ไป `designing-fsa.html`

## ปัญหาที่พบ

1. hero อธิบายแนวคิดจาก string ไปสู่ language แต่ไม่มี CTA หรือภาพ pipeline ที่เชื่อมเข้าสู่ lab
2. Definition, สูตร accepted string, ขั้นตอน 3 ข้อ, blockquote และนิยาม `L(M)` อยู่ใน surface เดียวที่หนาแน่น ทำให้จุดสำคัญแข่งขันกัน
3. ลำดับ Choose Machine → Build x → Test ยังพึ่งข้อความอธิบายมากกว่าการจัดวาง
4. lab ถูกกำหนดเป็นคอลัมน์เดียวทุกขนาด ทำให้ desktop มีช่วงแนวตั้งยาวและผล simulation อยู่ไกลจาก controls
5. ช่อง `String x` ดูคล้าย text input แต่เป็น readonly; ผู้ใช้อาจพยายามพิมพ์ก่อนพบ chip builder
6. epsilon, Clear และ Remove มีผลใกล้กัน แต่ visual hierarchy ยังไม่แยก symbol action กับ editing action ชัด
7. `#machine-summary` เป็น live region และถูกสร้างใหม่ทั้งส่วนเมื่อเปลี่ยน machine อาจประกาศข้อมูลจำนวนมาก
8. `#language-playback` เป็น live region ที่เปลี่ยนทุก step ขณะเดียวกันผล state/path ก็เปลี่ยน ทำให้ประกาศไม่เป็นโครงสร้างเดียว
9. `#guess-grid` เป็น live region ครอบทั้งพื้นที่ interactive ซึ่ง JavaScript สร้างพร้อมกัน อาจประกาศทุก card ตอนโหลดหน้า
10. machine state badges ไม่มี list semantics และ final/current state ใช้สี/เส้นขอบเป็นหลัก
11. state path เป็นข้อความยาวใน `<strong>` เดียว เมื่อ string ยาวจะอ่านและสแกนย้อนกลับยาก
12. progress bar เป็น visual-only และไม่มีค่าปัจจุบันสำหรับ assistive technology
13. simulation panel ไม่มี heading, ID หรือ focus target ที่ชัด แม้ JavaScript เลื่อนไปยัง panel หลัง Test
14. simulation table ไม่มี caption, header scope, row header และชื่อของ scroll region
15. epsilon result ใช้ empty row แต่ไม่มี semantic ที่อธิบายว่า Step 0 ก็เป็นผลที่ถูกต้อง
16. current table row ใช้ animation/สีเป็นหลัก ไม่มี marker ที่ไม่พึ่งสี
17. select/input ใช้ `outline: none` และ focus shadow โปร่ง; focus visibility ยังไม่ชัดพอ
18. How-to 38px, string chip 42px, ปุ่มปิด dialog 34px และ Guess buttons 38px เล็กกว่า touch target 44px
19. Guess buttons ไม่มี `aria-pressed`; card และ feedback ไม่มี group/status semantics เฉพาะข้อ
20. `.language-lab` และ `.guess-language-activity` ถูก override `max-width: none` ใน selector group ร่วมกับ Recognition ทำให้ source of truth ไม่ชัดและเสี่ยงกระทบหน้าอื่น

## คำสั่งแก้ไข `language-recognition.html`

### 1. เพิ่ม CTA และ membership pipeline ใน hero

ภายใน `.language-hero` ให้คง kicker, `h1` และข้อความเดิม จากนั้นเพิ่ม `.language-hero__actions`:

- ลิงก์หลัก `ทดสอบ x ∈ L(M)` ไป `#language-lab`
- ลิงก์รอง `ทบทวนนิยาม L(M)` ไป `#language-definition`

เพิ่ม `id="language-lab"` ให้ `.language-lab` และ `id="language-definition"` ให้ `.recognition-definition`

เพิ่ม `.membership-pipeline` ที่สรุป:

`String x → Read every symbol → End state → Compare with F → Membership result`

- เป็น visual explanation ไม่ใช่ stepper ที่คลิกได้
- ใช้ native anchor สำหรับ CTA ไม่เพิ่ม JavaScript scroll

### 2. ลดความหนาแน่นของ Definition

- คงนิยาม recognized/accepted, สูตร `f(s0, x) ∈ F`, ขั้นตอน 3 ข้อ, blockquote และนิยาม `L(M)` ครบ
- เปลี่ยน `.recognition-definition__steps` เป็น `<ol>` และแต่ละขั้นเป็น `<li>`
- จัด intro กับ acceptance formula เป็นสองคอลัมน์เมื่อพื้นที่พอ
- วาง 3-step flow ต่อจากสูตรและก่อน blockquote
- ให้ blockquote เป็น rule สำคัญเพียงจุดเดียว ไม่สร้าง callout ซ้ำ
- แยก `L(M)` เป็น subsection ที่มีพื้นที่หายใจและสูตร navy เดิม
- สูตรต้องใช้ `<math>` ไม่จำเป็น; คง HTML text/subscript ที่รองรับเดิมได้

### 3. เพิ่ม workflow ในหัว lab

ภายใน `.language-panel__header` หลังคำอธิบาย เพิ่ม ordered list `.language-workflow`:

1. `Choose M` — เลือก machine/language
2. `Build x` — ต่อ 0, 1 หรือใช้ epsilon
3. `Test` — ให้เครื่องอ่านทุก symbol
4. `Decide` — ตรวจ end state กับ F

- ใช้เลข 01–04 และเส้นเชื่อม
- ไม่ทำเป็น control หรือ progress ที่บันทึกสถานะ
- คง dialog สำหรับคำอธิบายเต็ม

### 4. จัด form เป็นขั้นชัดเจน

- เพิ่ม label `01 Choose Machine` เหนือ select
- เพิ่ม label `02 Build String x` เหนือ readonly input และ chip builder
- เพิ่ม label `03 Test Membership` เหนือ `.form-actions`
- คง `#language-input` เป็น readonly และคงค่าแสดง `epsilon`
- เพิ่มข้อความใกล้ input ว่า `สร้าง string ด้วยปุ่มด้านล่าง ช่องนี้ใช้แสดงผลและพิมพ์ไม่ได้`
- เชื่อม helper text, `#epsilon-note` และ `#language-error` ผ่าน `aria-describedby`
- แยกปุ่ม symbol `0`, `1`, `ε` ออกจาก editing actions `ลบ`, `ล้าง` ด้วย group label ที่มองเห็นได้
- คง data attribute และ behavior เดิมของทุกปุ่ม

### 5. ปรับ validation และสถานะ disabled

- คง `#language-error` เป็น live region สำหรับ error เท่านั้น; ใช้ `role="alert"`, `aria-live="assertive"`, `aria-atomic="true"` หรือใช้ `role="status"` แบบ polite เพียงอย่างเดียว ห้ามกำหนด semantic ซ้ำซ้อน
- หากพบ symbol ที่ไม่ใช่ `0`/`1` ให้ตั้ง `aria-invalid="true"` ที่ `#language-input`
- เมื่อ input ถูกสร้างใหม่, เปลี่ยน machine, validation ผ่าน หรือ Reset ให้ลบ `aria-invalid`
- ระหว่าง run เพิ่ม `aria-busy="true"` ที่ form และ simulation panel; ลบเมื่อจบหรือถูกยกเลิก
- disabled controls ต้องยังอ่านข้อความได้และระบุว่ากำลัง Test; Reset ต้องไม่ถูก disable

### 6. เพิ่ม heading และ focus target ให้ simulation

- เพิ่ม `id="language-results"`, `tabindex="-1"` และ `aria-labelledby="language-results-title"` ให้ `.language-panel--simulation`
- เพิ่ม header ก่อน `#machine-summary`:
  - eyebrow `MEMBERSHIP TRACE`
  - `<h2 id="language-results-title">From String to Language</h2>`
  - ข้อความ `ติดตาม state path แล้วตรวจว่า end state อยู่ใน F หรือไม่`
- เมื่อ Test ให้เลื่อนและ focus panel นี้หลัง render เริ่มต้น โดยเคารพ reduced motion
- การ focus ต้องไม่ทำให้เกิด outline ขนาดใหญ่ถาวรหลัง click; แสดง focus-visible ตาม keyboard modality

### 7. ปรับ Machine Summary ให้เป็น machine reference

- คงข้อมูล `L(M)`, rule, state list, start state และ F ที่ JavaScript สร้าง
- นำ `aria-live` ออกจาก `#machine-summary`
- เพิ่ม heading ที่เชื่อมกับ selected option เช่น `Selected machine`
- ใน `renderMachineSummary()` กำหนด `.machine-state-row` เป็น `role="list"`
- state badge แต่ละตัวเป็น `role="listitem"` และมี accessible label เช่น `q0, start state, final state, current state`
- เพิ่ม marker ตัวอักษร `S` สำหรับ start, `F` สำหรับ final และ `Current` สำหรับ current โดยไม่พึ่งสี
- อัปเดต `aria-current="step"` เฉพาะ badge ปัจจุบัน
- ห้ามเปลี่ยน machine title, rule, states หรือ final states

### 8. เปลี่ยนผลลัพธ์เป็น membership pipeline ที่ sync กับ step

ภายใน simulation panel จัด visual flow:

1. `x = ...`
2. `f(s0, x) = current/end state`
3. `current/end state ∈/∉ F`
4. `x ∈/∉ L(M)` เมื่อจบ

- ก่อนจบให้ช่อง membership แสดง `กำลังตรวจ` ไม่เปิดเผย accepted/rejected ล่วงหน้า
- เมื่อจบให้แสดงข้อความเต็ม เช่น `01 ∈ L(M) · accepted`
- ใช้ symbol ทางคณิตศาสตร์ร่วมกับคำว่า accepted/rejected เสมอ
- ห้ามเปลี่ยนผลที่ได้จาก `machine.finals.has(endState)`

### 9. รวมการประกาศ autoplay ให้เหลือจุดเดียว

- นำ `aria-live` ออกจาก `#language-playback`
- เพิ่ม visually hidden `#language-announcement` ภายใน simulation panel พร้อม `role="status"`, `aria-live="polite"`, `aria-atomic="true"`
- ประกาศตอนเริ่มหนึ่งครั้งว่า `เริ่มที่ {start}`
- ประกาศหนึ่งครั้งต่อ step:

`Step {n} จาก {total}: อ่าน {symbol}, ย้ายจาก {current} ไป {next}`

- เมื่อจบประกาศครั้งเดียว:

`{x} อยู่/ไม่อยู่ใน L(M); end state {state} อยู่/ไม่อยู่ใน F`

- epsilon ประกาศ `epsilon ไม่มี transition; end state เท่ากับ start state {state}` ก่อนผลสรุป
- ห้ามให้ machine summary, playback และ error ประกาศข้อความเดียวกันซ้ำ

### 10. ปรับ playback และ progress semantics

- คง `#language-playback`, label, status และ progress bar
- กำหนด track เป็น `role="progressbar"` พร้อม `aria-valuemin="0"`, `aria-valuemax`, `aria-valuenow` และ `aria-valuetext`
- สำหรับ epsilon ให้ total step เป็น 0 และประกาศว่า `No transition`; อย่าหารด้วยศูนย์หรือแสดง progress ที่หลอกว่าอ่าน symbol แล้ว
- ระหว่าง run ใช้ label `Auto trace`; เมื่อจบใช้ `Membership result`
- accepted/rejected ต้องมี icon/text/pattern ร่วมกับสี
- หน้านี้ไม่มี manual step control: ห้ามเพิ่ม Previous, Next, Pause หรือ Resume

### 11. ปรับ State Path ให้ตรวจย้อนหลังง่าย

- คง ID `#language-state-path`
- แทนข้อความลูกศรยาวด้วย ordered list ของ state nodes เมื่อมีผล โดย JavaScript สร้างจาก `result.path`
- เปิดเผย node ตาม completed step เท่านั้น
- node แรกระบุ `Start`; node ล่าสุดระบุ `Current` หรือ `End` เมื่อจบ
- connector เป็น `aria-hidden="true"`
- ถ้าต้องคง `<strong>` wrapper ให้ใส่ list ภายในหรือใช้ sibling container โดยไม่เปลี่ยน ID ที่ JavaScript อ้าง
- path ยาวต้อง scroll แนวนอนภายใน ไม่ wrap จนอ่านลำดับผิด

### 12. ปรับ status strip

- เปลี่ยน `.language-status-strip` เป็น `<dl>` หรือเพิ่ม semantics เทียบเท่า
- คง State path, Current/End state และ Final states
- เพิ่มค่าปัจจุบัน `String x` เพื่อให้ผู้ใช้ไม่ต้องมองกลับ control panel
- ใช้ Current/End state เป็นค่าที่เด่นที่สุด
- ลด card ย่อย ใช้เส้นแบ่งภายใน surface เดียว
- เมื่อ machine เปลี่ยนต้อง sync start/final states ทันทีและล้าง path/result เดิม

### 13. ปรับ simulation table

- เพิ่ม `<caption>` แบบ visually hidden ว่า `ตาราง transition ของการทดสอบว่า x อยู่ใน L(M) หรือไม่`
- เพิ่ม `scope="col"` ให้ `<th>` ทั้ง 4 ช่องใน `<thead>`
- ใน `makeStepRow()` สร้างคอลัมน์ Step เป็น `<th scope="row">`
- คง `.is-latest` และ `.is-empty`
- เพิ่ม mobile hint ก่อนตารางว่า `เลื่อนตารางในแนวนอนเพื่อดูทุกคอลัมน์`
- กำหนด `.simulation-table-wrap` เป็น `tabindex="0"`, `role="region"`, `aria-label="ผล transition เลื่อนได้ในแนวนอน"`
- latest row ต้องมี marker `Current` หรือข้อความที่ไม่พึ่ง animation/สี
- สำหรับ epsilon ให้ empty row ระบุ `Step 0 · ไม่มี transition · end state = start state` แทนการสื่อว่าไม่มีข้อมูล

### 14. ปรับ Guess the Language

- นำ `aria-live="polite"` ออกจาก `#guess-grid`
- คง accepted/rejected examples, machine options และ expected answer ทั้ง 3 ชุด
- ใน `renderGuessActivity()` กำหนด card เป็น `role="group"` และเชื่อมชื่อผ่าน ID ที่ไม่ซ้ำ
- ใช้ semantic list สำหรับ accepted และ rejected examples แทนข้อความคั่น comma หากไม่ทำให้ card สูงเกินไป
- ปุ่ม rule เริ่มด้วย `aria-pressed="false"` และ sync กับ `.is-selected`
- feedback ของแต่ละ card ใช้ `role="status"`, `aria-live="polite"`, `aria-atomic="true"`
- เพิ่มข้อความ `เลือกใหม่ได้` และคง behavior ที่ตอบซ้ำได้
- correct/wrong ต้องมี icon และข้อความร่วมกับสี
- ห้ามแก้ `guessItems` หรือคำตอบของแต่ละชุด

### 15. ปรับ dialog วิธีเล่น

- คง native `<dialog>`, ID, ขั้นตอน 4 ข้อ และ legend เดิม
- เพิ่มข้อความใต้หัวว่า `ใช้เวลาประมาณ 1 นาที`
- ปุ่มปิดมีพื้นที่กดอย่างน้อย 44×44px
- เพิ่ม event `close` เพื่อคืน focus ไป `#open-language-how-to`
- คง Escape และ backdrop close
- ห้ามสร้าง custom modal แทน native dialog

### 16. ปรับ Key Idea และ navigation

- เพิ่ม `id="language-key-idea"` ให้ `.language-reflection`
- คงความหมายว่า `L(M)` คือเซตของ strings ไม่ใช่ string เดี่ยว
- แก้ข้อความที่แสดง `x in L(M)` ให้ใช้ `x ∈ L(M)` เพื่อสอดคล้องกับสูตรส่วนอื่น โดยไม่เปลี่ยนความหมาย
- เพิ่มคู่เปรียบเทียบสั้น:
  - `x` = สมาชิกหนึ่งตัวที่กำลังทดสอบ
  - `L(M)` = เซตของสมาชิกทุกตัวที่ M accepts
- เปลี่ยนข้อความ Previous เป็น `← กลับไป FSA`
- เปลี่ยนข้อความ Next เป็น `เรียน Designing FSA →`
- คง URL เดิม

## คำสั่งแก้ไข `styles/challenge-sections.css`

### 1. จำกัดผลกระทบและรวม source of truth

- แก้เฉพาะ selector ที่ขึ้นต้นด้วย `#page-language-recognition`
- ห้ามแก้ selector `#page-recognition-fsm` ในกลุ่ม Desktop width normalization
- แยก `.language-lab` และ `.guess-language-activity` ออกจาก selector group ร่วม แล้วกำหนด width/max-width ใน section Language Recognition จุดเดียว
- ห้ามสร้าง shared selector ที่ไม่มี page scope ในรอบนี้

### 2. Content width และ page rhythm

- กำหนด `#page-language-recognition` เป็น `width: 100%`, `max-width: 1400px` และจัดกึ่งกลาง
- จำกัดข้อความ hero ประมาณ `68–74ch`
- `.recognition-definition`, `.language-lab`, `.guess-language-activity`, `.language-reflection` ใช้ `width: 100%`, `max-width: 1240px` และจัดกึ่งกลาง
- ใช้ระยะหลัก 16, 24, 32 และ 48px
- foundation เป็น surface อธิบายหลัก ส่วน lab เป็น workbench; ลดเงาและ card ซ้อนที่ไม่จำเป็น

### 3. Hero, definition และ pipeline

- hero คง editorial layout พื้นโปร่งและเส้นด้านล่าง
- CTA inline บน desktop และ stack ต่ำกว่า 480px; touch target อย่างน้อย 44px
- `.membership-pipeline` ใช้ 5 จุดต่อเนื่องบน desktop, scroll ภายในหรือเรียงแนวตั้งบน mobile
- ใช้ teal กับ end state ที่อยู่ใน F และ amber กับขั้นตรวจ ไม่แสดง accepted/rejected ของ run ปัจจุบันใน hero
- intro/formula เป็น 2 คอลัมน์ตั้งแต่ 900px; ต่ำกว่านั้นเป็น 1 คอลัมน์
- definition steps ใช้ 3 คอลัมน์บน desktop และ 1 คอลัมน์ต่ำกว่า 700px
- สูตร `L(M)` ใช้ navy surface เป็น visual anchor เพียงจุดเดียว

### 4. Lab layout

- ตั้งแต่ 1120px จัด `.language-lab` เป็นสองคอลัมน์: control `minmax(320px, 0.72fr)` และ simulation `minmax(0, 1.28fr)`
- control panel ใช้ `align-self: start`; sticky ได้เมื่อไม่ชน viewport และต้องยกเลิกต่ำกว่า 1120px
- ต่ำกว่า 1120px เรียง control ก่อน simulation ตาม DOM
- ห้ามให้ state path หรือตารางดันความกว้างทั้งหน้า
- ลดแถบ accent บน control จาก teal–amber–blue ให้เหลือ teal → amber

### 5. Workflow, form และ controls

- `.language-workflow` ใช้ 4 คอลัมน์บน desktop, 2 คอลัมน์บน tablet, 1 คอลัมน์บน mobile
- workflow เป็น diagram ไม่ใช่ interactive stepper
- select และ readonly input สูงอย่างน้อย 48px
- readonly input ใช้พื้น neutral และ cursor default เพื่อสื่อว่าพิมพ์ไม่ได้ แต่ contrast ต้องผ่าน
- แยก symbol/action groups ด้วย label และ divider ไม่ใช้ card ซ้อน
- chip radius 6–8px เพื่อให้ดูเป็น builder control ไม่เป็น tag
- control ทุกตัวอย่างน้อย 44×44px; builder ต้อง wrap ได้ที่ 320px

### 6. Focus, running และ disabled state

- select, input, Test, Reset, How-to, chip, table wrapper และ guess button ทุกตัวมี `:focus-visible`
- focus outline ใช้สีทึบอย่างน้อย 3px พร้อม `outline-offset: 2px`; ห้ามพึ่ง alpha shadow เพียงอย่างเดียว
- running state ต้องแสดงทั้งข้อความ `กำลัง Test...`, disabled controls และ progress
- disabled chip ใช้ `cursor: not-allowed` แทน `wait`; ความหมายการรอแสดงที่ Test/progress
- Reset ระหว่าง run ต้องยังดู enabled และหาเจอง่าย

### 7. Machine summary และ state path

- machine summary ใช้ technical grid background จางตามเดิม
- machine title และ rule เป็นลำดับแรก; state legend อยู่ถัดลงมา
- state badge ใช้ radius 6px ไม่ใช้ pill
- final state มี `F` marker, start มี `S`, current มี amber ring/label
- หาก state เป็นทั้ง final และ current ต้องมองเห็นทั้งสองสถานะพร้อมกัน
- state path เป็นแถว node/connector ที่ scroll แนวนอนภายใน ใช้ `scroll-snap-type: x proximity` ได้
- ห้ามใช้ opacity ต่ำกับ state ที่ไม่ active จนอ่านชื่อไม่ได้

### 8. Membership result และ progress

- membership pipeline ใน simulation ใช้ 4 ช่องที่เชื่อมด้วยลูกศรและลดเป็น stack บน mobile
- End state เป็น visual anchor ระหว่าง run; membership result เด่นที่สุดเมื่อจบ
- accepted ใช้ teal soft + ✓ + `accepted`; rejected ใช้ amber/orange soft + × + `rejected`
- progress track สูง 6–8px และข้อความ Step n/total เป็นข้อมูลหลัก
- epsilon ใช้สถานะ `0 transitions` ที่ชัด ไม่แสดง empty/loading style

### 9. Status strip และ table

- status strip ใช้ divider ภายใน surface เดียวแทน card ย่อย 3–4 ใบ
- path/string ยาวใช้ `overflow-wrap` หรือ scroll ภายในโดยไม่ดัน layout
- table header navy, latest row teal soft และ marker Current
- `.simulation-table-wrap:focus-visible` มี outline ชัด
- mobile table ใช้ `min-width` ประมาณ 560–600px และ scroll เฉพาะ wrapper
- เพิ่ม gradient hint ด้านขวาก่อนเลื่อน โดย `pointer-events: none`
- ใช้ `scrollbar-gutter: stable` เมื่อรองรับ

### 10. Guess activity

- desktop แสดง 3 cards, tablet 2 cards, mobile 1 card
- accepted/rejected examples แบ่งเป็นสองพื้นที่ด้วย label ชัด แต่ไม่เพิ่ม card ซ้อน
- buttons สูงอย่างน้อย 44px พร้อม hover, selected และ focus แยกกัน
- correct ใช้ teal + ✓; wrong ใช้ orange + ข้อความ `ลองใหม่ได้`
- formula ในปุ่มต้อง wrap โดยไม่ตัดข้อความ
- feedback มีความสูงตามเนื้อหา ไม่บังคับ `min-height` มากเกินไป

### 11. Dialog และ motion

- dialog กว้างไม่เกิน 560px สูงไม่เกิน `calc(100dvh - 32px)` และ scroll ภายใน
- ปุ่มปิด 44×44px พร้อม focus ring
- คง reduced-motion rule และขยายให้ครอบคลุม state path, badges, membership result และ motion ใหม่ทั้งหมด
- autoplay ยังใช้ `stepDelay` เดิม; smooth scroll ใช้ `auto` เมื่อ reduced motion
- ห้ามใช้ animation เพื่อซ่อนหรือเลื่อนผลสำคัญออกจากการอ่าน

## คำสั่งแก้ไข `scripts/languageChallenge.js` เฉพาะ UX/accessibility

อนุญาตเฉพาะรายการต่อไปนี้:

1. ตั้ง/ลบ `aria-invalid` ของ `#language-input` ตาม validation
2. ตั้ง/ลบ `aria-busy` ของ form และ simulation panel ใน `setRunning()`/cancel flow
3. focus `#language-results` เมื่อเริ่ม Test โดยคง reduced-motion behavior
4. เพิ่ม role, label, marker และ `aria-current` ให้ state badges ที่สร้างใน `renderMachineSummary()`/`highlightMachineState()`
5. render state path เป็น semantic ordered list โดยใช้ข้อมูล `result.path` เดิม
6. อัปเดต `#language-announcement` หนึ่งครั้งต่อ step และหนึ่งครั้งเมื่อจบ
7. sync progress ARIA และ epsilon state
8. สร้าง `<th scope="row">` สำหรับคอลัมน์ Step ใน `makeStepRow()`
9. เพิ่ม role/group, unique label, `aria-pressed` และ feedback live region เฉพาะ card ใน `renderGuessActivity()`
10. คืน focus ไปปุ่มเปิด dialog เมื่อ dialog ปิด

ห้าม refactor หรือแก้ `machines`, `guessItems`, `parseInput()`, `simulate()`, `stepDelay`, `activeRunId`, การ disable ระหว่าง run และ behavior ของ chip/Reset

## Design tokens ที่ให้ใช้

- Navy: `#09111f`, `#0f172a`, `#162033`
- Teal: `#0f766e`
- Teal hover: `#0b615b`
- Teal soft: `#ecfdf5`, `#f0fdfa`, `#ccfbf1`
- Amber/current: `#d97706`, `#f59e0b`
- Amber soft: `#fffbeb`
- Rejected/error: `#b91c1c`, `#c2410c`
- Rejected soft: `#fff7ed`
- Heading: `#0f172a`
- Body: `#475569`
- Muted: `#64748b`
- Border: `#d6e0eb` หรือ `var(--border-color)`
- Radius: 8px สำหรับ panel/card และ 6px สำหรับ control

ห้ามเพิ่มสีม่วง, neon gradient, glassmorphism หนัก, pill จำนวนมาก หรือเปลี่ยนหน้าให้เป็น dashboard สำเร็จรูป

## เกณฑ์ตรวจรับด้านระบบ

### Machine `{1}*`

- `epsilon` จบ `q0` และ accepted
- `1`, `11`, `111` จบ `q0` และ accepted
- `0`, `10`, `101` จบ `qd` และ rejected

### Machine `{1, 01}`

- `1` จบ `q2` และ accepted
- `01` จบ `q3` และ accepted
- `epsilon` จบ `q0` และ rejected
- `0` จบ `q1` และ rejected
- `11`, `001`, `010` จบ `qd` และ rejected

### Machine `{0}* U {0}*{10}{0,1}*`

- `epsilon`, `0`, `00` จบ `q0` และ accepted
- `10`, `010`, `001011` จบ `q2` และ accepted
- `1`, `01` จบ `q1` และ rejected
- `011`, `0011` จบ `qd` และ rejected

### Interaction

- ค่า `epsilon`, `ε` และข้อความว่างให้ symbols ว่างเหมือนกัน
- whitespace ใน binary string ถูกลบก่อน simulation
- symbol อื่นไม่เริ่ม run และแสดง validation error
- chip `0`/`1` ต่อท้าย, Remove ลบตัวท้าย, epsilon/Clear กลับเป็น `epsilon`
- เปลี่ยน machine ระหว่าง idle คง input แต่ล้าง result และ sync summary/final states
- ระหว่าง run machine/input/chips/Test ถูก disable แต่ Reset ยังคงใช้งานได้
- Reset ระหว่าง run ยกเลิก async loop โดยไม่มี row เก่าแสดงตามหลัง
- Reset กลับ machine `ones` และ input `epsilon`
- autoplay ใช้ delay เดิมและแสดง row/state/path ตามลำดับเดิม
- Guess activity ทั้ง 3 ชุดให้คำตอบเดิมและเลือกใหม่ได้
- dialog เปิด/ปิดครบทุกวิธีและคืน focus ไปปุ่มเปิด
- Previous/Next lesson และ sidebar ไป URL เดิม
- Console ไม่มี error ใหม่

## เกณฑ์ตรวจรับด้าน UX/UI

- ผู้ใช้เข้าใจความสัมพันธ์ `x`, end state, `F` และ `L(M)` ก่อนเริ่ม lab
- Definition → Lab → Guess activity → Key Idea มีลำดับการเรียนรู้ชัด
- ที่ 1440×900 control และ simulation อยู่ร่วมกันโดย state path/table ไม่ล้นหน้า
- ที่ 1024×768 และ 768×1024 panel เรียง control ก่อน simulation
- ที่ 390×844 และ 320px ไม่มี horizontal scroll ของทั้งหน้า; อนุญาตเฉพาะ pipeline/path/table region
- readonly input สื่อชัดว่าต้องใช้ chip และ epsilon มีความหมายชัด
- select, chips, Test, Reset, table region, guess buttons และ dialog ใช้ keyboard ได้พร้อม focus indicator
- touch target ทุก control บน mobile ไม่น้อยกว่า 44px
- start, final, current, accepted, rejected, selected, correct, wrong และ disabled แยกได้โดยไม่พึ่งสีอย่างเดียว
- screen reader ได้ยินข้อความหนึ่งครั้งต่อ step และผลสรุปหนึ่งครั้ง
- epsilon ถูกสื่อเป็น Step 0 ที่มีผล ไม่ใช่ simulation ที่หายหรือผิดพลาด
- machine summary และ state path มี list semantics; progress และตารางมี semantic ครบ
- Guess activity ประกาศเฉพาะ card ที่ตอบและระบุ selected ผ่าน `aria-pressed`
- reduced motion ไม่ทำให้ข้อมูลหรือ interaction หาย

## หมายเหตุสำหรับ AI ผู้แก้โค้ด

หน้า Language Recognition ใช้ async autoplay ที่ยกเลิกด้วย `activeRunId` และมี epsilon เป็นกรณี 0 transition ห้ามเปลี่ยนสองส่วนนี้ การปรับ state path หรือ announcement ต้องใช้ผลจาก `simulate()` เดิมเท่านั้น นอกจากนี้ `styles/challenge-sections.css` มี selector width ร่วมกับหน้า Recognition ให้แยกเฉพาะส่วนของ `#page-language-recognition` โดยไม่แก้ layout ของหน้าอื่น
