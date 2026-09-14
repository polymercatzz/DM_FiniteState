# UX/UI Implementation Plan: `recognition-fsm.html`

## เป้าหมาย

ปรับ Lesson 04 ให้เป็น **pattern-recognition lab** ที่ผู้เรียนเข้าใจลำดับ `Enter Bits → Predict → Trace → Decide` ได้ทันที โดยให้ input stream, state ปัจจุบัน, จุดที่พบ `111`, output stream และ last output bit เชื่อมโยงกันอย่างชัดเจน

คงแนวทางภาพเดิมของเว็บไซต์: technical academic, sidebar สี navy, พื้นเนื้อหาสว่าง, teal สำหรับสถานะหลัก/ผลสำเร็จ, amber สำหรับจุด trigger และ orange สำหรับคำตอบผิด

## แหล่งที่ใช้วิเคราะห์

- `recognition-fsm.html`
- `styles/base.css`
- `styles/sidebar.css`
- `styles/challenge-sections.css`
- `scripts/sidebar.js`
- `scripts/recognitionChallenge.js`

ห้ามอ่านหรืออ้างอิงไฟล์ในโฟลเดอร์ `content`

## ขอบเขตไฟล์ที่อนุญาตให้แก้

- แก้โครงสร้าง, semantic และ accessibility ใน `recognition-fsm.html`
- แก้เฉพาะ selector ที่ scope ด้วย `#page-recognition-fsm` ใน `styles/challenge-sections.css`
- แก้ `scripts/recognitionChallenge.js` ได้เฉพาะการ sync visual state, accessible state, focus management และ markup ที่ JavaScript สร้าง
- ห้ามแก้ `transitions`, `stateMeanings`, `sortStrings`, `simulate()`, วิธีตัดสินผลจาก last output bit, ลำดับ autoplay และค่า delay `650ms`/`250ms`
- ไม่แก้ `styles/base.css`, `styles/sidebar.css`, `scripts/sidebar.js` หรือหน้า HTML อื่น

## สัญญา DOM และระบบที่ห้ามเปลี่ยน

### ID ที่ JavaScript ใช้งาน

คง ID ต่อไปนี้แบบตรงตัว ห้ามลบ เปลี่ยนชื่อ หรือใช้ซ้ำ:

- `recognition-form`, `binary-string`, `binary-error`
- `recognition-feedback`, `final-bit`, `conclusion-output`, `result-verdict-icon`
- `input-bit-stream`, `output-bit-stream`, `trigger-note`, `recognition-body`
- `reset-recognition`, `remove-last-bit`, `clear-binary`
- `recognition-results`, `simulation-status`, `recognition-conclusion`
- `step-toolbar`, `previous-step`, `next-step`, `step-counter`, `step-progress-bar`
- `sort-list`
- `recognizer-how-to-dialog`, `recognizer-how-to-title`
- `open-recognizer-how-to`, `close-recognizer-how-to`

### Class และ data attribute ที่ JavaScript ใช้งาน

- คง `[data-bit]` และค่า `data-bit="0"`, `data-bit="1"`
- คง `[data-state-node]` และค่า `s0`, `s1`, `s2`, `s3`
- คง radio `name="recognition-prediction"` และค่า `recognized`, `not-recognized`
- คง class ที่ JavaScript เพิ่ม/ลบ: `.is-success`, `.is-running`, `.is-complete`, `.is-pending`, `.is-current`, `.is-trigger`, `.is-latest`, `.is-active`, `.is-found`, `.is-correct`, `.is-wrong`, `.is-selected`
- คง `.sort-card`, `.sort-card__actions`, `.bit-stream`, `.output-stream`, `.step-toolbar`, `.recognition-conclusion`

### พฤติกรรมที่ต้องคงเดิม

- ช่อง input ลบ whitespace ทั้งหมดก่อนตรวจ และยอมรับเฉพาะ `0` กับ `1`
- ช่องว่างอย่างเดียวถือเป็น input ว่าง; symbol อื่นต้องไม่เริ่ม simulation
- ปุ่ม `0`/`1` แทรกที่ตำแหน่ง caret หรือแทน selection เมื่อช่อง input มี focus
- ปุ่มลบล่าสุดลบอักขระท้ายสุด และ Clear ล้างทั้ง string
- Run บันทึก prediction ที่เลือก แล้วเริ่มเฉลยอัตโนมัติจาก Step 0
- output เป็น `1` เมื่อพบ `111`; หลังเข้าสู่ `s3` เครื่องคงอยู่ `s3` และ output เป็น `1` ต่อไป
- การตัดสิน recognized ใช้เฉพาะ last output bit
- ระหว่าง autoplay ผู้ใช้กด Previous/Next เพื่อหยุด autoplay และตรวจทีละ step ได้
- การแก้ input หลัง Run ยกเลิกผลและกลับสู่สถานะรอ
- Reset ยกเลิก timer ล้าง input และผลทั้งหมด แต่คงค่า prediction ที่เลือกตามพฤติกรรมเดิม
- dialog เปิดด้วย `showModal()` และปิดได้ด้วยปุ่ม ×, Escape และ backdrop
- Sort activity มี 5 string เดิม ผู้ใช้เลือกใหม่ได้ และแสดง output stream/last output bit ทุกครั้ง
- Previous ไป `working-fsm.html`; Next ไป `fsa.html`

## ปัญหาที่พบ

1. hero อธิบายกฎสำคัญได้ถูกต้อง แต่ไม่มี CTA หรือ visual summary ที่พาเข้าสู่ lab
2. ลำดับ Predict → Run → Inspect อยู่ในข้อความและ dialog มากกว่าการจัดวางบนหน้าจอ
3. control panel กับ simulation panel ถูกบังคับเป็นคอลัมน์เดียวจาก override ช่วงท้าย CSS ทำให้หน้าจอ desktop ใช้พื้นที่แนวนอนไม่เต็มประสิทธิภาพ
4. กฎสำคัญ “last output bit เท่านั้น” กระจายอยู่หลายตำแหน่ง แต่ยังไม่มี decision rule ที่สแกนเห็นได้ทันทีใกล้ผลลัพธ์
5. `#binary-error` ใช้ทั้ง error, สถานะกำลังเฉลย และข้อความสำเร็จ แต่กำหนด `role="alert"` พร้อม `aria-live="polite"`; semantic ไม่ตรงกับข้อมูลส่วนใหญ่
6. `#simulation-status`, `#trigger-note`, `#recognition-conclusion` และ `#binary-error` เป็น live region พร้อมกัน ทำให้ autoplay มีโอกาสประกาศซ้ำหลายข้อความต่อ step
7. state nodes แสดง active state ด้วยสีเป็นหลัก และ container ยังไม่มี list semantics
8. bit ปัจจุบันและกลุ่ม `111` ใช้สี/พื้นหลังเป็นหลัก โดยไม่มีข้อความหรือ accessible label ที่ระบุตำแหน่ง
9. progress bar เป็น visual-only และ `#step-counter` ไม่ได้ประกาศสถานะรวมผ่าน progress semantics
10. ตารางไม่มี caption, `scope="col"`, row header และชื่อสำหรับ scroll region
11. ตารางกว้างอย่างน้อย 700–760px บน mobile แต่ไม่มีคำบอกว่าเลื่อนแนวนอนได้ และ wrapper รับ keyboard focus ไม่ได้
12. ปุ่ม How-to 38px, Step 40px, ปิด dialog 34px และปุ่มใน Sort activity 36px เล็กกว่า touch target 44px
13. radio ถูกซ่อนด้วย `pointer-events: none`; แม้ label คลิกได้ แต่ยังไม่มี `:focus-visible` ที่ผูกกับ input อย่างชัดเจน
14. Sort activity ใส่ `aria-live` ไว้ที่ container ที่มีทั้ง card และปุ่มซึ่ง JavaScript สร้างใหม่ อาจประกาศเนื้อหาทั้งชุดเมื่อเริ่มหน้า
15. ปุ่มใน Sort activity ไม่มี `aria-pressed` จึงไม่สื่อคำตอบที่เลือกแก่ผู้ใช้ screen reader
16. dialog ไม่มีการคืน focus ไปปุ่มเปิดหลังปิด
17. CSS ของ Recognition มีทั้งกฎเริ่มต้นและ override ช่วงท้าย โดย `.recognition-lab` เปลี่ยนจากสองคอลัมน์เป็นหนึ่งคอลัมน์แบบถาวร ทำให้ source of truth ไม่ชัด
18. `styles/challenge-sections.css` ใช้ร่วมกับหน้า Language Recognition และ Designing FSA จึงเสี่ยงกระทบหน้าอื่นหากแก้ selector แบบ global

## คำสั่งแก้ไข `recognition-fsm.html`

### 1. เพิ่มทางเข้าสู่กิจกรรมใน hero

ภายใน `.recognition-hero` ให้คง kicker, `h1` และข้อความอธิบายเดิม จากนั้นเพิ่ม `.recognition-hero__actions`:

- ลิงก์หลัก `เริ่มทดสอบ Binary String` ไป `#recognition-lab`
- ลิงก์รอง `ดูกฎการตัดสิน` ไป `#recognition-key-idea`

เพิ่ม `id="recognition-lab"` ให้ `.recognition-lab` และเพิ่ม `id="recognition-key-idea"` ให้ `.recognition-reflection`

ใช้ native anchor เท่านั้น ไม่เพิ่ม JavaScript สำหรับ scroll

### 2. ทำ workflow ให้เห็นได้โดยไม่ต้องเปิด dialog

ภายในหัว `.recognition-panel--control` หลังคำอธิบาย เพิ่ม ordered list `.recognition-workflow`:

1. `Enter Bits` — สร้าง binary string
2. `Predict` — เลือก recognized หรือ not recognized
3. `Run & Trace` — ดู state และ output ทีละ bit

- ใช้เลข 01–03 และเส้นเชื่อมเป็น visual guide
- เป็นข้อความแสดงลำดับ ไม่ใช่ปุ่มหรือ progress ที่บันทึกสถานะ
- คง dialog วิธีเล่นสำหรับคำอธิบายละเอียด

### 3. จัด control form เป็นขั้นที่ชัดเจน

- เพิ่ม label ขั้น `01 Binary Input` เหนือช่อง input/keypad
- เพิ่ม label ขั้น `02 Prediction` เหนือ fieldset โดยคง `<legend>` และ radio เดิม
- เพิ่ม label ขั้น `03 Run & Trace` เหนือ `.form-actions`
- คงลำดับ DOM เป็น input → keypad → prediction → status → actions
- เพิ่มข้อความกำกับช่อง input แบบสั้น `ใช้เฉพาะ 0 และ 1; ระบบจะตัดช่องว่างออกก่อน Run` และเชื่อมกับ input ผ่าน `aria-describedby`
- `aria-describedby` ของ `#binary-string` ต้องอ้างทั้ง helper text และ `#binary-error`
- ห้ามเพิ่ม validation ที่จำกัดความยาว string หรือเปลี่ยนค่า prediction เริ่มต้น

### 4. แยก error ออกจากสถานะทั่วไป

- คง ID `#binary-error` แต่เปลี่ยนเป็น `role="status"`, `aria-live="polite"`, `aria-atomic="true"`
- เมื่อ input ว่างหรือมี symbol อื่น ให้ `recognitionChallenge.js` ตั้ง `aria-invalid="true"` ที่ `#binary-string`
- เมื่อ input ถูกต้อง, ผู้ใช้เริ่มแก้ค่า หรือกด Reset ให้ลบ `aria-invalid`
- error ต้องมี icon/text หรือ prefix ที่มองเห็นได้ ไม่พึ่งสีแดงอย่างเดียว
- ข้อความ `กำลังเฉลยผลทีละ step...` ให้ย้ายไปแสดงผ่าน `#simulation-status`; ไม่ใช้ `#binary-error` เป็น loading status

### 5. ลด live region ให้เหลือแหล่งประกาศหลักหนึ่งจุด

- นำ `aria-live` ออกจาก `#simulation-status`, `#trigger-note` และ `#recognition-conclusion`; ทั้งสามยังคงเป็นข้อความที่มองเห็นได้
- เพิ่ม visually hidden element `#recognition-announcement` ภายใน `#recognition-results` พร้อม `role="status"`, `aria-live="polite"`, `aria-atomic="true"`
- อัปเดตจุดนี้หนึ่งครั้งต่อ step ด้วยข้อความรูปแบบ:

`Step {n} จาก {total}: อ่าน {bit}, ย้ายจาก {current} ไป {next}, output {output}{ข้อความเมื่อพบ 111}`

- เมื่อจบให้ประกาศครั้งเดียวว่า prediction ถูกหรือผิด, output stream คืออะไร และ last output bit เท่าใด
- เมื่อผู้ใช้กด Previous/Next ให้ประกาศเฉพาะ step ที่ผู้ใช้เลือก
- `#binary-error` ประกาศเฉพาะ validation error; ห้ามประกาศข้อความ step ซ้ำ

### 6. ปรับ simulation heading และ decision rule

- คง heading `การทำงานของเครื่อง` และ `#simulation-status`
- เพิ่มข้อความสั้นใต้ heading ว่า `อ่านจากซ้ายไปขวา และหยุด autoplay ได้ด้วยปุ่มย้อนกลับ/ถัดไป`
- เพิ่ม decision rule ที่มองเห็นได้ใกล้ stream หรือก่อน conclusion:
  - `Last output bit = 1` → `Recognized`
  - `Last output bit = 0` → `Not recognized`
- decision rule เป็นข้อมูลอ้างอิง ไม่เป็น control และไม่แสดงผลล่วงหน้าของ string ปัจจุบัน
- ใช้ teal กับค่า 1 และ neutral/navy กับค่า 0; ห้ามใช้สีอย่างเดียวในการสื่อความหมาย

### 7. เพิ่ม semantics ให้ state strip

- กำหนด `role="list"` และชื่อที่ชัดเจนให้ `.state-machine-strip`
- กำหนด `role="listitem"` ให้ node `s0`–`s3`
- คง `<i aria-hidden="true">` เป็นเส้นเชื่อม
- เพิ่มข้อความ visually hidden ใน active node ว่า `สถานะปัจจุบัน`
- ให้ JavaScript อัปเดต `aria-current="step"` เฉพาะ node ที่ active และลบออกจาก node อื่น
- ห้ามเปลี่ยน transition หรือความหมายของ state

### 8. ทำ bit stream ให้อ่านสถานะได้ทั้งภาพและเสียง

- คง `#input-bit-stream` และ `#output-bit-stream`
- เพิ่มหัวลำดับที่ชัดเจนว่าแต่ละ cell แทนหนึ่ง step
- ใน `createBitStream()` เพิ่ม accessible label ให้แต่ละ bit เช่น `Input step 3: 1, current, เป็นส่วนของ 111 ที่พบ`
- pending bit ต้องถูกซ่อนจาก screen reader จนกว่าจะเปิดเผย หรือระบุว่า `ยังไม่เปิดเผย`; เลือกวิธีเดียวและใช้สม่ำเสมอ
- bit ที่เป็น trigger ต้องมี marker ที่ไม่พึ่งสี เช่นกรอบหนา/สัญลักษณ์/label `111 found`
- output bit ปัจจุบันต้องแยกจาก trigger bit ได้ชัด ไม่ใช้ style เดียวกัน
- ห้ามเปลี่ยนจำนวน bit หรือลำดับการ reveal

### 9. ปรับ step controls และ progress

- คงปุ่ม Previous/Next และเงื่อนไข disabled เดิม
- กำหนด `.step-progress` เป็น progress group ที่มี accessible name
- ใช้ native `<progress>` หรือใส่ `role="progressbar"` ให้ track พร้อมอัปเดต `aria-valuemin="0"`, `aria-valuemax`, `aria-valuenow` และ `aria-valuetext="Step n จาก total"`
- คง `#step-progress-bar` หาก JavaScript ยังใช้ปรับความกว้าง; หากเปลี่ยนเป็น `<progress>` ต้องแก้ JavaScript เฉพาะส่วน sync ค่า
- เพิ่มคำกำกับที่มองเห็นว่า `กดปุ่มเพื่อหยุด autoplay และตรวจเอง`
- ห้ามเพิ่ม Pause, Resume, Restart หรือเปลี่ยนการหยุด autoplay เมื่อกด Previous/Next

### 10. ปรับ simulation table

- เพิ่ม `<caption>` แบบ visually hidden ว่า `ตารางการทำงานของ FSM สำหรับตรวจ substring 111`
- เพิ่ม `scope="col"` ให้ `<th>` ทั้ง 6 ช่องใน `<thead>`
- ใน `renderTable()` สร้างคอลัมน์ Step เป็น `<th scope="row">` แทน `<td>`
- คง class `.is-trigger`, `.is-latest`, `.is-empty`
- เพิ่มข้อความ mobile-only ก่อนตารางว่า `เลื่อนตารางในแนวนอนเพื่อดูทุกคอลัมน์`
- กำหนด `.simulation-table-wrap` เป็น `tabindex="0"`, `role="region"`, `aria-label="ผล simulation เลื่อนได้ในแนวนอน"`
- latest row ต้องมี marker `Current` หรือข้อความที่ไม่พึ่งสี; trigger row ต้องมีข้อความ `พบ 111` ตามข้อมูลเดิม

### 11. ทำ conclusion ให้ตอบคำถามตามลำดับ

- คง `#recognition-conclusion` และข้อมูล Prediction, Output stream, Final output bit
- จัดลำดับสายตาเป็น:
  1. ผล prediction `Correct`/`Incorrect`
  2. final output bit ขนาดเด่น
  3. output stream เป็นหลักฐานประกอบ
- เพิ่มข้อความผลของเครื่อง `Recognized` หรือ `Not recognized` แยกจากผลการทาย เพื่อไม่ให้คำว่า Correct/Incorrect ถูกเข้าใจว่าเป็นสถานะของ string
- ให้ผลถูก/ผิดมี icon และข้อความครบ ไม่พึ่ง teal/orange
- ห้ามเปลี่ยน logic ที่เปรียบเทียบ prediction กับ `expectedPrediction`

### 12. ปรับ Sort activity ให้เป็นแบบฝึกหัดที่ accessible

- นำ `aria-live="polite"` ออกจาก `#sort-list`
- คง 5 string และคำตอบเดิมจาก `sortStrings`
- ใน `renderSortActivity()` กำหนดแต่ละ `.sort-card` เป็น `role="group"` และเชื่อมชื่อกับ string ผ่าน ID ที่ไม่ซ้ำ
- ปุ่ม Recognized/Not recognized ใช้ `aria-pressed="false"` เริ่มต้น และอัปเดตให้ตรงกับ `.is-selected`
- note ของแต่ละ card ใช้ `role="status"`, `aria-live="polite"`, `aria-atomic="true"` เพื่อประกาศเฉพาะคำตอบ card นั้น
- เพิ่มข้อความเหนือรายการว่า `เลือกใหม่ได้จนกว่าจะเข้าใจกฎ`
- เมื่อเลือกผิดต้องยังเลือกใหม่ได้ตามเดิม ห้าม disable ปุ่มหรือซ่อนเฉลย
- แสดง correct/wrong ด้วย icon หรือคำกำกับร่วมกับสี

### 13. ปรับ dialog วิธีเล่น

- คง native `<dialog>`, ID, ขั้นตอน 4 ข้อ และ legend เดิม
- เพิ่มข้อความใต้หัว dialog ว่า `ใช้เวลาประมาณ 1 นาที`
- ปุ่มปิดต้องมีพื้นที่กดอย่างน้อย 44×44px
- เพิ่ม event `close` เพื่อคืน focus ไป `#open-recognizer-how-to`
- คงการปิดด้วย Escape และ backdrop
- ห้ามสร้าง custom modal หรือ focus trap ใหม่แทน behavior ของ native dialog

### 14. ปรับ Key Idea และ lesson navigation

- คงตัวอย่าง `11011` และคำอธิบายเดิม
- เปลี่ยน `.state-meaning-list` เป็น semantic list (`<ul><li>`) หรือ description list (`<dl>`) โดยคงข้อความ state เดิมครบ
- เพิ่ม label สั้นเหนือ state list ว่า `State memory`
- เปลี่ยนข้อความ Previous เป็น `← กลับไป Working with FSM`
- เปลี่ยนข้อความ Next เป็น `เรียน Finite-State Automata →`
- คง URL เดิม

## คำสั่งแก้ไข `styles/challenge-sections.css`

### 1. จำกัดผลกระทบต่อหน้าอื่น

- แก้เฉพาะ section `Lesson 04: FSM Recognition`, `Lesson 04: guided recognizer flow` และ selector ที่ขึ้นต้นด้วย `#page-recognition-fsm`
- ห้ามแก้ selector ของ `#page-language-recognition` หรือ `#page-designing-fsa`
- แยก `#page-recognition-fsm .recognition-lab` และ `.sort-activity` ออกจากกลุ่ม Desktop width normalization ที่ใช้ร่วมหลายหน้า แล้วกำหนด source of truth ใน section Recognition เท่านั้น
- ห้ามเปลี่ยน shared component ที่ไม่มี scope ของ page ในรอบนี้

### 2. Content width และ page rhythm

- กำหนด `#page-recognition-fsm` เป็น `width: 100%`, `max-width: 1400px` และจัดกึ่งกลาง
- จำกัดข้อความ hero ประมาณ `68–74ch`
- `.recognition-lab`, `.sort-activity` และ `.recognition-reflection` ใช้ `width: 100%`, `max-width: 1240px` และจัดกึ่งกลาง
- ใช้ระยะหลัก 16, 24, 32 และ 48px ตามระบบ 8px
- ให้ lab เป็น surface หลัก; ไม่เปลี่ยนทุก section เป็น card

### 3. Hero และ workflow

- คง hero แบบ editorial พื้นโปร่งและเส้นด้านล่าง
- `.recognition-hero__actions` แสดง inline บน desktop และ stack ต่ำกว่า 480px
- CTA หลักใช้ teal, ลิงก์รองเป็น secondary/text action และมี min-height 44px
- `.recognition-workflow` ใช้ 3 คอลัมน์บน desktop และ 1 คอลัมน์ต่ำกว่า 700px
- ใช้เลขขั้นและเส้นเชื่อมแบบ technical diagram; ห้ามทำเป็น clickable stepper
- ลดแถบ accent บน control panel จาก teal–amber–blue ให้เหลือ teal → amber เพื่อให้ตรงกับภาษาภาพของหน้า

### 4. Layout ของ lab

- ที่ความกว้างตั้งแต่ 1120px จัด `.recognition-lab` เป็นสองคอลัมน์: control `minmax(320px, 0.72fr)` และ simulation `minmax(0, 1.28fr)`
- กำหนด `align-items: start`; control panel ใช้ `position: sticky` ได้เมื่อ viewport สูงพอ โดย `top` ต้องไม่ชน sidebar/header และต้องยกเลิก sticky ต่ำกว่า 1120px
- ต่ำกว่า 1120px เรียง control ก่อน simulation ตาม DOM
- ห้ามให้ state strip, table หรือ output stream ดันความกว้างของทั้งหน้า
- panel ใช้ border บางและเงาระดับเดียว ลด card ซ้อนภายใน

### 5. Form controls และ focus

- input สูงอย่างน้อย 48px ใช้ monospace/technical font ที่มีอยู่ และมี letter spacing พอแยก bit
- `:focus-visible` ของ input, radio segment, Run, Reset, How-to, bit chip และทุก step button ใช้ outline ทึบอย่างน้อย 3px พร้อม `outline-offset: 2px`
- radio segment ต้องแสดง focus บน `<span>` ผ่าน `input:focus-visible + span`
- control ทุกตัวบน mobile มี touch target อย่างน้อย 44×44px
- utility button `ลบล่าสุด` และ `Clear` ต้องไม่ถูกดันจนเกิด overflow ที่ 320px; wrap เป็นแถวใหม่ได้
- error state ใช้ border/icon/text ร่วมกับสี และต้องมี contrast ผ่าน
- disabled step button ต้องแยกจาก enabled ด้วยพื้น, border และ opacity โดยข้อความยังอ่านได้

### 6. State strip และ stream board

- state node ใช้เหลี่ยมมน 6–8px ไม่ใช้ pill
- active state ใช้พื้น teal, วงแหวน และ marker `Current`; state `s3` ที่พบแล้วใช้ teal/amber accent โดยมีข้อความกำกับ
- desktop คงทิศทาง `s0 → s1 → s2 → s3`
- mobile ไม่ควรซ่อน connector แล้วทำให้ลำดับกำกวม: ให้ strip scroll แนวนอนภายใน หรือเรียงแนวตั้งพร้อมลูกศรที่ยังมองเห็น
- bit cell มีขนาดอย่างน้อย 32px; current ใช้ blue-neutral outline ได้ แต่ trigger `111` ใช้ amber เพื่อแยกหน้าที่
- pending, current, trigger และ revealed ต้องต่างกันโดยไม่พึ่ง opacity/สีอย่างเดียว
- stream ยาวต้อง wrap หรือ scroll ภายใน container โดยไม่ทำให้หน้า overflow

### 7. Trigger note, progress และ conclusion

- `.trigger-note` ใช้ callout เส้นซ้าย; สถานะยังไม่พบเป็น neutral และพบแล้วเป็น amber/teal พร้อม icon/text
- step toolbar สูงอย่างน้อย 44px ต่อ control และ layout ไม่สลับลำดับ Previous/Progress/Next ระหว่าง breakpoint
- progress track สูง 6–8px และมี contrast ชัด แต่ข้อความ `Step n / total` เป็นข้อมูลหลัก
- conclusion ให้ final output bit เป็น visual anchor ใหญ่สุด และใช้ layout ที่ยังอ่านเป็น Prediction → Decision → Evidence
- ที่ mobile ให้ conclusion stack เป็นคอลัมน์เดียว ห้ามบีบ output stream หรือ final bit ใน grid 2 คอลัมน์

### 8. Table

- คง header navy, latest row เป็น teal soft และ trigger row เป็น amber soft
- เพิ่ม marker ที่อ่านได้ เช่น `Current` และ `111 found` โดยไม่ใช้สีอย่างเดียว
- `.simulation-table-wrap:focus-visible` มี outline ชัดเจน
- บน mobile table มี `min-width` ประมาณ 640–680px และ scroll เฉพาะใน region
- เพิ่ม gradient hint ด้านขวาก่อนผู้ใช้เลื่อน โดยต้อง `pointer-events: none` และไม่บังข้อความ
- ใช้ `scrollbar-gutter: stable` เมื่อรองรับ

### 9. Sort activity และ Key Idea

- desktop แสดง sort cards 3 คอลัมน์เพื่อให้ปุ่มและ feedback มีพื้นที่อ่าน; tablet 2 คอลัมน์; mobile 1 คอลัมน์
- ลด radius ของ card/control เหลือ 6–8px และใช้เส้นแบ่งแทนเงาหนัก
- ปุ่มคำตอบสูงอย่างน้อย 44px พร้อม hover, selected และ focus ที่แยกกันชัด
- correct ใช้ teal + ✓; wrong ใช้ orange + ข้อความ `ลองใหม่ได้`
- output stream ใน note ใช้ technical type และ `overflow-wrap: anywhere`
- state meaning ใช้ list/divider เรียบ ไม่ทำให้ดูเป็นปุ่ม

### 10. Dialog และ motion

- dialog กว้างไม่เกิน 520px สูงไม่เกิน `calc(100dvh - 32px)` และ scroll ภายใน
- ปุ่มปิด 44×44px พร้อม focus ring
- animation ของ row/bit/progress ใช้ 160–280ms และไม่เพิ่ม motion ตกแต่งที่ไม่ช่วยการเรียนรู้
- คง reduced-motion rule และขยายให้ครอบคลุม transition/animation ใหม่ทั้งหมดภายใต้ `#page-recognition-fsm`
- เมื่อ reduced motion เปิด การ scroll ไป results ต้องใช้ `behavior: "auto"`; ห้ามเปลี่ยนระยะเวลา autoplay เดิม

## คำสั่งแก้ไข `scripts/recognitionChallenge.js` เฉพาะ UX/accessibility

อนุญาตเฉพาะรายการต่อไปนี้:

1. ตั้ง/ลบ `aria-invalid` ของ `#binary-string` ตาม validation
2. ย้ายสถานะกำลัง run ออกจาก `#binary-error` ไป `#simulation-status`
3. อัปเดต `#recognition-announcement` ครั้งเดียวต่อ step และครั้งเดียวเมื่อจบ
4. อัปเดต `aria-current="step"` และ accessible label ของ state node
5. เพิ่ม accessible state ให้ bit ที่สร้างใน `createBitStream()` โดยไม่เปลี่ยนจำนวนหรือลำดับ node
6. สร้าง `<th scope="row">` สำหรับคอลัมน์ Step ใน `renderTable()`
7. sync `aria-valuemax`, `aria-valuenow` และ `aria-valuetext` ของ progress
8. เพิ่ม `role="group"`, label, `aria-pressed` และ live note เฉพาะ card ใน `renderSortActivity()`
9. คืน focus ไปปุ่มเปิด dialog ผ่าน event `close`
10. เลือก smooth/auto scroll ตาม `prefers-reduced-motion`

ห้าม refactor หรือแก้ `transitions`, `sortStrings`, `simulate()`, `scheduleNextStep()`, การคำนวณ `firstTriggerStep`, การตัดสินจาก final bit, การเลือก prediction และเงื่อนไข Run/Reset

## Design tokens ที่ให้ใช้

- Navy: `#09111f`, `#0f172a`, `#162033`
- Teal: `#0f766e`
- Teal hover: `#0b615b`
- Teal soft: `#ecfdf5`, `#f0fdfa`
- Amber trigger: `#d97706`, `#f59e0b`
- Amber soft: `#fffbeb`
- Wrong/error: `#c2410c`
- Wrong soft: `#fff7ed`
- Current step blue: `#1d4ed8`
- Current step soft: `#dbeafe`
- Heading: `#0f172a`
- Body: `#475569`
- Muted: `#64748b`
- Border: `#d6e0eb` หรือ `var(--border-color)`
- Radius: 8px สำหรับ panel/card และ 6px สำหรับ control

ห้ามเพิ่มสีม่วง, neon gradient, glassmorphism หนัก, pill จำนวนมาก หรือเปลี่ยนหน้าให้เป็น dashboard สำเร็จรูป

## เกณฑ์ตรวจรับด้านระบบ

- `111` ให้ state `s0 → s1 → s2 → s3`, output `001`, final bit `1`, recognized
- `01110` ให้ output `00011`, final bit `1`, recognized
- `11011` ให้ output `00000`, final bit `0`, not recognized
- `101010` ให้ output `000000`, final bit `0`, not recognized
- `111000` ให้ output `001111`, final bit `1`, recognized และคงอยู่ `s3` หลังพบแล้ว
- input ที่มี whitespace เช่น `1 1 1` ถูก normalize เป็น `111` และให้ผลเดิม
- input ว่างหรือมี symbol อื่นไม่เริ่ม simulation, แสดง error และ focus กลับช่อง input
- ปุ่ม bit แทรกที่ caret/แทน selection และปุ่มลบ/Clear ทำงานเหมือนเดิม
- Run เปิด Step 0 แล้ว autoplay ทีละ step ด้วย delay เดิม; reduced motion ยังใช้ delay เดิมของระบบ
- Previous/Next หยุด autoplay และไม่เดินเกิน Step 0/Step สุดท้าย
- การแก้ input หรือ Reset ระหว่าง autoplay ยกเลิก timer และไม่มี step เก่าแสดงภายหลัง
- result เปรียบเทียบ prediction ถูกต้อง และตัดสิน recognized จาก last output bit เท่านั้น
- Sort activity ทั้ง 5 ข้อให้ expected result เดิม เลือกใหม่ได้ และไม่ disable หลังตอบ
- dialog เปิด/ปิดครบทุกวิธีและคืน focus ไปปุ่มเปิด
- Previous/Next lesson และ sidebar ไป URL เดิม
- Console ไม่มี error ใหม่

## เกณฑ์ตรวจรับด้าน UX/UI

- ผู้ใช้เห็นลำดับ Enter Bits → Predict → Run & Trace โดยไม่ต้องเปิด dialog
- ที่ 1440×900 control และ simulation อยู่ร่วมกันโดย simulation ไม่ถูกบีบจน table/stream ล้นหน้า
- ที่ 1024×768 และ 768×1024 panel เรียง control ก่อน simulation และข้อมูลยังอ่านตามลำดับ
- ที่ 390×844 และ 320px ไม่มี horizontal scroll ของทั้งหน้า; อนุญาตเฉพาะ state strip/table region
- input, radio, keypad, actions, step controls, sort buttons และ dialog ใช้ Tab/Enter/Space ได้ตามชนิดและมี focus indicator
- touch target ทุก control บน mobile ไม่น้อยกว่า 44px
- idle, running, complete, current, pending, trigger, correct, wrong และ disabled แยกได้โดยไม่พึ่งสีอย่างเดียว
- screen reader ได้ยินผล simulation หนึ่งข้อความต่อ step และผลสรุปหนึ่งครั้ง โดยไม่ถูก live region อื่นประกาศซ้ำ
- state strip มีลำดับ semantic, progress มีค่าปัจจุบัน และ table มี caption/column header/row header
- Sort activity ประกาศเฉพาะ card ที่ตอบและบอกสถานะ selected ผ่าน `aria-pressed`
- decision rule และ final output bit เป็นจุดเด่น แต่ไม่เปิดเผยผลก่อน simulation จบ
- reduced motion ไม่กระทบการมองเห็นข้อมูลหรือการทำงานของ step controls

## หมายเหตุสำหรับ AI ผู้แก้โค้ด

`styles/challenge-sections.css` มี CSS ของ Recognition สองช่วงและมี selector รวมกับหน้าอื่น ให้รวม source of truth เฉพาะ `#page-recognition-fsm` ก่อนปรับ layout และตรวจ diff ว่าไม่มี selector ของ Language Recognition หรือ Designing FSA เปลี่ยนแปลง ใช้ test strings ในเกณฑ์ตรวจรับเป็น baseline ก่อนและหลังแก้ JavaScript
