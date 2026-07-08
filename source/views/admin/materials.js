import { addMaterial, getMaterials, updateMaterial, deleteMaterial, searchMaterials } from '../../services/dbService.js';
import { showToast, formatDate, getStatusLabel, getStatusColor } from '../../utils/helpers.js';

export async function renderMaterialManagement() {
  const content = document.getElementById('content');
  
  content.innerHTML = `
    <div class="management-container">
      <div class="page-header">
        <h1>Quản Lý Vật Tư Xưởng</h1>
        <button class="btn btn-primary" id="addMaterialBtn">
          <i class="fas fa-plus"></i> Thêm Vật Tư
        </button>
      </div>

      <!-- Search -->
      <div class="card">
        <div class="search-filter">
          <input type="text" id="searchKeyword" placeholder="Tìm kiếm vật tư...">
          <select id="statusFilter">
            <option value="">-- Tất cả trạng thái --</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>
      </div>

      <!-- Materials Table -->
      <div class="card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Tên vật tư</th>
                <th>Số lượng</th>
                <th>Đơn vị</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody id="materialsTable">
              <tr>
                <td colspan="7" class="text-center text-muted">Đang tải...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Material Modal -->
    <div id="materialModal" class="hidden"></div>
  `;

  addManagementStyles();
  setupMaterialEvents();
  await loadMaterials();
}

async function loadMaterials() {
  const materials = await getMaterials();
  displayMaterials(materials);
}

function displayMaterials(materials) {
  const table = document.getElementById('materialsTable');
  
  if (materials.length === 0) {
    table.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Không có vật tư</td></tr>';
    return;
  }

  table.innerHTML = materials.map(material => `
    <tr>
      <td>${material.name}</td>
      <td>${material.quantity}</td>
      <td>${material.unit}</td>
      <td>${material.description || '-'}</td>
      <td>
        <span class="badge" style="background-color: ${getStatusColor(material.status)}; color: white; padding: 6px 12px; border-radius: 4px;">
          ${getStatusLabel(material.status)}
        </span>
      </td>
      <td>${material.createdAt ? formatDate(material.createdAt) : '-'}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-primary btn-small" data-edit="${material.id}">Sửa</button>
          <button class="btn btn-danger btn-small" data-delete="${material.id}">Xóa</button>
        </div>
      </td>
    </tr>
  `).join('');

  // Add event listeners
  table.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => editMaterial(btn.dataset.edit));
  });

  table.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.delete;
      const confirmed = confirm('Bạn chắc chắn muốn xóa vật tư này?');
      if (confirmed) {
        const result = await deleteMaterial(id);
        if (result.success) {
          showToast('Xóa vật tư thành công', 'success');
          loadMaterials();
        } else {
          showToast(result.error, 'danger');
        }
      }
    });
  });
}

async function editMaterial(materialId) {
  const materials = await getMaterials();
  const material = materials.find(m => m.id === materialId);
  if (material) {
    showMaterialModal(material);
  }
}

function setupMaterialEvents() {
  const addBtn = document.getElementById('addMaterialBtn');
  const searchInput = document.getElementById('searchKeyword');
  const statusFilter = document.getElementById('statusFilter');

  addBtn.addEventListener('click', () => {
    showMaterialModal(null);
  });

  searchInput.addEventListener('input', async (e) => {
    const keyword = e.target.value;
    if (keyword) {
      const results = await searchMaterials(keyword);
      displayMaterials(results);
    } else {
      loadMaterials();
    }
  });

  statusFilter.addEventListener('change', async (e) => {
    const status = e.target.value;
    let materials = await getMaterials();
    if (status) {
      materials = materials.filter(m => m.status === status);
    }
    displayMaterials(materials);
  });
}

function showMaterialModal(material) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${material ? 'Sửa Vật Tư' : 'Thêm Vật Tư'}</h2>
        <button class="modal-close">&times;</button>
      </div>
      <form id="materialForm">
        <div class="modal-body">
          <div class="form-group">
            <label for="name">Tên vật tư *</label>
            <input type="text" id="name" value="${material?.name || ''}" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="quantity">Số lượng *</label>
              <input type="number" id="quantity" value="${material?.quantity || ''}" required>
            </div>

            <div class="form-group">
              <label for="unit">Đơn vị *</label>
              <input type="text" id="unit" value="${material?.unit || ''}" placeholder="cái, bộ, kg..." required>
            </div>
          </div>

          <div class="form-group">
            <label for="description">Mô tả</label>
            <textarea id="description" placeholder="Nhập mô tả vật tư">${material?.description || ''}</textarea>
          </div>

          <div class="form-group">
            <label for="status">Trạng thái</label>
            <select id="status">
              <option value="active" ${material?.status === 'active' ? 'selected' : ''}>Hoạt động</option>
              <option value="inactive" ${material?.status === 'inactive' ? 'selected' : ''}>Không hoạt động</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="cancelBtn">Hủy</button>
          <button type="submit" class="btn btn-primary">Lưu</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const form = modal.querySelector('#materialForm');
  const cancelBtn = modal.querySelector('#cancelBtn');
  const closeBtn = modal.querySelector('.modal-close');

  cancelBtn.addEventListener('click', () => modal.remove());
  closeBtn.addEventListener('click', () => modal.remove());

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById('name').value,
      quantity: parseInt(document.getElementById('quantity').value),
      unit: document.getElementById('unit').value,
      description: document.getElementById('description').value,
      status: document.getElementById('status').value
    };

    let result;
    if (material) {
      result = await updateMaterial(material.id, data);
    } else {
      result = await addMaterial(data);
    }

    if (result.success) {
      showToast(material ? 'Cập nhật vật tư thành công' : 'Thêm vật tư thành công', 'success');
      modal.remove();
      loadMaterials();
    } else {
      showToast(result.error, 'danger');
    }
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function addManagementStyles() {
  if (document.getElementById('managementStyles')) return;
  
  const style = document.createElement('style');
  style.id = 'managementStyles';
  style.textContent = `
    .management-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .search-filter {
      display: flex;
      gap: 15px;
      margin-bottom: 0;
      padding: 20px;
    }

    .search-filter input,
    .search-filter select {
      flex: 1;
      padding: 10px 15px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 14px;
    }

    .table-actions {
      display: flex;
      gap: 8px;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }

      .page-header .btn {
        width: 100%;
      }

      .search-filter {
        flex-direction: column;
      }
    }
  `;
  
  document.head.appendChild(style);
}

export async function renderMaterialCatalog() {
  const content = document.getElementById('content');
  const materials = await getMaterials();

  content.innerHTML = `
    <div class="management-container">
      <div class="page-header">
        <div>
          <h1>Vật tư xưởng</h1>
          <p class="text-muted">Danh mục vật tư sinh viên có thể đăng ký mượn hoặc sử dụng tại xưởng.</p>
        </div>
      </div>

      <div class="catalog-grid" id="materialCatalog">
        ${materials.length ? materials.map(material => `
          <article class="catalog-card" data-search="${[material.name, material.unit, material.description].join(' ').toLowerCase()}">
            <div class="catalog-icon"><i class="fas fa-box-open"></i></div>
            <div>
              <h3>${material.name}</h3>
              <p>${material.description || 'Chưa có mô tả'}</p>
            </div>
            <div class="catalog-meta">
              <span>${material.quantity || 0} ${material.unit || ''}</span>
              <span class="badge badge-info">${getStatusLabel(material.status || 'active')}</span>
            </div>
          </article>
        `).join('') : `
          <div class="card text-center text-muted p-3">Chưa có vật tư trong hệ thống.</div>
        `}
      </div>
    </div>
  `;

  addManagementStyles();
  addCatalogStyles();

  if (window.__materialCatalogSearchHandler) {
    window.removeEventListener('search', window.__materialCatalogSearchHandler);
  }

  window.__materialCatalogSearchHandler = (event) => {
    const keyword = event.detail.keyword.toLowerCase();
    document.querySelectorAll('.catalog-card').forEach(card => {
      card.classList.toggle('hidden', keyword && !card.dataset.search.includes(keyword));
    });
  };

  window.addEventListener('search', window.__materialCatalogSearchHandler);
}

function addCatalogStyles() {
  if (document.getElementById('catalogStyles')) return;

  const style = document.createElement('style');
  style.id = 'catalogStyles';
  style.textContent = `
    .catalog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }

    .catalog-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 18px;
      display: flex;
      min-height: 210px;
      flex-direction: column;
      gap: 14px;
      box-shadow: var(--shadow);
    }

    .catalog-icon {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      display: grid;
      place-items: center;
      background: #eaf4ff;
      color: var(--secondary-color);
      font-size: 20px;
    }

    .catalog-card h3 {
      color: var(--primary-color);
      font-size: 18px;
      margin-bottom: 6px;
    }

    .catalog-card p {
      color: #64748b;
      font-size: 14px;
      margin: 0;
    }

    .catalog-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      gap: 10px;
    }
  `;

  document.head.appendChild(style);
}
