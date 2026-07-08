import { getMaterials } from '../../services/dbService.js';

export async function renderInventoryManagement() {
  const content = document.getElementById('content');
  const materials = await getMaterials();
  const rows = materials.length ? materials : [
    { name: 'Gỗ thông ghép', unit: 'tấm', quantity: 48, description: 'Nhập kho phục vụ thực hành' },
    { name: 'Keo dán gỗ', unit: 'chai', quantity: 12, description: 'Cần nhập thêm trong tuần' },
    { name: 'Lưỡi cưa dự phòng', unit: 'cái', quantity: 6, description: 'Dùng cho máy cưa bàn' }
  ];

  content.innerHTML = `
    <div class="management-container">
      <div class="page-header">
        <div>
          <h1>Xuất nhập kho</h1>
          <p class="text-muted">Theo dõi tồn kho, lượt nhập và lượt xuất vật tư xưởng.</p>
        </div>
        <button class="btn btn-primary" id="mockImportBtn">
          <i class="fas fa-file-import"></i> Tạo phiếu
        </button>
      </div>

      <div class="grid">
        <div class="stat-card">
          <div class="stat-value">${rows.length}</div>
          <div class="stat-label">Mã vật tư</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${rows.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}</div>
          <div class="stat-label">Tổng tồn kho</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${rows.filter(item => Number(item.quantity || 0) <= 12).length}</div>
          <div class="stat-label">Cần kiểm tra</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Bảng tồn kho</h2>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Vật tư</th>
                <th>Tồn kho</th>
                <th>Đơn vị</th>
                <th>Ghi chú</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map(item => `
                <tr data-search="${[item.name, item.description].join(' ').toLowerCase()}">
                  <td>${item.name}</td>
                  <td>${item.quantity || 0}</td>
                  <td>${item.unit || '-'}</td>
                  <td>${item.description || '-'}</td>
                  <td>
                    <span class="badge ${Number(item.quantity || 0) <= 12 ? 'badge-warning' : 'badge-success'}">
                      ${Number(item.quantity || 0) <= 12 ? 'Sắp hết' : 'Ổn định'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Lượt xuất nhập gần đây</h2>
        </div>
        <div class="inventory-timeline">
          <div><span class="badge badge-success">Nhập</span> 20 tấm gỗ MDF - Kho chính</div>
          <div><span class="badge badge-info">Xuất</span> 4 chai keo dán gỗ - Lớp TH-Mộc-02</div>
          <div><span class="badge badge-warning">Xuất</span> 2 lưỡi cưa - Bảo trì máy cưa</div>
        </div>
      </div>
    </div>
  `;

  addInventoryStyles();
}

function addInventoryStyles() {
  if (document.getElementById('inventoryStyles')) return;

  const style = document.createElement('style');
  style.id = 'inventoryStyles';
  style.textContent = `
    .inventory-timeline {
      display: grid;
      gap: 12px;
    }

    .inventory-timeline div {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px;
    }
  `;

  document.head.appendChild(style);
}
