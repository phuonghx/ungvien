
let allData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 20;
let charts = {};
let reverseRatioChart = false; // Biến để theo dõi trạng thái đảo ngược
let reversePositionChart = false; // Biến để theo dõi trạng thái đảo ngược biểu đồ vị trí
let reverseNV1Chart = false; // Biến để theo dõi trạng thái đảo ngược biểu đồ NV1
let reverseNV2Chart = false; // Biến để theo dõi trạng thái đảo ngược biểu đồ NV2
let reverseMajorChart = false; // Biến để theo dõi trạng thái đảo ngược biểu đồ chuyên ngành
let reverseGenderMajorChart = false; // Biến để theo dõi trạng thái đảo ngược biểu đồ nam/nữ theo chuyên ngành
let reverseNV1vs2Chart = false; // Biến để theo dõi trạng thái đảo ngược biểu đồ so sánh NV1 vs NV2
let reverseTopPairsChart = false; // Biến để theo dõi trạng thái đảo ngược biểu đồ top cặp
let reverseAgeChart = false; // Biến để theo dõi trạng thái đảo ngược biểu đồ tuổi

// Khởi tạo
function init() {
    allData = candidateData;
    filteredData = allData;

    // Cập nhật thống kê
    updateStats();

    // Điền các vị trí vào filter
    populatePositions();
    populateNV1();
    populateNV2();

    // Hiển thị dữ liệu
    displayTable();

    // Vẽ biểu đồ
    setTimeout(drawCharts, 100);
}

// Chuyển tab
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.remove('active');
    });

    // Remove active from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');

    // Redraw charts if dashboard tab
    if (tabName === 'dashboard') {
        setTimeout(updateCharts, 100);
    }
}

// Cập nhật thống kê
function updateStats() {
    const total = allData.length;
    const males = allData.filter(c => c['Giới tính'] === 'Nam').length;
    const females = allData.filter(c => c['Giới tính'] === 'Nữ').length;

    document.getElementById('totalCount').textContent = total.toLocaleString('vi-VN');
    document.getElementById('maleCount').textContent = males.toLocaleString('vi-VN');
    document.getElementById('femaleCount').textContent = females.toLocaleString('vi-VN');
    document.getElementById('resultCount').textContent = filteredData.length.toLocaleString('vi-VN');
}

// Điền vị trí vào select
function populatePositions() {
    const positions = [...new Set(allData.map(c => c['Vị trí dự tuyển']).filter(p => p))];
    positions.sort().reverse();

    const select = document.getElementById('positionFilter');
    positions.forEach(pos => {
        const option = document.createElement('option');
        option.value = pos;
        option.textContent = pos;
        select.appendChild(option);
    });
}

// Điền nguyện vọng 1 vào select
function populateNV1() {
    const nv1List = [...new Set(allData.map(c => c['Tên trường NV1']).filter(p => p && p.trim()))];
    nv1List.sort().reverse();

    const select = document.getElementById('nv1Filter');
    nv1List.forEach(nv1 => {
        const option = document.createElement('option');
        option.value = nv1;
        option.textContent = nv1;
        select.appendChild(option);
    });
}

// Điền nguyện vọng 2 vào select
function populateNV2() {
    const nv2List = [...new Set(allData.map(c => c['Tên Trường NV2']).filter(p => p && p.trim()))];
    nv2List.sort().reverse();

    const select = document.getElementById('nv2Filter');
    nv2List.forEach(nv2 => {
        const option = document.createElement('option');
        option.value = nv2;
        option.textContent = nv2;
        select.appendChild(option);
    });
}

// Lấy màu cho biểu đồ
function getChartColors(count) {
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF9F40'
    ];
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(colors[i % colors.length]);
    }
    return result;
}

// Vẽ biểu đồ
function drawCharts() {
    // Thống kê theo vị trí
    const positionStats = {};
    allData.forEach(c => {
        const pos = c['Vị trí dự tuyển'];
        if (pos) {
            positionStats[pos] = (positionStats[pos] || 0) + 1;
        }
    });

    const positions = Object.keys(positionStats).sort((a, b) => positionStats[b] - positionStats[a]);
    const positionValues = positions.map(p => positionStats[p]);

    // Biểu đồ số lượng theo vị trí
    if (document.getElementById('positionChart')) {
        const chartHeight = Math.max(400, positions.length * 25);
        const canvas = document.getElementById('positionChart');
        canvas.style.height = chartHeight + 'px';

        drawPositionChart();
    }

    // Biểu đồ tỷ lệ chọi
    if (document.getElementById('ratioChart')) {
        const total = allData.length;
        const percentages = positionValues.map(v => ((v / total) * 100).toFixed(1));

        const chartHeight = Math.max(400, positions.length * 25);
        const canvas = document.getElementById('ratioChart');
        canvas.style.height = chartHeight + 'px';

        drawRatioChart(positions, positionValues, percentages, chartHeight);
    }

    // Biểu đồ nguyện vọng 1
    if (document.getElementById('nv1Chart')) {
        drawNV1Chart();
    }

    // Biểu đồ nguyện vọng 2
    if (document.getElementById('nv2Chart')) {
        drawNV2Chart();
    }

    // Biểu đồ giới tính
    const genderStats = {
        'Nam': allData.filter(c => c['Giới tính'] === 'Nam').length,
        'Nữ': allData.filter(c => c['Giới tính'] === 'Nữ').length
    };

    if (document.getElementById('genderChart')) {
        const ctx = document.getElementById('genderChart').getContext('2d');
        charts.genderChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Nam', 'Nữ'],
                datasets: [{
                    data: [genderStats['Nam'], genderStats['Nữ']],
                    backgroundColor: ['#add8e6', '#ffc0cb']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    // Biểu đồ giới tính theo vị trí (tất cả)
    const genderPositionStats = {};
    positions.forEach(pos => {
        const nam = allData.filter(c => c['Vị trí dự tuyển'] === pos && c['Giới tính'] === 'Nam').length;
        const nu = allData.filter(c => c['Vị trí dự tuyển'] === pos && c['Giới tính'] === 'Nữ').length;
        genderPositionStats[pos] = { nam, nu };
    });

    if (document.getElementById('genderPositionChart')) {
        const chartHeight = Math.max(400, positions.length * 25);
        const canvas = document.getElementById('genderPositionChart');
        canvas.style.height = chartHeight + 'px';

        const ctx = canvas.getContext('2d');

        charts.genderPositionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: positions,
                datasets: [
                    {
                        label: 'Nam',
                        data: positions.map(p => genderPositionStats[p].nam),
                        backgroundColor: '#add8e6'
                    },
                    {
                        label: 'Nữ',
                        data: positions.map(p => genderPositionStats[p].nu),
                        backgroundColor: '#ffc0cb'
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { stacked: true, beginAtZero: true },
                    y: {
                        stacked: true,
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    }

    // Biểu đồ chuyên ngành
    if (document.getElementById('majorChart')) {
        drawMajorChart();
    }

    // Biểu đồ Nam/Nữ theo chuyên ngành
    if (document.getElementById('genderMajorChart')) {
        drawGenderMajorChart();
    }

    // Biểu đồ so sánh NV1 vs NV2
    if (document.getElementById('nv1vs2Chart')) {
        drawNV1vs2Chart();
    }

    // Biểu đồ Top 10 cặp phổ biến
    if (document.getElementById('topPairsChart')) {
        drawTopPairsChart();
    }

    // Biểu đồ phân bổ tuổi
    if (document.getElementById('ageChart')) {
        drawAgeChart();
    }

    // Biểu đồ tỷ lệ hoàn thành thông tin
    if (document.getElementById('noteChart')) {
        drawNoteChart();
    }
}

// Cập nhật biểu đồ
function updateCharts() {
    Object.values(charts).forEach(chart => {
        if (chart && chart.destroy) {
            chart.destroy();
        }
    });
    charts = {};
    drawCharts();
}

// Đảo ngược thứ tự biểu đồ tỷ lệ chọi
function toggleRatioChart() {
    reverseRatioChart = !reverseRatioChart;
    // Vẽ lại chỉ biểu đồ tỷ lệ chọi
    if (charts.ratioChart && charts.ratioChart.destroy) {
        charts.ratioChart.destroy();
    }
    drawRatioChart();
}

// Đảo ngược thứ tự biểu đồ số lượng theo vị trí
function togglePositionChart() {
    reversePositionChart = !reversePositionChart;
    if (charts.positionChart && charts.positionChart.destroy) {
        charts.positionChart.destroy();
    }
    drawPositionChart();
}

// Đảo ngược thứ tự biểu đồ nguyện vọng 1
function toggleNV1Chart() {
    reverseNV1Chart = !reverseNV1Chart;
    if (charts.nv1Chart && charts.nv1Chart.destroy) {
        charts.nv1Chart.destroy();
    }
    drawNV1Chart();
}

// Đảo ngược thứ tự biểu đồ nguyện vọng 2
function toggleNV2Chart() {
    reverseNV2Chart = !reverseNV2Chart;
    if (charts.nv2Chart && charts.nv2Chart.destroy) {
        charts.nv2Chart.destroy();
    }
    drawNV2Chart();
}

// Đảo ngược thứ tự biểu đồ chuyên ngành
function toggleMajorChart() {
    reverseMajorChart = !reverseMajorChart;
    if (charts.majorChart && charts.majorChart.destroy) {
        charts.majorChart.destroy();
    }
    drawMajorChart();
}

// Đảo ngược thứ tự biểu đồ nam/nữ theo chuyên ngành
function toggleGenderMajorChart() {
    reverseGenderMajorChart = !reverseGenderMajorChart;
    if (charts.genderMajorChart && charts.genderMajorChart.destroy) {
        charts.genderMajorChart.destroy();
    }
    drawGenderMajorChart();
}

// Đảo ngược thứ tự biểu đồ so sánh NV1 vs NV2
function toggleNV1vs2Chart() {
    reverseNV1vs2Chart = !reverseNV1vs2Chart;
    if (charts.nv1vs2Chart && charts.nv1vs2Chart.destroy) {
        charts.nv1vs2Chart.destroy();
    }
    drawNV1vs2Chart();
}

// Đảo ngược thứ tự biểu đồ top cặp
function toggleTopPairsChart() {
    reverseTopPairsChart = !reverseTopPairsChart;
    if (charts.topPairsChart && charts.topPairsChart.destroy) {
        charts.topPairsChart.destroy();
    }
    drawTopPairsChart();
}

// Đảo ngược thứ tự biểu đồ tuổi
function toggleAgeChart() {
    reverseAgeChart = !reverseAgeChart;
    if (charts.ageChart && charts.ageChart.destroy) {
        charts.ageChart.destroy();
    }
    drawAgeChart();
}

// Vẽ biểu đồ tỷ lệ chọi
function drawRatioChart(positions, positionValues, percentages, chartHeight) {
    const positionStats = {};
    allData.forEach(c => {
        const pos = c['Vị trí dự tuyển'];
        if (pos) {
            positionStats[pos] = (positionStats[pos] || 0) + 1;
        }
    });

    let sortedPositions = Object.keys(positionStats).sort((a, b) => positionStats[b] - positionStats[a]);
    let sortedPercentages = sortedPositions.map(p => {
        const val = positionStats[p];
        return ((val / allData.length) * 100).toFixed(1);
    });

    // Đảo ngược nếu cần
    if (reverseRatioChart) {
        sortedPositions = sortedPositions.reverse();
        sortedPercentages = sortedPercentages.reverse();
    }

    const canvas = document.getElementById('ratioChart');
    const chartHeightCalculated = Math.max(400, sortedPositions.length * 25);
    canvas.style.height = chartHeightCalculated + 'px';

    const ctx = canvas.getContext('2d');
    charts.ratioChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedPositions,
            datasets: [{
                label: 'Tỷ Lệ (%)',
                data: sortedPercentages,
                backgroundColor: getChartColors(sortedPositions.length),
                borderRadius: 5
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { beginAtZero: true, max: 100 },
                y: {
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// Vẽ biểu đồ số lượng theo vị trí
function drawPositionChart() {
    const positionStats = {};
    allData.forEach(c => {
        const pos = c['Vị trí dự tuyển'];
        if (pos) {
            positionStats[pos] = (positionStats[pos] || 0) + 1;
        }
    });

    let sortedPositions = Object.keys(positionStats).sort((a, b) => positionStats[b] - positionStats[a]);
    let sortedValues = sortedPositions.map(p => positionStats[p]);

    if (reversePositionChart) {
        sortedPositions = sortedPositions.reverse();
        sortedValues = sortedValues.reverse();
    }

    const canvas = document.getElementById('positionChart');
    const chartHeight = Math.max(400, sortedPositions.length * 25);
    canvas.style.height = chartHeight + 'px';

    const ctx = canvas.getContext('2d');
    charts.positionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedPositions,
            datasets: [{
                label: 'Số Ứng Viên',
                data: sortedValues,
                backgroundColor: getChartColors(sortedPositions.length),
                borderRadius: 5
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { beginAtZero: true },
                y: {
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// Vẽ biểu đồ nguyện vọng 1
function drawNV1Chart() {
    const nv1Stats = {};
    allData.forEach(c => {
        const nv1 = c['Tên trường NV1'];
        if (nv1 && nv1.trim()) {
            const trimmedNv1 = nv1.trim();
            nv1Stats[trimmedNv1] = (nv1Stats[trimmedNv1] || 0) + 1;
        }
    });

    let sortedSchools = Object.keys(nv1Stats).sort((a, b) => nv1Stats[b] - nv1Stats[a]);
    let sortedValues = sortedSchools.map(s => nv1Stats[s]);

    if (reverseNV1Chart) {
        sortedSchools = sortedSchools.reverse();
        sortedValues = sortedValues.reverse();
    }

    const canvas = document.getElementById('nv1Chart');
    const chartHeight = Math.max(400, sortedSchools.length * 25);
    canvas.style.height = chartHeight + 'px';

    const ctx = canvas.getContext('2d');
    charts.nv1Chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedSchools,
            datasets: [{
                label: 'Số NV1',
                data: sortedValues,
                backgroundColor: getChartColors(sortedSchools.length),
                borderRadius: 5
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { beginAtZero: true },
                y: {
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// Vẽ biểu đồ nguyện vọng 2
function drawNV2Chart() {
    const nv2Stats = {};
    allData.forEach(c => {
        const nv2 = c['Tên Trường NV2'];
        if (nv2 && nv2.trim()) {
            const trimmedNv2 = nv2.trim();
            nv2Stats[trimmedNv2] = (nv2Stats[trimmedNv2] || 0) + 1;
        }
    });

    let sortedSchools = Object.keys(nv2Stats).sort((a, b) => nv2Stats[b] - nv2Stats[a]);
    let sortedValues = sortedSchools.map(s => nv2Stats[s]);

    if (reverseNV2Chart) {
        sortedSchools = sortedSchools.reverse();
        sortedValues = sortedValues.reverse();
    }

    const canvas = document.getElementById('nv2Chart');
    const chartHeight = Math.max(400, sortedSchools.length * 25);
    canvas.style.height = chartHeight + 'px';

    const ctx = canvas.getContext('2d');
    charts.nv2Chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedSchools,
            datasets: [{
                label: 'Số NV2',
                data: sortedValues,
                backgroundColor: getChartColors(sortedSchools.length),
                borderRadius: 5
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { beginAtZero: true },
                y: {
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// Vẽ biểu đồ chuyên ngành
function drawMajorChart() {
    const majorStats = {};
    allData.forEach(c => {
        const major = c['Chuyên ngành đào tạo'];
        if (major && major.trim()) {
            const trimmedMajor = major.trim();
            majorStats[trimmedMajor] = (majorStats[trimmedMajor] || 0) + 1;
        }
    });

    let sortedMajors = Object.keys(majorStats).sort((a, b) => majorStats[b] - majorStats[a]);
    let sortedValues = sortedMajors.map(m => majorStats[m]);

    if (reverseMajorChart) {
        sortedMajors = sortedMajors.reverse();
        sortedValues = sortedValues.reverse();
    }

    const canvas = document.getElementById('majorChart');
    const chartHeight = Math.max(400, sortedMajors.length * 30);
    canvas.style.height = chartHeight + 'px';
    canvas.style.minHeight = chartHeight + 'px';

    const ctx = canvas.getContext('2d');
    charts.majorChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedMajors,
            datasets: [{
                label: 'Số Ứng Viên',
                data: sortedValues,
                backgroundColor: getChartColors(sortedMajors.length),
                borderRadius: 5
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { beginAtZero: true },
                y: {
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// Vẽ biểu đồ Nam/Nữ theo chuyên ngành
function drawGenderMajorChart() {
    const majorStats = {};
    allData.forEach(c => {
        const major = c['Chuyên ngành đào tạo'];
        if (major && major.trim()) {
            const trimmedMajor = major.trim();
            if (!majorStats[trimmedMajor]) {
                majorStats[trimmedMajor] = { nam: 0, nu: 0 };
            }
            if (c['Giới tính'] === 'Nam') {
                majorStats[trimmedMajor].nam++;
            } else if (c['Giới tính'] === 'Nữ') {
                majorStats[trimmedMajor].nu++;
            }
        }
    });

    let sortedMajors = Object.keys(majorStats).sort((a, b) =>
        (majorStats[b].nam + majorStats[b].nu) - (majorStats[a].nam + majorStats[a].nu)
    );

    if (reverseGenderMajorChart) {
        sortedMajors = sortedMajors.reverse();
    }

    const canvas = document.getElementById('genderMajorChart');
    const chartHeight = Math.max(400, sortedMajors.length * 30);
    canvas.style.height = chartHeight + 'px';
    canvas.style.minHeight = chartHeight + 'px';

    const ctx = canvas.getContext('2d');
    charts.genderMajorChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedMajors,
            datasets: [
                {
                    label: 'Nam',
                    data: sortedMajors.map(m => majorStats[m].nam),
                    backgroundColor: '#add8e6'
                },
                {
                    label: 'Nữ',
                    data: sortedMajors.map(m => majorStats[m].nu),
                    backgroundColor: '#ffc0cb'
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { stacked: true, beginAtZero: true },
                y: {
                    stacked: true,
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// Vẽ biểu đồ so sánh NV1 vs NV2
function drawNV1vs2Chart() {
    const positionStats = {};
    allData.forEach(c => {
        const pos = c['Vị trí dự tuyển'];
        if (pos) {
            if (!positionStats[pos]) {
                positionStats[pos] = { nv1: 0, nv2: 0 };
            }
            if (c['Tên trường NV1'] && c['Tên trường NV1'].trim()) {
                positionStats[pos].nv1++;
            }
            if (c['Tên Trường NV2'] && c['Tên Trường NV2'].trim()) {
                positionStats[pos].nv2++;
            }
        }
    });

    let sortedPositions = Object.keys(positionStats).sort((a, b) =>
        (positionStats[b].nv1 + positionStats[b].nv2) - (positionStats[a].nv1 + positionStats[a].nv2)
    );

    if (reverseNV1vs2Chart) {
        sortedPositions = sortedPositions.reverse();
    }

    const canvas = document.getElementById('nv1vs2Chart');
    const chartHeight = Math.max(400, sortedPositions.length * 30);
    canvas.style.height = chartHeight + 'px';
    canvas.style.minHeight = chartHeight + 'px';

    const ctx = canvas.getContext('2d');
    charts.nv1vs2Chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedPositions,
            datasets: [
                {
                    label: 'Nguyện Vọng 1',
                    data: sortedPositions.map(p => positionStats[p].nv1),
                    backgroundColor: '#36A2EB'
                },
                {
                    label: 'Nguyện Vọng 2',
                    data: sortedPositions.map(p => positionStats[p].nv2),
                    backgroundColor: '#FF9F40'
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { beginAtZero: true },
                y: {
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// Vẽ biểu đồ Top 10 cặp phổ biến nhất
function drawTopPairsChart() {
    const pairStats = {};
    allData.forEach(c => {
        const pos = c['Vị trí dự tuyển'];
        const nv1 = c['Tên trường NV1'];
        if (pos && nv1 && nv1.trim()) {
            const key = pos + ' → ' + nv1;
            pairStats[key] = (pairStats[key] || 0) + 1;
        }
    });

    let sortedPairs = Object.keys(pairStats)
        .sort((a, b) => pairStats[b] - pairStats[a])
        .slice(0, 10);
    let pairValues = sortedPairs.map(p => pairStats[p]);

    if (reverseTopPairsChart) {
        sortedPairs = sortedPairs.reverse();
        pairValues = pairValues.reverse();
    }

    const canvas = document.getElementById('topPairsChart');
    const chartHeight = Math.max(400, sortedPairs.length * 25);
    canvas.style.height = chartHeight + 'px';

    const ctx = canvas.getContext('2d');
    charts.topPairsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedPairs,
            datasets: [{
                label: 'Số Ứng Viên',
                data: pairValues,
                backgroundColor: getChartColors(sortedPairs.length),
                borderRadius: 5
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { beginAtZero: true },
                y: {
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

// Vẽ biểu đồ phân bổ tuổi
function drawAgeChart() {
    const ageStats = {};
    allData.forEach(c => {
        const ngaySinh = c['Ngày sinh'];
        if (ngaySinh) {
            // Parse ngày sinh định dạng DD/MM/YYYY
            const parts = ngaySinh.split('/');
            if (parts.length === 3) {
                const year = parseInt(parts[2]);
                if (year > 0) {
                    ageStats[year] = (ageStats[year] || 0) + 1;
                }
            }
        }
    });

    let sortedYears = Object.keys(ageStats)
        .map(y => parseInt(y))
        .sort((a, b) => a - b);
    let yearValues = sortedYears.map(y => ageStats[y]);

    if (reverseAgeChart) {
        sortedYears = sortedYears.reverse();
        yearValues = yearValues.reverse();
    }

    const canvas = document.getElementById('ageChart');
    const chartHeight = Math.max(400, sortedYears.length * 25);
    canvas.style.height = chartHeight + 'px';

    const ctx = canvas.getContext('2d');
    charts.ageChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedYears.map(y => 'Năm ' + y),
            datasets: [{
                label: 'Số Ứng Viên',
                data: yearValues,
                backgroundColor: getChartColors(sortedYears.length),
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                y: { beginAtZero: true }
            }
        }
    });
}

// Vẽ biểu đồ tỷ lệ hoàn thành thông tin
function drawNoteChart() {
    const hasNote = allData.filter(c => c['Ghi chú'] && c['Ghi chú'].trim()).length;
    const noNote = allData.length - hasNote;

    const canvas = document.getElementById('noteChart');
    const ctx = canvas.getContext('2d');

    charts.noteChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Có Ghi Chú', 'Không Ghi Chú'],
            datasets: [{
                data: [hasNote, noNote],
                backgroundColor: ['#4BC0C0', '#FF6384'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const total = hasNote + noNote;
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

// Tìm kiếm
function search() {
    currentPage = 1;
    const searchName = document.getElementById('searchInput').value.toLowerCase();
    const selectedPosition = document.getElementById('positionFilter').value;
    const selectedNV1 = document.getElementById('nv1Filter').value;
    const selectedNV2 = document.getElementById('nv2Filter').value;
    const selectedGender = document.getElementById('genderFilter').value;

    filteredData = allData.filter(candidate => {
        // Tìm kiếm theo tên
        const matchName = candidate['Họ tên'].toLowerCase().includes(searchName);

        // Tìm kiếm theo CCCD (với hoặc không có số 0 ở đầu)
        let matchCCCD = false;
        if (searchName.length > 0) {
            const cccdOriginal = candidate['Số CCCD'];
            const cccdWithZero = '0' + cccdOriginal;
            matchCCCD = cccdOriginal.includes(searchName) || cccdWithZero.includes(searchName);
        }

        const matchPosition = !selectedPosition || candidate['Vị trí dự tuyển'] === selectedPosition;
        const matchNV1 = !selectedNV1 || candidate['Tên trường NV1'] === selectedNV1;
        const matchNV2 = !selectedNV2 || candidate['Tên Trường NV2'] === selectedNV2;
        const matchGender = !selectedGender || candidate['Giới tính'] === selectedGender;

        return (matchName || matchCCCD) && matchPosition && matchNV1 && matchNV2 && matchGender;
    });

    updateStats();
    displayTable();
}

// Hiển thị bảng
function displayTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    if (filteredData.length === 0) {
        tbody.innerHTML = '<tr>                    <td colspan="9" class="no-data">Không có dữ liệu phù hợp</td></tr>';
        document.getElementById('pagination').innerHTML = '';
        document.getElementById('infoText').textContent = 'Không tìm thấy ứng viên nào.';
        return;
    }

    // Tính toán phân trang
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);

    // Hiển thị dữ liệu trang hiện tại
    pageData.forEach(candidate => {
        const row = tbody.insertRow();

        const badge = candidate['Giới tính'] === 'Nữ'
            ? `<span class="badge badge-female">Nữ</span>`
            : `<span class="badge badge-male">Nam</span>`;

        // Sửa CCCD theo giới tính
        let cccd = candidate['Số CCCD'];
        if (cccd && cccd.length > 0) {
            const firstDigit = parseInt(cccd[0]);
            const isGenderValid = candidate['Giới tính'] === 'Nữ'
                ? firstDigit % 2 === 0
                : firstDigit % 2 === 1;

            // Nếu giới tính không khớp với quy ước, thêm số 0 ở đầu
            if (!isGenderValid) {
                cccd = '0' + cccd;
            }
        }

        row.innerHTML = `
                    <td data-label="STT">${candidate['STT']}</td>
                    <td data-label="Họ Tên"><strong>${candidate['Họ tên']}</strong><span class="cccd-text">(${cccd})</span></td>
                    <td data-label="Vị Trí">${candidate['Vị trí dự tuyển']}</td>
                    <td data-label="Giới Tính">${badge}</td>
                    <td data-label="Ngày Sinh">${candidate['Ngày sinh']}</td>
                    <td data-label="Chuyên Ngành">${candidate['Chuyên ngành đào tạo']}</td>
                    <td data-label="NV1">${candidate['Tên trường NV1']}</td>
                    <td data-label="NV2">${candidate['Tên Trường NV2']}</td>
                    <td data-label="Ghi Chú" title="${candidate['Ghi chú']}">${candidate['Ghi chú'] ? '✓' : '-'}</td>
                `;
    });

    // Cập nhật thông tin
    document.getElementById('infoText').textContent =
        `Hiển thị ${startIndex + 1} - ${Math.min(endIndex, filteredData.length)} trong ${filteredData.length} kết quả`;

    // Hiển thị phân trang
    displayPagination(totalPages);
}

// Hiển thị nút phân trang
function displayPagination(totalPages) {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';

    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← Trước';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            displayTable();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    paginationDiv.appendChild(prevBtn);

    const pageInfo = document.createElement('span');
    pageInfo.style.margin = '0 20px';
    pageInfo.textContent = `${currentPage} / ${totalPages}`;
    paginationDiv.appendChild(pageInfo);

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Sau →';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayTable();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    paginationDiv.appendChild(nextBtn);
}

// Lắng nghe sự kiện Enter
document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') search();
});

// Khởi động khi trang tải
window.addEventListener('DOMContentLoaded', init);
