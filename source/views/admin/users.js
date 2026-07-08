import { 
  collection, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  doc
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';
import { db } from '../../config/firebase.js';
import { showToast, formatDate, getRoleLabel } from '../../utils/helpers.js';

export async function renderUserManagement() {
  const content = document.getElementById('content');
  
  content.innerHTML = `
    <div class="management-container">
      <div class="page-header">
        <h1>Quản Lý Người Dùng</h1>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab-btn active" data-tab="pending">Chờ duyệt</button>
        <button class="tab-btn" data-tab="active">Kích hoạt</button>
        <button class="tab-btn" data-tab="all">Tất cả</button>
      </div>

      <!-- Users Table -->
      <div class="card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Họ tên</th>
                <th>Vai trò</th>
                <th>Số điện thoại</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody id="usersTable">
              <tr>
                <td colspan="7" class="text-center text-muted">Đang tải...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  setupUserEvents();
  await loadUsers('pending');
}

async function loadUsers(status = null) {
  try {
    const usersRef = collection(db, 'users');
    let q;
    
    if (status === 'all') {
      q = query(usersRef);
    } else if (status) {
      q = query(usersRef, where('status', '==', status));
    } else {
      q = query(usersRef, where('status', '==', 'pending'));
    }

    const querySnapshot = await getDocs(q);
    const users = [];
    querySnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });

    displayUsers(users);
  } catch (error) {
    console.error('Lỗi tải người dùng:', error);
    showToast('Lỗi tải dữ liệu', 'danger');
  }
}

function displayUsers(users) {
  const table = document.getElementById('usersTable');
  
  if (users.length === 0) {
    table.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Không có người dùng</td></tr>';
    return;
  }

  table.innerHTML = users.map(user => `
    <tr>
      <td>${user.email}</td>
      <td>${user.fullName}</td>
      <td>${getRoleLabel(user.role)}</td>
      <td>${user.phone || '-'}</td>
      <td>
        <span class="badge ${user.status === 'active' ? 'badge-success' : 'badge-warning'}">
          ${user.status === 'active' ? 'Hoạt động' : 'Chờ duyệt'}
        </span>
      </td>
      <td>${user.createdAt ? formatDate(user.createdAt) : '-'}</td>
      <td>
        <div class="table-actions">
          ${user.status === 'pending' ? `
            <button class="btn btn-success btn-small" data-approve="${user.id}">Duyệt</button>
            <button class="btn btn-danger btn-small" data-reject="${user.id}">Từ chối</button>
          ` : ''}
          <button class="btn btn-primary btn-small" data-view="${user.id}">Chi tiết</button>
        </div>
      </td>
    </tr>
  `).join('');

  // Event listeners
  table.querySelectorAll('[data-approve]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await approveUser(btn.dataset.approve);
    });
  });

  table.querySelectorAll('[data-reject]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await rejectUser(btn.dataset.reject);
    });
  });

  table.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const users = await getAllUsers();
      const user = users.find(u => u.id === btn.dataset.view);
      if (user) showUserDetail(user);
    });
  });
}

async function approveUser(userId) {
  try {
    await updateDoc(doc(db, 'users', userId), { status: 'active' });
    showToast('Đã duyệt người dùng', 'success');
    
    const tabBtns = document.querySelectorAll('.tab-btn');
    const activeTab = Array.from(tabBtns).find(btn => btn.classList.contains('active'));
    if (activeTab) {
      await loadUsers(activeTab.dataset.tab);
    }
  } catch (error) {
    showToast(error.message, 'danger');
  }
}

async function rejectUser(userId) {
  const confirmed = confirm('Bạn chắc chắn muốn từ chối người dùng này?');
  if (!confirmed) return;

  try {
    await updateDoc(doc(db, 'users', userId), { status: 'rejected' });
    showToast('Đã từ chối người dùng', 'success');
    
    const tabBtns = document.querySelectorAll('.tab-btn');
    const activeTab = Array.from(tabBtns).find(btn => btn.classList.contains('active'));
    if (activeTab) {
      await loadUsers(activeTab.dataset.tab);
    }
  } catch (error) {
    showToast(error.message, 'danger');
  }
}

async function getAllUsers() {
  const querySnapshot = await getDocs(collection(db, 'users'));
  const users = [];
  querySnapshot.forEach(doc => {
    users.push({ id: doc.id, ...doc.data() });
  });
  return users;
}

function showUserDetail(user) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Chi Tiết Người Dùng</h2>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="detail-group">
          <label>Email:</label>
          <p>${user.email}</p>
        </div>

        <div class="detail-group">
          <label>Họ và tên:</label>
          <p>${user.fullName}</p>
        </div>

        <div class="detail-group">
          <label>Vai trò:</label>
          <p>${getRoleLabel(user.role)}</p>
        </div>

        <div class="detail-group">
          <label>Số điện thoại:</label>
          <p>${user.phone || '-'}</p>
        </div>

        <div class="detail-group">
          <label>Tổ chức:</label>
          <p>${user.organization || '-'}</p>
        </div>

        <div class="detail-group">
          <label>Địa chỉ:</label>
          <p>${user.address || '-'}</p>
        </div>

        <div class="detail-group">
          <label>Trạng thái:</label>
          <p>
            <span class="badge ${user.status === 'active' ? 'badge-success' : 'badge-warning'}">
              ${user.status === 'active' ? 'Hoạt động' : 'Chờ duyệt'}
            </span>
          </p>
        </div>

        <div class="detail-group">
          <label>Ngày tạo:</label>
          <p>${user.createdAt ? formatDate(user.createdAt) : '-'}</p>
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

function setupUserEvents() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const tab = btn.dataset.tab;
      await loadUsers(tab === 'all' ? null : tab);
    });
  });

  // Add tab styles
  addTabStyles();
}

function addTabStyles() {
  if (document.getElementById('tabStyles')) return;
  
  const style = document.createElement('style');
  style.id = 'tabStyles';
  style.textContent = `
    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      border-bottom: 2px solid var(--border-color);
    }

    .tab-btn {
      padding: 12px 20px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      color: #999;
      border-bottom: 2px solid transparent;
      transition: all 0.3s ease;
    }

    .tab-btn:hover {
      color: var(--text-color);
    }

    .tab-btn.active {
      color: var(--secondary-color);
      border-bottom-color: var(--secondary-color);
    }

    .detail-group {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid var(--border-color);
    }

    .detail-group:last-child {
      border-bottom: none;
    }

    .detail-group label {
      font-weight: 600;
      color: var(--text-color);
      display: block;
      margin-bottom: 8px;
    }

    .detail-group p {
      color: #666;
      margin: 0;
    }
  `;
  
  document.head.appendChild(style);
}
