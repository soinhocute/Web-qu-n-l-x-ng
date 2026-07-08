import {
  getMaterials,
  getEquipments,
  getBorrowRequests,
  updateBorrowRequest
} from '../../services/dbService.js';
import { showToast, formatDate } from '../../utils/helpers.js';

export async function renderTeacherDashboard() {
  const content = document.getElementById('content');
  
  content.innerHTML = `
    <div class="dashboard-container">
      <div class="page-header">
        <h1>Dashboard Giáo Viên</h1>
        <p>Quản lý xưởng và duyệt yêu cầu mượn/trả</p>
      </div>

      <!-- Quick Stats -->
      <div class="grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-boxes"></i>
          </div>
          <div class="stat-value" id="materialCount">0</div>
          <div class="stat-label">Vật tư quản lý</div>
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
            <i class="fas fa-handshake"></i>
          </div>
          <div class="stat-value" id="pendingCount">0</div>
          <div class="stat-label">Chờ duyệt</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Tác Vụ Nhanh</h2>
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
            <a href="#" class="quick-action-btn" id="reviewBorrowsBtn">
              <i class="fas fa-clipboard-check"></i>
              <span>Duyệt Mượn/Trả</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Pending Requests -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Yêu Cầu Chờ Duyệt</h2>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Sinh viên</th>
                  <th>Vật tư</th>
                  <th>Số lượng</th>
                  <th>Loại</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody id="pendingRequestsTable">
                <tr>
                  <td colspan="5" class="text-center text-muted">Đang tải...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  addDashboardStyles();
  setupTeacherDashboardActions();
  await loadTeacherDashboardData();
}

async function loadTeacherDashboardData() {
  const [materials, equipments, pendingRequests] = await Promise.all([
    getMaterials(),
    getEquipments(),
    getBorrowRequests({ status: 'pending' })
  ]);

  document.getElementById('materialCount').textContent = materials.length;
  document.getElementById('equipmentCount').textContent = equipments.length;
  document.getElementById('pendingCount').textContent = pendingRequests.length;

  renderPendingRequests(pendingRequests);
}

function renderPendingRequests(requests) {
  const table = document.getElementById('pendingRequestsTable');
  if (!table) return;

  if (!requests.length) {
    table.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Không có đơn mượn chờ duyệt</td></tr>';
    return;
  }

  table.innerHTML = requests.slice(0, 8).map(request => `
    <tr>
      <td>${request.studentName || 'Sinh viên'}</td>
      <td>${request.materialName || 'Vật tư'}</td>
      <td>${request.quantity || 0}</td>
      <td>${request.returnDate ? `Hạn trả ${formatDate(request.returnDate)}` : 'Mượn vật tư'}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-success btn-small" data-approve="${request.id}">
            <i class="fas fa-check"></i> Duyệt
          </button>
          <button class="btn btn-danger btn-small" data-reject="${request.id}">
            <i class="fas fa-xmark"></i> Từ chối
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  table.querySelectorAll('[data-approve]').forEach(button => {
    button.addEventListener('click', () => updateTeacherBorrow(button.dataset.approve, 'approved'));
  });

  table.querySelectorAll('[data-reject]').forEach(button => {
    button.addEventListener('click', () => updateTeacherBorrow(button.dataset.reject, 'rejected'));
  });
}

async function updateTeacherBorrow(requestId, status) {
  const result = await updateBorrowRequest(requestId, { status });
  if (!result.success) {
    showToast(result.error || 'Không thể cập nhật đơn mượn', 'danger');
    return;
  }

  showToast(status === 'approved' ? 'Đã duyệt đơn mượn' : 'Đã từ chối đơn mượn', 'success');
  await loadTeacherDashboardData();
}

function setupTeacherDashboardActions() {
  const navigate = (page) => {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === page);
    });
    window.dispatchEvent(new CustomEvent('pageNavigation', { detail: { page } }));
  };

  document.getElementById('addMaterialBtn')?.addEventListener('click', (event) => {
    event.preventDefault();
    navigate('teacher-materials');
  });

  document.getElementById('addEquipmentBtn')?.addEventListener('click', (event) => {
    event.preventDefault();
    navigate('teacher-equipments');
  });

  document.getElementById('reviewBorrowsBtn')?.addEventListener('click', (event) => {
    event.preventDefault();
    navigate('teacher-borrow');
  });
}

function addDashboardStyles() {
  if (document.getElementById('teacherDashboardStyles')) return;
  
  const style = document.createElement('style');
  style.id = 'teacherDashboardStyles';
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
