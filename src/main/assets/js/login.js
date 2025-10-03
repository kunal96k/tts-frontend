const themes = [
    {
        background: "#1A1A2E",
        color: "#FFFFFF",
        primaryColor: "#0F3460"
    },
    {
        background: "#461220",
        color: "#FFFFFF",
        primaryColor: "#E94560"
    },
    {
        background: "#192A51",
        color: "#FFFFFF",
        primaryColor: "#967AA1"
    },
    {
        background: "#F7B267",
        color: "#000000",
        primaryColor: "#F4845F"
    },
    {
        background: "#F25F5C",
        color: "#000000",
        primaryColor: "#642B36"
    },
    {
        background: "#231F20",
        color: "#FFF",
        primaryColor: "#BB4430"
    }
];

const setTheme = (theme) => {
    const root = document.querySelector(":root");
    root.style.setProperty("--background", theme.background);
    root.style.setProperty("--color", theme.color);
    root.style.setProperty("--primary-color", theme.primaryColor);
    root.style.setProperty("--glass-color", theme.glassColor);
};

const displayThemeButtons = () => {
    const btnContainer = document.querySelector(".theme-btn-container");
    if (!btnContainer) return;
    themes.forEach((theme) => {
        const div = document.createElement("div");
        div.className = "theme-btn";
        div.style.cssText = `background: ${theme.background}; width: 25px; height: 25px`;
        btnContainer.appendChild(div);
        div.addEventListener("click", () => setTheme(theme));
    });
};

displayThemeButtons();

const supportModal = document.getElementById("supportModal");
const supportModalBackdrop = document.getElementById("supportModalBackdrop");
const supportTriggers = document.querySelectorAll(".js-support-trigger");
const supportClose = document.querySelector(".js-support-close");

const toggleSupportModal = (show) => {
    if (!supportModal || !supportModalBackdrop) return;
    supportModal.classList.toggle("hidden", !show);
    supportModalBackdrop.classList.toggle("hidden", !show);
};

supportTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
        event.preventDefault();
        toggleSupportModal(true);
        supportModal?.focus();
    });
});

supportModalBackdrop?.addEventListener("click", () => toggleSupportModal(false));

supportClose?.addEventListener("click", () => toggleSupportModal(false));

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        toggleSupportModal(false);
    }
});
