// Biến toàn cục
let currentCandidate = null;
let allResults = [];
let charts = {};

// Khởi tạo
function init() {
    if (typeof resultData !== 'undefined') {
        allResults = resultData;
    }
    
    const searchInput = document.getElementById('searchInput');
    
    // Lắng nghe sự kiện Enter
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            searchCandidate();
        }
    });
    
    // Lắng nghe sự kiện nhập liệu để hiển thị gợi ý
    searchInput.addEventListener('input', function (e) {
        showAutocomplete(e.target.value);
    });
    
    // Ẩn dropdown khi click ra ngoài
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.search-input-wrapper')) {
            hideAutocomplete();
        }
    });
    
    // Kiểm tra URL có SBD không và tự động tìm kiếm
    checkURLParams();
    
    // Lắng nghe sự kiện thay đổi URL (khi người dùng nhấn nút back/forward)
    window.addEventListener('popstate', function(e) {
        checkURLParams();
    });
}

// Kiểm tra và load kết quả từ URL
function checkURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const sbd = urlParams.get('sbd');
    
    if (sbd) {
        const candidate = allResults.find(c => 
            c.SBD.toUpperCase() === sbd.toUpperCase()
        );
        
        if (candidate) {
            document.getElementById('searchInput').value = sbd;
            currentCandidate = candidate;
            displayResult(candidate);
        } else {
            // Nếu không tìm thấy, xóa URL param và hiển thị thông báo
            window.history.replaceState({}, '', window.location.pathname);
            document.getElementById('notFoundSection').style.display = 'block';
        }
    }
}

// Cập nhật URL với SBD
function updateURL(sbd) {
    const url = new URL(window.location);
    url.searchParams.set('sbd', sbd);
    window.history.pushState({}, '', url);
}

// Chuyển đổi chuỗi có dấu thành không dấu
function removeVietnameseTones(str) {
    if (!str) return '';
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    return str;
}

// Chuẩn hóa chuỗi tìm kiếm (loại bỏ khoảng trắng và dấu)
function normalizeSearchString(str) {
    if (!str) return '';
    // Loại bỏ khoảng trắng và chuyển thành không dấu
    return removeVietnameseTones(str.replace(/\s+/g, ''));
}

// Hiển thị gợi ý tự động
function showAutocomplete(searchValue) {
    const dropdown = document.getElementById('autocompleteDropdown');
    
    if (!searchValue || searchValue.length < 2) {
        dropdown.style.display = 'none';
        return;
    }
    
    const searchNormalized = normalizeSearchString(searchValue);
    const searchLower = searchValue.toLowerCase();
    
    // Tìm kiếm theo SBD hoặc tên (hỗ trợ không dấu và viết liền)
    const matches = allResults.filter(c => {
        const sbd = c.SBD.toUpperCase();
        const name = c['Họ tên'].toLowerCase();
        const nameNormalized = normalizeSearchString(name);
        const nameWithoutSpace = removeVietnameseTones(name.replace(/\s+/g, ''));
        
        // Tìm theo SBD
        if (sbd.includes(searchValue.toUpperCase())) {
            return true;
        }
        
        // Tìm theo tên có dấu
        if (name.includes(searchLower)) {
            return true;
        }
        
        // Tìm theo tên không dấu
        if (nameNormalized.includes(searchNormalized)) {
            return true;
        }
        
        // Tìm theo tên viết liền
        if (nameWithoutSpace.includes(removeVietnameseTones(searchLower))) {
            return true;
        }
        
        return false;
    }).slice(0, 20); // Giới hạn 10 kết quả
    
    if (matches.length === 0) {
        dropdown.style.display = 'none';
        return;
    }
    
    dropdown.innerHTML = '';
    matches.forEach(c => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.innerHTML = `
            <div class="autocomplete-sbd">${c.SBD}</div>
            <div class="autocomplete-info">
                <span class="autocomplete-name">${c['Họ tên']}</span>
                <span class="autocomplete-detail">${c['Vị trí dự tuyển']} • ${c['Giới tính']} • ${c['Ngày sinh']}</span>
            </div>
        `;
        item.onclick = () => {
            selectCandidate(c);
        };
        dropdown.appendChild(item);
    });
    
    dropdown.style.display = 'block';
}

// Ẩn dropdown gợi ý
function hideAutocomplete() {
    const dropdown = document.getElementById('autocompleteDropdown');
    dropdown.style.display = 'none';
}

// Chọn thí sinh từ gợi ý
function selectCandidate(candidate) {
    hideAutocomplete();
    document.getElementById('searchInput').value = candidate.SBD;
    currentCandidate = candidate;
    updateURL(candidate.SBD);
    displayResult(candidate);
}

// Tìm kiếm thí sinh
function searchCandidate() {
    const searchValue = document.getElementById('searchInput').value.trim();
    
    if (!searchValue) {
        alert('⚠️ Vui lòng nhập SBD hoặc tên thí sinh để tìm kiếm!');
        return;
    }
    
    hideAutocomplete();
    
    // Ẩn tất cả các section
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('notFoundSection').style.display = 'none';
    document.getElementById('suggestionSection').style.display = 'none';
    
    // Tìm kiếm chính xác theo SBD
    let candidate = allResults.find(c => 
        c.SBD.toUpperCase() === searchValue.toUpperCase()
    );
    
    // Nếu không tìm thấy theo SBD, tìm theo tên (hỗ trợ không dấu)
    if (!candidate) {
        const searchNormalized = normalizeSearchString(searchValue);
        const searchLower = searchValue.toLowerCase();
        
        const candidates = allResults.filter(c => {
            const name = c['Họ tên'].toLowerCase();
            const nameNormalized = normalizeSearchString(name);
            
            return name.includes(searchLower) || nameNormalized.includes(searchNormalized);
        });
        
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
        updateURL(candidate.SBD);
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
            updateURL(c.SBD);
            displayResult(c);
            suggestionSection.style.display = 'none';
        };
        suggestionList.appendChild(item);
    });
    
    suggestionSection.style.display = 'block';
}

// Hiển thị kết quả
function displayResult(candidate) {
    // Cập nhật title của trang
    const candidateName = candidate['Họ tên'] || 'Thí sinh';
    const candidateSBD = candidate.SBD || '';
    document.title = `${candidateName} - ${candidateSBD} | Tra Cứu Kết Quả Thi Tuyển`;
    
    // Gửi event tracking đến Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'tra_cuu_ket_qua', {
            'event_category': 'Tra cứu',
            'event_label': `${candidateSBD} - ${candidateName}`,
            'sbd': candidateSBD,
            'ho_ten': candidateName,
            'vi_tri': candidate['Vị trí dự tuyển'] || 'Không rõ',
            'diem_tong': candidate['Tổng điểm'] || 'Bỏ thi'
        });
    }
    
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
    
    // Hiển thị so sánh điểm số
    displayScoreComparison(candidate);
    
    // Hiển thị phân tích nguyện vọng
    displayWishAnalysis(candidate);
    
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
    
    // Lấy tất cả điểm theo vị trí (chỉ tính điểm >= 50)
    const positionScores = allResults
        .filter(c => c['Vị trí dự tuyển'] === position && c['Tổng điểm'] && c['Tổng điểm'] !== 'Bỏ thi' && c['Tổng điểm'].trim() !== '')
        .map(c => parseFloat(c['Tổng điểm']))
        .filter(s => !isNaN(s) && s >= 50);
    
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
    
    // Lọc thí sinh cùng vị trí và cùng NV1 (chỉ tính điểm >= 50)
    const competitors = allResults.filter(c => {
        const samePosition = c['Vị trí dự tuyển'] === position;
        const sameSchool = c['Tên trường NV1'] === nv1;
        const hasScore = c['Tổng điểm'] && c['Tổng điểm'] !== 'Bỏ thi' && c['Tổng điểm'].trim() !== '';
        const score = parseFloat(c['Tổng điểm']);
        return samePosition && sameSchool && hasScore && !isNaN(score) && score >= 50;
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
    
    // Lọc thí sinh cùng vị trí và cùng NV2 (chỉ tính điểm >= 50)
    const competitors = allResults.filter(c => {
        const samePosition = c['Vị trí dự tuyển'] === position;
        const sameSchool = c['Tên Trường NV2'] === nv2;
        const hasScore = c['Tổng điểm'] && c['Tổng điểm'] !== 'Bỏ thi' && c['Tổng điểm'].trim() !== '';
        const score = parseFloat(c['Tổng điểm']);
        return samePosition && sameSchool && hasScore && !isNaN(score) && score >= 50;
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



// Hiển thị so sánh điểm số
function displayScoreComparison(candidate) {
    const position = candidate['Vị trí dự tuyển'];
    const totalScoreStr = candidate['Tổng điểm'];
    const totalScore = parseFloat(totalScoreStr);
    
    // Lấy tất cả điểm theo vị trí (chỉ tính điểm >= 50)
    const positionScores = allResults
        .filter(c => c['Vị trí dự tuyển'] === position && c['Tổng điểm'] && c['Tổng điểm'] !== 'Bỏ thi' && c['Tổng điểm'].trim() !== '')
        .map(c => parseFloat(c['Tổng điểm']))
        .filter(s => !isNaN(s) && s >= 50)
        .sort((a, b) => b - a);
    
    if (positionScores.length === 0) return;
    
    // Tính toán các mốc
    const maxScore = Math.max(...positionScores);
    const minScore = Math.min(...positionScores);
    const avgScore = (positionScores.reduce((a, b) => a + b, 0) / positionScores.length).toFixed(2);
    const medianScore = positionScores[Math.floor(positionScores.length / 2)].toFixed(2);
    
    // Hiển thị điểm của thí sinh
    document.getElementById('yourScore').textContent = totalScore || 'Bỏ thi';
    
    if (!isNaN(totalScore)) {
        // Kiểm tra điểm tối thiểu
        if (totalScore < 50) {
            document.getElementById('yourPercentile').innerHTML = `
                <span style="color: #e74c3c; font-weight: 600;">❌ Không đủ điểm tối thiểu (50 điểm)</span>
            `;
            document.getElementById('yourScore').style.color = '#e74c3c';
        } else {
            const rank = positionScores.indexOf(totalScore) + 1;
            const percentile = ((positionScores.length - rank + 1) / positionScores.length * 100).toFixed(1);
            document.getElementById('yourPercentile').textContent = `Top ${percentile}% | Hạng ${rank}/${positionScores.length}`;
            
            document.getElementById('yourPercentile').textContent += ``;
        }
    } else {
        document.getElementById('yourPercentile').textContent = 'Không có dữ liệu';
    }
    
    // Các mốc khác
    document.getElementById('maxScore').textContent = maxScore.toFixed(2);
    
    document.getElementById('avgScore').textContent = avgScore;
    
    document.getElementById('medianScore').textContent = medianScore;
    
    document.getElementById('minScore').textContent = minScore.toFixed(2);
}

// Hiển thị phân tích nguyện vọng
function displayWishAnalysis(candidate) {
    const position = candidate['Vị trí dự tuyển'];
    const totalScoreStr = candidate['Tổng điểm'];
    const totalScore = parseFloat(totalScoreStr);
    const nv1 = candidate['Tên trường NV1'];
    const nv2 = candidate['Tén Trường NV2'];
    
    if (isNaN(totalScore)) return;
    
    // Kiểm tra điểm tối thiểu (50 điểm)
    if (totalScore < 50) {
        document.getElementById('nv1Analysis').style.display = 'block';
        document.getElementById('nv1AnalysisSchool').textContent = nv1 || 'Nguyện vọng 1';
        document.getElementById('nv1AnalysisContent').innerHTML = `
            <div class="analysis-low">
                <strong>⚠️ Không đạt điểm tối thiểu</strong>
                <p>Điểm của bạn (${totalScore}) thấp hơn mức tối thiểu <strong>50 điểm</strong>. Thí sinh không đủ điều kiện xét tuyển.</p>
            </div>
        `;
        
        if (nv2 && nv2.trim()) {
            document.getElementById('nv2Analysis').style.display = 'block';
            document.getElementById('nv2AnalysisSchool').textContent = nv2;
            document.getElementById('nv2AnalysisContent').innerHTML = `
                <p>Không đủ điều kiện xét tuyển do điểm thấp hơn mức tối thiểu (50 điểm).</p>
            `;
        }
        
        return;
    }
    
    // Phân tích NV1
    if (nv1 && nv1.trim()) {
        document.getElementById('nv1Analysis').style.display = 'block';
        document.getElementById('nv1AnalysisSchool').textContent = nv1;
        
        const nv1Stats = calculateCompetitionStats(candidate, nv1, 'NV1');
        const rank = parseInt(nv1Stats.rank);
        const total = parseInt(nv1Stats.total);
        
        let analysis = '';
        if (rank !== '-' && rank > 0) {
            // Trường hợp đặc biệt: chỉ có 1 người duy nhất
            if (total === 1 && rank === 1) {
                analysis = `<div class="analysis-excellent">
                    <strong>🎯 Khả năng đỗ: RẤT CAO</strong>
                    <p>Bạn là <strong>ứng viên duy nhất</strong> chọn trường này ở vị trí ${position}. Cơ hội trúng tuyển rất cao!</p>
                </div>`;
            } else {
                const topPercent = (rank / total * 100).toFixed(1);
                
                // Top % càng thấp = xếp hạng càng cao = khả năng đỗ càng cao
                if (topPercent <= 10) {
                    analysis = `<div class="analysis-excellent">
                        <strong>🎯 Khả năng đỗ: RẤT CAO</strong>
                        <p>Bạn xếp hạng <strong>${rank}/${total}</strong> (Top ${topPercent}%). Vị trí rất thuận lợi!</p>
                    </div>`;
                } else if (topPercent <= 30) {
                    analysis = `<div class="analysis-good">
                        <strong>✅ Khả năng đỗ: CAO</strong>
                        <p>Bạn xếp hạng <strong>${rank}/${total}</strong> (Top ${topPercent}%). Khả năng đỗ tốt!</p>
                    </div>`;
                } else if (topPercent <= 50) {
                    analysis = `<div class="analysis-medium">
                        <strong>📊 Khả năng đỗ: TRUNG BÌNH</strong>
                        <p>Bạn xếp hạng <strong>${rank}/${total}</strong> (Top ${topPercent}%). Nên cân nhắc thêm nguyện vọng an toàn.</p>
                    </div>`;
                } else {
                    analysis = `<div class="analysis-low">
                        <strong>⚠️ Khả năng đỗ: THẤP</strong>
                        <p>Bạn xếp hạng <strong>${rank}/${total}</strong> (Top ${topPercent}%). Nên xem xét các trường khác có tỷ lệ chọi thấp hơn.</p>
                    </div>`;
                }
            }
        }
        
        document.getElementById('nv1AnalysisContent').innerHTML = analysis;
    }
    
    // Phân tích NV2
    if (nv2 && nv2.trim()) {
        document.getElementById('nv2Analysis').style.display = 'block';
        document.getElementById('nv2AnalysisSchool').textContent = nv2;
        
        const nv2Stats = calculateCompetitionStats(candidate, nv2, 'NV2');
        const rank = parseInt(nv2Stats.rank);
        const total = parseInt(nv2Stats.total);
        
        let analysis = '';
        if (rank !== '-' && rank > 0) {
            let message = '';
            
            // Trường hợp đặc biệt: chỉ có 1 người duy nhất
            if (total === 1 && rank === 1) {
                message = `Bạn là <strong>ứng viên duy nhất</strong> chọn trường này làm NV2 ở vị trí ${position}. Nguyện vọng dự phòng RẤT TỐT! 🎯`;
            } else {
                const topPercent = (rank / total * 100).toFixed(1);
                
                if (topPercent <= 30) {
                    message = `Xếp hạng: <strong>${rank}/${total}</strong> (Top ${topPercent}%) - Nguyện vọng dự phòng RẤT TỐT! 🎯`;
                } else if (topPercent <= 50) {
                    message = `Xếp hạng: <strong>${rank}/${total}</strong> (Top ${topPercent}%) - Nguyện vọng dự phòng TỐT! ✅`;
                } else {
                    message = `Xếp hạng: <strong>${rank}/${total}</strong> (Top ${topPercent}%) - Nguyện vọng dự phòng hợp lý.`;
                }
            }
            
            analysis = `<p>${message}</p>`;
        }
        
        document.getElementById('nv2AnalysisContent').innerHTML = analysis;
    }
}

// Hiển thị các trường gợi ý
function displayAlternativeSchools(candidate) {
    const position = candidate['Vị trí dự tuyển'];
    const totalScore = parseFloat(candidate['Tổng điểm']);
    const currentNV1 = candidate['Tên trường NV1'];
    const currentNV2 = candidate['Tên Trường NV2'];
    
    if (isNaN(totalScore)) return;
    
    // Chỉ phân tích các trường trong NV1 và NV2 của thí sinh
    const schoolsToAnalyze = [];
    
    if (currentNV1 && currentNV1.trim()) {
        schoolsToAnalyze.push(currentNV1);
    }
    
    if (currentNV2 && currentNV2.trim() && currentNV2 !== currentNV1) {
        schoolsToAnalyze.push(currentNV2);
    }
    
    // Nếu không có trường nào để phân tích, ẩn section
    if (schoolsToAnalyze.length === 0) {
        document.getElementById('alternativeSchools').style.display = 'none';
        return;
    }
    
    // Thống kê các trường khác cùng vị trí (loại trừ NV1 và NV2 của thí sinh)
    const schoolStats = {};
    
    allResults.forEach(c => {
        if (c['Vị trí dự tuyển'] !== position) return;
        
        const school = c['Tên trường NV1'];
        if (!school || !school.trim()) return;
        
        // Bỏ qua nếu là trường NV1 hoặc NV2 của thí sinh hiện tại
        if (school === currentNV1 || school === currentNV2) return;
        
        const score = parseFloat(c['Tổng điểm']);
        if (isNaN(score)) return;
        
        if (!schoolStats[school]) {
            schoolStats[school] = { scores: [], count: 0 };
        }
        
        schoolStats[school].scores.push(score);
        schoolStats[school].count++;
    });
    
    // Tính toán và sắp xếp
    const alternatives = [];
    
    for (const school in schoolStats) {
        const scores = schoolStats[school].scores.sort((a, b) => b - a);
        const myRank = scores.filter(s => s > totalScore).length + 1;
        const total = scores.length;
        const competitionRatio = total;
        const topPercent = (myRank / total * 100);
        
        alternatives.push({
            school,
            myRank,
            total,
            competitionRatio,
            topPercent,
            isSafer: topPercent <= 30
        });
    }
    
    // Sắp xếp theo topPercent tăng dần (dễ đỗ nhất trước)
    alternatives.sort((a, b) => a.topPercent - b.topPercent);
    
    // Hiển thị top 5 trường dễ đỗ nhất
    const safeSchools = alternatives.filter(a => a.isSafer).slice(0, 5);
    
    if (safeSchools.length > 0) {
        document.getElementById('alternativeSchools').style.display = 'block';
        
        let html = '<p style="margin-bottom: 15px; color: #7f8c8d; font-size: 14px;">Dựa trên điểm của bạn, các trường sau có tỷ lệ chọi thấp hơn và có thể xem xét:</p>';
        html += '<div class="alternative-grid">';
        safeSchools.forEach((alt, index) => {
            const safetyLevel = alt.topPercent <= 10 ? '🟢 Rất an toàn' 
                : alt.topPercent <= 20 ? '🟡 An toàn' 
                : '🟠 Khá an toàn';
            
            html += `
                <div class="alternative-item">
                    <div class="alternative-rank">#${index + 1}</div>
                    <div class="alternative-info">
                        <div class="alternative-school">${alt.school}</div>
                        <div class="alternative-stats">
                            <span class="stat">Hạng: ${alt.myRank}/${alt.total}</span>
                            <span class="stat">Top ${alt.topPercent.toFixed(1)}%</span>
                            <span class="stat safety">${safetyLevel}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        document.getElementById('alternativeList').innerHTML = html;
    } else {
        document.getElementById('alternativeSchools').style.display = 'none';
    }
}

// Chia sẻ kết quả
function shareResult() {
    if (!currentCandidate) return;
    
    const modal = document.getElementById('shareModal');
    modal.style.display = 'flex';
    
    // Tạo link chia sẻ
    const shareUrl = `${window.location.origin}${window.location.pathname}?sbd=${encodeURIComponent(currentCandidate.SBD)}`;
    document.getElementById('shareLink').value = shareUrl;
    
    // Tạo QR code
    const qrContainer = document.querySelector('.qr-code-container');
    
    // Xóa QR code cũ nếu có
    const oldQR = qrContainer.querySelector('#qrcode');
    if (oldQR) {
        oldQR.remove();
    }
    
    // Ẩn canvas và tạo div mới cho QR code
    const canvas = document.getElementById('qrCodeCanvas');
    canvas.style.display = 'none';
    
    // Tạo div chứa QR code
    const qrDiv = document.createElement('div');
    qrDiv.id = 'qrcode';
    qrDiv.style.display = 'flex';
    qrDiv.style.justifyContent = 'center';
    qrDiv.style.alignItems = 'center';
    qrContainer.insertBefore(qrDiv, qrContainer.firstChild);
    
    // Kiểm tra và tạo QR code
    try {
        if (typeof QRCode !== 'undefined') {
            new QRCode(qrDiv, {
                text: shareUrl,
                width: 200,
                height: 200,
                colorDark: '#667eea',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        } else {
            console.error('Thư viện QRCode chưa được tải');
            qrDiv.innerHTML = '<p style="color: red;">Không thể tạo QR code</p>';
        }
    } catch (error) {
        console.error('Lỗi khi tạo QR code:', error);
        qrDiv.innerHTML = '<p style="color: red;">Lỗi: ' + error.message + '</p>';
    }
}

// Đóng modal chia sẻ
function closeShareModal() {
    document.getElementById('shareModal').style.display = 'none';
}

// Sao chép link
function copyShareLink() {
    const input = document.getElementById('shareLink');
    input.select();
    document.execCommand('copy');
    alert('✅ Đã sao chép link!');
}

// Chia sẻ lên Facebook
function shareToFacebook() {
    const shareUrl = document.getElementById('shareLink').value;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
}

// Chia sẻ lên Zalo
function shareToZalo() {
    const shareUrl = document.getElementById('shareLink').value;
    const zaloUrl = `https://zalo.me/share?url=${encodeURIComponent(shareUrl)}`;
    window.open(zaloUrl, '_blank', 'width=600,height=400');
}

// Tải PDF
function downloadPDF() {
    alert('Tính năng tải PDF đang được phát triển!');
    // Có thể sử dụng html2pdf hoặc jsPDF để implement
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
    
    // Xóa SBD khỏi URL
    window.history.pushState({}, '', window.location.pathname);
    
    // Reset title về mặc định
    document.title = 'Tra Cứu Kết Quả Thi Tuyển';
    
    // Cuộn lên đầu
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Khởi động
window.addEventListener('DOMContentLoaded', init);
