import { recordStudentEntry, getStudentEntries } from '../../services/dbService.js';
import { showToast, formatDate, formatTime } from '../../utils/helpers.js';
import { getCurrentUserInfo, getAuthenticatedUser } from '../../app.js';

export async function renderStudentEntryManagement() {
  const content = document.getElementById('content');
  
  content.innerHTML = `
    <div class="management-container">
      <div class="page-header">
        <h1>Quản Lý Ra Vào Sinh Viên</h1>
      </div>

      <!-- Quick Entry Buttons -->
      <div class="card">
        <h3>Ghi Nhận Ra Vào</h3>
        <div class="quick-actions">
          <button class="btn btn-success" id="checkInBtn" style="width: 100%; padding: 15px; margin-bottom: 10px;">
            <i class="fas fa-sign-in-alt"></i> Ghi Nhận Vào
          </button>
          <button class="btn btn-warning" id="checkOutBtn" style="width: 100%; padding: 15px;">
            <i class="fas fa-sign-out-alt"></i> Ghi Nhận Ra
          </button>
        </div>
      </div>

      <!-- Entries Table -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Lịch Sử Ra Vào</h2>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Sinh viên</th>
                <th>Thời gian</th>
                <th>Loại</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody id="entriesTable">
              <tr>
                <td colspan="4" class="text-center text-muted">Đang tải...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  setupEntryEvents();
  await loadEntries();
}

async function loadEntries() {
  const entries = await getStudentEntries();
  displayEntries(entries);
}

function displayEntries(entries) {
  const table = document.getElementById('entriesTable');
  
  if (entries.length === 0) {
    table.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Không có ghi nhận ra vào</td></tr>';
    return;
  }

  // Sắp xếp theo thời gian mới nhất
  entries.sort((a, b) => {
    const timeA = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
    const timeB = b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
    return timeB - timeA;
  });

  table.innerHTML = entries.slice(0, 50).map(entry => {
    const timestamp = entry.timestamp.toDate ? entry.timestamp.toDate() : new Date(entry.timestamp);
    return `
      <tr>
        <td>${entry.studentName}</td>
        <td>${formatDate(entry.timestamp)} ${formatTime(entry.timestamp)}</td>
        <td>
          <span class="badge ${entry.type === 'in' ? 'badge-success' : 'badge-warning'}">
            ${entry.type === 'in' ? 'Vào' : 'Ra'}
          </span>
        </td>
        <td>${entry.note || '-'}</td>
      </tr>
    `;
  }).join('');
}

async function recordEntry(type) {
  const user = getCurrentUserInfo();
  const authUser = getAuthenticatedUser();

  const data = {
    studentId: authUser.uid,
    studentName: user.fullName,
    type: type, // 'in' hoặc 'out'
    timestamp: new Date(),
    date: new Date().toISOString().split('T')[0],
    note: ''
  };

  const result = await recordStudentEntry(data);
  if (result.success) {
    showToast(`Đã ghi nhận ${type === 'in' ? 'vào' : 'ra'}`, 'success');
    loadEntries();
  } else {
    showToast(result.error, 'danger');
  }
}

function setupEntryEvents() {
  const checkInBtn = document.getElementById('checkInBtn');
  const checkOutBtn = document.getElementById('checkOutBtn');

  checkInBtn.addEventListener('click', () => recordEntry('in'));
  checkOutBtn.addEventListener('click', () => recordEntry('out'));
}

// Admin view - Xem toàn bộ ra vào
export async function renderAdminEntryManagement() {
  const content = document.getElementById('content');
  
  content.innerHTML = `
    <div class="management-container">
      <div class="page-header">
        <h1>Quản Lý Ra Vào Sinh Viên</h1>
      </div>

      <!-- Filter -->
      <div class="card">
        <div class="search-filter">
          <input type="text" id="searchStudent" placeholder="Tìm kiếm sinh viên...">
          <input type="date" id="filterDate">
          <button class="btn btn-primary" id="filterBtn">Lọc</button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid">
        <div class="stat-card">
          <div class="stat-value" id="todayInCount">0</div>
          <div class="stat-label">Vào hôm nay</div>
        </div>

        <div class="stat-card">
          <div class="stat-value" id="todayOutCount">0</div>
          <div class="stat-label">Ra hôm nay</div>
        </div>

        <div class="stat-card">
          <div class="stat-value" id="totalTodayCount">0</div>
          <div class="stat-label">Tổng ra vào</div>
        </div>
      </div>

      <!-- Entries Table -->
      <div class="card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Sinh viên</th>
                <th>Thời gian</th>
                <th>Loại</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody id="entriesTable">
              <tr>
                <td colspan="4" class="text-center text-muted">Đang tải...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  setupAdminEntryEvents();
  await loadAdminEntries();
}

async function loadAdminEntries() {
  const entries = await getStudentEntries();
  
  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = entries.filter(e => {
    const entryDate = e.date || new Date(e.timestamp.toDate ? e.timestamp.toDate() : e.timestamp).toISOString().split('T')[0];
    return entryDate === today;
  });

  const inCount = todayEntries.filter(e => e.type === 'in').length;
  const outCount = todayEntries.filter(e => e.type === 'out').length;

  document.getElementById('todayInCount').textContent = inCount;
  document.getElementById('todayOutCount').textContent = outCount;
  document.getElementById('totalTodayCount').textContent = todayEntries.length;

  displayAdminEntries(entries);
}

function displayAdminEntries(entries) {
  const table = document.getElementById('entriesTable');
  
  if (entries.length === 0) {
    table.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Không có ghi nhận ra vào</td></tr>';
    return;
  }

  entries.sort((a, b) => {
    const timeA = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
    const timeB = b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
    return timeB - timeA;
  });

  table.innerHTML = entries.slice(0, 100).map(entry => `
    <tr>
      <td>${entry.studentName}</td>
      <td>${formatDate(entry.timestamp)} ${formatTime(entry.timestamp)}</td>
      <td>
        <span class="badge ${entry.type === 'in' ? 'badge-success' : 'badge-warning'}">
          ${entry.type === 'in' ? 'Vào' : 'Ra'}
        </span>
      </td>
      <td>${entry.note || '-'}</td>
    </tr>
  `).join('');
}

function setupAdminEntryEvents() {
  const searchInput = document.getElementById('searchStudent');
  const dateInput = document.getElementById('filterDate');
  const filterBtn = document.getElementById('filterBtn');

  filterBtn.addEventListener('click', async () => {
    let entries = await getStudentEntries();

    if (searchInput.value) {
      entries = entries.filter(e => e.studentName.toLowerCase().includes(searchInput.value.toLowerCase()));
    }

    if (dateInput.value) {
      entries = entries.filter(e => (e.date || new Date(e.timestamp.toDate()).toISOString().split('T')[0]) === dateInput.value);
    }

    displayAdminEntries(entries);
  });
}
