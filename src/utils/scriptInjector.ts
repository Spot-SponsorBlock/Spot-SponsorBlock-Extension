export function injectScript(src: string) {
    const url = (chrome || browser).runtime.getURL(src);
    const docScript = document.createElement("script");
    docScript.id = "sponsorblock-document-script";
    docScript.src = url;

    const head = (document.head || document.documentElement);
    const existingScript = document.getElementById("sponsorblock-document-script");
    if (head && (!existingScript)) {
        head.appendChild(docScript);
    }
}