// Biến toàn cục
let currentCandidate = null;
let allResults = [];
let charts = {};

// Khởi tạo
function init() {
    if (typeof resultData !== 'undefined') {
        allResults = resultData;
        console.log(`Đã tải ${allResults.length} kết quả thi`);
    }
    
    // Lắng nghe sự kiện Enter
    document.getElementById('searchInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            searchCandidate();
        }
    });
}

// Tìm kiếm thí sinh
function searchCandidate() {
    const searchValue = document.getElementById('searchInput').value.trim();
    
    if (!searchValue) {
        alert('⚠️ Vui lòng nhập SBD hoặc tên thí sinh để tìm kiếm!');
        return;
    }
    
    // Ẩn tất cả các section
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('notFoundSection').style.display = 'none';
    document.getElementById('suggestionSection').style.display = 'none';
    
    // Tìm kiếm chính xác theo SBD
    let candidate = allResults.find(c => 
        c.SBD.toUpperCase() === searchValue.toUpperCase()
    );
    
    // Nếu không tìm thấy theo SBD, tìm theo tên
    if (!candidate) {
        const candidates = allResults.filter(c => 
            c['Họ tên'].toLowerCase().includes(searchValue.toLowerCase())
        );
        
        if (candidates.length === 1) {
            candidate = candidates[0];
        } else if (candidates.length > 1) {
            // Hiển thị danh sách gợi ý
            showSuggestions(candidates);
            return;
        }
    }
    
    if (candidate) {
        currentCandidate = candidate;
        displayResult(candidate);
    } else {
        document.getElementById('notFoundSection').style.display = 'block';
    }
}

// Hiển thị danh sách gợi ý
function showSuggestions(candidates) {
    const suggestionSection = document.getElementById('suggestionSection');
    const suggestionList = document.getElementById('suggestionList');
    
    suggestionList.innerHTML = '';
    
    candidates.forEach(c => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.innerHTML = `
            <div class="suggestion-name">${c['Họ tên']}</div>
            <div class="suggestion-info">SBD: ${c.SBD} | ${c['Vị trí dự tuyển']} | ${c['Ngày sinh']}</div>
        `;
        item.onclick = () => {
            currentCandidate = c;
            displayResult(c);
            suggestionSection.style.display = 'none';
        };
        suggestionList.appendChild(item);
    });
    
    suggestionSection.style.display = 'block';
}

// Hiển thị kết quả
function displayResult(candidate) {
    // Hiển thị section kết quả
    document.getElementById('resultSection').style.display = 'block';
    
    // Thông tin cơ bản
    document.getElementById('sbd').textContent = candidate.SBD || '-';
    document.getElementById('room').textContent = candidate['Phòng thi'] || '-';
    document.getElementById('name').textContent = candidate['Họ tên'] || '-';
    document.getElementById('dob').textContent = candidate['Ngày sinh'] || '-';
    document.getElementById('gender').textContent = candidate['Giới tính'] || '-';
    document.getElementById('position').textContent = candidate['Vị trí dự tuyển'] || '-';
    
    // Điểm số
    const bonusScore = candidate['Điểm Diện UT'];
    const testScore = candidate['Điểm bài thi viết'];
    const totalScore = candidate['Tổng điểm'];
    
    document.getElementById('bonusScore').textContent = bonusScore || '0';
    document.getElementById('testScore').textContent = testScore || 'Bỏ thi';
    document.getElementById('totalScore').textContent = totalScore || 'Bỏ thi';
    
    // Kiểm tra bỏ thi
    const isAbsent = testScore === 'Bỏ thi' || !testScore || testScore.trim() === '';
    
    if (isAbsent) {
        document.getElementById('testScore').style.color = '#e74c3c';
        document.getElementById('totalScore').style.color = '#e74c3c';
    } else {
        document.getElementById('testScore').style.color = '#2ecc71';
        document.getElementById('totalScore').style.color = '#2ecc71';
    }
    
    // Nguyện vọng 1
    const nv1 = candidate['Tên trường NV1'];
    document.getElementById('nv1').textContent = nv1 || 'Không có';
    
    if (nv1 && nv1.trim()) {
        const nv1Stats = calculateCompetitionStats(candidate, nv1, 'NV1');
        document.getElementById('nv1Count').textContent = nv1Stats.total;
        document.getElementById('nv1Ratio').textContent = `1:${nv1Stats.ratio}`;
        document.getElementById('nv1Rank').textContent = isAbsent ? 'Bỏ thi' : `${nv1Stats.rank}/${nv1Stats.total}`;
    } else {
        document.getElementById('nv1Count').textContent = '-';
        document.getElementById('nv1Ratio').textContent = '-';
        document.getElementById('nv1Rank').textContent = '-';
    }
    
    // Nguyện vọng 2
    const nv2 = candidate['Tên Trường NV2'];
    document.getElementById('nv2').textContent = nv2 || 'Không có';
    
    if (nv2 && nv2.trim()) {
        const nv2Stats = calculateCompetitionStats(candidate, nv2, 'NV2');
        document.getElementById('nv2Count').textContent = nv2Stats.total;
        document.getElementById('nv2Ratio').textContent = `1:${nv2Stats.ratio}`;
        document.getElementById('nv2Rank').textContent = isAbsent ? 'Bỏ thi' : `${nv2Stats.rank}/${nv2Stats.total}`;
    } else {
        document.getElementById('nv2Count').textContent = '-';
        document.getElementById('nv2Ratio').textContent = '-';
        document.getElementById('nv2Rank').textContent = '-';
    }
    
    // Ghi chú
    const note = candidate['Ghi chú'];
    if (note && note.trim()) {
        document.getElementById('noteSection').style.display = 'block';
        document.getElementById('note').textContent = note;
    } else {
        document.getElementById('noteSection').style.display = 'none';
    }
    
    // Vẽ biểu đồ
    setTimeout(() => {
        drawCharts(candidate);
    }, 100);
    
    // Hiển thị danh sách thí sinh cùng nguyện vọng
    displayNV1Competitors(candidate);
    displayNV2Competitors(candidate);
    
    // Cuộn đến kết quả
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Tính toán thống kê cạnh tranh
function calculateCompetitionStats(candidate, school, wishType) {
    const position = candidate['Vị trí dự tuyển'];
    const totalScoreStr = candidate['Tổng điểm'];
    const totalScore = parseFloat(totalScoreStr);
    
    // Lọc thí sinh cùng vị trí và cùng nguyện vọng
    const competitors = allResults.filter(c => {
        const samePosition = c['Vị trí dự tuyển'] === position;
        const sameSchool = wishType === 'NV1' 
            ? c['Tên trường NV1'] === school
            : c['Tên Trường NV2'] === school;
        const hasScore = c['Tổng điểm'] && c['Tổng điểm'] !== 'Bỏ thi' && c['Tổng điểm'].trim() !== '';
        
        return samePosition && sameSchool && hasScore;
    });
    
    // Sắp xếp theo điểm giảm dần
    competitors.sort((a, b) => {
        const scoreA = parseFloat(a['Tổng điểm']);
        const scoreB = parseFloat(b['Tổng điểm']);
        return scoreB - scoreA;
    });
    
    // Tìm thứ hạng
    let rank = '-';
    if (!isNaN(totalScore) && totalScoreStr && totalScoreStr !== 'Bỏ thi') {
        rank = competitors.findIndex(c => c.SBD === candidate.SBD) + 1;
        if (rank === 0) rank = '-';
    }
    
    const total = competitors.length;
    const ratio = total > 0 ? total.toFixed(1) : '0';
    
    return { total, ratio, rank };
}

// Vẽ biểu đồ
function drawCharts(candidate) {
    // Hủy biểu đồ cũ
    Object.values(charts).forEach(chart => {
        if (chart && chart.destroy) chart.destroy();
    });
    charts = {};
    
    const position = candidate['Vị trí dự tuyển'];
    const totalScoreStr = candidate['Tổng điểm'];
    const totalScore = parseFloat(totalScoreStr);
    
    // Lấy tất cả điểm theo vị trí
    const positionScores = allResults
        .filter(c => c['Vị trí dự tuyển'] === position && c['Tổng điểm'] && c['Tổng điểm'] !== 'Bỏ thi' && c['Tổng điểm'].trim() !== '')
        .map(c => parseFloat(c['Tổng điểm']))
        .filter(s => !isNaN(s));
    
    // Phân bố điểm theo khoảng
    const scoreBins = {};
    const binSize = 5;
    
    positionScores.forEach(score => {
        const bin = Math.floor(score / binSize) * binSize;
        const binLabel = `${bin}-${bin + binSize}`;
        scoreBins[binLabel] = (scoreBins[binLabel] || 0) + 1;
    });
    
    const sortedBins = Object.keys(scoreBins).sort((a, b) => {
        const aStart = parseInt(a.split('-')[0]);
        const bStart = parseInt(b.split('-')[0]);
        return aStart - bStart;
    });
    
    // Biểu đồ phân bố điểm
    const ctx1 = document.getElementById('scoreDistChart');
    if (ctx1) {
        charts.scoreDistChart = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: sortedBins,
                datasets: [{
                    label: 'Số thí sinh',
                    data: sortedBins.map(bin => scoreBins[bin]),
                    backgroundColor: sortedBins.map(bin => {
                        const binStart = parseInt(bin.split('-')[0]);
                        const binEnd = binStart + binSize;
                        return (!isNaN(totalScore) && totalScore >= binStart && totalScore < binEnd) 
                            ? '#3498db' 
                            : '#95a5a6';
                    }),
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Số thí sinh: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
        
        // Hiển thị vị trí của thí sinh
        if (!isNaN(totalScore)) {
            document.getElementById('yourPositionText').textContent = 
                `🎯 Điểm của bạn (${totalScore}) nằm trong khoảng màu xanh`;
        } else {
            document.getElementById('yourPositionText').textContent = '';
        }
    }
    
    // Biểu đồ thứ hạng trong NV1
    const nv1 = candidate['Tên trường NV1'];
    const ctx2 = document.getElementById('rankChart');
    
    if (ctx2 && nv1 && nv1.trim()) {
        const nv1Stats = calculateCompetitionStats(candidate, nv1, 'NV1');
        
        if (nv1Stats.rank !== '-') {
            const passCount = nv1Stats.rank;
            const failCount = nv1Stats.total - nv1Stats.rank;
            
            charts.rankChart = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: ['Thí sinh xếp trước bạn', 'Thí sinh xếp sau bạn'],
                    datasets: [{
                        data: [passCount - 1, failCount],
                        backgroundColor: ['#e74c3c', '#2ecc71'],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: { size: 12 }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        } else {
            ctx2.parentElement.innerHTML = '<p style="text-align: center; padding: 20px; color: #95a5a6;">Không có dữ liệu thứ hạng</p>';
        }
    }
}

// Hiển thị danh sách thí sinh cùng NV1
function displayNV1Competitors(candidate) {
    const nv1 = candidate['Tên trường NV1'];
    const position = candidate['Vị trí dự tuyển'];
    
    if (!nv1 || !nv1.trim()) {
        document.getElementById('nv1CompetitorSection').style.display = 'none';
        return;
    }
    
    document.getElementById('nv1CompetitorSection').style.display = 'block';
    
    // Lọc thí sinh cùng vị trí và cùng NV1
    const competitors = allResults.filter(c => {
        const samePosition = c['Vị trí dự tuyển'] === position;
        const sameSchool = c['Tên trường NV1'] === nv1;
        const hasScore = c['Tổng điểm'] && c['Tổng điểm'] !== 'Bỏ thi' && c['Tổng điểm'].trim() !== '';
        return samePosition && sameSchool && hasScore;
    });
    
    // Sắp xếp theo điểm giảm dần
    competitors.sort((a, b) => {
        const scoreA = parseFloat(a['Tổng điểm']);
        const scoreB = parseFloat(b['Tổng điểm']);
        return scoreB - scoreA;
    });
    
    document.getElementById('nv1ListCount').textContent = competitors.length;
    
    const listContainer = document.getElementById('nv1CompetitorList');
    listContainer.innerHTML = '';
    
    // Tạo bảng
    const table = document.createElement('table');
    table.className = 'competitor-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Thứ hạng</th>
                <th>SBD</th>
                <th>Họ tên</th>
                <th>Giới tính</th>
                <th>Ngày sinh</th>
                <th>Điểm UT</th>
                <th>Điểm thi</th>
                <th>Tổng điểm</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    
    competitors.forEach((c, index) => {
        const row = document.createElement('tr');
        const isCurrentCandidate = c.SBD === candidate.SBD;
        if (isCurrentCandidate) {
            row.className = 'current-candidate';
        }
        
        row.innerHTML = `
            <td class="rank-cell">${index + 1}</td>
            <td>${c.SBD}</td>
            <td>${c['Họ tên']}</td>
            <td>${c['Giới tính']}</td>
            <td>${c['Ngày sinh']}</td>
            <td>${c['Điểm Diện UT'] || '0'}</td>
            <td>${c['Điểm bài thi viết'] || '-'}</td>
            <td class="score-cell">${c['Tổng điểm']}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    listContainer.appendChild(table);
}

// Hiển thị danh sách thí sinh cùng NV2
function displayNV2Competitors(candidate) {
    const nv2 = candidate['Tên Trường NV2'];
    const position = candidate['Vị trí dự tuyển'];
    
    if (!nv2 || !nv2.trim()) {
        document.getElementById('nv2CompetitorSection').style.display = 'none';
        return;
    }
    
    document.getElementById('nv2CompetitorSection').style.display = 'block';
    
    // Lọc thí sinh cùng vị trí và cùng NV2
    const competitors = allResults.filter(c => {
        const samePosition = c['Vị trí dự tuyển'] === position;
        const sameSchool = c['Tên Trường NV2'] === nv2;
        const hasScore = c['Tổng điểm'] && c['Tổng điểm'] !== 'Bỏ thi' && c['Tổng điểm'].trim() !== '';
        return samePosition && sameSchool && hasScore;
    });
    
    // Sắp xếp theo điểm giảm dần
    competitors.sort((a, b) => {
        const scoreA = parseFloat(a['Tổng điểm']);
        const scoreB = parseFloat(b['Tổng điểm']);
        return scoreB - scoreA;
    });
    
    document.getElementById('nv2ListCount').textContent = competitors.length;
    
    const listContainer = document.getElementById('nv2CompetitorList');
    listContainer.innerHTML = '';
    
    // Tạo bảng
    const table = document.createElement('table');
    table.className = 'competitor-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Thứ hạng</th>
                <th>SBD</th>
                <th>Họ tên</th>
                <th>Giới tính</th>
                <th>Ngày sinh</th>
                <th>Điểm UT</th>
                <th>Điểm thi</th>
                <th>Tổng điểm</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    
    competitors.forEach((c, index) => {
        const row = document.createElement('tr');
        const isCurrentCandidate = c.SBD === candidate.SBD;
        if (isCurrentCandidate) {
            row.className = 'current-candidate';
        }
        
        row.innerHTML = `
            <td class="rank-cell">${index + 1}</td>
            <td>${c.SBD}</td>
            <td>${c['Họ tên']}</td>
            <td>${c['Giới tính']}</td>
            <td>${c['Ngày sinh']}</td>
            <td>${c['Điểm Diện UT'] || '0'}</td>
            <td>${c['Điểm bài thi viết'] || '-'}</td>
            <td class="score-cell">${c['Tổng điểm']}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    listContainer.appendChild(table);
}



// In kết quả
function printResult() {
    window.print();
}

// Tìm kiếm lại
function searchAgain() {
    document.getElementById('searchInput').value = '';
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('notFoundSection').style.display = 'none';
    document.getElementById('suggestionSection').style.display = 'none';
    document.getElementById('searchInput').focus();
    
    // Cuộn lên đầu
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Khởi động
window.addEventListener('DOMContentLoaded', init);
