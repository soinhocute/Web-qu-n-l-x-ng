import { logoutUser } from '../services/authService.js';
import { removeToken, removeUserInfo } from '../utils/helpers.js';

let isSidebarCollapsed = false;

export function renderLayout(role, user = {}) {
  const app = document.getElementById('app');
  const displayName = user.displayName || user.email || 'Khách';

  applySavedTheme();

  app.innerHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header" id="sidebarHeader">
        <div class="sidebar-logo">
          <span class="sidebar-logo-mark"><i class="fas fa-leaf"></i></span>
          <span class="sidebar-brand-text">
            <strong>Xưởng Maker</strong>
            <small>Quản lý xưởng thực tập gỗ</small>
          </span>
        </div>
      </div>
      <nav class="sidebar-nav" id="sidebarNav">
        ${getSidebarMenuByRole(role)}
      </nav>
    </aside>

    <div class="main-content" id="mainContent">
      <nav class="navbar">
        <div class="navbar-left">
          <button class="toggle-sidebar" id="toggleSidebar" title="Thu gọn menu">
            <i class="fas fa-bars"></i>
          </button>
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" id="searchInput" placeholder="Tìm vật tư, thiết bị, sinh viên...">
          </div>
        </div>
        <div class="navbar-right">
          <button class="theme-toggle" id="themeToggle" title="Đổi chế độ sáng/tối">
            <i class="fas fa-moon"></i>
          </button>
          <div class="navbar-icon" id="notificationIcon" title="Thông báo">
            <i class="fas fa-bell"></i>
            <span class="notification-badge" id="notificationBadge">3</span>
          </div>
          <div class="user-profile" id="userProfile">
            <div class="user-avatar" title="${user.email || displayName}">${getInitials(displayName)}</div>
            <span>${displayName}</span>
          </div>
        </div>
      </nav>

      <div class="content" id="content"></div>
    </div>

    <div class="notification-dropdown hidden" id="notificationDropdown">
      <div class="notification-list" id="notificationList">
        <div class="notification-item">
          <strong>Đơn mượn mới</strong>
          <p>Sinh viên vừa gửi yêu cầu mượn vật tư.</p>
        </div>
        <div class="notification-item">
          <strong>Bảo trì thiết bị</strong>
          <p>Máy cưa bàn cần kiểm tra định kỳ.</p>
        </div>
        <div class="notification-item">
          <strong>Tồn kho thấp</strong>
          <p>Keo dán gỗ sắp hết mức tối thiểu.</p>
        </div>
      </div>
    </div>

    <div class="user-menu-dropdown hidden" id="userMenuDropdown">
      <a href="#" class="dropdown-item" id="profileLink">
        <i class="fas fa-user"></i> Hồ sơ
      </a>
      <a href="#" class="dropdown-item" id="settingsLink">
        <i class="fas fa-cog"></i> Cài đặt
      </a>
      <hr>
      <a href="#" class="dropdown-item" id="logoutLink">
        <i class="fas fa-sign-out-alt"></i> ${user.email ? 'Đăng xuất' : 'Về chọn vai trò'}
      </a>
    </div>
  `;

  updateThemeIcon(document.body.dataset.theme || 'light');
  addDropdownStyles();
  setupLayoutEvents(Boolean(user.email));
  setupRippleEffects();
}

function getSidebarMenuByRole(role) {
  const menus = {
    admin: `
      <li><a href="#dashboard" class="nav-link active" data-page="admin-dashboard"><i class="fas fa-th-large"></i> <span>Tổng quan</span></a></li>
      <li><a href="#users" class="nav-link" data-page="admin-users"><i class="fas fa-users"></i> <span>Tài khoản</span></a></li>
      <li><a href="#materials" class="nav-link" data-page="admin-materials"><i class="fas fa-boxes"></i> <span>Vật tư</span></a></li>
      <li><a href="#equipments" class="nav-link" data-page="admin-equipments"><i class="fas fa-tools"></i> <span>Thiết bị</span></a></li>
      <li><a href="#borrow-requests" class="nav-link" data-page="admin-borrow"><i class="fas fa-handshake"></i> <span>Mượn/trả</span></a></li>
      <li><a href="#student-entries" class="nav-link" data-page="admin-entries"><i class="fas fa-right-to-bracket"></i> <span>Lượt ra vào</span></a></li>
      <li><a href="#inventory" class="nav-link" data-page="admin-inventory"><i class="fas fa-warehouse"></i> <span>Xuất nhập kho</span></a></li>
      <li><a href="#schedules" class="nav-link" data-page="admin-schedules"><i class="fas fa-calendar-days"></i> <span>Thời khóa biểu</span></a></li>
      <li><a href="#statistics" class="nav-link" data-page="admin-statistics"><i class="fas fa-chart-line"></i> <span>Thống kê</span></a></li>
    `,
    teacher: `
      <li><a href="#dashboard" class="nav-link active" data-page="teacher-dashboard"><i class="fas fa-th-large"></i> <span>Tổng quan</span></a></li>
      <li><a href="#materials" class="nav-link" data-page="teacher-materials"><i class="fas fa-boxes"></i> <span>Vật tư</span></a></li>
      <li><a href="#equipments" class="nav-link" data-page="teacher-equipments"><i class="fas fa-tools"></i> <span>Thiết bị</span></a></li>
      <li><a href="#student-entries" class="nav-link" data-page="teacher-entries"><i class="fas fa-right-to-bracket"></i> <span>Lượt ra vào</span></a></li>
      <li><a href="#borrow-requests" class="nav-link" data-page="teacher-borrow"><i class="fas fa-handshake"></i> <span>Duyệt mượn/trả</span></a></li>
      <li><a href="#inventory" class="nav-link" data-page="teacher-inventory"><i class="fas fa-warehouse"></i> <span>Xuất nhập kho</span></a></li>
      <li><a href="#schedules" class="nav-link" data-page="teacher-schedules"><i class="fas fa-calendar-days"></i> <span>Thời khóa biểu</span></a></li>
    `,
    student: `
      <li><a href="#dashboard" class="nav-link active" data-page="student-dashboard"><i class="fas fa-th-large"></i> <span>Tổng quan</span></a></li>
      <li><a href="#my-borrows" class="nav-link" data-page="student-borrows"><i class="fas fa-handshake"></i> <span>Mượn/trả vật tư</span></a></li>
      <li><a href="#materials" class="nav-link" data-page="student-materials"><i class="fas fa-boxes"></i> <span>Vật tư xưởng</span></a></li>
      <li><a href="#my-entries" class="nav-link" data-page="student-entries"><i class="fas fa-right-to-bracket"></i> <span>Lịch ra vào</span></a></li>
      <li><a href="#schedules" class="nav-link" data-page="student-schedules"><i class="fas fa-calendar-days"></i> <span>Thời khóa biểu</span></a></li>
    `,
    partner: `
      <li><a href="#overview" class="nav-link active" data-page="partner-overview"><i class="fas fa-th-large"></i> <span>Giới thiệu</span></a></li>
      <li><a href="#statistics" class="nav-link" data-page="partner-statistics"><i class="fas fa-chart-line"></i> <span>Thống kê</span></a></li>
      <li><a href="#partners" class="nav-link" data-page="partner-list"><i class="fas fa-network-wired"></i> <span>Đối tác</span></a></li>
    `,
    guest: `
      <li><a href="#overview" class="nav-link active" data-page="public-overview"><i class="fas fa-th-large"></i> <span>Giới thiệu</span></a></li>
      <li><a href="#register" class="nav-link" data-page="public-register"><i class="fas fa-user-plus"></i> <span>Đăng kí</span></a></li>
    `
  };

  return menus[role] || menus.guest;
}

function setupLayoutEvents(hasAccount) {
  const toggleBtn = document.getElementById('toggleSidebar');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');

  toggleBtn?.addEventListener('click', () => {
    isSidebarCollapsed = !isSidebarCollapsed;
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('collapsed');
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('active'));
      link.classList.add('active');
      animatePageTransition();
      window.dispatchEvent(new CustomEvent('pageNavigation', { detail: { page: link.dataset.page } }));
    });
  });

  const notifIcon = document.getElementById('notificationIcon');
  const notifDropdown = document.getElementById('notificationDropdown');
  notifIcon?.addEventListener('click', () => notifDropdown.classList.toggle('hidden'));

  const themeToggle = document.getElementById('themeToggle');
  themeToggle?.addEventListener('click', () => {
    const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    document.body.dataset.theme = nextTheme;
    localStorage.setItem('workshopTheme', nextTheme);
    updateThemeIcon(nextTheme);
  });

  const userProfile = document.getElementById('userProfile');
  const userMenuDropdown = document.getElementById('userMenuDropdown');
  userProfile?.addEventListener('click', () => userMenuDropdown.classList.toggle('hidden'));

  const logoutLink = document.getElementById('logoutLink');
  logoutLink?.addEventListener('click', async (e) => {
    e.preventDefault();
    if (hasAccount) {
      const result = await logoutUser();
      if (!result.success) return;
    }
    removeUserInfo();
    removeToken();
    sessionStorage.removeItem('selectedRole');
    location.href = './index.html';
  });

  const searchInput = document.getElementById('searchInput');
  searchInput?.addEventListener('input', (e) => {
    window.dispatchEvent(new CustomEvent('search', { detail: { keyword: e.target.value } }));
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar-icon') && notifDropdown) {
      notifDropdown.classList.add('hidden');
    }
    if (!e.target.closest('.user-profile') && userMenuDropdown) {
      userMenuDropdown.classList.add('hidden');
    }
  });
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem('workshopTheme') || 'light';
  document.body.dataset.theme = savedTheme;
  updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#themeToggle i');
  if (!icon) return;
  icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function animatePageTransition() {
  const content = document.getElementById('content');
  if (!content) return;
  content.classList.remove('page-enter');
  void content.offsetWidth;
  content.classList.add('page-enter');
}

function setupRippleEffects() {
  if (document.body.dataset.rippleReady === 'true') return;
  document.body.dataset.rippleReady = 'true';

  document.addEventListener('click', (event) => {
    const target = event.target.closest('.btn, .quick-action-btn, .tab-btn, .filter-btn, .action-btn, .toggle-sidebar, .theme-toggle, .chat-button');
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.className = 'ripple';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    target.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 650);
  });
}

function getInitials(name) {
  if (!name) return 'K';
  return name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function addDropdownStyles() {
  if (document.getElementById('dropdownStyles')) return;

  const style = document.createElement('style');
  style.id = 'dropdownStyles';
  style.textContent = `
    .notification-dropdown,
    .user-menu-dropdown {
      position: fixed;
      top: 70px;
      right: 24px;
      background: white;
      border: 1px solid rgba(15, 23, 42, 0.08);
      border-radius: 8px;
      box-shadow: 0 16px 40px rgba(15, 23, 42, 0.18);
      min-width: 240px;
      z-index: 1100;
      overflow: hidden;
    }

    .notification-dropdown {
      right: 116px;
      width: 320px;
    }

    .notification-item {
      padding: 14px 16px;
      border-bottom: 1px solid #eef2f7;
      cursor: pointer;
    }

    .notification-item:last-child {
      border-bottom: 0;
    }

    .notification-item:hover,
    .dropdown-item:hover {
      background-color: #f5f7fb;
    }

    .notification-item strong {
      display: block;
      color: var(--primary-color);
      margin-bottom: 4px;
    }

    .notification-item p {
      color: #64748b;
      font-size: 13px;
      margin: 0;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 15px;
      color: var(--text-color);
      text-decoration: none;
    }

    .user-menu-dropdown hr {
      margin: 6px 0;
      border: 0;
      border-top: 1px solid var(--border-color);
    }
  `;

  document.head.appendChild(style);
}
