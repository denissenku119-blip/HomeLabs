import { isNativePlatform, isPluginAvailable } from '@/services/platform.service';

/**
 * Builds a self-contained HTML document from the report that is currently on
 * screen. Reusing the rendered report keeps the download identical to what the
 * app calculated — no second report or calculation system.
 */
export async function buildReportDocument(root: HTMLElement, title: string): Promise<string> {
  const clone = root.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.report-no-print').forEach((el) => el.remove());
  // Offline: no scripts, no external links, every image inlined as a data URI.
  clone.querySelectorAll('script, link, iframe').forEach((el) => el.remove());
  for (const img of Array.from(clone.querySelectorAll('img'))) {
    const src = img.getAttribute('src') || '';
    if (src.startsWith('data:')) continue;
    try {
      const blob = await (await fetch(src)).blob();
      img.setAttribute('src', await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.onerror = rej;
        r.readAsDataURL(blob);
      }));
    } catch {
      img.remove();
    }
    img.removeAttribute('srcset');
  }
  let css = '';
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        // Drop rules that would fetch anything (web fonts, imports, url() images);
        // the report falls back to the device's system fonts.
        if (rule.type === CSSRule.IMPORT_RULE || rule.type === CSSRule.FONT_FACE_RULE) continue;
        css += rule.cssText.replace(/url\((?!\s*['"]?data:)[^)]*\)/g, 'none') + '\n';
      }
    } catch {
      // cross-origin stylesheet (fonts) — skipped
    }
  }
  const html = document.documentElement;
  const esc = (v: string) => v.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
  return `<!doctype html>
<html lang="${esc(html.lang || 'en')}" dir="${esc(html.dir || 'ltr')}" class="${esc(html.className)}">
<head>
<meta charset="utf-8" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<style>${css}</style>
</head>
<body class="${esc(document.body.className)}">${clone.outerHTML}</body>
</html>`;
}

export function reportFileName(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'report';
  const date = new Date().toISOString().slice(0, 10);
  return `${slug}-report-${date}.html`;
}

export type ReportSaveResult =
  | { ok: true; method: 'download' | 'native'; savedPath?: string }
  | { ok: false; error: string };

/** Folder inside the device's shared Documents folder used for saved reports. */
export const NATIVE_REPORT_FOLDER = 'HomeLab Architect';

/**
 * Web: triggers a real file download. Android/iOS app: WebViews ignore
 * download links, so the file is written to app storage and handed to the
 * system share sheet (save to Files/Drive, open in a browser, or print).
 */
export async function saveReportDocument(html: string, fileName: string, title: string, mimeType = 'text/html;charset=utf-8'): Promise<ReportSaveResult> {
  try {
    if (isNativePlatform()) {
      if (!isPluginAvailable('Filesystem') || !isPluginAvailable('Share')) {
        return { ok: false, error: 'unavailable' };
      }
      const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
      const { Share } = await import('@capacitor/share');
      // Prefer a permanent copy in the shared Documents folder (no storage
      // permission needed on Android 11+ for files the app creates). If the
      // device refuses, fall back to app storage and rely on the share sheet.
      let uri: string;
      let savedPath: string | undefined;
      try {
        const written = await Filesystem.writeFile({
          path: `${NATIVE_REPORT_FOLDER}/${fileName}`,
          data: html,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
          recursive: true,
        });
        // Read back so success is only reported for a file that really exists.
        await Filesystem.stat({ path: `${NATIVE_REPORT_FOLDER}/${fileName}`, directory: Directory.Documents });
        uri = written.uri;
        savedPath = `Documents/${NATIVE_REPORT_FOLDER}/${fileName}`;
      } catch {
        const written = await Filesystem.writeFile({
          path: fileName,
          data: html,
          directory: Directory.Data,
          encoding: Encoding.UTF8,
        });
        await Filesystem.stat({ path: fileName, directory: Directory.Data });
        uri = written.uri;
      }
      try {
        await Share.share({ title, files: [uri], dialogTitle: title });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // The file is already saved permanently; closing the menu is fine.
        if (/cancel/i.test(msg)) return savedPath ? { ok: true, method: 'native', savedPath } : { ok: false, error: 'cancelled' };
        if (!savedPath) throw err;
      }
      return { ok: true, method: 'native', savedPath };
    }
    const blob = new Blob([html], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return { ok: true, method: 'download' };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
