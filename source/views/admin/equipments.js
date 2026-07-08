import { addEquipment, getEquipments, updateEquipment } from '../../services/dbService.js';
import { showToast, formatDate, getStatusLabel } from '../../utils/helpers.js';

const STATUS_OPTIONS = [
  { value: 'working', label: 'Đang hoạt động' },
  { value: 'maintenance', label: 'Bảo trì' },
  { value: 'broken', label: 'Hỏng' },
  { value: 'inactive', label: 'Ngừng sử dụng' }
];

const GROUP_OPTIONS = [
  'Máy cưa',
  'Máy bào',
  'Máy chà nhám',
  'Máy khoan',
  'Máy phay CNC',
  'Máy dán cạnh',
  'Lò sấy',
  'Dụng cụ phụ trợ'
];

export async function renderEquipmentManagement() {
  const content = document.getElementById('content');

  content.innerHTML = `
    <div class="management-container equipment-page">
      <div class="page-header">
        <div>
          <h1>Quản Lý Thiết Bị - Máy Móc</h1>
          <p class="text-muted">Theo dõi hồ sơ, vận hành, sửa chữa và bảo trì thiết bị trong xưởng.</p>
        </div>
        <button class="btn btn-primary" id="addEquipmentBtn">
          <i class="fas fa-plus"></i> Thêm Thiết Bị
        </button>
      </div>

      <div class="card">
        <div class="search-filter">
          <input type="text" id="searchKeyword" placeholder="Tìm theo mã, tên, nhóm, vị trí, người phụ trách...">
          <select id="statusFilter">
            <option value="">-- Tất cả tình trạng --</option>
            ${STATUS_OPTIONS.map(option => `<option value="${option.value}">${option.label}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="table equipment-table">
            <thead>
              <tr>
                <th>Mã thiết bị</th>
                <th>Thiết bị</th>
                <th>Nhóm</th>
                <th>Vị trí đặt máy</th>
                <th>Nhà sản xuất</th>
                <th>Năm mua</th>
                <th>Tình trạng</th>
                <th>Người phụ trách</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody id="equipmentsTable">
              <tr>
                <td colspan="9" class="text-center text-muted">Đang tải...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  setupEquipmentEvents();
  await loadEquipments();
}

async function loadEquipments() {
  const equipments = await getEquipments();
  displayEquipments(equipments.map(normalizeEquipment));
}

function displayEquipments(equipments) {
  const table = document.getElementById('equipmentsTable');
  if (!table) return;

  if (equipments.length === 0) {
    table.innerHTML = '<tr><td colspan="9" class="text-center text-muted">Không có thiết bị</td></tr>';
    return;
  }

  table.innerHTML = equipments.map(equipment => `
    <tr>
      <td><strong>${escapeHtml(equipment.code || '-')}</strong></td>
      <td>
        <div class="equipment-cell">
          ${equipment.imageUrl ? `
            <img class="equipment-thumb" src="${escapeHtml(equipment.imageUrl)}" alt="${escapeHtml(equipment.name)}">
          ` : `
            <span class="equipment-thumb equipment-thumb-empty"><i class="fas fa-gears"></i></span>
          `}
          <div>
            <strong>${escapeHtml(equipment.name || 'Thiết bị')}</strong>
            <small>${escapeHtml(equipment.qrCode || 'Chưa gắn QR')}</small>
          </div>
        </div>
      </td>
      <td>${escapeHtml(equipment.group || '-')}</td>
      <td>${escapeHtml(equipment.location || '-')}</td>
      <td>${escapeHtml(equipment.manufacturer || '-')}</td>
      <td>${escapeHtml(equipment.purchaseYear || '-')}</td>
      <td><span class="badge badge-${getStatusClass(equipment.status)}">${getEquipmentStatusLabel(equipment.status)}</span></td>
      <td>${escapeHtml(equipment.manager || '-')}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-secondary btn-small" data-view="${equipment.id}"><i class="fas fa-eye"></i> Chi tiết</button>
          <button class="btn btn-primary btn-small" data-edit="${equipment.id}"><i class="fas fa-pen"></i> Sửa</button>
          <button class="btn btn-warning btn-small" data-status="${equipment.id}">
            ${equipment.status === 'working' ? 'Báo hỏng' : 'Khôi phục'}
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  table.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => viewEquipment(btn.dataset.view));
  });

  table.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => editEquipment(btn.dataset.edit));
  });

  table.querySelectorAll('[data-status]').forEach(btn => {
    btn.addEventListener('click', () => updateEquipmentStatus(btn.dataset.status));
  });
}

async function viewEquipment(equipmentId) {
  const equipments = (await getEquipments()).map(normalizeEquipment);
  const equipment = equipments.find(e => e.id === equipmentId);
  if (equipment) showEquipmentDetail(equipment);
}

async function editEquipment(equipmentId) {
  const equipments = (await getEquipments()).map(normalizeEquipment);
  const equipment = equipments.find(e => e.id === equipmentId);
  if (equipment) showEquipmentModal(equipment);
}

async function updateEquipmentStatus(equipmentId) {
  const equipments = (await getEquipments()).map(normalizeEquipment);
  const equipment = equipments.find(e => e.id === equipmentId);
  if (!equipment) return;

  const newStatus = equipment.status === 'working' ? 'broken' : 'working';
  const result = await updateEquipment(equipmentId, { status: newStatus });

  if (result.success) {
    showToast('Cập nhật tình trạng thiết bị thành công', 'success');
    loadEquipments();
  } else {
    showToast(result.error || 'Không thể cập nhật thiết bị', 'danger');
  }
}

function setupEquipmentEvents() {
  const addBtn = document.getElementById('addEquipmentBtn');
  const searchInput = document.getElementById('searchKeyword');
  const statusFilter = document.getElementById('statusFilter');

  addBtn?.addEventListener('click', () => showEquipmentModal(null));

  searchInput?.addEventListener('input', async () => {
    await applyEquipmentFilters();
  });

  statusFilter?.addEventListener('change', async () => {
    await applyEquipmentFilters();
  });
}

async function applyEquipmentFilters() {
  const keyword = document.getElementById('searchKeyword')?.value.toLowerCase().trim() || '';
  const status = document.getElementById('statusFilter')?.value || '';
  let equipments = (await getEquipments()).map(normalizeEquipment);

  if (keyword) {
    equipments = equipments.filter(equipment => [
      equipment.code,
      equipment.name,
      equipment.group,
      equipment.location,
      equipment.manufacturer,
      equipment.manager,
      equipment.qrCode
    ].some(value => String(value || '').toLowerCase().includes(keyword)));
  }

  if (status) {
    equipments = equipments.filter(equipment => equipment.status === status);
  }

  displayEquipments(equipments);
}

function showEquipmentModal(equipment) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content modal-wide">
      <div class="modal-header">
        <h2>${equipment ? 'Sửa Hồ Sơ Thiết Bị' : 'Thêm Hồ Sơ Thiết Bị'}</h2>
        <button class="modal-close">&times;</button>
      </div>
      <form id="equipmentForm">
        <div class="modal-body equipment-form-grid">
          ${renderSection('Thông tin định danh', [
            renderInput('code', 'Mã thiết bị *', equipment?.code, 'text', true),
            renderInput('name', 'Tên thiết bị *', equipment?.name, 'text', true),
            renderGroupSelect(equipment?.group),
            renderInput('imageUrl', 'Hình ảnh (URL)', equipment?.imageUrl),
            renderInput('qrCode', 'QR code gắn trên thiết bị', equipment?.qrCode)
          ])}

          ${renderSection('Thông tin mua sắm', [
            renderInput('location', 'Vị trí đặt máy', equipment?.location),
            renderInput('manufacturer', 'Nhà sản xuất', equipment?.manufacturer),
            renderInput('purchaseYear', 'Năm mua', equipment?.purchaseYear, 'number'),
            renderInput('originalPrice', 'Nguyên giá', equipment?.originalPrice, 'number'),
            renderStatusSelect(equipment?.status),
            renderInput('manager', 'Người phụ trách', equipment?.manager)
          ])}

          ${renderSection('Vận hành & an toàn', [
            renderTextarea('userManual', 'Hướng dẫn sử dụng', equipment?.userManual),
            renderTextarea('safetyProcedure', 'Quy trình vận hành an toàn', equipment?.safetyProcedure)
          ], 'form-section-wide')}

          ${renderSection('Bảo trì & hồ sơ', [
            renderTextarea('repairHistory', 'Lịch sử sửa chữa', equipment?.repairHistory),
            renderTextarea('maintenanceSchedule', 'Lịch bảo trì', equipment?.maintenanceSchedule),
            renderTextarea('attachments', 'File đính kèm: hóa đơn, catalogue, biên bản nghiệm thu, phiếu bảo trì', equipment?.attachments)
          ], 'form-section-wide')}
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="cancelBtn">Hủy</button>
          <button type="submit" class="btn btn-primary">Lưu</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const form = modal.querySelector('#equipmentForm');
  const cancelBtn = modal.querySelector('#cancelBtn');
  const closeBtn = modal.querySelector('.modal-close');

  cancelBtn.addEventListener('click', () => modal.remove());
  closeBtn.addEventListener('click', () => modal.remove());

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = getEquipmentFormData(form);
    const result = equipment
      ? await updateEquipment(equipment.id, data)
      : await addEquipment(data);

    if (result.success) {
      showToast(equipment ? 'Cập nhật thiết bị thành công' : 'Thêm thiết bị thành công', 'success');
      modal.remove();
      loadEquipments();
    } else {
      showToast(result.error || 'Không thể lưu thiết bị', 'danger');
    }
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.remove();
  });
}

function showEquipmentDetail(equipment) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content modal-wide">
      <div class="modal-header">
        <h2>Hồ Sơ Thiết Bị</h2>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="equipment-detail-head">
          ${equipment.imageUrl ? `
            <img src="${escapeHtml(equipment.imageUrl)}" alt="${escapeHtml(equipment.name)}">
          ` : `
            <div class="equipment-detail-placeholder"><i class="fas fa-gears"></i></div>
          `}
          <div>
            <span class="badge badge-${getStatusClass(equipment.status)}">${getEquipmentStatusLabel(equipment.status)}</span>
            <h3>${escapeHtml(equipment.name || 'Thiết bị')}</h3>
            <p>${escapeHtml(equipment.code || 'Chưa có mã')} · ${escapeHtml(equipment.group || 'Chưa phân nhóm')}</p>
          </div>
        </div>

        <div class="detail-grid">
          ${detailItem('Vị trí đặt máy', equipment.location)}
          ${detailItem('Nhà sản xuất', equipment.manufacturer)}
          ${detailItem('Năm mua', equipment.purchaseYear)}
          ${detailItem('Nguyên giá', formatCurrency(equipment.originalPrice))}
          ${detailItem('Người phụ trách', equipment.manager)}
          ${detailItem('QR code', equipment.qrCode)}
        </div>

        <div class="detail-block">${detailBlock('Hướng dẫn sử dụng', equipment.userManual)}</div>
        <div class="detail-block">${detailBlock('Quy trình vận hành an toàn', equipment.safetyProcedure)}</div>
        <div class="detail-block">${detailBlock('Lịch sử sửa chữa', equipment.repairHistory)}</div>
        <div class="detail-block">${detailBlock('Lịch bảo trì', equipment.maintenanceSchedule)}</div>
        <div class="detail-block">${detailBlock('File đính kèm', equipment.attachments)}</div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="closeBtn">Đóng</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.querySelector('#closeBtn').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.remove();
  });
}

function renderSection(title, fields, extraClass = '') {
  return `
    <section class="form-section ${extraClass}">
      <h3>${title}</h3>
      ${fields.join('')}
    </section>
  `;
}

function renderInput(id, label, value = '', type = 'text', required = false) {
  return `
    <div class="form-group">
      <label for="${id}">${label}</label>
      <input type="${type}" id="${id}" value="${escapeHtml(value ?? '')}" ${required ? 'required' : ''}>
    </div>
  `;
}

function renderTextarea(id, label, value = '') {
  return `
    <div class="form-group">
      <label for="${id}">${label}</label>
      <textarea id="${id}">${escapeHtml(value ?? '')}</textarea>
    </div>
  `;
}

function renderGroupSelect(value = '') {
  const current = value || '';
  return `
    <div class="form-group">
      <label for="group">Nhóm thiết bị *</label>
      <select id="group" required>
        <option value="">-- Chọn nhóm thiết bị --</option>
        ${GROUP_OPTIONS.map(option => `
          <option value="${escapeHtml(option)}" ${current === option ? 'selected' : ''}>${option}</option>
        `).join('')}
      </select>
    </div>
  `;
}

function renderStatusSelect(value = 'working') {
  const current = value || 'working';
  return `
    <div class="form-group">
      <label for="status">Tình trạng hiện tại</label>
      <select id="status">
        ${STATUS_OPTIONS.map(option => `
          <option value="${option.value}" ${current === option.value ? 'selected' : ''}>${option.label}</option>
        `).join('')}
      </select>
    </div>
  `;
}

function getEquipmentFormData(form) {
  const value = (id) => form.querySelector(`#${id}`)?.value.trim() || '';
  const originalPrice = Number(value('originalPrice')) || 0;

  return {
    code: value('code'),
    name: value('name'),
    group: value('group'),
    type: value('group'),
    imageUrl: value('imageUrl'),
    location: value('location'),
    manufacturer: value('manufacturer'),
    purchaseYear: value('purchaseYear'),
    originalPrice,
    status: value('status') || 'working',
    manager: value('manager'),
    userManual: value('userManual'),
    safetyProcedure: value('safetyProcedure'),
    repairHistory: value('repairHistory'),
    maintenanceSchedule: value('maintenanceSchedule'),
    attachments: value('attachments'),
    qrCode: value('qrCode')
  };
}

function normalizeEquipment(equipment) {
  return {
    ...equipment,
    code: equipment.code || equipment.equipmentCode || '',
    group: equipment.group || equipment.type || '',
    imageUrl: equipment.imageUrl || equipment.image || '',
    location: equipment.location || equipment.machineLocation || '',
    manufacturer: equipment.manufacturer || '',
    purchaseYear: equipment.purchaseYear || '',
    originalPrice: equipment.originalPrice || '',
    manager: equipment.manager || equipment.personInCharge || '',
    userManual: equipment.userManual || '',
    safetyProcedure: equipment.safetyProcedure || '',
    repairHistory: equipment.repairHistory || '',
    maintenanceSchedule: equipment.maintenanceSchedule || '',
    attachments: equipment.attachments || '',
    qrCode: equipment.qrCode || ''
  };
}

function getEquipmentStatusLabel(status) {
  return STATUS_OPTIONS.find(option => option.value === status)?.label || getStatusLabel(status || 'working');
}

function getStatusClass(status) {
  if (status === 'working') return 'success';
  if (status === 'maintenance') return 'warning';
  if (status === 'broken') return 'danger';
  return 'info';
}

function detailItem(label, value) {
  return `
    <div class="detail-item">
      <span>${label}</span>
      <strong>${escapeHtml(value || '-')}</strong>
    </div>
  `;
}

function detailBlock(label, value) {
  return `
    <h4>${label}</h4>
    <p>${nl2br(value || '-')}</p>
  `;
}

function formatCurrency(value) {
  const number = Number(value || 0);
  if (!number) return '-';
  return number.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

function nl2br(value) {
  return escapeHtml(value).replaceAll('\n', '<br>');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
