// Credit: https://usehooks-ts.com/
import { useState } from 'react';

export type CopiedValue = string | null;
export type CopyFn = (text: string) => Promise<boolean>;
export type UseClipboardReturn = [CopiedValue, CopyFn];

/**
 * navigator.clipboard only exists in secure contexts (HTTPS or localhost).
 * Over plain HTTP, fall back to the legacy select-and-copy trick.
 */
function legacyCopy(text: string): boolean {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        return document.execCommand('copy');
    } catch {
        return false;
    } finally {
        document.body.removeChild(textarea);
    }
}

export function useClipboard(): UseClipboardReturn {
    const [copiedText, setCopiedText] = useState<CopiedValue>(null);

    const copy: CopyFn = async (text) => {
        let ok = false;

        try {
            if (navigator?.clipboard) {
                await navigator.clipboard.writeText(text);
                ok = true;
            } else {
                ok = legacyCopy(text);
            }
        } catch (error) {
            console.warn('Copy failed', error);
            ok = legacyCopy(text);
        }

        setCopiedText(ok ? text : null);

        return ok;
    };

    return [copiedText, copy];
}
