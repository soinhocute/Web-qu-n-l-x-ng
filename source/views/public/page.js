export function renderPublicPage() {
  const content = document.getElementById('content');
  
  content.innerHTML = `
    <div class="public-container">
      <div class="public-header">
        <h1><i class="fas fa-hammer"></i> Xưởng Gỗ - Trường ĐH Công Nghiệp</h1>
        <p>Trung tâm đào tạo kỹ năng chế biến gỗ hiện đại</p>
      </div>

      <!-- Overview Section -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Giới Thiệu Xưởng</h2>
        </div>
        <div class="card-body">
          <p>
            Xưởng gỗ của trường là một cơ sở đào tạo chuyên dụng, được trang bị 
            các máy móc hiện đại nhất phục vụ cho quá trình học tập và nghiên cứu 
            của sinh viên ngành Công nghiệp gỗ.
          </p>
          <h3 style="margin-top: 20px; color: var(--primary-color);">Trang Thiết Bị Chính</h3>
          <ul style="margin: 15px 0; padding-left: 20px;">
            <li>Máy cưa gỗ cnc - 2 cái</li>
            <li>Máy cắt ngang tự động - 4 cái</li>
            <li>Máy đánh bóng - 6 cái</li>
            <li>Lò sấy gỗ điều khiển nhiệt độ - 1 cái</li>
            <li>Máy dán cạnh - 3 cái</li>
            <li>Máy khoan điều khiển số - 2 cái</li>
          </ul>

          <h3 style="margin-top: 20px; color: var(--primary-color);">Giờ Hoạt Động</h3>
          <table class="info-table" style="margin-top: 15px;">
            <tr>
              <td><strong>Thứ 2 - 6:</strong></td>
              <td>7:00 - 17:00</td>
            </tr>
            <tr>
              <td><strong>Thứ 7:</strong></td>
              <td>7:00 - 12:00</td>
            </tr>
            <tr>
              <td><strong>Chủ nhật:</strong></td>
              <td>Đóng cửa</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Features -->
      <div class="grid">
        <div class="feature-card">
          <i class="fas fa-cogs"></i>
          <h3>Trang Thiết Bị Hiện Đại</h3>
          <p>Các máy móc nhập khẩu chất lượng cao từ châu Âu</p>
        </div>

        <div class="feature-card">
          <i class="fas fa-graduation-cap"></i>
          <h3>Đội Ngũ Chuyên Gia</h3>
          <p>Giáo viên hướng dẫn có kinh nghiệm 15+ năm</p>
        </div>

        <div class="feature-card">
          <i class="fas fa-chart-line"></i>
          <h3>Cơ Hội Thực Tập</h3>
          <p>Hợp tác với các công ty lớn trong ngành</p>
        </div>

        <div class="feature-card">
          <i class="fas fa-handshake"></i>
          <h3>Hỗ Trợ Toàn Diện</h3>
          <p>Hỗ trợ từ khâu thiết kế đến sản xuất</p>
        </div>
      </div>

      <!-- Contact Info -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Liên Hệ</h2>
        </div>
        <div class="card-body">
          <div class="contact-info">
            <p><i class="fas fa-map-marker-alt"></i> <strong>Địa chỉ:</strong> 123 Đường Lê Lợi, TP. Hồ Chí Minh</p>
            <p><i class="fas fa-phone"></i> <strong>Điện thoại:</strong> 028 3456 7890</p>
            <p><i class="fas fa-envelope"></i> <strong>Email:</strong> xuong.go@hcmut.edu.vn</p>
            <p><i class="fas fa-globe"></i> <strong>Website:</strong> www.hcmut.edu.vn/xuong</p>
          </div>
        </div>
      </div>

      <!-- Register Info -->
      <div class="info-banner">
        <h3>Muốn tham gia?</h3>
        <p>Đăng kí tài khoản mới hoặc đăng nhập bằng tài khoản được cấp sẵn.</p>
        <a href="#" class="btn btn-primary" id="registerBtn">Đăng Kí Ngay</a>
      </div>
    </div>
  `;

  addPublicStyles();
  setupPublicEvents();
}

function setupPublicEvents() {
  const registerBtn = document.getElementById('registerBtn');
  if (registerBtn) {
    registerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('pageNavigation', { detail: { page: 'public-register' } }));
    });
  }
}

function addPublicStyles() {
  if (document.getElementById('publicStyles')) return;
  
  const style = document.createElement('style');
  style.id = 'publicStyles';
  style.textContent = `
    .public-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .public-header {
      text-align: center;
      margin-bottom: 40px;
      padding: 30px 0;
      border-bottom: 2px solid var(--secondary-color);
    }

    .public-header h1 {
      font-size: 32px;
      color: var(--primary-color);
      margin-bottom: 10px;
    }

    .public-header p {
      color: #666;
      font-size: 16px;
    }

    .feature-card {
      background: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: var(--shadow);
      text-align: center;
      transition: all 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-lg);
    }

    .feature-card i {
      font-size: 36px;
      color: var(--secondary-color);
      margin-bottom: 15px;
    }

    .feature-card h3 {
      color: var(--primary-color);
      margin-bottom: 10px;
    }

    .feature-card p {
      color: #666;
      font-size: 14px;
    }

    .info-table {
      width: 100%;
      border-collapse: collapse;
    }

    .info-table tr {
      border-bottom: 1px solid var(--border-color);
    }

    .info-table td {
      padding: 12px 0;
    }

    .info-table td:first-child {
      width: 30%;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .contact-info p {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
    }

    .contact-info i {
      color: var(--secondary-color);
      min-width: 24px;
    }

    .info-banner {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      border-radius: 8px;
      text-align: center;
      margin-top: 40px;
    }

    .info-banner h3 {
      font-size: 24px;
      margin-bottom: 10px;
    }

    .info-banner p {
      margin-bottom: 20px;
      font-size: 16px;
    }

    .info-banner .btn {
      background-color: white;
      color: #667eea;
      font-weight: 600;
    }

    .info-banner .btn:hover {
      background-color: #f0f0f0;
    }
  `;
  
  document.head.appendChild(style);
}
