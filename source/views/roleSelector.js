import { renderGuestApp } from '../app.js';
import { renderLogin } from './login.js';

export function renderRoleSelector() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="role-selector-container">
      <section class="role-selector-card">
        <div class="role-brand">
          <i class="fas fa-hammer"></i>
          <div>
            <h1>Xưởng Maker</h1>
            <p>Hệ thống quản lý vật tư, thiết bị và lượt sử dụng xưởng</p>
          </div>
        </div>

        <div class="role-grid">
          <article class="role-option" data-role="student">
            <div class="role-icon"><i class="fas fa-graduation-cap"></i></div>
            <h3>Sinh viên</h3>
            <p>Đăng ký mượn/trả vật tư, xem lịch xưởng và lịch ra vào.</p>
            <button class="btn btn-primary">Tiếp tục</button>
          </article>

          <article class="role-option" data-role="teacher">
            <div class="role-icon"><i class="fas fa-chalkboard-user"></i></div>
            <h3>Giáo viên</h3>
            <p>Quản lý vật tư, thiết bị, sinh viên và duyệt đơn mượn/trả.</p>
            <button class="btn btn-primary">Tiếp tục</button>
          </article>

          <article class="role-option" data-role="partner">
            <div class="role-icon"><i class="fas fa-handshake"></i></div>
            <h3>Đối tác</h3>
            <p>Xem giới thiệu xưởng, thống kê phát triển và danh sách đối tác.</p>
            <button class="btn btn-primary">Tiếp tục</button>
          </article>

          <article class="role-option" data-role="guest">
            <div class="role-icon"><i class="fas fa-globe"></i></div>
            <h3>Khách tham quan</h3>
            <p>Xem trang giới thiệu xưởng, không cần đăng nhập.</p>
            <button class="btn btn-secondary">Xem giới thiệu</button>
          </article>
        </div>

        <p class="admin-note">Trang admin đăng nhập riêng tại <a href="./admin.html">admin.html</a>.</p>
      </section>
    </div>
  `;

  addRoleSelectorStyles();
  setupRoleSelectorEvents();
}

function setupRoleSelectorEvents() {
  document.querySelectorAll('.role-option button').forEach(button => {
    button.addEventListener('click', async () => {
      const role = button.closest('.role-option').dataset.role;
      sessionStorage.setItem('selectedRole', role);

      if (role === 'guest') {
        await renderGuestApp('public-overview');
        return;
      }

      renderLogin(role);
    });
  });
}

function addRoleSelectorStyles() {
  if (document.getElementById('roleSelectorStyles')) return;

  const style = document.createElement('style');
  style.id = 'roleSelectorStyles';
  style.textContent = `
    .role-selector-container {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 32px;
      background: #eef3f8;
    }

    .role-selector-card {
      width: min(1040px, 100%);
      background: white;
      border-radius: 8px;
      box-shadow: 0 18px 50px rgba(15, 23, 42, 0.16);
      padding: 36px;
    }

    .role-brand {
      display: flex;
      align-items: center;
      gap: 18px;
      margin-bottom: 30px;
    }

    .role-brand i {
      width: 58px;
      height: 58px;
      border-radius: 8px;
      display: grid;
      place-items: center;
      background: #f97316;
      color: white;
      font-size: 28px;
    }

    .role-brand h1 {
      color: var(--primary-color);
      font-size: 34px;
      line-height: 1.1;
      margin-bottom: 6px;
    }

    .role-brand p {
      color: #64748b;
      margin: 0;
    }

    .role-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
    }

    .role-option {
      border: 1px solid #dbe3ed;
      border-radius: 8px;
      padding: 22px;
      display: flex;
      min-height: 250px;
      flex-direction: column;
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }

    .role-option:hover {
      transform: translateY(-3px);
      border-color: #f97316;
      box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1);
    }

    .role-icon {
      color: #f97316;
      font-size: 34px;
      margin-bottom: 16px;
    }

    .role-option h3 {
      color: var(--primary-color);
      font-size: 18px;
      margin-bottom: 8px;
    }

    .role-option p {
      flex: 1;
      color: #64748b;
      font-size: 14px;
      margin-bottom: 20px;
    }

    .role-option .btn {
      justify-content: center;
      width: 100%;
    }

    .admin-note {
      margin-top: 24px;
      padding-top: 18px;
      border-top: 1px solid #edf1f5;
      color: #64748b;
      text-align: center;
      font-size: 14px;
    }

    .admin-note a {
      color: #f97316;
      font-weight: 700;
      text-decoration: none;
    }

    @media (max-width: 900px) {
      .role-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 560px) {
      .role-selector-container {
        padding: 16px;
      }

      .role-selector-card {
        padding: 22px;
      }

      .role-brand {
        align-items: flex-start;
      }

      .role-brand h1 {
        font-size: 26px;
      }

      .role-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  document.head.appendChild(style);
}
