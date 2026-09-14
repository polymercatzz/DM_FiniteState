# UX/UI Implementation Plan: `introduction.html`

## เป้าหมาย

ปรับ Lesson 01 ให้ผู้เรียนเข้าใจภาพรวมของ Models of Computation ได้จากการสแกนหน้า โดยคงแนวทาง **technical academic editorial** ของเว็บไซต์: sidebar สี navy, เนื้อหาพื้นสว่าง, teal เป็นสีหลัก, amber เป็น accent และใช้ Bai Jamjuree คู่กับ Sarabun

จุดจดจำของหน้านี้ต้องเป็นแผนภาพแนวคิด **Input → State + Rules → Output / Decision** เพื่อเตรียมผู้เรียนก่อนเข้าสู่ simulator ในบทถัดไป

## ขอบเขตไฟล์

- แก้โครงสร้างและข้อความ UX เฉพาะ `introduction.html`
- แก้สไตล์เฉพาะ `styles/pages/introduction.css`
- ไม่แก้ `styles/base.css`, `styles/sidebar.css`, `scripts/sidebar.js` หรือหน้า HTML อื่น
- ใช้เฉพาะเนื้อหาที่ปรากฏใน `introduction.html` และพฤติกรรมจากไฟล์ที่หน้าโหลดจริง ห้ามอ่านหรืออ้างอิงไฟล์ในโฟลเดอร์ `content`

## สิ่งที่ต้องคงเดิม

- คง `body[data-page="intro"]`, `#sidebar-toggle`, `#site-sidebar`, `.app-container`, `.sidebar`, `.main-content`, `#page-intro` และ `.page-section.active`
- คง `href` และ `data-page` ของเมนู sidebar ทุกลิงก์
- คงลิงก์ Previous ไป `index.html` และ Next ไป `fsm-output.html`
- คง `.lesson-flow`, `.lesson-section`, `.lesson-navigation`, `.lesson-action--secondary` และ `.lesson-action--primary` เพื่อใช้รูปแบบร่วมจาก `styles/base.css`
- คงสาระทั้งหมดที่มีอยู่ใน `introduction.html`; อนุญาตให้ย่อหรือจัดกลุ่มใหม่ แต่ห้ามเปลี่ยนความหมายทางวิชาการ
- ห้ามเพิ่ม JavaScript, framework, library, icon package หรือรูปภาพภายนอก
- ห้ามทำส่วนที่ไม่มี interaction ให้ดูเหมือนปุ่มหรือการ์ดที่คลิกได้

## ปัญหาที่พบ

1. เนื้อหาหลักเริ่มด้วยย่อหน้าและรายการคำถามทันที จึงยังไม่มีภาพจำที่อธิบายกระบวนการของ computation model
2. Hero ยังไม่สรุปผลลัพธ์ที่ผู้เรียนจะได้รับจากเนื้อหาซึ่งปรากฏอยู่ในหน้านี้ ทำให้ยังไม่เห็นเป้าหมายของบทอย่างรวดเร็ว
3. ส่วนเปรียบเทียบ Model ใช้ `div` และ ARIA role เลียนแบบตาราง ทั้งที่ข้อมูลเป็นตารางสองคอลัมน์จริง จึงควรใช้ semantic table
4. ตัวอย่างการใช้ FSM แสดงเป็น chip รูปแบบเดียวกันทั้งหมด ทำให้ดูเหมือน tag และไม่มีลำดับการอ่าน
5. Vocabulary อ่านได้ แต่คู่คำศัพท์ 6 คู่กระจายเต็มความกว้างและไม่มีจุดเน้นคำสำคัญ
6. ข้อความ Previous `กลับไปทบทวนบทก่อนหน้า` ไม่ตรงกับปลายทางซึ่งเป็นหน้า Learning Tree
7. `styles/pages/introduction.css` มี selector ที่หน้าไม่ได้ใช้ ได้แก่ `.bg-welcome`, `.intro-hero*`, `.intro-grid`, `.intro-box*`, `.intro-index` และ `.meta-chips*`
8. ไฟล์ CSS มี media query ของ `#page-fsm-output` ซึ่งไม่เกี่ยวข้องและไม่มีผลในหน้า Introduction
9. `.intro-header` ถูกประกาศหลายครั้งและถูก override ท้ายไฟล์ด้วย `max-width: none` ทำให้ดูแลยากและเกิดกฎขัดกัน
10. ลิงก์ lesson navigation มี hover state แต่ไม่มี focus state เฉพาะที่ชัดเจน

## คำสั่งแก้ไข `introduction.html`

### 1. Hero และ learning outcomes

คง `.section-kicker`, `h1` และข้อความนำเดิม ภายใน `.intro-header` จากนั้นเพิ่ม list ชื่อ `.intro-outcomes` ใต้ข้อความนำ โดยสรุปจากเนื้อหาที่มีอยู่ใน `introduction.html` เป็น 3 ข้อ:

- อธิบายหน้าที่ของ computation model
- แยก Input, State, Rule และ Output ได้
- อธิบายว่า FSM เหมาะกับระบบแบบใด

ใช้ `<ul>`/`<li>` ตาม semantic จริง ไม่ใช้ chip ทรง pill และไม่ใส่สถานะ completed

### 2. เพิ่ม concept flow ใน Core Idea

หลังย่อหน้าแรกของ section `Core Idea` เพิ่ม `<figure class="computation-flow">` ที่ประกอบด้วย 4 node ตามลำดับ:

1. Input — สิ่งที่ป้อนเข้าสู่ระบบ
2. State — สิ่งที่ระบบต้องจดจำ
3. Rule / Transition — กฎที่กำหนดขั้นถัดไป
4. Output / Decision — ผลลัพธ์หรือคำตัดสิน

ข้อกำหนด:

- ใช้ ordered list ภายใน figure เพื่อคงลำดับเมื่อ CSS ไม่ทำงาน
- มี `<figcaption>` ว่า `องค์ประกอบพื้นฐานของแบบจำลองการคำนวณ`
- ลูกศรและเส้นเชื่อมเป็น pseudo-element หรือ SVG ตกแต่งที่มี `aria-hidden="true"`
- ห้ามทำ node เป็นปุ่มและห้ามเพิ่ม interaction
- คง `.inquiry-list` ต่อจาก concept flow แต่เปลี่ยนหัวนำเป็น `คำถามที่แบบจำลองช่วยตอบ`

### 3. ใช้ semantic table สำหรับ Model Overview

เปลี่ยน `.model-compare` จาก `div role="table"` เป็น `<table>` จริง:

- เพิ่ม `<caption>` ที่อธิบายว่าเป็นการเปรียบเทียบแบบจำลองการคำนวณ
- ใช้ `<thead>`, `<tbody>`, `<tr>`, `<th scope="col">` และ `<td>`
- คงข้อมูล Grammars, Finite-State Machines และ Turing Machines ตามเดิม
- เพิ่ม class `.model-row--focus` ให้แถว Finite-State Machines เพื่อเน้นว่าเป็นหัวข้อหลักของชุดบทเรียน
- การเน้นใช้พื้น teal จางและเส้นด้านซ้าย ห้ามใช้สีสถานะสำเร็จหรือไอคอน check

### 4. ปรับ Real-world examples

เปลี่ยน `.real-world-list` จากชุด `<span>` เป็น semantic `<ul>` และแต่ละตัวอย่างเป็น `<li>`

- คงตัวอย่างทั้ง 6 รายการและข้อความเดิม
- เพิ่มเลขลำดับหรือเส้น marker ขนาดเล็กด้วย CSS
- จัดเป็น grid 2 คอลัมน์บน desktop และ 1 คอลัมน์บน mobile
- ห้ามใส่เงาหนักหรือ hover เพราะรายการนี้คลิกไม่ได้

### 5. ปรับ Vocabulary

คง `<dl class="term-list">` และคู่ `<dt>/<dd>` ทั้ง 6 คู่

- เพิ่มเลขกำกับเชิงตกแต่ง `01–06` ด้วย CSS counter แทนการเพิ่มข้อความซ้ำใน HTML
- เน้นคำศัพท์ด้วย Bai Jamjuree และ teal; คำอธิบายใช้สี body text
- ห้ามเปลี่ยนเป็น card 6 ใบที่มีเงา เพราะจะทำให้หน้าหนักเกินไป

### 6. แก้ UX copy ของ navigation

- เปลี่ยนข้อความลิงก์ Previous เป็น `← กลับไป Learning Tree`
- เปลี่ยน label เหนือลิงก์ Previous จาก `Previous Lesson` เป็น `Course Overview`
- คง `href="index.html"`
- คงข้อความและ `href="fsm-output.html"` ของปุ่ม Next ตามเดิม

## คำสั่งแก้ไข `styles/pages/introduction.css`

### 1. จัดระเบียบ stylesheet

- ลบ selector ที่ไม่ถูกใช้ใน `introduction.html`: `.bg-welcome`, `.intro-hero*`, `.intro-grid`, `.intro-box*`, `.intro-index`, `.meta-chips` และ `.meta-chips-soft`
- ลบ media query ที่อ้างถึง `#page-fsm-output`
- รวมกฎ `.intro-header` ที่ซ้ำกันให้เหลือชุดเดียวและ scope selector ใหม่ทั้งหมดภายใต้ `#page-intro` เพื่อไม่ให้กระทบหน้าอื่น
- ไม่ประกาศค่าที่มีอยู่แล้วใน `styles/base.css` ซ้ำ หากไม่ได้ override เพื่อหน้า Introduction โดยเฉพาะ

### 2. Content width และ spacing

- กำหนด `#page-intro` เป็น `width: 100%`, `max-width: 1180px` และจัดกึ่งกลาง
- จำกัดข้อความใน hero และย่อหน้าเนื้อหาไว้ประมาณ `68–74ch`
- ใช้ระยะห่าง section ตามระบบ 8px: ค่าหลัก `16px`, `24px`, `32px`, `48px`
- คงเส้นแบ่ง section แบบบางจาก `styles/base.css`; อย่าเปลี่ยนทุก section เป็น card
- ที่ desktop จัด `Core Idea` เป็นเนื้อหาด้านซ้ายและ concept flow ด้านขวาได้ แต่ลำดับ DOM ต้องยังเป็นข้อความก่อนภาพประกอบ

### 3. Hero

- คงรูปแบบ editorial header พื้นโปร่งและเส้นคั่นด้านล่าง ไม่ย้อนกลับไปเป็นกล่องขาวมีเงา
- `h1` ใช้ `clamp(2.1rem, 4vw, 3.4rem)`, line-height ประมาณ `1.08`
- `.intro-outcomes` เป็น grid 3 คอลัมน์บนจอกว้างและ 1 คอลัมน์บนจอเล็ก
- แต่ละ outcome ใช้เส้นด้านบนหรือเลขกำกับสี teal/amber ไม่ใช้ pill

### 4. Computation flow

- ใช้ surface สี navy อ่อนหรือ `#0f172a` เพื่อสร้าง visual anchor หนึ่งจุดของหน้า
- node ใช้พื้นสีขาวโปร่งเล็กน้อย, border บาง และตัวอักษรสีขาว/teal อ่อนที่ผ่าน contrast
- ใช้ amber เฉพาะ node สุดท้าย `Output / Decision`
- desktop แสดง 4 node ตามแนวนอนหรือ grid 4 คอลัมน์ พร้อมเส้นเชื่อมต่อเนื่อง
- ต่ำกว่า `760px` เปลี่ยนเป็นแนวตั้งและให้ลูกศรชี้ลง โดยไม่มี horizontal scroll
- figure และ figcaption ต้องอ่านง่ายเมื่อปิด animation

### 5. Model table

- ตารางใช้ `width: 100%`, `border-collapse: collapse` และไม่ใช้ box-shadow
- header ใช้พื้น navy หรือ teal เข้ม ตัวอักษรขาว
- cell มี padding อย่างน้อย `14px 16px` และเส้นแบ่งสี `var(--border-color)`
- แถว FSM ใช้พื้น `rgba(15, 118, 110, 0.08)` และ border-left สี teal
- ต่ำกว่า `640px` ห้ามบีบตารางจนข้อความแคบเกินไป ให้แปลงแต่ละแถวเป็น block โดยใช้ `data-label` หรือรูปแบบ responsive table ที่ยังประกาศชื่อคอลัมน์ให้ผู้ใช้เห็น

### 6. Examples และ Vocabulary

- `.real-world-list` ใช้ list-style none, grid 2 คอลัมน์ และ gap `10–12px`
- แต่ละ example ใช้ border บาง, radius `6px`, ไม่มีเงา และไม่มี hover transform
- `.term-list` ใช้ 2 คอลัมน์เมื่อกว้างกว่า `760px`; ต่ำกว่านั้นเป็น 1 คอลัมน์
- รักษาเส้น divider และใช้ CSS counter เป็นลำดับ visual โดยไม่รบกวน screen reader

### 7. Navigation และ accessibility

- เพิ่ม `#page-intro .lesson-action:focus-visible` ด้วย outline อย่างน้อย `3px` และ `outline-offset: 3px`
- ตรวจ contrast ของข้อความปุ่ม primary กับพื้น teal ให้ผ่าน WCAG AA
- เพิ่ม `@media (prefers-reduced-motion: reduce)` เฉพาะเมื่อมี transition/animation ใหม่
- หากเพิ่ม entrance animation ให้ใช้ครั้งเดียวกับ concept flow, ระยะรวมไม่เกิน `400ms` และต้องไม่ซ่อนเนื้อหาหาก animation โหลดไม่สำเร็จ

## Design tokens ที่ให้ใช้

- Navy: `#09111f` หรือ `#0f172a`
- Teal: `#0f766e`
- Teal hover: `#0b615b`
- Amber accent: `#f59e0b`
- Heading: `#0f172a`
- Body text: `#475569`
- Muted text: `#64748b`
- Border: `#d6e0eb` หรือ `var(--border-color)`
- Surface: `#ffffff` หรือ `rgba(255, 255, 255, 0.94)`
- Radius: `6px` สำหรับรายการย่อย และ `8px` สำหรับพื้นที่หลัก

ห้ามเพิ่มสีม่วง, gradient ฉูดฉาด, glassmorphism หนัก หรือชุด card ที่มีเงาทุกส่วน

## เกณฑ์ตรวจรับ

- sidebar แสดง active state ที่ Introduction และ toggle ทำงานเหมือนเดิม
- เนื้อหาวิชาการเดิมยังอยู่ครบ: คำถาม 4 ข้อ, Model 3 แบบ, ตัวอย่าง FSM 6 รายการ และคำศัพท์ 6 คำ
- concept flow เรียง Input → State → Rule / Transition → Output / Decision ถูกต้องทั้ง desktop และ mobile
- ตารางใช้ semantic HTML และ screen reader ระบุหัวคอลัมน์ได้
- Previous ไป `index.html` และ Next ไป `fsm-output.html`
- ที่ 1440×900 เนื้อหาไม่ยืดเต็มจอจนอ่านยาก และ concept flow เห็นครบ
- ที่ 1024×768 ไม่มีข้อความหรือ navigation ชน sidebar toggle
- ที่ 768×1024, 390×844 และ 320px ไม่มี horizontal scroll
- การ์ดหรือรายการที่คลิกไม่ได้ไม่มี cursor pointer, hover lift หรือรูปลักษณ์เหมือนปุ่ม
- ใช้ Tab เข้าถึง sidebar toggle และลิงก์ navigation ได้ พร้อม focus indicator ชัดเจน
- Console ไม่มี error ใหม่ และไม่มีการแก้ JavaScript

## หมายเหตุสำหรับ AI ผู้แก้โค้ด

ทำตามแผนนี้โดยแก้เฉพาะ `introduction.html` และ `styles/pages/introduction.css` ก่อน หากพบว่าต้องแก้ shared component ให้หยุดและรายงานเหตุผลแทนการแก้ `base.css` หรือ `sidebar.css` เอง เพื่อป้องกันผลกระทบต่อหน้าอื่น
