/**
 * =========================================================================
 * 🌐 The Insights Solution (TIS) - Master CMS Universal API Engine
 * =========================================================================
 * Bound to Google Sheet: TIS_Academy_Master_DB
 */

const TABS = [
  "SITE_Config",
  "HOME_About",
  "HOME_Projects",
  "FREE_Excel_Hacks",
  "FREE_Videos",
  "FREE_Articles",
  "COURSE_Excel",
  "COURSE_PowerQuery",
  "COURSE_PowerBI",
  "COURSE_SQL",
  "TEST_Reviews"
];

function doGet(e) {
  try {
    const params = e ? e.parameter : {};
    const requestedTab = params.tab;
    const forceRefresh = params.nocache === "1" || params.refresh === "true";
    const cache = CacheService.getScriptCache();
    
    if (requestedTab) {
      const cacheKey = "TIS_TAB_" + requestedTab;
      if (!forceRefresh) {
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
          return createJsonResponse({ status: "success", cached: true, tab: requestedTab, data: JSON.parse(cachedData) });
        }
      }
      
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(requestedTab);
      if (!sheet) {
        return createJsonResponse({ status: "error", message: "Tab not found: " + requestedTab });
      }
      
      const data = getSheetRowsAsJson(sheet);
      try { cache.put(cacheKey, JSON.stringify(data), 600); } catch (err) {}
      return createJsonResponse({ status: "success", cached: false, tab: requestedTab, data: data });
    }
    
    const masterCacheKey = "TIS_MASTER_ALL";
    if (!forceRefresh) {
      const cachedMaster = cache.get(masterCacheKey);
      if (cachedMaster) return createJsonResponse(JSON.parse(cachedMaster));
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const result = { status: "success", timestamp: new Date().toISOString() };
    
    TABS.forEach(tabName => {
      const sheet = ss.getSheetByName(tabName);
      result[tabName] = sheet ? getSheetRowsAsJson(sheet) : [];
    });
    
    try { cache.put(masterCacheKey, JSON.stringify(result), 300); } catch (err) {}
    return createJsonResponse(result);
    
  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

function getSheetRowsAsJson(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0].map(h => String(h).trim());
  const rows = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row.every(cell => cell === "" || cell === null || cell === undefined)) continue;
    
    const obj = {};
    headers.forEach((header, colIdx) => {
      let val = row[colIdx];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      obj[header] = val;
    });
    
    if (obj.hasOwnProperty("Is_Active") && (obj.Is_Active === false || obj.Is_Active === "FALSE")) continue;
    if (obj.hasOwnProperty("Display") && (obj.Display === false || obj.Display === "FALSE")) continue;
    
    rows.push(obj);
  }
  
  if (rows.length > 0 && rows[0].hasOwnProperty("Order")) {
    rows.sort((a, b) => (Number(a.Order) || 999) - (Number(b.Order) || 999));
  }
  
  return rows;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
