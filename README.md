# DM Finite State

เอกสารนี้สรุปโครงสร้างปัจจุบันของเว็บบทเรียน Discrete Math เรื่อง Models of Computation และ Finite-State Machines ในโฟลเดอร์ `DM_FiniteState`

## ภาพรวม

โปรเจกต์นี้เป็น static website แบบหลายหน้า เปิดใช้งานได้จาก `index.html` โดยไม่ต้องติดตั้ง dependency เพิ่ม หน้าหลักทำหน้าที่เป็น learning tree และแต่ละบทเรียนแยกเป็นไฟล์ HTML ของตัวเอง

## โครงสร้างไฟล์หลัก

```text
DM_FiniteState/
  index.html
  introduction.html
  fsm-output.html
  working-fsm.html
  recognition-fsm.html
  fsa.html
  language-recognition.html
  designing-fsa.html
  README.md
  CONTENT_STRUCTURE.md
  style.css
  assets/
  scripts/
    sidebar.js
    vendingMachine.js
    workingFsm.js
    recognitionChallenge.js
    fsaSimulator.js
    languageChallenge.js
    fsaBuilder.js
    finalChallenge.js
  styles/
    base.css
    sidebar.css
    content-sections.css
    challenge-sections.css
    pages/
      home.css
      introduction.css
      fsm-output.css
  content/
    00-content-audit-from-pdf.md
    01-introduction.md
    02-fsm-with-output.md
    03-working-with-fsm.md
    04-fsm-recognition.md
    05-fsm-with-no-output.md
    06-language-recognition.md
    07-designing-fsa.md
    08-final-challenge.md
    AI_IMPLEMENTATION_PROMPTS.md
```

## หน้าเว็บปัจจุบัน

| File | Page | หน้าที่ |
| --- | --- | --- |
| `index.html` | Learning Tree | หน้า root สำหรับเลือกบทเรียน |
| `introduction.html` | Lesson 01 | ภาพรวม Models of Computation |
| `fsm-output.html` | Lesson 02 | FSM with output และ vending machine simulator |
| `working-fsm.html` | Lesson 03 | ทดลอง input string, state path และ output string |
| `recognition-fsm.html` | Lesson 04 | ตรวจ substring `111` ด้วย FSM with output |
| `fsa.html` | Lesson 05 | FSA / FSM with no output และ final-state decision |
| `language-recognition.html` | Lesson 06 | ทดสอบ membership ว่า `x in L(M)` หรือไม่ |
| `designing-fsa.html` | Lesson 07 | ออกแบบ FSA ด้วย state planner, transition table และ test harness |

หมายเหตุ: มีไฟล์เนื้อหา `content/08-final-challenge.md` และ `scripts/finalChallenge.js` อยู่แล้ว แต่ยังไม่มีหน้า HTML ของบท 08 ในโครงเว็บปัจจุบัน

## Styles

- `styles/base.css` คุม layout หลัก, typography, page container และ component พื้นฐาน
- `styles/sidebar.css` คุม sidebar, navigation และปุ่มย่อ/ขยาย sidebar
- `styles/content-sections.css` คุมส่วนบทเรียนทั่วไปและ lab ของบทเนื้อหา
- `styles/challenge-sections.css` คุมหน้า challenge/lab เช่น recognition, language recognition และ designing FSA
- `styles/pages/home.css` ใช้กับหน้า learning tree
- `styles/pages/introduction.css` ใช้กับหน้า introduction
- `styles/pages/fsm-output.css` ใช้กับหน้า vending machine
- `style.css` เป็น stylesheet legacy ที่ยังอยู่ในโปรเจกต์

## Scripts

- `scripts/sidebar.js` ตั้งค่า active navigation จาก `body[data-page]` และควบคุมการย่อ/ขยาย sidebar
- `scripts/vendingMachine.js` คุม simulator ตู้ขายขนมในหน้า `fsm-output.html`
- `scripts/workingFsm.js` คุม string simulator ของ FSM with output
- `scripts/recognitionChallenge.js` คุม lab ตรวจ substring `111`
- `scripts/fsaSimulator.js` คุม FSA simulator สำหรับ final-state decision
- `scripts/languageChallenge.js` คุม membership tester และ guess-the-language activity
- `scripts/fsaBuilder.js` คุม state planner, transition table builder และ test harness ในหน้า Designing FSA
- `scripts/finalChallenge.js` เตรียมไว้สำหรับบท final challenge

## Content Notes

โฟลเดอร์ `content/` เก็บเอกสารต้นทางและ prompt/outline ของบทเรียน ไม่ใช่ไฟล์ที่หน้าเว็บโหลดโดยตรงใน runtime ปัจจุบัน การแก้หน้าจอผู้ใช้ให้แก้ที่ไฟล์ HTML, CSS และ JS ด้านบนเป็นหลัก

## การเปิดใช้งาน

เปิดไฟล์ `DM_FiniteState/index.html` ใน browser ได้โดยตรง หรือเปิดไฟล์ lesson HTML แต่ละหน้าได้เลยถ้าต้องการเข้าบทนั้นทันที
