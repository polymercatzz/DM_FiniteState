# UX/UI Implementation Plan: `index.html`

## เป้าหมาย

ปรับหน้า Learning Tree ให้เห็นลำดับการเรียนและกลุ่มเนื้อหาได้ภายในครั้งเดียว โดยคงแนวทางภาพเดิมของเว็บไซต์: เว็บการศึกษาเชิงเทคนิค โทน navy–teal ใช้ amber เป็น accent พื้นหลังสว่างแบบ grid และตัวอักษร Bai Jamjuree คู่กับ Sarabun

จุดจดจำของหน้านี้ต้องเป็น **เส้นทางเรียนแบบต่อเนื่องจาก Concept → FSM with Output → FSA Design** ไม่ใช่เพียงรายการการ์ดเรียงยาว

## ขอบเขตไฟล์

- แก้โครงสร้างเฉพาะ `index.html`
- แก้สไตล์หลักใน `styles/pages/home.css`
- แก้ `styles/sidebar.css` เฉพาะปัญหา responsive/scroll ที่ระบุด้านล่าง
- ไม่แก้ `scripts/sidebar.js` และไม่แก้ไฟล์บทเรียนอื่น

## สิ่งที่ต้องคงเดิม

- คง `body[data-page="home"]`, `#sidebar-toggle`, `#site-sidebar`, `.app-container`, `.sidebar`, `.main-content`, `#page-home` และ `.page-section.active`
- คง `href` ของทุกลิงก์และ `data-page` ของเมนู sidebar ตามเดิม
- คงจำนวนบทเรียน 7 บทและลำดับ `01` ถึง `07`
- คง sidebar toggle, active navigation และการนำทางแบบหลายหน้าให้ทำงานเหมือนเดิม
- คงการโหลด `styles/base.css`, `styles/sidebar.css`, `styles/pages/home.css` และ `scripts/sidebar.js`
- ห้ามเพิ่ม framework, library, icon package หรือ JavaScript ใหม่
- ห้ามเปลี่ยนเนื้อหาวิชาการและห้ามสร้างสถานะ progress ที่อ้างว่าผู้ใช้เรียนจบแล้ว

## ปัญหาที่พบ

1. `.tree-branches` เป็นรายการการ์ดเต็มความกว้าง 7 ใบ จึงอ่านเหมือนเมนูทั่วไปมากกว่า learning tree และใช้พื้นที่แนวตั้งมากเกินไปบนจอกว้าง
2. บทเรียนทั้ง 7 ไม่มีการแบ่งช่วง ทำให้ความสัมพันธ์ระหว่าง Introduction, FSM with Output และ FSA ไม่ชัด
3. hero กับ root card สื่อความหมายซ้ำกัน แต่ยังไม่มีข้อมูลสรุปเส้นทางที่ช่วยตัดสินใจว่าจะเริ่มตรงไหน
4. การ์ดมี feedback เฉพาะ `:hover`; ผู้ใช้ keyboard ยังไม่มี focus state ที่มองเห็นชัด
5. ที่หน้าจอต่ำกว่า 640px การวางเลขบทเป็นหนึ่งแถวเต็มทำให้การ์ดสูงโดยไม่จำเป็น
6. sidebar ใช้ `height: 100vh` ร่วมกับ `overflow: hidden`; บนจอ desktop ที่มีความสูงน้อย เมนูท้ายรายการอาจเลื่อนไปไม่ถึง
7. `styles/sidebar.css` จบไฟล์โดยยังไม่ปิด `@media (max-width: 900px)` ให้ปิด block ให้ถูกต้องก่อนเพิ่มกฎใหม่

## คำสั่งแก้ไข `index.html`

### 1. ปรับ hero ให้สรุปเส้นทางได้ทันที

ภายใน `.root-hero` ให้คง kicker, `h1` และข้อความอธิบายเดิม จากนั้นเพิ่มแถบข้อมูลสั้นใต้คำอธิบาย:

- `7 Lessons`
- `3 Learning Phases`
- `Concept → Simulator → Builder`

ใช้ markup แบบ list เพื่อให้ screen reader อ่านเป็นชุดข้อมูลได้ ห้ามใช้ข้อความว่า completed, locked หรือเปอร์เซ็นต์ความคืบหน้า

### 2. เปลี่ยน root card เป็น course overview

คง `.tree-node.tree-node--root` และเนื้อหาเดิม แต่เพิ่มข้อความกำกับสั้นว่า `Course Roadmap` และแสดงชื่อ 3 phase ต่อเนื่องกันด้วยลูกศรเชิงตกแต่ง:

1. Foundation
2. FSM with Output
3. FSA & Design

ลูกศรหรือเส้นเชื่อมต้องใส่ `aria-hidden="true"`

### 3. แบ่งบทเรียนเป็น 3 phase

เปลี่ยน `.tree-branches` ให้เป็นโครงสร้าง 3 กลุ่ม โดยยังใช้ anchor `.tree-node.tree-node--lesson` เดิมทุกตัว:

- **Phase 01 — Foundation:** บท 01 Introduction
- **Phase 02 — FSM with Output:** บท 02 FSM with Output, บท 03 Working with FSM, บท 04 FSM Recognition
- **Phase 03 — FSA & Design:** บท 05 FSM with No Output / FSA, บท 06 Language Recognition, บท 07 Designing FSA

แต่ละกลุ่มต้องมี heading ที่มองเห็นได้และคำอธิบายไม่เกิน 1 บรรทัด ใช้ semantic list (`ol`/`li`) สำหรับลำดับบทเรียน และ reset list style ใน CSS

ห้ามเปลี่ยนข้อความชื่อบท คำอธิบาย หรือ URL ของการ์ดเดิม

### 4. เพิ่ม affordance ให้การ์ด

ภายในท้ายการ์ดแต่ละบท เพิ่ม `.tree-node__cta` ที่มีข้อความ `เปิดบทเรียน` และลูกศร `→` เพื่อสื่อว่าการ์ดคลิกได้ ทั้งส่วนต้องอยู่ภายใน anchor เดิม

## คำสั่งแก้ไข `styles/pages/home.css`

### 1. Layout และความกว้าง

- จำกัดพื้นที่เนื้อหาหน้าแรกด้วย `max-width: 1440px` และจัดกึ่งกลาง แทนกฎท้ายไฟล์ที่กำหนด `.learning-root { max-width: none; }`
- hero ใช้ความกว้างข้อความไม่เกินประมาณ `72ch`; หัวข้อยังคงเด่นแต่ไม่ควรเกิน `clamp(2.25rem, 4.6vw, 4.2rem)`
- ตั้ง `.tree-branches` เป็น grid 3 คอลัมน์บนจอ `>= 1180px` โดยสัดส่วน phase เป็น `0.8fr 1.1fr 1.1fr`
- ที่ช่วง `760px–1179px` ใช้ 2 คอลัมน์ และให้ Phase 03 ขยายเต็มแถวหากพื้นที่ไม่พอ
- ต่ำกว่า `760px` กลับเป็น 1 คอลัมน์ตามลำดับ 01–03

### 2. Visual hierarchy ของ phase

- แต่ละ phase ใช้พื้นโปร่งหรือโปร่งขาวเล็กน้อย ไม่สร้าง card ซ้อน card ที่มีเงาหนัก
- ใช้เส้นด้านบนสี teal สำหรับ Phase 01, teal-to-blue สำหรับ Phase 02 และ amber สำหรับ Phase 03
- phase heading ใช้ Bai Jamjuree น้ำหนัก 700; คำอธิบายใช้ Sarabun และสี `var(--text-light)`
- สร้างเส้นเชื่อมจาก root card ไปหา phase ด้วย pseudo-elements เฉพาะ desktop; ที่ mobile ใช้เส้นแนวตั้งเส้นเดียวและไม่ให้เส้นทับข้อความ
- รักษา border radius หลักที่ 8px เพื่อไปในทิศทางเดียวกับหน้าอื่น

### 3. Lesson card

- ลดเงาปกติให้เบากว่าเดิม และใช้ border เป็นตัวแบ่งหลัก
- ให้ card ภายใน phase สูงเท่ากันเมื่ออยู่แถวเดียวกัน
- คงเลขบทไว้ด้านซ้ายของข้อความที่ทุกความกว้างตั้งแต่ `390px` ขึ้นไป; ลดขนาด badge เป็นประมาณ `42px` บน mobile แทนการย้ายไปอยู่คนละแถว
- จัด `.tree-node__cta` ไว้ท้ายการ์ด สี teal และขนาดเล็กกว่าชื่อบท
- hover: ยกการ์ดไม่เกิน `2px`, เปลี่ยน border เป็น teal และเลื่อนลูกศรเล็กน้อย
- เพิ่ม `:focus-visible` ให้ outline หนาอย่างน้อย `3px`, สีที่ตัดกับพื้นหลัง และมี `outline-offset: 3px`
- ห้ามใช้ `outline: none` หากไม่มี focus indicator ทดแทน

### 4. Hero metadata

- แสดง metadata เป็น flex ที่ wrap ได้
- ใช้เส้นแบ่งหรือ chip ทรงเหลี่ยมมน 6px; ห้ามใช้ pill จำนวนมาก
- ใช้ teal เป็นสีหลักและ amber เพียงหนึ่งจุดเพื่อรักษาลำดับความสำคัญ

### 5. Motion และ responsive

- transition จำกัดเฉพาะ `transform`, `border-color`, `box-shadow` และสี ระยะเวลา `160–200ms`
- เพิ่ม `@media (prefers-reduced-motion: reduce)` เพื่อปิด transform และ transition ของการ์ด/CTA
- ที่ความกว้างต่ำกว่า `420px` ลด padding การ์ดและขนาดหัวข้อ แต่พื้นที่กดของลิงก์ต้องไม่น้อยกว่า 44px
- ตรวจไม่ให้เกิด horizontal scroll ที่ 320px

## คำสั่งแก้ไข `styles/sidebar.css`

1. เติม `}` ปิด `@media (max-width: 900px)` ที่ท้ายไฟล์ให้ครบ
2. บน desktop เพิ่ม `min-height: 0` ให้ `.sidebar` และเพิ่ม `overflow-y: auto` พร้อม `overscroll-behavior: contain` ให้ `.sidebar-nav` เพื่อให้เข้าถึงเมนูทั้งหมดบนจอเตี้ย
3. เมื่อ sidebar ถูกย่อ ให้คง tooltip จาก `title`/ชื่อ link ที่มีอยู่ และอย่าแก้ logic ของปุ่ม toggle
4. เพิ่ม `:focus-visible` ให้ `.sidebar-toggle` และ `.nav-link` โดยใช้เส้น focus ที่เห็นชัดบนพื้น navy
5. กฎใหม่ต้องไม่เปลี่ยนขนาด sidebar desktop `280px` และ collapsed `76px`

## Design tokens ที่ให้ใช้

- Navy: `#09111f`
- Heading: `#0f172a`
- Teal: `#0f766e`
- Teal hover: `#0b615b`
- Amber accent: `#f59e0b`
- Body text: `#475569`
- Muted text: `#64748b`
- Border: `#d6e0eb` หรือค่าจาก `var(--border-color)`
- Surface: `rgba(255, 255, 255, 0.92–0.96)`

ห้ามเพิ่มสีม่วงหรือ gradient สีฉูดฉาดที่ไม่อยู่ในระบบสีเดิม

## เกณฑ์ตรวจรับ

- ลิงก์บทเรียนทั้ง 7 ไปยัง URL เดิมและเรียง 01–07 ถูกต้อง
- sidebar แสดง active state ที่ Learning Tree และปุ่มย่อ/ขยายทำงานเหมือนเดิม
- ผู้ใช้มองเห็น 3 phase ชัดเจนโดยไม่ต้องอ่านคำอธิบายทุกการ์ด
- ที่ 1440×900 แสดง 3 phase ในแถวเดียวโดยไม่มีข้อความล้น
- ที่ 1024×768 ไม่มีเมนู sidebar ที่เข้าถึงไม่ได้ และเนื้อหาไม่ชนปุ่ม toggle
- ที่ 768×1024 และ 390×844 ลำดับบทเรียนยังเป็น 01–07 และไม่มี horizontal scroll
- ที่ 320px ข้อความไม่ล้น card และทุกลิงก์ยังแตะได้สะดวก
- ใช้ Tab เข้าถึง sidebar toggle และ lesson card ทุกใบได้ พร้อม focus indicator ที่ชัดเจน
- เมื่อระบบตั้ง `prefers-reduced-motion: reduce` ไม่มีการยกหรือเลื่อนการ์ด
- Console ไม่มี error ใหม่ และไม่มีการแก้ JavaScript

## หมายเหตุการตรวจสอบ

แผนนี้จัดทำจากการอ่าน `index.html`, `styles/base.css`, `styles/sidebar.css`, `styles/pages/home.css`, `scripts/sidebar.js` และเทียบรูปแบบกับหน้า `introduction.html` ไม่ได้อ้างอิงภาพ render เนื่องจากเบราว์เซอร์ทดสอบไม่อนุญาตให้เปิด URL แบบ `file://`
