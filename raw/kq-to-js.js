const fs = require('fs');
const path = require('path');

// Đọc file CSV
const csvFilePath = path.join(__dirname, 'kq.csv');
const outputPath = path.join(__dirname, '..', 'assets', 'js', 'kq-data.js');

const csvData = fs.readFileSync(csvFilePath, 'utf8');
const lines = csvData.split('\n').filter(line => line.trim());

// Bỏ dòng header
const header = lines[0].split(',').map(h => h.trim());
const dataLines = lines.slice(1);

const results = [];

dataLines.forEach((line, index) => {
    // Parse CSV với dấu phẩy trong chuỗi
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim());
    
    if (values.length >= 12) {
        const obj = {
            'STT': values[0] || '',
            'Phòng thi': values[1] || '',
            'SBD': values[2] || '',
            'Họ tên': values[3] || '',
            'Ngày sinh': values[4] || '',
            'Giới tính': values[5] || '',
            'Vị trí dự tuyển': values[6] || '',
            'Tên trường NV1': values[7] || '',
            'Tên Trường NV2': values[8] || '',
            'Điểm Diện UT': values[9] || '',
            'Điểm bài thi viết': values[10] || '',
            'Tổng điểm': values[11] || '',
            'Ghi chú': values[12] || ''
        };
        
        results.push(obj);
    }
});

// Ghi ra file JS
const jsContent = `// Dữ liệu kết quả thi được chuyển đổi từ file CSV
const resultData = ${JSON.stringify(results, null, 2)};
`;

fs.writeFileSync(outputPath, jsContent, 'utf8');
console.log(`✅ Đã chuyển đổi ${results.length} bản ghi kết quả thi từ CSV sang JS`);
console.log(`📁 File output: ${outputPath}`);
