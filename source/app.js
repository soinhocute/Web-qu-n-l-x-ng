import { onAuthChange, getUserInfo, logoutUser } from './services/authService.js';
import { removeToken, removeUserInfo, saveUserInfo } from './utils/helpers.js';
import { renderLogin } from './views/login.js';
import { renderRoleSelector } from './views/roleSelector.js';
import { renderAdminDashboard } from './views/admin/dashboard.js';
import { renderMaterialCatalog, renderMaterialManagement } from './views/admin/materials.js';
import { renderEquipmentManagement } from './views/admin/equipments.js';
import { renderBorrowManagement, renderStudentBorrowForm } from './views/admin/borrows.js';
import { renderUserManagement } from './views/admin/users.js';
import { renderAdminEntryManagement, renderStudentEntryManagement } from './views/admin/entries.js';
import { renderInventoryManagement } from './views/admin/inventory.js';
import { renderScheduleManagement } from './views/admin/schedules.js';
import { renderTeacherDashboard } from './views/teacher/dashboard.js';
import { renderStudentDashboard } from './views/student/dashboard.js';
import { renderPublicPage } from './views/public/page.js';
import { renderPartnerList, renderPartnerPage, renderPartnerStats } from './views/public/partnerPage.js';
import { renderLayout } from './components/layout.js';
import { renderChatBubble } from './components/chatBubble.js';

let currentUser = null;
let userInfo = null;

export async function initApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  appContainer.innerHTML = `
    <div style="min-height:100vh;display:grid;place-items:center;background:#eef3f8;color:#1f2937;font-family:Arial,sans-serif;">
      <div>Đang tải hệ thống...</div>
    </div>
  `;

  const params = new URLSearchParams(window.location.search);
  const isAdminRoute = window.location.pathname.endsWith('/admin.html') || params.get('admin') === '1';

  if (isAdminRoute) {
    sessionStorage.setItem('selectedRole', 'admin');
  }

  onAuthChange(async (user) => {
    currentUser = user;

    if (!user) {
      appContainer.innerHTML = '';
      if (isAdminRoute) {
        renderLogin('admin');
      } else {
        renderRoleSelector();
      }
      return;
    }

    userInfo = await getUserInfo(user.uid);

    if (!userInfo) {
      await logoutAndReset();
      alert('Không tìm thấy thông tin tài khoản. Vui lòng liên hệ admin.');
      renderRoleSelector();
      return;
    }

    const selectedRole = sessionStorage.getItem('selectedRole');
    if (selectedRole && selectedRole !== 'guest' && selectedRole !== userInfo.role) {
      await logoutAndReset();
      alert('Tài khoản này không thuộc nhóm bạn đã chọn. Vui lòng chọn đúng vai trò.');
      renderRoleSelector();
      return;
    }

    if (userInfo.status === 'pending') {
      await logoutAndReset();
      alert('Tài khoản của bạn đang chờ admin duyệt.');
      renderRoleSelector();
      return;
    }

    if (userInfo.status === 'rejected') {
      await logoutAndReset();
      alert('Tài khoản của bạn đã bị từ chối. Vui lòng liên hệ admin.');
      renderRoleSelector();
      return;
    }

    saveUserInfo(userInfo);
    renderApp();
  });

  window.addEventListener('pageNavigation', async (e) => {
    await handlePageNavigation(e.detail.page);
  });
}

function renderApp() {
  const appContainer = document.getElementById('app');

  if (!userInfo) {
    appContainer.innerHTML = '';
    renderRoleSelector();
    return;
  }

  appContainer.innerHTML = '';
  renderLayout(userInfo.role, currentUser);
  renderDefaultDashboard();

  document.getElementById('chatBubble')?.remove();
  if (userInfo.role !== 'guest' && currentUser?.uid) {
    renderChatBubble(currentUser.uid);
  }
}

export async function renderGuestApp(page = 'public-overview') {
  currentUser = null;
  userInfo = {
    uid: 'guest',
    role: page.startsWith('partner') ? 'partner' : 'guest',
    fullName: page.startsWith('partner') ? 'Đối tác' : 'Khách',
    email: ''
  };

  document.getElementById('app').innerHTML = '';
  renderLayout(userInfo.role, {
    email: '',
    displayName: userInfo.fullName
  });
  document.getElementById('chatBubble')?.remove();
  await handlePageNavigation(page);
}

async function renderDefaultDashboard() {
  switch (userInfo.role) {
    case 'admin':
      await renderAdminDashboard();
      break;
    case 'teacher':
      await renderTeacherDashboard();
      break;
    case 'student':
      await renderStudentDashboard();
      break;
    case 'partner':
      await renderPartnerPage();
      break;
    case 'guest':
      await renderPublicPage();
      break;
    default:
      renderRoleSelector();
  }
}

async function handlePageNavigation(page) {
  try {
    const role = userInfo?.role || 'guest';

    if (page === 'admin-dashboard') {
      await renderAdminDashboard();
    } else if (page === 'admin-users') {
      await renderUserManagement();
    } else if (page === 'admin-materials') {
      await renderMaterialManagement();
    } else if (page === 'admin-equipments') {
      await renderEquipmentManagement();
    } else if (page === 'admin-borrow') {
      await renderBorrowManagement();
    } else if (page === 'admin-entries') {
      await renderAdminEntryManagement();
    } else if (page === 'admin-schedules') {
      await renderScheduleManagement(role);
    } else if (page === 'admin-inventory') {
      await renderInventoryManagement(role);
    } else if (page === 'admin-statistics') {
      await renderPartnerStats();
    } else if (page === 'teacher-dashboard') {
      await renderTeacherDashboard();
    } else if (page === 'teacher-materials') {
      await renderMaterialManagement();
    } else if (page === 'teacher-equipments') {
      await renderEquipmentManagement();
    } else if (page === 'teacher-borrow') {
      await renderBorrowManagement();
    } else if (page === 'teacher-entries') {
      await renderAdminEntryManagement();
    } else if (page === 'teacher-schedules') {
      await renderScheduleManagement(role);
    } else if (page === 'teacher-inventory') {
      await renderInventoryManagement(role);
    } else if (page === 'student-dashboard') {
      await renderStudentDashboard();
    } else if (page === 'student-borrows') {
      await renderStudentBorrowForm();
    } else if (page === 'student-entries') {
      await renderStudentEntryManagement();
    } else if (page === 'student-materials') {
      await renderMaterialCatalog();
    } else if (page === 'student-schedules') {
      await renderScheduleManagement(role);
    } else if (page === 'public-overview' || page === 'public-page') {
      await renderPublicPage();
    } else if (page === 'public-register') {
      renderLogin();
    } else if (page === 'partner-overview') {
      await renderPartnerPage();
    } else if (page === 'partner-statistics') {
      await renderPartnerStats();
    } else if (page === 'partner-list') {
      await renderPartnerList();
    }
  } catch (error) {
    console.error('Lỗi navigation:', error);
  }
}

async function logoutAndReset() {
  await logoutUser();
  removeUserInfo();
  removeToken();
  currentUser = null;
  userInfo = null;
}

export function getCurrentUserInfo() {
  return userInfo;
}

export function getAuthenticatedUser() {
  return currentUser;
}

function renderStartupError(error) {
  console.error('Lỗi khởi động ứng dụng:', error);
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  appContainer.innerHTML = `
    <div style="min-height:100vh;display:grid;place-items:center;background:#eef3f8;padding:24px;font-family:Arial,sans-serif;">
      <div style="max-width:560px;background:white;border:1px solid #fecaca;border-radius:8px;padding:24px;box-shadow:0 16px 40px rgba(15,23,42,.14);">
        <h1 style="margin:0 0 10px;color:#b91c1c;font-size:22px;">Không tải được trang</h1>
        <p style="margin:0 0 12px;color:#374151;">Ứng dụng gặp lỗi khi khởi động. Hãy tải lại trang hoặc kiểm tra Console để xem chi tiết.</p>
        <pre style="white-space:pre-wrap;background:#fef2f2;color:#991b1b;border-radius:8px;padding:12px;margin:0;font-size:13px;">${escapeHtml(error?.message || String(error))}</pre>
      </div>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  initApp().catch(renderStartupError);
});
