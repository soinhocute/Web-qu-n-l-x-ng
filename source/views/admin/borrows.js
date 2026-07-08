import { 
  createBorrowRequest, 
  getBorrowRequests, 
  updateBorrowRequest,
  getMaterials,
  sendNotification
} from '../../services/dbService.js';
import { showToast, formatDate, getStatusLabel } from '../../utils/helpers.js';
import { getCurrentUserInfo, getAuthenticatedUser } from '../../app.js';

export async function renderBorrowManagement() {
  const content = document.getElementById('content');
  
  content.innerHTML = `
    <div class="management-container">
      <div class="page-header">
        <h1>Quản Lý Mượn/Trả Vật Tư</h1>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab-btn active" data-tab="pending">Chờ duyệt</button>
        <button class="tab-btn" data-tab="approved">Đã duyệt</button>
        <button class="tab-btn" data-tab="returned">Đã trả</button>
      </div>

      <!-- Requests Table -->
      <div class="card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Sinh viên</th>
                <th>Vật tư</th>
                <th>Số lượng</th>
                <th>Ngày mượn</th>
                <th>Hạn trả</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody id="borrowsTable">
              <tr>
                <td colspan="7" class="text-center text-muted">Đang tải...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div id="borrowDetailModal" class="hidden"></div>
  `;

  setupBorrowEvents();
  await loadBorrowRequests('pending');
}

async function loadBorrowRequests(status = null) {
  const requests = await getBorrowRequests(status ? { status } : {});
  displayBorrowRequests(requests, status);
}

function displayBorrowRequests(requests, currentTab = 'pending') {
  const table = document.getElementById('borrowsTable');
  
  if (requests.length === 0) {
    table.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Không có đơn mượn</td></tr>';
    return;
  }

  table.innerHTML = requests.map(request => `
    <tr>
      <td>${request.studentName}</td>
      <td>${request.materialName}</td>
      <td>${request.quantity}</td>
      <td>${formatDate(request.createdAt)}</td>
      <td>${request.returnDate ? formatDate(request.returnDate) : '-'}</td>
      <td>
        <span class="badge badge-${getStatusColorClass(request.status)}">
          ${getStatusLabel(request.status)}
        </span>
      </td>
      <td>
        <div class="table-actions">
          ${request.status === 'pending' ? `
            <button class="btn btn-success btn-small" data-approve="${request.id}">Duyệt</button>
            <button class="btn btn-danger btn-small" data-reject="${request.id}">Từ chối</button>
          ` : `
            <button class="btn btn-primary btn-small" data-view="${request.id}">Chi tiết</button>
            ${request.status === 'approved' ? `
              <button class="btn btn-warning btn-small" data-return="${request.id}">Xác nhận trả</button>
            ` : ''}
          `}
        </div>
      </td>
    </tr>
  `).join('');

  // Event listeners
  table.querySelectorAll('[data-approve]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await approveBorrow(btn.dataset.approve);
    });
  });

  table.querySelectorAll('[data-reject]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await rejectBorrow(btn.dataset.reject);
    });
  });

  table.querySelectorAll('[data-return]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await returnBorrow(btn.dataset.return);
    });
  });

  table.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const requests = await getBorrowRequests({});
      const request = requests.find(r => r.id === btn.dataset.view);
      if (request) showBorrowDetail(request);
    });
  });
}

async function approveBorrow(borrowId) {
  const result = await updateBorrowRequest(borrowId, { status: 'approved' });
  if (result.success) {
    showToast('Đã duyệt đơn mượn', 'success');
    loadBorrowRequests('pending');
  }
}

async function rejectBorrow(borrowId) {
  const result = await updateBorrowRequest(borrowId, { status: 'rejected' });
  if (result.success) {
    showToast('Đã từ chối đơn mượn', 'success');
    loadBorrowRequests('pending');
  }
}

async function returnBorrow(borrowId) {
  const result = await updateBorrowRequest(borrowId, { status: 'returned' });
  if (result.success) {
    showToast('Đã xác nhận trả vật tư', 'success');
    loadBorrowRequests('approved');
  }
}

function getStatusColorClass(status) {
  const map = {
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger',
    'returned': 'info'
  };
  return map[status] || 'info';
}

function setupBorrowEvents() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const tab = btn.dataset.tab;
      await loadBorrowRequests(tab);
    });
  });
}

function showBorrowDetail(request) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Chi Tiết Đơn Mượn</h2>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="detail-group">
          <label>Sinh viên:</label>
          <p>${request.studentName}</p>
        </div>

        <div class="detail-group">
          <label>Vật tư:</label>
          <p>${request.materialName}</p>
        </div>

        <div class="detail-group">
          <label>Số lượng:</label>
          <p>${request.quantity}</p>
        </div>

        <div class="detail-group">
          <label>Ngày mượn:</label>
          <p>${formatDate(request.createdAt)}</p>
        </div>

        <div class="detail-group">
          <label>Hạn trả:</label>
          <p>${request.returnDate ? formatDate(request.returnDate) : 'Chưa xác định'}</p>
        </div>

        <div class="detail-group">
          <label>Trạng thái:</label>
          <p>
            <span class="badge badge-${getStatusColorClass(request.status)}">
              ${getStatusLabel(request.status)}
            </span>
          </p>
        </div>

        <div class="detail-group">
          <label>Ghi chú:</label>
          <p>${request.note || '-'}</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="closeBtn">Đóng</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('#closeBtn').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// Student view - Tạo đơn mượn
export async function renderStudentBorrowForm() {
  const content = document.getElementById('content');
  const materials = await getMaterials();
  
  content.innerHTML = `
    <div class="management-container">
      <div class="page-header">
        <h1>Mượn Vật Tư</h1>
      </div>

      <div class="card">
        <form id="borrowForm">
          <div class="form-group">
            <label for="material">Chọn vật tư *</label>
            <select id="material" required>
              <option value="">-- Chọn vật tư --</option>
              ${materials.filter(m => m.status === 'active').map(m => `
                <option value="${m.id}">${m.name} (${m.quantity} ${m.unit})</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label for="quantity">Số lượng mượn *</label>
            <input type="number" id="quantity" min="1" required>
          </div>

          <div class="form-group">
            <label for="returnDate">Hạn trả dự kiến *</label>
            <input type="date" id="returnDate" required>
          </div>

          <div class="form-group">
            <label for="note">Ghi chú</label>
            <textarea id="note" placeholder="Nhập ghi chú..."></textarea>
          </div>

          <button type="submit" class="btn btn-primary">Gửi Đơn Mượn</button>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById('borrowForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const materialId = document.getElementById('material').value;
    const material = materials.find(m => m.id === materialId);
    const user = getCurrentUserInfo();
    const authUser = getAuthenticatedUser();

    const data = {
      studentId: authUser.uid,
      studentName: user.fullName,
      materialId,
      materialName: material.name,
      quantity: parseInt(document.getElementById('quantity').value),
      returnDate: new Date(document.getElementById('returnDate').value),
      note: document.getElementById('note').value,
      status: 'pending'
    };

    const result = await createBorrowRequest(data);
    if (result.success) {
      showToast('Đã gửi đơn mượn, chờ giáo viên duyệt', 'success');
      form.reset();
    } else {
      showToast(result.error, 'danger');
    }
  });
}
