const styles: { [key: string]: string } = {
    "Styl A": "public/style-1.css", // 
    "Styl B": "public/style-2.css",
    "Styl C": "public/style-3.css"  
};
const linkId = "app-style-link";

// Początkowy stan 
let currentStyleName: string = "Styl A";

// Funkcja usuwająca stary styl i dodająca nowy
const applyStyle = (styleName: string): void => { 
    currentStyleName = styleName; 
    
    const oldLink = document.getElementById(linkId);
    if (oldLink) {
        oldLink.remove();
    }
    const stylePath = styles[styleName];
    if (!stylePath) {
        console.error(`Brak ścieżki dla stylu: ${styleName}`);
        return;
    }
    const newLink = document.createElement("link");
    newLink.id = linkId;
    newLink.rel = "stylesheet";
    newLink.type = "text/css";
    newLink.href = stylePath; 
    const head = document.getElementsByTagName("head")[0];
    head.appendChild(newLink);
};

applyStyle(currentStyleName);

// Funkcja generująca linki
const renderStyleLinks = (containerId: string): void => {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Nie znaleziono kontenera o ID: ${containerId}`);
        return;
    }
    Object.keys(styles).forEach(styleName => {
        const link = document.createElement("a");
        link.textContent = styleName;
        link.href = "#"; 
        link.className = "style-link-item"; 
        link.addEventListener("click", (event) => {
            event.preventDefault(); 
            applyStyle(styleName); 
        });
        container.appendChild(link);
    });
};
document.addEventListener("DOMContentLoaded", () => {
    renderStyleLinks("style-links-container"); 
});