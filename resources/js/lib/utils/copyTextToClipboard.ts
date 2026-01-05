export async function copyTextToClipboard(text: string, onCopied?: () => void): Promise<void> {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            onCopied?.();
            return;
        }
    } catch {
        // Si falla la API moderna, fallback abajo
    }

    // Fallback para navegadores antiguos
    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        // Evitar scroll al crear textarea
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
            onCopied?.();
        } else {
            throw new Error('Fallback: No se pudo copiar el texto');
        }
    } catch {
        // No se pudo copiar (ni con fallback)
        console.error('No se pudo copiar el texto al portapapeles');
    }
}
