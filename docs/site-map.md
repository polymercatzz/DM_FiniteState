# DM Finite State Site Map

เอกสารนี้สรุปโครงสร้างเว็บบทเรียนหลังแยกหน้า HTML ไปไว้ใน `pages/`

## Current Site Map

```text
index.html
  -> pages/introduction.html
  -> pages/fsm-output.html
  -> pages/working-fsm.html
  -> pages/recognition-fsm.html
  -> pages/fsa.html
  -> pages/language-recognition.html
  -> pages/designing-fsa.html
```

ทุกหน้าใช้ sidebar layout เดียวกัน และกำหนดหน้าปัจจุบันผ่าน `body[data-page]` เพื่อให้ `scripts/sidebar.js` highlight เมนูที่ถูกต้อง

## Shared Layout

- `styles/base.css` เป็นฐานของ layout, typography, content header และ responsive shell
- `styles/sidebar.css` เป็นระบบ navigation ด้านซ้ายและปุ่ม collapse sidebar
- HTML ทุกหน้ามีโครงหลักคือ `.app-container`, `.sidebar`, `.main-content` และ `.page-section.active`
- หน้า lesson อยู่ใน `pages/` ส่วน `index.html` อยู่ที่ root เพื่อเป็น entry point ของเว็บ

## Page Inventory

| Lesson | HTML | Script | Styles เฉพาะ/ร่วม | สถานะ |
| --- | --- | --- | --- | --- |
| Root | `index.html` | `sidebar.js` | `base.css`, `sidebar.css`, `pages/home.css` | ใช้งานเป็น learning tree |
| 01 | `pages/introduction.html` | `sidebar.js` | `base.css`, `sidebar.css`, `pages/introduction.css` | ใช้งาน |
| 02 | `pages/fsm-output.html` | `sidebar.js`, `vendingMachine.js` | `base.css`, `sidebar.css`, `pages/fsm-output.css` | ใช้งาน มี vending machine simulator |
| 03 | `pages/working-fsm.html` | `sidebar.js`, `workingFsm.js` | `base.css`, `sidebar.css`, `content-sections.css` | ใช้งาน มี string simulator |
| 04 | `pages/recognition-fsm.html` | `sidebar.js`, `recognitionChallenge.js` | `base.css`, `sidebar.css`, `challenge-sections.css` | ใช้งาน มี recognizer lab |
| 05 | `pages/fsa.html` | `sidebar.js`, `fsaSimulator.js` | `base.css`, `sidebar.css`, `content-sections.css` | ใช้งาน มี FSA simulator |
| 06 | `pages/language-recognition.html` | `sidebar.js`, `languageChallenge.js` | `base.css`, `sidebar.css`, `challenge-sections.css` | ใช้งาน มี membership tester |
| 07 | `pages/designing-fsa.html` | `sidebar.js`, `fsaBuilder.js` | `base.css`, `sidebar.css`, `challenge-sections.css` | ใช้งาน มี FSA builder |

## Lesson Flow

1. `index.html` แสดงแผนผังบทเรียน 01–07
2. `pages/introduction.html` ปูพื้นฐาน model, state, input, rule และ output
3. `pages/fsm-output.html` ใช้ vending machine อธิบาย FSM with output
4. `pages/working-fsm.html` ให้ทดลอง input string และ output string ทีละ step
5. `pages/recognition-fsm.html` ใช้ FSM with output ตรวจ pattern `111`
6. `pages/fsa.html` เปลี่ยนจาก output stream เป็นการตัดสินจาก final state
7. `pages/language-recognition.html` อธิบาย `L(M)` และ membership ของ string
8. `pages/designing-fsa.html` ให้ผู้เรียนวาง state memory เติม transition table และ run tests

## งานที่เหลือถ้าจะต่อยอด

- เพิ่ม `content/08-final-challenge.md` หรือสร้างหน้า HTML สำหรับบท 08
- ผูก final challenge เข้ากับ navigation เมื่อเนื้อหาพร้อม
- ตรวจข้อความใน HTML ให้สอดคล้องกับ source Markdown หากเพิ่ม content source ในอนาคต
