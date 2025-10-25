const fs = require('fs');
const path = require('path');

// Đọc file CSV
const csvFilePath = path.join(__dirname, 'full.csv');
const jsFilePath = path.join(__dirname, 'data.js');

try {
  // Đọc nội dung file CSV
  const csvContent = fs.readFileSync(csvFilePath, 'utf8');
  
  // Tách từng dòng
  const lines = csvContent.trim().split('\n');
  
  // Lấy header từ dòng đầu tiên
  const headers = parseCSVLine(lines[0]);
  
  // Tạo mảng dữ liệu
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    // Bỏ qua dòng trống
    if (values.every(v => v.trim() === '')) continue;
    
    // Tạo object cho mỗi dòng dữ liệu
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    
    data.push(record);
  }
  
  // Tạo nội dung file JS
  const jsContent = `// Dữ liệu được chuyển đổi từ file CSV
const candidateData = ${JSON.stringify(data, null, 2)};

// Xuất dữ liệu
if (typeof module !== 'undefined' && module.exports) {
  module.exports = candidateData;
}
`;
  
  // Ghi file JS
  fs.writeFileSync(jsFilePath, jsContent, 'utf8');
  
  console.log(`✅ Chuyển đổi thành công!`);
  console.log(`📄 File CSV: ${csvFilePath}`);
  console.log(`📄 File JS: ${jsFilePath}`);
  console.log(`📊 Tổng cộng: ${data.length} bản ghi`);
  
} catch (error) {
  console.error('❌ Lỗi:', error.message);
}

/**
 * Hàm để parse một dòng CSV
 * Xử lý các trường được bao quanh bởi dấu ngoặc kép
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let insideQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Xử lý dấu ngoặc kép được escape
        current += '"';
        i++;
      } else {
        // Toggle trạng thái inside quotes
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // Dấu phân cách cột
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Thêm phần tử cuối cùng
  result.push(current.trim());
  
  return result;
}
