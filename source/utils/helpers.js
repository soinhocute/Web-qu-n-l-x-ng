// Định dạng ngày tháng
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date.toDate ? date.toDate() : date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Định dạng thời gian
export const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date.toDate ? date.toDate() : date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Định dạng datetime
export const formatDateTime = (date) => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

// Chuyển đổi trạng thái thành tiếng Việt
export const getStatusLabel = (status) => {
  const statusMap = {
    'pending': 'Chờ duyệt',
    'approved': 'Đã duyệt',
    'rejected': 'Từ chối',
    'returned': 'Đã trả',
    'active': 'Hoạt động',
    'inactive': 'Không hoạt động',
    'working': 'Đang hoạt động',
    'broken': 'Hỏng',
    'maintenance': 'Bảo trì',
    'available': 'Có sẵn',
    'borrowed': 'Đã mượn'
  };
  return statusMap[status] || status;
};

// Lấy màu cho trạng thái
export const getStatusColor = (status) => {
  const colorMap = {
    'pending': '#FFA500',
    'approved': '#4CAF50',
    'rejected': '#F44336',
    'returned': '#2196F3',
    'active': '#4CAF50',
    'inactive': '#9E9E9E',
    'working': '#4CAF50',
    'broken': '#F44336',
    'maintenance': '#FF9800',
    'available': '#4CAF50',
    'borrowed': '#2196F3'
  };
  return colorMap[status] || '#9E9E9E';
};

// Lấy vai trò (role) tiếng Việt
export const getRoleLabel = (role) => {
  const roleMap = {
    'admin': 'Quản trị viên',
    'teacher': 'Giáo viên',
    'student': 'Sinh viên',
    'partner': 'Đối tác',
    'guest': 'Khách'
  };
  return roleMap[role] || role;
};

// Lưu token vào localStorage
export const saveToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Lấy token từ localStorage
export const getToken = () => {
  return localStorage.getItem('authToken');
};

// Xóa token
export const removeToken = () => {
  localStorage.removeItem('authToken');
};

// Lưu user info vào localStorage
export const saveUserInfo = (userInfo) => {
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
};

// Lấy user info từ localStorage
export const getUserInfo = () => {
  const info = localStorage.getItem('userInfo');
  return info ? JSON.parse(info) : null;
};

// Xóa user info
export const removeUserInfo = () => {
  localStorage.removeItem('userInfo');
};

// Hiển thị toast message
export const showToast = (message, type = 'info') => {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
};

// Hiển thị modal
export const showModal = (title, message, buttons = []) => {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          ${message}
        </div>
        <div class="modal-footer">
          ${buttons.map((btn, idx) => `
            <button class="btn btn-${btn.type || 'primary'}" data-action="${idx}">
              ${btn.label}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.remove();
      resolve(null);
    });
    
    modal.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = parseInt(e.target.dataset.action);
        modal.remove();
        resolve(action);
      });
    });
  });
};

// Xác nhận hành động
export const confirm = async (message) => {
  const result = await showModal('Xác nhận', message, [
    { label: 'Hủy', type: 'secondary' },
    { label: 'Đồng ý', type: 'primary' }
  ]);
  return result === 1;
};

// Kiểm tra có quyền truy cập
export const hasPermission = (userRole, requiredRole) => {
  const roleHierarchy = {
    'admin': 5,
    'teacher': 3,
    'student': 2,
    'partner': 1,
    'guest': 0
  };
  
  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
};

// Tìm kiếm
export const searchInArray = (array, keyword, fields) => {
  if (!keyword) return array;
  
  const lowerKeyword = keyword.toLowerCase();
  return array.filter(item => {
    return fields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(lowerKeyword);
    });
  });
};

// Sắp xếp
export const sortArray = (array, field, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
    if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

// Phân trang
export const paginate = (array, page, pageSize) => {
  const startIndex = (page - 1) * pageSize;
  return {
    data: array.slice(startIndex, startIndex + pageSize),
    totalPages: Math.ceil(array.length / pageSize),
    currentPage: page,
    total: array.length
  };
};
