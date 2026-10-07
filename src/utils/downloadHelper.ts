/**
 * Multi-tier robust download helper designed to work seamlessly across
 * desktop browsers (Chrome, Edge, Firefox, Safari), mobile devices, and sandboxed iframes.
 */

export function downloadTextFile(content: string, filename: string, mimeType: string = 'text/plain'): boolean {
  // Try Method 1: Client-side Blob download
  try {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1200);

    return true;
  } catch (blobErr) {
    console.warn('Client-side blob download error, trying server form fallback:', blobErr);
  }

  // Try Method 2: Server-side attachment endpoint
  try {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/download/export';
    form.style.display = 'none';

    const fnInput = document.createElement('input');
    fnInput.type = 'hidden';
    fnInput.name = 'filename';
    fnInput.value = filename;
    form.appendChild(fnInput);

    const mimeInput = document.createElement('input');
    mimeInput.type = 'hidden';
    mimeInput.name = 'mimeType';
    mimeInput.value = `${mimeType};charset=utf-8`;
    form.appendChild(mimeInput);

    const contentInput = document.createElement('input');
    contentInput.type = 'hidden';
    contentInput.name = 'content';
    contentInput.value = content;
    form.appendChild(contentInput);

    document.body.appendChild(form);
    form.submit();

    setTimeout(() => {
      document.body.removeChild(form);
    }, 1200);

    return true;
  } catch (formErr) {
    console.warn('Server form download error, trying Data URI:', formErr);
  }

  // Try Method 3: Data URI fallback
  try {
    const encoded = encodeURIComponent(content);
    const dataUri = `data:${mimeType};charset=utf-8,${encoded}`;
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
    }, 1200);

    return true;
  } catch (dataErr) {
    console.error('All download methods failed:', dataErr);
    return false;
  }
}

/**
 * Copies content to clipboard with a robust fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (e) {
    console.error('Clipboard copy failed:', e);
    return false;
  }
}
