# UX/UI Implementation Plan: `fsm-output.html`

## เป้าหมาย

ปรับ Lesson 02 ให้เป็น **interactive teaching lab** ที่ผู้เรียนเห็นความสัมพันธ์ `Input → Transition → Output` ได้ทันที โดยคงบุคลิกเดิมของเว็บไซต์: technical academic, sidebar สี navy, เนื้อหาพื้นสว่าง, teal เป็นสีหลัก และ amber ใช้เน้นเหตุการณ์สำคัญ

จุดจดจำของหน้านี้ต้องเป็นตู้ SNACK STATION ที่ทำงานร่วมกับ live transition panel อย่างเป็นระบบ ไม่ใช่ตู้จำลองและตารางที่แยกกันเป็นคนละส่วน

## แหล่งที่ใช้วิเคราะห์

- `fsm-output.html`
- `styles/base.css`
- `styles/sidebar.css`
- `styles/pages/fsm-output.css`
- `scripts/sidebar.js`
- `scripts/vendingMachine.js`

ห้ามอ่านหรืออ้างอิงไฟล์ในโฟลเดอร์ `content`

## ขอบเขตไฟล์ที่อนุญาตให้แก้

- แก้โครงสร้างและ accessibility ใน `fsm-output.html`
- แก้สไตล์ใน `styles/pages/fsm-output.css`
- แก้ `scripts/vendingMachine.js` ได้เฉพาะการประกาศผลสำหรับ screen reader และการคืน focus หลังปิด dialog
- ไม่แก้กฎ FSM, ค่า state, output, transition history หรือพฤติกรรมของ simulator
- ไม่แก้ `styles/base.css`, `styles/sidebar.css`, `scripts/sidebar.js` หรือหน้า HTML อื่น

## สัญญา DOM และระบบที่ห้ามเปลี่ยน

### ID ที่ JavaScript ใช้งาน

คง ID ต่อไปนี้แบบตรงตัว ห้ามเปลี่ยนชื่อ ห้ามลบ และห้ามใช้ซ้ำ:

- `machine-prompt`, `balance-display`, `state-display`, `coin-slot`
- `dispensed-product`, `btn-reset`
- `transition-pulse`, `transition-input`, `transition-from`, `transition-rule`, `transition-to`
- `transition-previous-label`, `transition-previous-meaning`
- `transition-current-label`, `transition-current-meaning`
- `transition-output-symbol`, `transition-output-separator`, `transition-output`
- `transition-history`, `transition-table`
- `node-s0`, `node-s1`, `node-s2`, `node-s3`, `node-s4`
- `row-s0`, `row-s1`, `row-s2`, `row-s3`, `row-s4`
- `open-tips`, `close-tips`, `play-tips-dialog`, `play-tips-title`

### Class และ data attribute ที่ JavaScript ใช้งาน

- คง `.machine-display`, `.coin-btn`, `.action-btn`, `.state-node`, `.state-table`, `.live-transition` และ `.dispensed-product`
- คง `data-input` ของปุ่มและ cell ทุกค่า: `5`, `10`, `O`, `R`
- คง `data-product` ของสินค้า
- คงการใช้ `data-current-state` และ `data-current-value` บน `.machine-display`
- รองรับ class ที่ JavaScript เพิ่ม/ลบ: `.active`, `.row-active`, `.last-transition`, `.is-updating`, `.is-coin`, `.is-action`, `.is-output`, `.is-reset`, `.is-dispensing`, `.product-o`, `.product-r`, `.flying-coin--5`, `.flying-coin--10`

### พฤติกรรมที่ต้องคงเดิม

- รับเหรียญ 5 และ 10 บาทตามกฎเดิม
- ปุ่มสินค้า `O` และ `R` ต้องกดได้แม้เงินยังไม่ครบ เพื่อให้ระบบตอบว่าแนะนำให้หยอดเหรียญ ห้ามใส่ `disabled`
- เมื่อ state เป็น `s4` การเลือกสินค้าต้องกลับไป `s0` และแสดงสินค้าที่จ่าย
- Reset ต้องกลับ `s0`, ล้าง highlight transition เดิม และเพิ่มรายการ Reset ใน history ตามเดิม
- history แสดงล่าสุดไม่เกิน 3 รายการ
- ปุ่มวิธีเล่นต้องเปิด native dialog และปิดได้จากปุ่ม ×, Escape และการคลิก backdrop
- ลิงก์ Previous ไป `introduction.html`; Next ไป `working-fsm.html`

## ปัญหาที่พบ

1. หน้าเริ่มด้วยเนื้อหา 3 section ก่อนถึง simulator ทำให้กิจกรรมหลักอยู่ลึกและไม่มีทางลัดจาก hero
2. simulator มีหลายส่วนที่เด่นพร้อมกัน ได้แก่เครื่อง, live transition, diagram และ table จึงยังไม่มีลำดับสายตาชัดว่าให้กดตรงไหนแล้วดูผลตรงไหน
3. คำอธิบาย `หากหยอดเกิน 21 บาทขึ้นไป` ไม่สอดคล้องกับ logic ซึ่งทำงานเป็นยอดเกิน 20 บาทและทอนส่วนเกิน
4. ปุ่มสินค้าเมื่อยังไม่ถึง `s4` ถูกลด saturation จนดูเหมือน disabled แต่ระบบยังตั้งใจให้กดได้
5. `.output-box` และ `.live-transition` ต่างใช้ `aria-live="polite"` จึงมีโอกาสประกาศข้อมูลซ้ำหรือประกาศหลายส่วนพร้อมกัน
6. ปุ่ม Reset 30px, ปุ่มสินค้า 32–36px, ปุ่ม Tips 34px บน mobile และปุ่มปิด dialog 32px มีพื้นที่กดเล็ก
7. state diagram และ transition table ใช้ตัวอักษรขนาดเล็กมาก โดยเฉพาะ label ใน SVG และตารางบนจอแคบ
8. ตารางหลักเลื่อนได้แนวนอนบน mobile แต่ไม่มีคำบอกหรือชื่อ region สำหรับผู้ใช้ keyboard/screen reader
9. ปุ่มและลิงก์ภายใน lab มี hover/active หลายแบบ แต่ไม่มีระบบ `:focus-visible` ที่ครอบคลุมทุก control
10. `styles/pages/fsm-output.css` มีประมาณ 2,891 บรรทัดและประกาศ selector เดิมซ้ำหลายช่วง ทำให้ผลลัพธ์จริงขึ้นกับ override ท้ายไฟล์
11. stylesheet มี selector ที่ไม่มีใน HTML และไม่ได้ถูกสร้างโดย JavaScript เช่น `.fsm-hero__visual`, `.hero-state-chain`, `.hero-console`, `.summary-card*`, `.play-tips*`, `.current-state-badge`, `.state-value-legend`, `.diagram-eyebrow`, `.learning-tree`, `.tree-node--lesson` และ `.meta-chips`
12. มีการกำหนด `font-family: Inter` หลายจุด แต่หน้าไม่ได้โหลด Inter ทำให้ typography จริงขึ้นกับ generic fallback และไม่ต่อเนื่องกับหน้าอื่น
13. media query หลายชุดกำหนด breakpoint 520, 560, 640, 860, 900 และ 1120px ซ้ำซ้อน ทำให้แก้ responsive ต่อได้ยาก

## คำสั่งแก้ไข `fsm-output.html`

### 1. เพิ่มทางลัดจาก hero ไปกิจกรรม

ภายใน `.fsm-hero__copy` ให้คง kicker, `h1` และข้อความเดิม จากนั้นเพิ่ม `.fsm-hero__actions`:

- ลิงก์หลัก `เริ่มทดลองกับตู้ขายขนม` ไป `#vending-lab`
- ลิงก์รอง `อ่านพื้นฐานก่อน` ไป `#fsm-definition`

เพิ่ม `id="fsm-definition"` ให้ section Definition และเพิ่ม `id="vending-lab"` ให้ `.interactive-grid`

ลิงก์หลักใช้รูปแบบปุ่ม teal ส่วนลิงก์รองเป็น text link ห้ามเพิ่ม JavaScript สำหรับ scroll

### 2. ทำบทนำให้สแกนง่ายโดยไม่เปลี่ยนเนื้อหา

- คงลำดับ Definition → Components → Vending Machine Model
- จัด Definition และ formula ให้อยู่ใน section เดียวกันตามเดิม
- เปลี่ยน `.component-grid` เป็น semantic `<dl>` โดยแต่ละรายการใช้ `<div><dt>…</dt><dd>…</dd></div>` และคงข้อความครบทั้ง 6 รายการ
- เปลี่ยน `.state-stack` เป็น `<ol>` หรือ `<dl>` ที่สื่อ state `s0–s4` ตามลำดับจริง
- เพิ่มข้อความกำกับสั้นเหนือ state list ว่า `ยอดเงินสะสมที่แต่ละ state จดจำ`
- ห้ามเพิ่ม card เงาหนักให้ทุก component

### 3. ปรับหัว simulator ให้บอกเงื่อนไขอย่างแม่นยำ

คงหัวข้อ `Vending Machine Simulator` และปุ่ม `#open-tips`

แก้ข้อความเงื่อนไขเป็น:

`สินค้าราคา 20 บาท รับเหรียญ 5 และ 10 บาท หากยอดเกิน 20 บาท ระบบจะทอนส่วนเกินทันที`

ใต้ข้อความเพิ่ม `.lab-sequence` เป็น list สั้น 3 ขั้น:

1. เลือก Input
2. ดู State Transition
3. ตรวจ Output

ใช้ตัวเลขและเส้นเชื่อมเป็น visual guide ไม่ทำเป็น progress ที่บันทึกสถานะ

### 4. รักษาตู้ขายสินค้าเป็น interaction หลัก

- คงโครง `.vending-machine` และ control เดิมทั้งหมด
- เพิ่มข้อความช่วยใกล้ปุ่มสินค้า: `กดเลือกได้ทุกเวลา หากเงินยังไม่ครบเครื่องจะแนะนำให้หยอดเหรียญ`
- ข้อความช่วยต้องเชื่อมกับปุ่ม `O/R` ด้วย `aria-describedby`
- ห้ามทำปุ่มสินค้า disabled ก่อนถึง `s4`
- เมื่อ `.machine-display[data-current-state="s4"]` ให้ใช้ style เน้นปุ่มสินค้าและสถานะ SELECT ITEM ชัดขึ้น แต่ไม่เพิ่ม logic ใหม่
- ปุ่ม Reset ต้องคงอยู่ใน machine crown และคง `aria-label`/`title`

### 5. จัด live transition เป็นแผงสังเกตผล

คงข้อมูล Previous State, Input, Current State, Output และ Recent Transitions ครบทั้งหมด

- เพิ่ม eyebrow `OBSERVE` เหนือหัวข้อ `State Transition`
- จัดลำดับภาพให้ transition notation เด่นที่สุด ตามด้วย Output และ detail/history
- เพิ่มข้อความเริ่มต้นสั้นว่า `กดเหรียญหรือปุ่มสินค้าเพื่อดูการเปลี่ยน state`
- คงลิงก์ไป `#transition-table`

### 6. แก้ live announcement ให้ไม่ซ้ำ

- นำ `aria-live` ออกจาก `.output-box` และ container `.live-transition`
- เพิ่ม element แบบ visually hidden ชื่อ `#transition-announcement` พร้อม `role="status"`, `aria-live="polite"`, `aria-atomic="true"`
- ใน `scripts/vendingMachine.js` อัปเดต element นี้ครั้งเดียวต่อ action ด้วยข้อความรูปแบบ:

`Input {input}: จาก {previous state} ไป {current state}; Output {output}`

- การเปลี่ยนนี้มีไว้เพื่อ accessibility เท่านั้น ห้ามเปลี่ยน FSM rule หรือข้อความที่มองเห็น

### 7. ปรับ dialog วิธีเล่น

- คง `<dialog>`, ID และรายการ 4 ขั้นเดิม
- เพิ่มข้อความนำหนึ่งบรรทัดใต้หัวข้อว่า `ใช้เวลาประมาณ 1 นาที`
- ตรวจให้ heading hierarchy ภายใน dialog ถูกต้อง โดยหัว dialog ไม่ข้ามระดับโดยไม่จำเป็น
- หลัง dialog ปิด ให้คืน focus ไป `#open-tips` ผ่าน event `close` ใน `vendingMachine.js`
- ห้ามเขียน custom modal แทน native dialog

### 8. ปรับ State Diagram และ Transition Table

- เพิ่ม `<title>` ภายใน `#fsm-svg` และกำหนด `role="img"`; คง ID ของ node/transition ทุกตัว
- เพิ่มคำอธิบายใต้หัว card ว่า diagram แสดง current state ส่วน table แสดง rule ทั้งหมด
- เพิ่ม `<caption>` ให้ `.state-table` โดยใช้ visually hidden style
- เพิ่ม `scope="col"` ให้ column headers และ `scope="row"` ให้ cell state แรกของแต่ละแถว โดยเปลี่ยน cell แรกจาก `<td>` เป็น `<th>` ได้แต่ต้องคง `row-s0–row-s4`
- คง `data-input` ทุก cell เพราะ JavaScript ใช้ highlight transition
- เพิ่มข้อความ mobile-only เหนือตารางว่า `เลื่อนตารางในแนวนอนเพื่อดู Input ทั้งหมด`
- ให้ `.table-container` มี `tabindex="0"`, `role="region"` และ `aria-label="ตาราง State Transition เลื่อนได้ในแนวนอน"`

### 9. Reflection และ navigation

- คง Reading the Table และคำถาม Check Yourself ทั้ง 3 ข้อ
- จัด Check Yourself เป็นพื้นที่พื้น amber จางแบบ worksheet โดยไม่ทำให้ดูคลิกได้
- เปลี่ยนข้อความ Previous เป็น `← กลับไป Introduction`
- เปลี่ยนข้อความ Next เป็น `เรียน Working with FSM →`
- คง URL เดิมทั้งสองลิงก์

## คำสั่งแก้ไข `styles/pages/fsm-output.css`

### 1. จัดระเบียบ CSS ก่อนปรับภาพ

- รวม selector ที่ประกาศซ้ำให้เหลือ source of truth ชุดเดียว โดยรักษาค่าที่มีผลจริงจากกฎท้ายไฟล์ก่อนเริ่ม redesign
- ลบ selector ที่ยืนยันแล้วว่าไม่มีใน HTML และ JavaScript ตามรายการปัญหาข้อ 11
- ห้ามลบ selector ของ class ที่ JavaScript เพิ่มขณะ runtime ตาม DOM contract ด้านบน
- scope selector เฉพาะหน้าด้วย `#page-fsm-output` เมื่อเป็นไปได้
- รวม breakpoint หลักเป็น `1120px`, `860px`, `640px` และ `420px`; ใช้ breakpoint เพิ่มเฉพาะเมื่อมีเหตุผลด้าน layout ชัดเจน
- เปลี่ยน `Inter` เป็น `Bai Jamjuree` สำหรับ state, code, number และ label ภาษาอังกฤษ; ใช้ `Sarabun` สำหรับคำอธิบายภาษาไทย

### 2. Hero และบทนำ

- คง hero แบบ editorial พื้นโปร่งและเส้นคั่นด้านล่างตามกฎท้ายไฟล์ ไม่ย้อนกลับไปใช้ hero card/visual ที่ถูกซ่อนอยู่
- จำกัดเนื้อหาหน้าไว้ที่ `max-width: 1400px` และจัดกึ่งกลาง
- `.fsm-hero__actions` แสดง inline บน desktop และ stack เฉพาะต่ำกว่า 480px
- ปุ่ม anchor มี min-height 44px และ `:focus-visible` ชัดเจน
- `.fsm-lesson` ใช้ grid สองคอลัมน์บนจอกว้าง: Definition และ Components อยู่แถวแรก ส่วน Vending Machine Model กว้างเต็มแถว
- ต่ำกว่า 860px ใช้หนึ่งคอลัมน์ตามลำดับ DOM

### 3. Lab card และ visual hierarchy

- ให้ `.simulator-card` เป็น surface หลักที่มี border บางและแถบ accent ด้านบน teal-to-amber ตามภาษาภาพเดิม
- ลดเงาปกติให้อยู่ประมาณ `0 14px 34px rgba(15,23,42,.075)`; ไม่ซ้อนเงาหนักหลายชั้น
- `.lab-sequence` ใช้ 3 คอลัมน์บน desktop และ 1 แถวที่ wrap ได้บน mobile
- รักษา radius 8px ของ card และ 6px ของ control

### 4. Simulator layout

- ที่ความกว้างมากกว่า 1100px ใช้สองคอลัมน์: ตู้ `minmax(360px, 500px)` และ live panel `minmax(320px, 1fr)`
- ใช้ `align-items: start` แทน center เพื่อให้หัว machine และ transition panel เริ่มระดับใกล้กัน
- `.live-transition` ใช้ `position: sticky; top: 24px` เฉพาะ desktop และต้องยกเลิก sticky ที่ต่ำกว่า 1100px
- ต่ำกว่า 860px เรียง machine ก่อน live panel
- ที่ 320px ตู้ต้องกว้างไม่เกิน container และไม่มีส่วนใดดัน viewport ให้เกิด horizontal scroll

### 5. Controls และสถานะ

- ปุ่ม coin, product, reset, tips และ close dialog ต้องมี touch target อย่างน้อย 44×44px บน mobile
- เพิ่ม `:focus-visible` ให้ `.coin-btn`, `.product-select`, `.reset-btn`, `.tips-trigger`, `.tips-dialog__close`, `.view-table-link` และ lesson navigation
- ใช้ outline 3px ที่ตัดกับพื้นหลังและ `outline-offset: 2–3px`; ห้ามใช้เพียง box-shadow สีอ่อน
- เมื่อยังไม่ถึง `s4` ลด saturation ของปุ่มสินค้าเพียงเล็กน้อยและคง cursor pointer เพื่อไม่สื่อว่า disabled
- เมื่อถึง `s4` เน้นกรอบปุ่มสินค้าและ status light พร้อมกัน แต่ไม่ใช้ animation กระพริบถี่
- คง orange สำหรับสินค้า O และ red สำหรับสินค้า R เพราะเป็นส่วนหนึ่งของการจับคู่ input

### 6. Live transition panel

- ใช้ transition notation เป็นองค์ประกอบเด่นที่สุด โดย state ใช้ Bai Jamjuree น้ำหนัก 700 และ output ใช้ amber accent
- เพิ่มพื้นหลัง `#f8fafc` จาง ๆ เฉพาะกลุ่ม detail ไม่ทำทุกช่องเป็น card
- เพิ่มขนาด label ที่ต่ำกว่า `0.7rem` ให้ไม่น้อยกว่า `0.72rem` เมื่อแสดงเป็นข้อความสำคัญ
- history table ใช้ขนาดอย่างน้อย `0.75rem` และต้องไม่บีบข้อความจนอ่านไม่ได้
- highlight ล่าสุดใช้ teal สำหรับ current state และ amber สำหรับ transition cell ตามเดิม

### 7. Diagram และ table

- ให้ diagram เป็น overview สั้นและ table เป็นข้อมูลหลัก แต่เพิ่มขนาด label ใน SVG ให้เทียบเท่าอย่างน้อย 11–12px หลัง render
- คง state ปกติเป็นขาว/เส้น slate และ active state เป็น teal
- ใช้ amber สำหรับ transition pulse และ last-transition เท่านั้น
- `.table-container` ต้องแสดง focus ring เมื่อได้รับ focus
- บน mobile อนุญาตให้ table มี `min-width` และ scroll แนวนอน แต่ต้องมี gradient hint ด้านขวาก่อนผู้ใช้เลื่อน และซ่อน hint หลัง focus/interactionได้ด้วย CSS เท่าที่ทำได้
- ใช้ `scrollbar-gutter: stable` เมื่อ browser รองรับ

### 8. Dialog

- dialog กว้างไม่เกิน 460px และสูงไม่เกิน `min(680px, calc(100dvh - 32px))`
- หากเนื้อหาสูงเกิน viewport ให้ scroll ภายใน dialog ไม่ใช่ body ด้านหลัง
- ปุ่มปิดต้องมีพื้นที่กด 44px และ focus ring ชัดเจน
- backdrop ใช้ navy โปร่งประมาณ 58%; blur ไม่เกิน 2px

### 9. Motion

- คง animation ที่สื่อเหตุการณ์: coin-to-slot, product dispense, state transition และ output feedback
- ลด animation ที่ซ้ำกันใน action เดียว ไม่ให้ machine, panel, row และ output กระพริบแรงพร้อมกัน
- motion หลักต่อ action ไม่เกิน 600ms ยกเว้น product dispense ซึ่งคงได้ไม่เกิน 1100ms
- เปลี่ยน `@media (prefers-reduced-motion: reduce)` จาก global `*` เป็น selector ที่ scope ภายใต้ `#page-fsm-output` รวมทั้ง `.flying-coin`
- ใน reduced motion ต้องยังเห็น state, output และ table highlight ล่าสุดครบ แม้ไม่มี animation

## Design tokens ที่ให้ใช้

- Navy: `#09111f`, `#0f172a`, `#162033`
- Teal: `#0f766e`
- Teal hover: `#0b615b`
- Teal soft: `#f0fdfa`
- Amber: `#f59e0b`
- Amber soft: `#fffbeb`
- Orange product: คงสีของ `.product-select--orange`
- Red product: คงสีของ `.product-select--red`
- Heading: `#0f172a`
- Body text: `#475569`
- Muted: `#64748b`
- Border: `#d6e0eb` หรือ `var(--border-color)`
- Radius: 8px สำหรับ card, 6px สำหรับ control

ห้ามเพิ่มสีม่วง, neon gradient, glassmorphism หนัก หรือเปลี่ยนตู้ขายสินค้าเป็น card dashboard ทั่วไป

## เกณฑ์ตรวจรับด้านระบบ

- ทดสอบลำดับ `10 → 10 → O`: state ไป `s2 → s4 → s0` และจ่ายคอร์เน่
- ทดสอบลำดับ `5 → 5 → 5 → 10`: state ไปถึง `s4` และ output ทอน 5 บาท
- กด `R` ก่อนเงินครบแล้วระบบยังตอบแนะนำให้หยอดเหรียญ
- ที่ `s4` กดเหรียญ 5 หรือ 10 แล้วยังอยู่ `s4` และคืนเหรียญตามเดิม
- Reset จากทุก state กลับ `s0` และค่าหน้าจอเป็น 0 บาท
- diagram, active table row, last transition cell, live panel และ output box แสดงข้อมูลตรงกันทุก action
- transition history เก็บล่าสุดไม่เกิน 3 รายการ
- dialog เปิด/ปิดได้ครบและ focus กลับสู่ปุ่มวิธีเล่น
- Previous/Next และ sidebar navigation ไป URL เดิม
- Console ไม่มี error ใหม่

## เกณฑ์ตรวจรับด้าน UX/UI

- ที่ 1440×900 เห็น machine และ live transition panel พร้อมกัน และสายตาไล่ Input → Transition → Output ได้ชัด
- ที่ 1024×768 layout ไม่ชน sidebar และ live panel ไม่ถูกบีบจน label ล้น
- ที่ 768×1024, 390×844 และ 320px ไม่มี horizontal scroll ของทั้งหน้า; อนุญาตเฉพาะ scroll ภายใน diagram/table region
- control หลักทุกตัวใช้งานด้วย Tab/Enter/Space ได้และมี focus indicator
- touch target บน mobile ไม่น้อยกว่า 44px
- ปุ่มสินค้าไม่ดูเป็น disabled ขณะที่ยังกดได้
- screen reader ได้ยินผล transition หนึ่งครั้งต่อ action ไม่ประกาศซ้ำจากหลาย live region
- state table มี caption, row/column header และ scrollable region มีชื่อ
- เมื่อเปิด reduced motion ข้อมูลผลลัพธ์ยังครบและไม่มี animation ที่จำเป็นต่อความเข้าใจ

## หมายเหตุสำหรับ AI ผู้แก้โค้ด

ก่อนลบ CSS ให้ค้นทั้ง `fsm-output.html` และ `scripts/vendingMachine.js` ทุกครั้ง เพราะหลาย class เกิดขึ้นเฉพาะหลังผู้ใช้กด simulator หาก selector ใดไม่แน่ชัดว่าเป็น legacy ให้คงไว้และรายงานแทนการลบ ห้าม refactor ตาราง `fsmRules` หรือ state transition logic ระหว่างงานดีไซน์
