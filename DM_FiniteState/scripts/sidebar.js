document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".nav-link");
    const pageSections = document.querySelectorAll(".page-section");
    const pageTitle = document.getElementById("page-title");
    const pageSubtitle = document.getElementById("page-subtitle");
    const appContainer = document.querySelector(".app-container");
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const currentPage = document.body.dataset.page;

    // Keep links named and discoverable when the rail is collapsed to icons.
    navLinks.forEach(link => {
        const label = link.querySelector(".nav-link__text strong")?.textContent.trim();
        if (!label) {
            return;
        }

        link.setAttribute("aria-label", label);
        link.setAttribute("title", label);
    });

    const updateSidebarControls = () => {
        if (!appContainer || !sidebarToggle) {
            return;
        }

        const isCollapsed = appContainer.classList.contains("sidebar-collapsed");
        sidebarToggle.setAttribute("aria-expanded", String(!isCollapsed));
        sidebarToggle.setAttribute("aria-label", isCollapsed ? "ขยาย sidebar" : "ย่อ sidebar");
        sidebarToggle.setAttribute("title", isCollapsed ? "ขยาย sidebar" : "ย่อ sidebar");
    };

    if (appContainer && sidebarToggle) {
        sidebarToggle.addEventListener("click", () => {
            appContainer.classList.toggle("sidebar-collapsed");
            updateSidebarControls();
        });
    }

    updateSidebarControls();

    if (currentPage) {
        navLinks.forEach(link => {
            const isActive = link.dataset.page === currentPage;
            link.classList.toggle("active", isActive);
            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    // โครงสร้างคำอธิบายเมนูเมื่อผู้ใช้เปลี่ยนหน้า
    const pageMeta = {
        "intro": {
            title: "1. Introduction to Models of Computation",
            subtitle: "ทำความรู้จักพื้นฐานโครงสร้างแบบจำลองคอมพิวเตอร์และคณิตศาสตร์แยกส่วน"
        },
        "fsm-output": {
            title: "2. Finite-State Machines with Output",
            subtitle: "เรียนรู้การเปลี่ยนสถานะผ่านการจำลองตู้ Vending Machine อัตโนมัติ"
        },
        "working-fsm": {
            title: "3. Working with FSM",
            subtitle: "ทดลอง input string, output string และ state path ทีละ step"
        },
        "recognition-fsm": {
            title: "4. FSM Recognition",
            subtitle: "ตรวจ substring 111 ด้วย output stream และ last output bit"
        },
        "fsa": {
            title: "5. FSM with No Output / FSA",
            subtitle: "ตัดสิน Accepted หรือ Rejected จาก end state และ final states"
        },
        "language-recognition": {
            title: "6. Language Recognition",
            subtitle: "เข้าใจ L(M) ผ่าน membership tests และตัวอย่าง accepted/rejected"
        },
        "designing-fsa": {
            title: "7. Designing FSA",
            subtitle: "ฝึกออกแบบ FSA ด้วย state planner, transition table และ test harness"
        }
    };

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");
            if (href && href !== "#") {
                return;
            }

            e.preventDefault();
            const targetPage = link.getAttribute("data-page");

            // ปรับปรุงการสลับไฮไลท์ที่ปุ่มเมนู Sidebar
            navLinks.forEach(l => {
                l.classList.remove("active");
                l.removeAttribute("aria-current");
            });
            link.classList.add("active");
            link.setAttribute("aria-current", "page");

            // แสดงเฉพาะหน้าจอที่ถูกเลือก
            pageSections.forEach(section => {
                section.classList.remove("active");
                if (section.id === `page-${targetPage}`) {
                    section.classList.add("active");
                }
            });

            // อัปเดตหัวข้อใหญ่ด้านบนพาดหัวหลักตามการคลิก
            if (pageMeta[targetPage]) {
                if (pageTitle) {
                    pageTitle.innerText = pageMeta[targetPage].title;
                }
                if (pageSubtitle) {
                    pageSubtitle.innerText = pageMeta[targetPage].subtitle;
                }
            }
        });
    });
});
