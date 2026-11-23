import { siteConfig } from "@/lib/site";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type EmailLayoutOptions = {
  preview: string;
  title: string;
  greeting: string;
  body: string[];
  buttonLabel: string;
  buttonUrl: string;
  footerNote?: string;
};

export function renderEmailHtml(options: EmailLayoutOptions) {
  const { preview, title, greeting, body, buttonLabel, buttonUrl, footerNote } = options;

  const paragraphs = body
    .map(
      (line) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#3d342c">${escapeHtml(line)}</p>`
    )
    .join("");

  const footer = footerNote
    ? `<p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#8a7b6d">${escapeHtml(footerNote)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f3ece3;font-family:Georgia,'Times New Roman',serif">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preview)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3ece3;padding:32px 16px">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf9;border:1px solid #e8ddd0;border-radius:20px;overflow:hidden;box-shadow:0 18px 40px rgba(61,42,26,0.08)">
          <tr>
            <td style="padding:28px 32px 18px;background:linear-gradient(135deg,#6f4c27 0%,#8a6238 100%)">
              <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.72)">Школа бачаты</p>
              <h1 style="margin:0;font-size:28px;line-height:1.2;color:#fff7ef;font-weight:600">${escapeHtml(siteConfig.name)}</h1>
              <p style="margin:10px 0 0;font-size:14px;line-height:1.5;color:rgba(255,247,239,0.88)">${escapeHtml(siteConfig.slogan)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px">
              <p style="margin:0 0 18px;font-size:18px;line-height:1.5;color:#2a2119">${escapeHtml(greeting)}</p>
              ${paragraphs}
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px">
                <tr>
                  <td style="border-radius:12px;background:#6f4c27">
                    <a href="${buttonUrl}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:600;color:#fff7ef;text-decoration:none;border-radius:12px">${escapeHtml(buttonLabel)}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:#8a7b6d">
                Если кнопка не открывается, скопируйте ссылку:<br />
                <a href="${buttonUrl}" style="color:#6f4c27;word-break:break-all">${buttonUrl}</a>
              </p>
              ${footer}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px 24px;border-top:1px solid #efe4d7;background:#faf6f0">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#9a8b7c;text-align:center">
                ${escapeHtml(siteConfig.fullName)} · ${escapeHtml(siteConfig.contacts.email)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderVerificationCodeEmailHtml(options: {
  preview: string;
  title: string;
  greeting: string;
  body: string[];
  code: string;
  footerNote?: string;
}) {
  const { preview, title, greeting, body, code, footerNote } = options;

  const paragraphs = body
    .map(
      (line) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#3d342c">${escapeHtml(line)}</p>`
    )
    .join("");

  const footer = footerNote
    ? `<p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#8a7b6d">${escapeHtml(footerNote)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f3ece3;font-family:Georgia,'Times New Roman',serif">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preview)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3ece3;padding:32px 16px">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf9;border:1px solid #e8ddd0;border-radius:20px;overflow:hidden;box-shadow:0 18px 40px rgba(61,42,26,0.08)">
          <tr>
            <td style="padding:28px 32px 18px;background:linear-gradient(135deg,#6f4c27 0%,#8a6238 100%)">
              <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.72)">Школа бачаты</p>
              <h1 style="margin:0;font-size:28px;line-height:1.2;color:#fff7ef;font-weight:600">${escapeHtml(siteConfig.name)}</h1>
              <p style="margin:10px 0 0;font-size:14px;line-height:1.5;color:rgba(255,247,239,0.88)">${escapeHtml(siteConfig.slogan)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px">
              <p style="margin:0 0 18px;font-size:18px;line-height:1.5;color:#2a2119">${escapeHtml(greeting)}</p>
              ${paragraphs}
              <p style="margin:24px 0 8px;font-size:14px;color:#8a7b6d">Код подтверждения:</p>
              <p style="margin:0;font-size:36px;line-height:1.2;letter-spacing:0.28em;font-weight:700;color:#6f4c27">${escapeHtml(code)}</p>
              ${footer}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px 24px;border-top:1px solid #efe4d7;background:#faf6f0">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#9a8b7c;text-align:center">
                ${escapeHtml(siteConfig.fullName)} · ${escapeHtml(siteConfig.contacts.email)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderVerificationCodeEmailText(options: {
  greeting: string;
  body: string[];
  code: string;
  footerNote?: string;
}) {
  return [
    options.greeting,
    "",
    ...options.body,
    "",
    `Код подтверждения: ${options.code}`,
    "",
    options.footerNote ?? "",
    "",
    siteConfig.fullName,
  ]
    .filter(Boolean)
    .join("\n");
}

export function renderEmailText(options: Omit<EmailLayoutOptions, "preview"> & { linkLabel: string }) {
  return [
    options.greeting,
    "",
    ...options.body,
    "",
    `${options.linkLabel}: ${options.buttonUrl}`,
    "",
    options.footerNote ?? "",
    "",
    siteConfig.fullName,
  ]
    .filter(Boolean)
    .join("\n");
}

