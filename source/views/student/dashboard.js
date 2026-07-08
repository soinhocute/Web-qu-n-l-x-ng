import { getBorrowRequests } from '../../services/dbService.js';
import { getCurrentUser } from '../../services/authService.js';

export async function renderStudentDashboard() {
  const content = document.getElementById('content');
  
  content.innerHTML = `
    <div class="dashboard-container">
      <div class="page-header">
        <h1>Dashboard Sinh Viên</h1>
        <p>Mượn/trả vật tư và xem thông tin</p>
      </div>

      <!-- Quick Stats -->
      <div class="grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-handshake"></i>
          </div>
          <div class="stat-value" id="borrowCount">0</div>
          <div class="stat-label">Đơn mượn</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-value" id="pendingCount">0</div>
          <div class="stat-label">Chờ duyệt</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-value" id="approvedCount">0</div>
          <div class="stat-label">Đã duyệt</div>
        </div>
      </div>

      <!-- Visual Statistics -->
      <div class="dashboard-charts">
        <div class="card chart-card">
          <div class="card-header">
            <h2 class="card-title"><i class="fas fa-chart-column"></i> Nhip muon tra</h2>
          </div>
          <div class="card-body">
            <div class="bar-chart">
              <div class="bar-row">
                <span>Don muon</span>
                <div class="bar-track"><div class="bar-fill" id="borrowChartFill" style="--value: 8%"></div></div>
                <strong id="borrowChartValue">0</strong>
              </div>
              <div class="bar-row">
                <span>Cho duyet</span>
                <div class="bar-track"><div class="bar-fill" id="pendingChartFill" style="--value: 8%"></div></div>
                <strong id="pendingChartValue">0</strong>
              </div>
              <div class="bar-row">
                <span>Da duyet</span>
                <div class="bar-track"><div class="bar-fill" id="approvedChartFill" style="--value: 8%"></div></div>
                <strong id="approvedChartValue">0</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="card chart-card">
          <div class="card-header">
            <h2 class="card-title"><i class="fas fa-seedling"></i> Tien do xuong</h2>
          </div>
          <div class="card-body">
            <div class="donut-chart" id="studentDonutChart" style="--pending: 0%; --approved: 0%;" aria-label="Student workflow chart"></div>
            <div class="chart-legend">
              <span><i class="legend-dot legend-pending"></i>Cho duyet</span>
              <span><i class="legend-dot legend-approved"></i>San sang</span>
              <span><i class="legend-dot legend-other"></i>Luu kho</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Tác Vụ Nhanh</h2>
        </div>
        <div class="card-body">
          <div class="quick-actions">
            <a href="#" class="quick-action-btn" id="borrowMaterialBtn">
              <i class="fas fa-plus"></i>
              <span>Mượn Vật Tư</span>
            </a>
            <a href="#" class="quick-action-btn" id="myBorrowsBtn">
              <i class="fas fa-list"></i>
              <span>Đơn Mượn Của Tôi</span>
            </a>
            <a href="#" class="quick-action-btn" id="scheduleBtn">
              <i class="fas fa-calendar"></i>
              <span>Thời Khóa Biểu</span>
            </a>
          </div>
        </div>
      </div>

      <!-- My Borrow Requests -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Đơn Mượn Của Tôi</h2>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Vật tư</th>
                  <th>Số lượng</th>
                  <th>Ngày mượn</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody id="myBorrowsTable">
                <tr>
                  <td colspan="4" class="text-center text-muted">Đang tải...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  addDashboardStyles();
  await loadStudentDashboardData();
}

async function loadStudentDashboardData() {
  const user = getCurrentUser();
  if (!user?.uid) return;

  try {
    const requests = await getBorrowRequests({ studentId: user.uid });
    const pending = requests.filter(request => request.status === 'pending').length;
    const approved = requests.filter(request => request.status === 'approved').length;

    document.getElementById('borrowCount').textContent = requests.length;
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('approvedCount').textContent = approved;
    document.getElementById('borrowChartValue').textContent = requests.length;
    document.getElementById('pendingChartValue').textContent = pending;
    document.getElementById('approvedChartValue').textContent = approved;

    const max = Math.max(requests.length, pending, approved, 1);
    document.getElementById('borrowChartFill')?.style.setProperty('--value', `${Math.max(8, Math.round((requests.length / max) * 100))}%`);
    document.getElementById('pendingChartFill')?.style.setProperty('--value', `${Math.max(8, Math.round((pending / max) * 100))}%`);
    document.getElementById('approvedChartFill')?.style.setProperty('--value', `${Math.max(8, Math.round((approved / max) * 100))}%`);

    const total = Math.max(requests.length, 1);
    const donut = document.getElementById('studentDonutChart');
    donut?.style.setProperty('--pending', `${Math.round((pending / total) * 100)}%`);
    donut?.style.setProperty('--approved', `${Math.round(((pending + approved) / total) * 100)}%`);

    const table = document.getElementById('myBorrowsTable');
    if (!table) return;

    if (requests.length === 0) {
      table.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Chua co don muon</td></tr>';
      return;
    }

    table.innerHTML = requests.slice(0, 6).map(request => `
      <tr>
        <td>${request.materialName || 'Vat tu'}</td>
        <td>${request.quantity || 0}</td>
        <td>${formatDate(request.createdAt)}</td>
        <td><span class="badge ${getStatusBadgeClass(request.status)}">${getStatusLabel(request.status)}</span></td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Loi tai dashboard sinh vien:', error);
  }
}

function formatDate(timestamp) {
  if (!timestamp?.toDate) return '--';
  return new Date(timestamp.toDate()).toLocaleDateString('vi-VN');
}

function getStatusBadgeClass(status) {
  if (status === 'approved') return 'badge-success';
  if (status === 'rejected') return 'badge-danger';
  return 'badge-warning';
}

function getStatusLabel(status) {
  if (status === 'approved') return 'Da duyet';
  if (status === 'rejected') return 'Tu choi';
  return 'Cho duyet';
}

function addDashboardStyles() {
  if (document.getElementById('studentDashboardStyles')) return;
  
  const style = document.createElement('style');
  style.id = 'studentDashboardStyles';
  style.textContent = `
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
