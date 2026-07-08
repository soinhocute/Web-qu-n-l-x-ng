import { getUserInfo, loginUser, registerUser } from '../services/authService.js';
import { renderRoleSelector } from './roleSelector.js';

export function renderLogin(roleOverride = null) {
  const app = document.getElementById('app');
  const selectedRole = roleOverride || sessionStorage.getItem('selectedRole') || 'student';
  const isAdmin = selectedRole === 'admin';

  app.innerHTML = `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <i class="fas fa-hammer"></i>
          <h1>${isAdmin ? 'Đăng nhập Admin' : 'Đăng nhập xưởng'}</h1>
          <p>${getRoleHint(selectedRole)}</p>
        </div>

        <form id="authForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" placeholder="Nhập email" required>
          </div>

          <div class="form-group">
            <label for="password">Mật khẩu</label>
            <input type="password" id="password" placeholder="Nhập mật khẩu" required minlength="6">
          </div>

          <div id="registerFields" class="hidden">
            <div class="form-group">
              <label for="fullName">Họ và tên</label>
              <input type="text" id="fullName" placeholder="Nhập họ và tên">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="phone">Số điện thoại</label>
                <input type="tel" id="phone" placeholder="Số điện thoại">
              </div>
              <div class="form-group">
                <label for="userCode">Mã SV/GV</label>
                <input type="text" id="userCode" placeholder="Mã định danh">
              </div>
            </div>

            <div class="form-group ${selectedRole === 'partner' ? '' : 'hidden'}" id="organizationField">
              <label for="organization">Tổ chức / Công ty</label>
              <input type="text" id="organization" placeholder="Nhập tổ chức / công ty">
            </div>

            <div class="register-note">
              Tài khoản tự đăng ký sẽ được kích hoạt ngay theo vai trò bạn đã chọn.
            </div>
          </div>

          <div class="error-message hidden" id="errorMessage"></div>

          <button type="submit" class="btn btn-primary btn-block">
            <span id="submitBtn">Đăng nhập</span>
          </button>
        </form>

        ${isAdmin ? '' : `
          <div class="auth-toggle">
            <button type="button" class="btn btn-ghost" id="toggleModeBtn">Chưa có tài khoản? Đăng kí</button>
          </div>
        `}

        <div class="back-link">
          <a href="#" id="backToRoles"><i class="fas fa-arrow-left"></i> Quay lại chọn vai trò</a>
        </div>
      </div>
    </div>
  `;

  addLoginStyles();
  setupLoginEvents(selectedRole, isAdmin);
}

function setupLoginEvents(selectedRole, isAdmin) {
  const form = document.getElementById('authForm');
  const registerFields = document.getElementById('registerFields');
  const submitBtn = document.getElementById('submitBtn');
  const toggleModeBtn = document.getElementById('toggleModeBtn');
  const errorMessage = document.getElementById('errorMessage');
  const backLink = document.getElementById('backToRoles');
  let isRegisterMode = false;

  toggleModeBtn?.addEventListener('click', () => {
    isRegisterMode = !isRegisterMode;
    registerFields.classList.toggle('hidden', !isRegisterMode);
    submitBtn.textContent = isRegisterMode ? 'Tạo tài khoản' : 'Đăng nhập';
    toggleModeBtn.textContent = isRegisterMode ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng kí';
    document.getElementById('fullName').required = isRegisterMode;
  });

  backLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (isAdmin) {
      location.href = './index.html';
      return;
    }
    renderRoleSelector();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.classList.add('hidden');

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      if (isRegisterMode) {
        const result = await registerUser(email, password, {
          fullName: document.getElementById('fullName').value.trim(),
          phone: document.getElementById('phone').value.trim(),
          code: document.getElementById('userCode').value.trim(),
          role: selectedRole,
          organization: document.getElementById('organization')?.value.trim() || ''
        });

        if (!result.success) {
          showError(result.error);
          return;
        }

        alert('Tạo tài khoản thành công. Bạn có thể sử dụng tài khoản này để đăng nhập.');
        return;
      }

      const result = await loginUser(email, password);
      if (!result.success) {
        showError(result.error);
        return;
      }

      const info = await getUserInfo(result.user.uid);
      if (!info || info.role !== selectedRole) {
        showError('Tài khoản không đúng nhóm đã chọn.');
      }
    } catch (error) {
      showError(error.message);
    }
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
  }
}

function getRoleHint(role) {
  const hints = {
    admin: 'Trang quản trị riêng, không dùng chung cổng sinh viên/giáo viên.',
    student: 'Dành cho sinh viên tự đăng ký hoặc dùng tài khoản được cấp sẵn.',
    teacher: 'Dành cho giáo viên quản lý thông tin xưởng.',
    partner: 'Dành cho đối tác tự đăng ký hoặc dùng tài khoản được cấp sẵn.'
  };
  return hints[role] || hints.student;
}

function addLoginStyles() {
  if (document.getElementById('loginStyles')) return;

  const style = document.createElement('style');
  style.id = 'loginStyles';
  style.textContent = `
    .login-container {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      background: #eef3f8;
    }

    .login-card {
      width: min(520px, 100%);
      background: white;
      border-radius: 8px;
      box-shadow: 0 18px 48px rgba(15, 23, 42, 0.16);
      padding: 34px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 26px;
    }

    .login-header i {
      width: 56px;
      height: 56px;
      border-radius: 8px;
      display: inline-grid;
      place-items: center;
      background: #f97316;
      color: white;
      font-size: 26px;
      margin-bottom: 14px;
    }

    .login-header h1 {
      color: var(--primary-color);
      font-size: 28px;
      margin-bottom: 6px;
    }

    .login-header p {
      color: #64748b;
      font-size: 14px;
      margin: 0;
    }

    .btn-block {
      justify-content: center;
      width: 100%;
    }

    .register-note {
      background: #fff7ed;
      border: 1px solid #fed7aa;
      border-radius: 8px;
      color: #9a3412;
      font-size: 13px;
      line-height: 1.4;
      padding: 10px 12px;
      margin-bottom: 18px;
    }

    .auth-toggle {
      margin-top: 18px;
      text-align: center;
    }

    .auth-toggle button {
      border: 0;
      background: transparent;
      color: #f97316;
      cursor: pointer;
      font-weight: 700;
    }

    .back-link {
      margin-top: 16px;
      text-align: center;
    }

    .back-link a {
      color: #64748b;
      font-size: 14px;
      text-decoration: none;
    }

    .error-message {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #b91c1c;
      margin-bottom: 16px;
      padding: 10px 12px;
    }
  `;

  document.head.appendChild(style);
}
