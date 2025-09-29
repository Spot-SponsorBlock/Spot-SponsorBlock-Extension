export function injectScript(src: string) {
    const docScript = document.createElement("script");
    docScript.id = "sponsorblockreativK-document-script";
    docScript.innerHTML = src;

    const head = (document.head || document.documentElement);
    const existingScript = document.getElementById("sponsorblockreativK-document-script");
    if (head && (!existingScript)) {
        head.appendChild(docScript);
    }
}