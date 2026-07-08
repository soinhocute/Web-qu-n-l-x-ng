export function renderPartnerPage() {
  const content = document.getElementById('content');
  
  content.innerHTML = `
    <div class="partner-container">
      <div class="page-header">
        <h1>Thông Tin Đối Tác</h1>
        <p>Thống kê phát triển và hiệp tác của xưởng</p>
      </div>

      <!-- Key Statistics -->
      <div class="grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-value">150+</div>
          <div class="stat-label">Sinh viên đã đào tạo</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-briefcase"></i>
          </div>
          <div class="stat-value">45</div>
          <div class="stat-label">Công ty hợp tác</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-project-diagram"></i>
          </div>
          <div class="stat-value">80+</div>
          <div class="stat-label">Dự án hoàn thành</div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-award"></i>
          </div>
          <div class="stat-value">15</div>
          <div class="stat-label">Giải thưởng nhận được</div>
        </div>
      </div>

      <!-- Overview Section -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Giới Thiệu Xưởng</h2>
        </div>
        <div class="card-body">
          <p>
            Xưởng gỗ là một trung tâm đào tạo hàng đầu trong lĩnh vực chế biến gỗ, 
            nơi mà tài năng gặp gỡ với công nghệ để tạo ra những sản phẩm chất lượng cao. 
            Chúng tôi tự hào là đối tác tin cậy của các công ty hàng đầu trong ngành.
          </p>
        </div>
      </div>

      <!-- Opportunities -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Cơ Hội Hợp Tác</h2>
        </div>
        <div class="card-body">
          <div class="opportunity-list">
            <div class="opportunity-item">
              <i class="fas fa-check-circle"></i>
              <div>
                <h4>Tuyển Dụng Sinh Viên</h4>
                <p>Các sinh viên tốt nghiệp sẵn sàng làm việc với kỹ năng thực tế</p>
              </div>
            </div>

            <div class="opportunity-item">
              <i class="fas fa-check-circle"></i>
              <div>
                <h4>Thực Tập Chuyên Nghiệp</h4>
                <p>Chương trình thực tập tại xưởng để sinh viên học hỏi kinh nghiệm</p>
              </div>
            </div>

            <div class="opportunity-item">
              <i class="fas fa-check-circle"></i>
              <div>
                <h4>Hợp Tác Nghiên Cứu</h4>
                <p>Cơ hội nghiên cứu và phát triển sản phẩm mới</p>
              </div>
            </div>

            <div class="opportunity-item">
              <i class="fas fa-check-circle"></i>
              <div>
                <h4>Sản Xuất Lắp Ráp</h4>
                <p>Dịch vụ sản xuất và lắp ráp theo yêu cầu</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Partner List -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Các Đối Tác Hiện Tại</h2>
        </div>
        <div class="card-body">
          <div class="partner-grid" id="partnerList">
            <div class="text-center text-muted p-3">Đang tải...</div>
          </div>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Liên Hệ Hợp Tác</h2>
        </div>
        <div class="card-body">
          <p>Bạn muốn trở thành đối tác của xưởng? Hãy liên hệ với chúng tôi:</p>
          <div class="contact-info" style="margin-top: 20px;">
            <p><i class="fas fa-envelope"></i> Email: partnership@xuong.go.edu.vn</p>
            <p><i class="fas fa-phone"></i> Điện thoại: 028 3456 7890 (ext. 101)</p>
            <p><i class="fas fa-clock"></i> Giờ làm việc: 8:00 - 17:00 (Thứ 2 - 6)</p>
          </div>
        </div>
      </div>
    </div>
  `;

  addPartnerStyles();
  loadPartnerData();
}

function addPartnerStyles() {
  if (document.getElementById('partnerStyles')) return;
  
  const style = document.createElement('style');
  style.id = 'partnerStyles';
  style.textContent = `
    .partner-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .stat-card {
      background: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      border-left: 4px solid var(--secondary-color);
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-lg);
    }

    .stat-icon {
      font-size: 32px;
      color: var(--secondary-color);
      margin-bottom: 10px;
    }

    .opportunity-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .opportunity-item {
      display: flex;
      gap: 20px;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 8px;
      border-left: 4px solid var(--secondary-color);
    }

    .opportunity-item i {
      font-size: 24px;
      color: var(--success-color);
      min-width: 30px;
      text-align: center;
    }

    .opportunity-item h4 {
      color: var(--primary-color);
      margin-bottom: 5px;
    }

    .opportunity-item p {
      color: #666;
      font-size: 14px;
      margin: 0;
    }

    .partner-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 20px;
    }

    .partner-item {
      background: white;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      text-align: center;
      transition: all 0.3s ease;
    }

    .partner-item:hover {
      box-shadow: var(--shadow);
      border-color: var(--secondary-color);
    }

    .partner-logo {
      font-size: 48px;
      margin-bottom: 10px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .partner-name {
      font-weight: 600;
      color: var(--primary-color);
      margin-bottom: 5px;
    }

    .partner-type {
      font-size: 12px;
      color: #999;
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
  `;
  
  document.head.appendChild(style);
}

async function loadPartnerData() {
  // Mock data for partners (trong thực tế sẽ lấy từ Firebase)
  const partners = [
    { name: 'ABC Furniture', type: 'Nhà sản xuất' },
    { name: 'XYZ Wood Co.', type: 'Nhà phân phối' },
    { name: 'Premium Woods', type: 'Nhà cung cấp' },
    { name: 'Design Studio', type: 'Thiết kế' },
    { name: 'Eco Wood', type: 'Tái chế gỗ' },
    { name: 'Global Trade', type: 'Xuất khẩu' }
  ];

  const partnerList = document.getElementById('partnerList');
  partnerList.innerHTML = partners.map(partner => `
    <div class="partner-item">
      <div class="partner-logo">
        <i class="fas fa-building"></i>
      </div>
      <div class="partner-name">${partner.name}</div>
      <div class="partner-type">${partner.type}</div>
    </div>
  `).join('');
}

export function renderPartnerStats() {
  const content = document.getElementById('content');

  content.innerHTML = `
    <div class="partner-container">
      <div class="page-header">
        <h1>Thống kê phát triển xưởng</h1>
        <p>Các chỉ số tổng quan dành cho đối tác hợp tác.</p>
      </div>

      <div class="grid">
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-users"></i></div>
          <div class="stat-value">150+</div>
          <div class="stat-label">Sinh viên đã đào tạo</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-screwdriver-wrench"></i></div>
          <div class="stat-value">28</div>
          <div class="stat-label">Thiết bị đang quản lý</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-boxes-stacked"></i></div>
          <div class="stat-value">320</div>
          <div class="stat-label">Lượt sử dụng vật tư/tháng</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
          <div class="stat-value">18%</div>
          <div class="stat-label">Tăng trưởng dự án</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Tiến độ hợp tác</h2>
        </div>
        <div class="metric-list">
          <div><span>Đào tạo kỹ năng thực hành</span><strong>86%</strong></div>
          <div><span>Dự án sinh viên - doanh nghiệp</span><strong>64%</strong></div>
          <div><span>Khai thác thiết bị an toàn</span><strong>92%</strong></div>
          <div><span>Chuẩn hóa quản lý vật tư</span><strong>73%</strong></div>
        </div>
      </div>
    </div>
  `;

  addPartnerStyles();
  addStatsStyles();
}

export function renderPartnerList() {
  const content = document.getElementById('content');

  content.innerHTML = `
    <div class="partner-container">
      <div class="page-header">
        <h1>Đối tác hợp tác</h1>
        <p>Danh sách các đơn vị đang đồng hành cùng xưởng.</p>
      </div>

      <div class="card">
        <div class="partner-grid" id="partnerList"></div>
      </div>
    </div>
  `;

  addPartnerStyles();
  loadPartnerData();
}

function addStatsStyles() {
  if (document.getElementById('partnerStatsStyles')) return;

  const style = document.createElement('style');
  style.id = 'partnerStatsStyles';
  style.textContent = `
    .metric-list {
      display: grid;
      gap: 14px;
    }

    .metric-list div {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 16px;
    }

    .metric-list strong {
      color: var(--secondary-color);
    }
  `;

  document.head.appendChild(style);
}
