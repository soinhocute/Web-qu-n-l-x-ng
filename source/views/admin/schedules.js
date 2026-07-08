import { addSchedule, getSchedules } from '../../services/dbService.js';
import { formatDate, showToast } from '../../utils/helpers.js';

export async function renderScheduleManagement(role = 'student') {
  const content = document.getElementById('content');
  const canEdit = role === 'admin' || role === 'teacher';

  content.innerHTML = `
    <div class="management-container">
      <div class="page-header">
        <div>
          <h1>Thời khóa biểu xưởng</h1>
          <p class="text-muted">Theo dõi ca học, ca thực hành và lịch sử dụng thiết bị.</p>
        </div>
        ${canEdit ? `
          <button class="btn btn-primary" id="addScheduleBtn">
            <i class="fas fa-plus"></i> Thêm lịch
          </button>
        ` : ''}
      </div>

      <div class="schedule-board" id="scheduleBoard">
        <div class="text-center text-muted p-3">Đang tải lịch...</div>
      </div>
    </div>
  `;

  addScheduleStyles();
  await loadSchedules();

  document.getElementById('addScheduleBtn')?.addEventListener('click', () => showScheduleModal());
}

async function loadSchedules() {
  const schedules = await getSchedules();
  const fallback = [
    { title: 'Thực hành an toàn xưởng', room: 'Khu máy cưa', teacher: 'GV. Nguyễn Minh', date: '2026-07-08', time: '07:30 - 10:30' },
    { title: 'Gia công vật liệu gỗ', room: 'Khu máy cắt', teacher: 'GV. Trần An', date: '2026-07-09', time: '13:00 - 16:00' },
    { title: 'Bảo trì thiết bị định kỳ', room: 'Toàn xưởng', teacher: 'Tổ kỹ thuật', date: '2026-07-10', time: '08:00 - 11:00' }
  ];
  const items = schedules.length ? schedules : fallback;

  document.getElementById('scheduleBoard').innerHTML = items.map(item => `
    <article class="schedule-item" data-search="${[item.title, item.room, item.teacher].join(' ').toLowerCase()}">
      <div class="schedule-date">
        <strong>${item.date ? formatDate(item.date) : '-'}</strong>
        <span>${item.time || item.slot || 'Chưa có giờ'}</span>
      </div>
      <div>
        <h3>${item.title || item.subject || 'Ca sử dụng xưởng'}</h3>
        <p><i class="fas fa-location-dot"></i> ${item.room || 'Xưởng chính'}</p>
        <p><i class="fas fa-user-tie"></i> ${item.teacher || 'Chưa phân công'}</p>
      </div>
    </article>
  `).join('');
}

function showScheduleModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Thêm lịch xưởng</h2>
        <button class="modal-close">&times;</button>
      </div>
      <form id="scheduleForm">
        <div class="modal-body">
          <div class="form-group">
            <label for="title">Tên lịch</label>
            <input id="title" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="date">Ngày</label>
              <input type="date" id="date" required>
            </div>
            <div class="form-group">
              <label for="time">Khung giờ</label>
              <input id="time" placeholder="07:30 - 10:30" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="room">Khu vực</label>
              <input id="room" placeholder="Khu máy cắt">
            </div>
            <div class="form-group">
              <label for="teacher">Phụ trách</label>
              <input id="teacher" placeholder="GV. ...">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="cancelSchedule">Hủy</button>
          <button type="submit" class="btn btn-primary">Lưu</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('#cancelSchedule').addEventListener('click', () => modal.remove());
  modal.querySelector('#scheduleForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const result = await addSchedule({
      title: modal.querySelector('#title').value,
      date: modal.querySelector('#date').value,
      time: modal.querySelector('#time').value,
      room: modal.querySelector('#room').value,
      teacher: modal.querySelector('#teacher').value
    });

    if (result.success) {
      showToast('Đã thêm lịch xưởng', 'success');
      modal.remove();
      loadSchedules();
    } else {
      showToast(result.error, 'danger');
    }
  });
}

function addScheduleStyles() {
  if (document.getElementById('scheduleStyles')) return;

  const style = document.createElement('style');
  style.id = 'scheduleStyles';
  style.textContent = `
    .schedule-board {
      display: grid;
      gap: 14px;
    }

    .schedule-item {
      display: grid;
      grid-template-columns: 180px 1fr;
      gap: 18px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: var(--shadow);
      padding: 18px;
    }

    .schedule-date {
      border-right: 1px solid #e2e8f0;
      color: var(--primary-color);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .schedule-date span,
    .schedule-item p {
      color: #64748b;
      font-size: 14px;
      margin: 0;
    }

    .schedule-item h3 {
      color: var(--primary-color);
      margin-bottom: 10px;
    }

    @media (max-width: 640px) {
      .schedule-item {
        grid-template-columns: 1fr;
      }

      .schedule-date {
        border-right: 0;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 12px;
      }
    }
  `;

  document.head.appendChild(style);
}
