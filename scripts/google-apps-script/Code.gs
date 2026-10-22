/**
 * VECODERS registrations → Google Sheets bridge.
 *
 * Deploy from the Google account that should own the sheets (jmkevin2006@gmail.com):
 *   1. script.google.com → New project → paste this file.
 *   2. Project Settings → Script Properties:
 *        SHARED_SECRET = <same value as GOOGLE_SCRIPT_SECRET in Vercel/.env>
 *        FOLDER_ID     = <optional Drive folder ID for the sheets>
 *   3. Deploy → New deployment → Web app. Execute as: Me. Who has access: Anyone.
 *   4. Copy the /exec URL into GOOGLE_SCRIPT_URL.
 * After editing this file, use Deploy → Manage deployments → Edit → New version
 * so the same URL keeps working.
 *
 * Because the script runs as its owner, every sheet it creates is owned by that account.
 */

// Opening the web app URL in a browser sends a GET. Answer it so it's a quick health
// check instead of a "Script function not found" failure; it never touches any sheet.
function doGet() {
  return json_({ ok: true, message: 'VECODERS sheets bridge is running. Use POST.' });
}

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var secret = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
    if (!secret || body.secret !== secret) return json_({ ok: false, error: 'unauthorized' });

    if (body.action === 'createSheet') return json_(createSheet_(body));
    if (body.action === 'appendRow') return json_(appendRow_(body));
    return json_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function createSheet_(body) {
  var ss = SpreadsheetApp.create('VECODERS – ' + (body.title || 'Event') + ' Registrations');
  var sheet = ss.getSheets()[0];
  sheet.setName('Registrations');
  var headers = body.headers || [];
  if (headers.length) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  var folderId = PropertiesService.getScriptProperties().getProperty('FOLDER_ID');
  if (folderId) DriveApp.getFileById(ss.getId()).moveTo(DriveApp.getFolderById(folderId));

  return { ok: true, id: ss.getId(), url: ss.getUrl() };
}

function appendRow_(body) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = SpreadsheetApp.openById(body.id).getSheets()[0];
    var row = body.row || [];
    // Teams larger than the original header (event max raised later) get extra header cells.
    var headers = body.headers || [];
    if (headers.length > sheet.getLastColumn()) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    }
    sheet.appendRow(row);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
