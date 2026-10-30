import { Creator } from '../types';

/**
 * Escapes a cell value for standard CSV compatibility.
 * Handles quotes, commas, newlines, and undefined/null values.
 */
function escapeCSVCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports an array of creators to CSV with full operator details.
 * Adds UTF-8 BOM (\uFEFF) so Excel and Google Sheets properly display Arabic and Latin text.
 */
export function exportCreatorsToCSV(creators: Creator[], filenamePrefix = 'zak_hitlist_creators'): void {
  if (!creators || creators.length === 0) {
    return;
  }

  const headers = [
    'Coach Name',
    'Instagram Handle',
    'Profile URL',
    'Operator Score (out of 10)',
    'Classification',
    'Pipeline Stage',
    'Followers Count',
    'Sub-Niche',
    'Current Bio Flaw',
    'Loom Opening Hook',
    'Lead Source',
    'Outreach Talked Status',
    'Scheduled Contact Date',
    'Last Talked Date',
    'Estimated MRR (DH)',
    'Actual MRR (DH)',
    'Touchpoints Count',
    'Operator Analysis & Notes',
    'Is Archived',
    'Archive Reason',
    'Archived At'
  ];

  const rows = creators.map((c) => [
    escapeCSVCell(c.name),
    escapeCSVCell(c.handle),
    escapeCSVCell(c.profileUrl || `https://instagram.com/${c.handle.replace('@', '')}`),
    escapeCSVCell(c.score ?? 5),
    escapeCSVCell(c.coachCategory),
    escapeCSVCell(c.status),
    escapeCSVCell(c.followers),
    escapeCSVCell(c.subNiche || ''),
    escapeCSVCell(c.bioFlaw || ''),
    escapeCSVCell(c.loomHook || ''),
    escapeCSVCell(c.source || ''),
    escapeCSVCell(c.talkedStatus || 'Pending'),
    escapeCSVCell(c.scheduledContactDate || ''),
    escapeCSVCell(c.lastTalkedDate || c.lastContactDate || ''),
    escapeCSVCell(c.estimatedMRR ?? ''),
    escapeCSVCell(c.actualMRR ?? ''),
    escapeCSVCell(c.touchpoints?.length ?? 0),
    escapeCSVCell(c.notes || ''),
    escapeCSVCell(c.isArchived ? 'Yes' : 'No'),
    escapeCSVCell(c.archiveReason || ''),
    escapeCSVCell(c.archivedAt || '')
  ]);

  const csvContent = '\uFEFF' + [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatFollowersShort(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
  return num.toLocaleString();
}

/**
 * Builds clean, standalone HTML string for printable dossier report.
 */
export function buildCreatorsHTMLReport(creators: Creator[], title = 'ZAK CRM — Hitlist Creators Dossier'): string {
  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const totalFollowers = creators.reduce((acc, c) => acc + (c.followers || 0), 0);
  const avgScore = creators.length > 0
    ? (creators.reduce((acc, c) => acc + (c.score || 5), 0) / creators.length).toFixed(1)
    : '0';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${title} - ${dateStr}</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 10mm;
        }
        * {
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #111;
          background: #fff;
          margin: 0;
          padding: 16px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 2px solid #000;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .brand {
          font-size: 18px;
          font-weight: 900;
          letter-spacing: -0.5px;
          text-transform: uppercase;
        }
        .subtitle {
          font-size: 11px;
          color: #666;
          margin-top: 2px;
          font-family: monospace;
        }
        .meta-stats {
          display: flex;
          gap: 12px;
          font-family: monospace;
          font-size: 11px;
        }
        .stat-badge {
          background: #f4f4f4;
          border: 1px solid #ddd;
          padding: 4px 8px;
          border-radius: 4px;
        }
        .stat-badge strong {
          color: #000;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10.5px;
          margin-top: 8px;
        }
        th {
          background: #f5f5f3;
          border: 1px solid #000;
          padding: 6px 8px;
          text-align: left;
          font-family: monospace;
          font-size: 9.5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        td {
          border: 1px solid #e0e0e0;
          padding: 6px 8px;
          vertical-align: top;
        }
        tr:nth-child(even) {
          background: #fafaf8;
        }
        .handle {
          font-family: monospace;
          color: #0055ff;
          font-size: 10px;
        }
        .score-pill {
          display: inline-block;
          font-weight: 700;
          padding: 2px 5px;
          border-radius: 3px;
          font-family: monospace;
          font-size: 10px;
          border: 1px solid #d97706;
          background: #fffbeb;
          color: #b45309;
        }
        .stage-pill {
          font-family: monospace;
          font-weight: 600;
          font-size: 9px;
          padding: 2px 6px;
          border-radius: 3px;
          border: 1px solid #888;
          display: inline-block;
        }
        .hook-text {
          font-size: 9.5px;
          color: #333;
          background: #fdfaf0;
          padding: 4px;
          border-radius: 3px;
          border-left: 2px solid #eab308;
          margin-top: 3px;
        }
        .footer {
          margin-top: 20px;
          font-size: 9px;
          color: #888;
          display: flex;
          justify-content: space-between;
          font-family: monospace;
          border-top: 1px solid #ddd;
          padding-top: 8px;
        }
        .no-print {
          margin-bottom: 16px;
          padding: 10px;
          background: #eef6ff;
          border: 1px solid #2563eb;
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .btn-print {
          background: #000;
          color: #fff;
          padding: 6px 14px;
          border: none;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          font-family: monospace;
        }
        @media print {
          .no-print {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="no-print">
        <span>📄 <strong>Printable Hitlist Report Ready</strong> — Click "Print to PDF" to save or print this document.</span>
        <button class="btn-print" onclick="window.print()">🖨️ PRINT TO PDF</button>
      </div>

      <div class="header">
        <div>
          <div class="brand">ZAK / Growth Operator CRM — Hitlist Executive Dossier</div>
          <div class="subtitle">Creator Prospects &amp; Active Partner Benchmarks Export</div>
        </div>
        <div class="meta-stats">
          <div class="stat-badge">Total Selected: <strong>${creators.length}</strong></div>
          <div class="stat-badge">Total Reach: <strong>${formatFollowersShort(totalFollowers)}</strong></div>
          <div class="stat-badge">Avg Score: <strong>${avgScore} / 10</strong></div>
          <div class="stat-badge">Export Date: <strong>${dateStr}</strong></div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 24px;">#</th>
            <th style="width: 140px;">Coach &amp; Handle</th>
            <th style="width: 50px;">Score</th>
            <th style="width: 60px;">Followers</th>
            <th style="width: 85px;">Stage</th>
            <th style="width: 110px;">Sub-Niche</th>
            <th>Current Bio Flaw &amp; Vulnerability</th>
            <th>Loom Hook / Cold DM Angle</th>
            <th style="width: 85px;">Talked Status</th>
          </tr>
        </thead>
        <tbody>
          ${creators.map((c, idx) => `
            <tr>
              <td style="font-family: monospace; font-size: 9px; opacity: 0.7;">${idx + 1}</td>
              <td>
                <strong>${c.name}</strong><br/>
                <span class="handle">${c.handle}</span>
                ${c.coachCategory !== 'Prospect' ? `<br/><span style="font-size: 8.5px; font-family: monospace; color: #555;">[${c.coachCategory}]</span>` : ''}
              </td>
              <td>
                <span class="score-pill">${c.score ?? 5}/10</span>
              </td>
              <td style="font-family: monospace; font-weight: bold;">
                ${formatFollowersShort(c.followers)}
              </td>
              <td>
                <span class="stage-pill">${c.status}</span>
              </td>
              <td style="font-size: 9.5px;">
                ${c.subNiche || c.niche || '—'}
              </td>
              <td style="font-size: 9.5px; color: #444;">
                ${c.bioFlaw ? `<strong>Bio Flaw:</strong> ${c.bioFlaw}` : (c.notes || '—')}
              </td>
              <td>
                ${c.loomHook ? `<div class="hook-text">${c.loomHook}</div>` : '—'}
              </td>
              <td style="font-size: 9px; font-family: monospace;">
                ${c.talkedStatus || 'Pending'}<br/>
                <span style="color: #888;">${c.lastTalkedDate || c.lastContactDate || ''}</span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <span>Confidential Dossier — Generated by ZAK Growth Partner Engine</span>
        <span>Page 1 of 1 • ${dateStr}</span>
      </div>
    </body>
    </html>
  `;
}

/**
 * Direct print trigger using DOM injection into main document.
 * Guarantees print dialog works across all browsers and sandboxed environments.
 */
export function printCreatorsDossier(creators: Creator[], title = 'ZAK CRM — Hitlist Creators Dossier'): void {
  if (!creators || creators.length === 0) return;

  // 1. Get or create the printable container in main document
  let printRoot = document.getElementById('zak-print-dossier-root');
  if (!printRoot) {
    printRoot = document.createElement('div');
    printRoot.id = 'zak-print-dossier-root';
    document.body.appendChild(printRoot);
  }

  // 2. Populate inner HTML
  printRoot.innerHTML = buildCreatorsHTMLReport(creators, title);

  // 3. Trigger main window print directly
  setTimeout(() => {
    try {
      window.print();
    } catch (e) {
      console.warn('Direct window.print() was blocked or failed:', e);
    }
  }, 100);
}

/**
 * Exports printable HTML report as a standalone downloadable file.
 * Allows opening in any browser tab to view or print to PDF with zero iframe issues.
 */
export function downloadHTMLReport(creators: Creator[], filenamePrefix = 'zak_hitlist_dossier'): void {
  if (!creators || creators.length === 0) return;

  const htmlContent = buildCreatorsHTMLReport(creators);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${dateStr}.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
