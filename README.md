# DM Finite State

เว็บบทเรียนแบบ static หลายหน้าเรื่อง Models of Computation และ Finite-State Machines เปิดใช้งานจาก `index.html` โดยไม่ต้องติดตั้ง dependency เพิ่ม

## โครงสร้างไฟล์

```text
DM_FiniteState/
  index.html
  pages/
    introduction.html
    fsm-output.html
    working-fsm.html
    recognition-fsm.html
    fsa.html
    language-recognition.html
    designing-fsa.html
  scripts/
    sidebar.js
    vendingMachine.js
    workingFsm.js
    recognitionChallenge.js
    fsaSimulator.js
    languageChallenge.js
    fsaBuilder.js
  styles/
    base.css
    sidebar.css
    content-sections.css
    challenge-sections.css
    pages/
      home.css
      introduction.css
      fsm-output.css
  docs/
    site-map.md
    archive/
      ux-ui-plans/
      legacy/
```

## หน้าเว็บ

| File | Page | หน้าที่ |
| --- | --- | --- |
| `index.html` | Learning Tree | หน้า root สำหรับเลือกบทเรียน |
| `pages/introduction.html` | Lesson 01 | ภาพรวม Models of Computation |
| `pages/fsm-output.html` | Lesson 02 | FSM with output และ vending machine simulator |
| `pages/working-fsm.html` | Lesson 03 | ทดลอง input string, state path และ output string |
| `pages/recognition-fsm.html` | Lesson 04 | ตรวจ substring `111` ด้วย FSM with output |
| `pages/fsa.html` | Lesson 05 | FSA / FSM with no output และ final-state decision |
| `pages/language-recognition.html` | Lesson 06 | ทดสอบ membership ว่า `x in L(M)` หรือไม่ |
| `pages/designing-fsa.html` | Lesson 07 | ออกแบบ FSA ด้วย state planner, transition table และ test harness |

บท 08 Final Challenge ยังไม่มีไฟล์เนื้อหาใน repository และลิงก์จาก Lesson 07 จึงเป็นงานต่อยอดที่ยังไม่พร้อมใช้งาน

## Styles และ Scripts

- `styles/base.css` คุม layout หลัก, typography และ component พื้นฐาน
- `styles/sidebar.css` คุม sidebar และ navigation
- `styles/content-sections.css` คุมบทเรียนทั่วไปและ lab
- `styles/challenge-sections.css` คุมหน้า challenge/lab
- `styles/pages/` เก็บสไตล์เฉพาะหน้า
- `scripts/sidebar.js` ตั้งค่า active navigation และควบคุม sidebar
- ไฟล์ JavaScript อื่นใน `scripts/` คุม simulator และ builder ของแต่ละบท

## เอกสาร

- `docs/site-map.md` อธิบาย site map และ lesson flow
- `docs/archive/ux-ui-plans/` เก็บแผน UX/UI ที่ดำเนินการเสร็จแล้ว
- `docs/archive/legacy/` เก็บไฟล์ที่ไม่ได้ใช้งานใน runtime ปัจจุบันเพื่อการกู้คืนภายหลัง

## การเปิดใช้งาน

เปิด `index.html` ใน browser ได้โดยตรง หรือเปิดหน้าใดก็ได้จาก `pages/` หากต้องการเข้าบทนั้นทันที
