import { getMaterials, getEquipments, getBorrowRequests, getStudentEntries } from '../../services/dbService.js';

export async function renderAdminDashboard() {
  const content = document.getElementById('content');
  
  content.innerHTML = `
    <div class="dashboard-container">
      <div class="page-header">
        <h1>Dashboard Quản Trị Viên</h1>
        <p>Chào mừng bạn quay trở lại</p>
      </div>

      <!-- Stats -->
      <div class="grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-boxes"></i>
          </div>
          <div class="stat-value" id="materialCount">0</div>
          <div class="stat-label">Vật tư xưởng</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-tools"></i>
          </div>
          <div class="stat-value" id="equipmentCount">0</div>
          <div class="stat-label">Thiết bị</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-value" id="borrowCount">0</div>
          <div class="stat-label">Đơn mượn chờ duyệt</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-value" id="entryCount">0</div>
          <div class="stat-label">Ra vào hôm nay</div>
        </div>
      </div>

      <!-- Visual Statistics -->
      <div class="dashboard-charts">
        <div class="card chart-card">
          <div class="card-header">
            <h2 class="card-title"><i class="fas fa-chart-column"></i> Thong ke xuong</h2>
          </div>
          <div class="card-body">
            <div class="bar-chart" id="workshopBarChart"></div>
          </div>
        </div>

        <div class="card chart-card">
          <div class="card-header">
            <h2 class="card-title"><i class="fas fa-circle-notch"></i> Trang thai muon</h2>
          </div>
          <div class="card-body">
            <div class="donut-chart" id="borrowDonutChart" aria-label="Borrow status chart"></div>
            <div class="chart-legend">
              <span><i class="legend-dot legend-pending"></i>Cho duyet</span>
              <span><i class="legend-dot legend-approved"></i>Da duyet</span>
              <span><i class="legend-dot legend-other"></i>Khac</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Borrow Requests -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Đơn Mượn Gần Đây</h2>
          <a href="#" class="btn btn-primary btn-small" id="viewAllBorrows">Xem tất cả</a>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Sinh viên</th>
                  <th>Vật tư</th>
                  <th>Số lượng</th>
                  <th>Ngày mượn</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody id="recentBorrowsTable">
                <tr>
                  <td colspan="6" class="text-center text-muted">Đang tải...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Các Tác Vụ Nhanh</h2>
        </div>
        <div class="card-body">
          <div class="quick-actions">
            <a href="#" class="quick-action-btn" id="addMaterialBtn">
              <i class="fas fa-plus"></i>
              <span>Thêm Vật Tư</span>
            </a>
            <a href="#" class="quick-action-btn" id="addEquipmentBtn">
              <i class="fas fa-plus"></i>
              <span>Thêm Thiết Bị</span>
            </a>
            <a href="#" class="quick-action-btn" id="addUserBtn">
              <i class="fas fa-user-plus"></i>
              <span>Thêm Người Dùng</span>
            </a>
            <a href="#" class="quick-action-btn" id="viewStatisticsBtn">
              <i class="fas fa-chart-bar"></i>
              <span>Xem Thống Kê</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  addDashboardStyles();
  await loadDashboardData();
}

async function loadDashboardData() {
  try {
    // Load materials
    const materials = await getMaterials();
    document.getElementById('materialCount').textContent = materials.length;

    // Load equipments
    const equipments = await getEquipments();
    document.getElementById('equipmentCount').textContent = equipments.length;

    // Load borrow requests
    const allBorrowRequests = await getBorrowRequests();
    const borrowRequests = allBorrowRequests.filter(request => request.status === 'pending');
    document.getElementById('borrowCount').textContent = borrowRequests.length;

    // Load today entries
    const entries = await getStudentEntries();
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = entries.filter(e => {
      const entryDate = new Date(e.timestamp.toDate()).toISOString().split('T')[0];
      return entryDate === today;
    });
    document.getElementById('entryCount').textContent = todayEntries.length;

    // Load recent borrows
    const recentBorrows = borrowRequests.slice(0, 5);
    const table = document.getElementById('recentBorrowsTable');
    renderWorkshopCharts({
      materials: materials.length,
      equipments: equipments.length,
      pendingBorrows: borrowRequests.length,
      allBorrows: allBorrowRequests.length,
      todayEntries: todayEntries.length,
      approvedBorrows: allBorrowRequests.filter(request => request.status === 'approved').length
    });
    
    if (recentBorrows.length === 0) {
      table.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Không có đơn mượn</td></tr>';
    } else {
      table.innerHTML = recentBorrows.map(borrow => `
        <tr>
          <td>${borrow.studentName}</td>
          <td>${borrow.materialName}</td>
          <td>${borrow.quantity}</td>
          <td>${new Date(borrow.createdAt.toDate()).toLocaleDateString('vi-VN')}</td>
          <td><span class="badge badge-warning">Chờ duyệt</span></td>
          <td>
            <button class="btn btn-success btn-small" data-approve="${borrow.id}">Duyệt</button>
            <button class="btn btn-danger btn-small" data-reject="${borrow.id}">Từ chối</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (error) {
    console.error('Lỗi tải dữ liệu dashboard:', error);
  }
}

function renderWorkshopCharts(stats) {
  const chart = document.getElementById('workshopBarChart');
  const donut = document.getElementById('borrowDonutChart');
  if (!chart || !donut) return;

  const rows = [
    { label: 'Vat tu', value: stats.materials },
    { label: 'Thiet bi', value: stats.equipments },
    { label: 'Don muon', value: stats.allBorrows },
    { label: 'Ra vao', value: stats.todayEntries }
  ];
  const max = Math.max(...rows.map(row => row.value), 1);

  chart.innerHTML = rows.map(row => {
    const width = Math.max(8, Math.round((row.value / max) * 100));
    return `
      <div class="bar-row">
        <span>${row.label}</span>
        <div class="bar-track"><div class="bar-fill" style="--value: ${width}%"></div></div>
        <strong>${row.value}</strong>
      </div>
    `;
  }).join('');

  const total = Math.max(stats.allBorrows, 1);
  const pending = Math.round((stats.pendingBorrows / total) * 100);
  const approved = Math.round(((stats.pendingBorrows + stats.approvedBorrows) / total) * 100);
  donut.style.setProperty('--pending', `${pending}%`);
  donut.style.setProperty('--approved', `${approved}%`);
}

function addDashboardStyles() {
  if (document.getElementById('dashboardStyles')) return;
  
  const style = document.createElement('style');
  style.id = 'dashboardStyles';
  style.textContent = `
    .dashboard-container {
      animation: fadeIn 0.3s ease;
    }

    .page-header {
      margin-bottom: 30px;
    }

    .page-header h1 {
      font-size: 28px;
      color: var(--primary-color);
      margin-bottom: 5px;
    }

    .page-header p {
      color: #999;
      font-size: 14px;
    }

    .stat-card {
      background: var(--surface-color);
      padding: 25px;
      border-radius: 18px;
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      border-left: 0;
      border: 1px solid var(--glass-border);
      backdrop-filter: blur(18px);
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: none;
      box-shadow: var(--shadow);
    }

    .stat-icon {
      font-size: 32px;
      color: var(--secondary-color);
      margin-bottom: 10px;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }

    .quick-action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, rgba(47, 107, 69, 0.92), rgba(138, 90, 43, 0.9));
      color: white;
      border-radius: 16px;
      text-decoration: none;
      transition: all 0.3s ease;
      gap: 10px;
      font-size: 14px;
      font-weight: 500;
    }

    .quick-action-btn:hover {
      transform: translateY(-5px);
      box-shadow: 0 18px 40px rgba(80, 63, 37, 0.28);
    }

    .quick-action-btn i {
      font-size: 24px;
    }
  `;
  
  document.head.appendChild(style);
}
