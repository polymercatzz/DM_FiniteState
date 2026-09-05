# DM Finite State Content Structure

เอกสารนี้สรุปโครงสร้างงานปัจจุบันของ `DM_FiniteState` หลังปรับเป็น static website แบบหลายหน้า โดยไม่รวมการแก้ไขไฟล์ในโฟลเดอร์ `content/`

## Current Site Map

```text
index.html
  -> introduction.html
  -> fsm-output.html
  -> working-fsm.html
  -> recognition-fsm.html
  -> fsa.html
  -> language-recognition.html
  -> designing-fsa.html
```

ทุกหน้าใช้ sidebar layout เดียวกัน และกำหนดหน้าปัจจุบันผ่าน `body[data-page]` เพื่อให้ `scripts/sidebar.js` highlight เมนูที่ถูกต้อง

## Shared Layout

- `styles/base.css` เป็นฐานของ layout, typography, content header และ responsive shell
- `styles/sidebar.css` เป็นระบบ navigation ด้านซ้ายและปุ่ม collapse sidebar
- HTML ทุกหน้ามีโครงหลักคือ `.app-container`, `.sidebar`, `.main-content` และ `.page-section.active`
- บล็อกเป้าหมายการเรียนถูกถอดออกจาก HTML lesson pages แล้ว เพื่อให้เนื้อหาเริ่มจากหัวข้อหลักหรือ interactive lab โดยตรง

## Page Inventory

| Lesson | HTML | Script | Styles เฉพาะ/ร่วม | สถานะ |
| --- | --- | --- | --- | --- |
| Root | `index.html` | `sidebar.js` | `base.css`, `sidebar.css`, `pages/home.css` | ใช้งานเป็น learning tree |
| 01 | `introduction.html` | `sidebar.js` | `base.css`, `sidebar.css`, `content-sections.css`, `pages/introduction.css` | ใช้งาน |
| 02 | `fsm-output.html` | `sidebar.js`, `vendingMachine.js` | `base.css`, `sidebar.css`, `pages/fsm-output.css` | ใช้งาน มี vending machine simulator |
| 03 | `working-fsm.html` | `sidebar.js`, `workingFsm.js` | `base.css`, `sidebar.css`, `content-sections.css` | ใช้งาน มี string simulator |
| 04 | `recognition-fsm.html` | `sidebar.js`, `recognitionChallenge.js` | `base.css`, `sidebar.css`, `challenge-sections.css` | ใช้งาน มี recognizer lab |
| 05 | `fsa.html` | `sidebar.js`, `fsaSimulator.js` | `base.css`, `sidebar.css`, `content-sections.css` | ใช้งาน มี FSA simulator |
| 06 | `language-recognition.html` | `sidebar.js`, `languageChallenge.js` | `base.css`, `sidebar.css`, `challenge-sections.css` | ใช้งาน มี membership tester |
| 07 | `designing-fsa.html` | `sidebar.js`, `fsaBuilder.js` | `base.css`, `sidebar.css`, `challenge-sections.css` | ใช้งาน มี FSA builder |
| 08 | ยังไม่มี HTML | `finalChallenge.js` | ยังไม่ผูกหน้า | เตรียม logic/outline ไว้ แต่ยังไม่อยู่ใน navigation |

## Lesson Flow ปัจจุบัน

1. `index.html` แสดงแผนผังบทเรียน 01-07
2. `introduction.html` ปูพื้นฐาน model, state, input, rule และ output
3. `fsm-output.html` ใช้ vending machine อธิบาย FSM with output
4. `working-fsm.html` ให้ทดลอง input string และ output string ทีละ step
5. `recognition-fsm.html` ใช้ FSM with output ตรวจ pattern `111`
6. `fsa.html` เปลี่ยนจาก output stream เป็นการตัดสินจาก final state
7. `language-recognition.html` อธิบาย `L(M)` และ membership ของ string
8. `designing-fsa.html` ให้ผู้เรียนวาง state memory เติม transition table และ run tests

## Content Folder

โฟลเดอร์ `content/` ยังเก็บ Markdown ต้นทางของบทเรียน, audit และ implementation prompts ไว้ครบ แต่ไม่ได้เป็นแหล่งที่หน้าเว็บโหลดอัตโนมัติใน runtime ปัจจุบัน

ไฟล์ใน `content/` ควรถือเป็น reference/outline สำหรับพัฒนาเพิ่ม ไม่ใช่โครงสร้างหน้าเว็บจริงล่าสุด

## งานที่เหลือถ้าจะต่อยอด

- เพิ่มหน้า HTML สำหรับบท 08 Final Challenge ถ้าต้องการให้ครบตาม outline
- ผูก `scripts/finalChallenge.js` กับหน้าใหม่และเพิ่ม link ใน `index.html` กับ sidebar
- ตรวจว่าข้อความในหน้า HTML ทุกบทสอดคล้องกับเนื้อหา Markdown ล่าสุด เมื่อมีการใช้ `content/` เป็น source อีกครั้ง
