/**
 * 終極 CSV 覆寫版 Google Apps Script Bridge (V7.0)
 * 
 * 運作原理：
 * App 會送出最純粹的「CSV 文字格式」。
 * 這個 Script 會利用 Google 原生的 Utilities.parseCsv() 解析 CSV，
 * 清空原來的 Sheet，然後「原封不動」把整個 CSV 貼上去。
 * 這是地球上最不可能出錯的寫法！
 *
 * 部署方法：
 * 1. 貼上這段程式碼並儲存。
 * 2. 點擊「部署」 -> 「管理部署」 -> 點擊 鉛筆圖示 (編輯)
 * 3. 版本必須選擇「新版本」 -> 點擊「部署」
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000); 

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    
    // 取出 POST 過來的純文字 (CSV 字串) 
    // 把 BOM (\uFEFF) 拿掉以免 Utilities.parseCsv 出錯
    var rawText = (e.postData ? e.postData.contents : "").replace(/^\uFEFF/, "");
    
    if (!rawText || rawText.trim() === "") {
      throw new Error("Empty CSV payload");
    }

    // Google Apps Script 內建的 CSV 解析器，無敵強大
    var csvData = Utilities.parseCsv(rawText);

    if (csvData.length > 0) {
      // 1. 暴力清空整張表！
      sheet.clearContents();
      
      // 2. 全部欄位設定為純文字格式，避免 Google 變聰明把電話號碼前面的 0 吃掉
      sheet.getRange("A:Z").setNumberFormat('@');
      
      // 3. 一次性把整個 CSV 陣列貼上去！ (行數, 列數 完全吻合)
      sheet.getRange(1, 1, csvData.length, csvData[0].length).setValues(csvData);
      
      // 4. 強制寫入硬碟
      SpreadsheetApp.flush();
    }

    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      action: "csv_overwritten", 
      rows: csvData.length 
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
