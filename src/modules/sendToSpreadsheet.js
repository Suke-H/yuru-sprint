const { sheets, auth } = require('@googleapis/sheets');
const config = require('../config');

// CI/CD時の問題: IDに空白と""が含まれることがあるためトリムする
const cleanSpreadsheetId = (config.SPREADSHEET_ID || '').replace(/"/g, '').trim();
const sheetName = (config.SHEET_NAME || '週間レポート').replace(/"/g, '').trim();

// 認証は Application Default Credentials (ADC) を使用
// - Cloud Run: サービスに紐づくサービスアカウントで自動認証
// - ローカル: GOOGLE_APPLICATION_CREDENTIALS にサービスアカウントキーのパスを指定
const googleAuth = new auth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheetsClient = sheets({ version: 'v4', auth: googleAuth });

function nowInJST() {
  return new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
}

async function sendWeeklyDataToSpreadsheet(period, userName, completedTasks, incompleteTasks, feedback) {
  if (!cleanSpreadsheetId) {
    throw new Error('SPREADSHEET_ID is not set');
  }

  try {
    // 列順: 期間 | ゆるゆる走者 | 完了タスク | 未完了タスク | 感想 | 記録日時
    const row = [period, userName, completedTasks, incompleteTasks, feedback, nowInJST()];

    console.log('Sending request to Google Sheets API');
    console.log('Row data:', JSON.stringify(row));

    const response = await sheetsClient.spreadsheets.values.append({
      spreadsheetId: cleanSpreadsheetId,
      range: `'${sheetName}'!A:F`,
      // RAW: 入力値を数式として解釈させない（感想が "=" で始まっても文字列のまま保存）
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    });

    console.log('Data successfully added to Spreadsheet');
    console.log('Updated range:', response.data.updates && response.data.updates.updatedRange);
    return response.data;
  } catch (error) {
    console.error('Error adding data to Spreadsheet:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw error;
  }
}

module.exports = {
  sendWeeklyDataToSpreadsheet
};
