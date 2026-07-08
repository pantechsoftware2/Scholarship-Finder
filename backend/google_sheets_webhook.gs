function doPost(e) {
  try {
    const SPREADSHEET_ID = "1cQfQHxBTN8_7pT2VDr8An-MpebXuppJLG7GTzLqp9Ew";
    const SHEET_NAME = "Sheet1";

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];

    if (!sheet) {
      throw new Error("Sheet not found");
    }

    if (!e || !e.postData || !e.postData.contents) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: "No POST data received. This function must be called via HTTP POST."
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = JSON.parse(e.postData.contents);

    const row = [
      data.timestamp || "",
      data.name || "",
      data.email || "",
      data.phone || "",
      data.target_degree || "",
      data.gpa || "",
      (data.countries || []).join(", "),
      data.major || "",
      data.work_experience || "",
      data.test_scores || "",
      data.ai_summary_probability ?? "",
      data.scholarships_count ?? 0,
      data.top_scholarship_name || "",
      data.top_scholarship_amount || "",
      data.top_scholarship_deadline || "",
      data.top_scholarship_match_score || "",
      data.top_scholarship_reason || "",
      data.top_scholarship_strategy_tip || "",
      data.top_scholarships_summary || "",
      data.profile_highlight || "",
      JSON.stringify(data.scholarships || []),
      data.current_degree || "",
      data.nationality || "",
      data.intended_intake || "",
      data.english_test_taken || "",
      data.ielts || "",
      data.toefl || "",
      data.pte || "",
      data.duolingo || ""
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("Error: " + err);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: err.message || "Unknown error"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
