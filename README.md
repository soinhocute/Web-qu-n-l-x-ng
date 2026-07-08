# Hệ Thống Quản Lý Xưởng Gỗ

Đây là một hệ thống quản lý xưởng gỗ toàn diện được xây dựng bằng Vanilla JavaScript và Firebase.

## 🎯 Tính Năng Chính

### 1. **Hệ Thống Phân Quyền**
- **Admin**: Toàn quyền kiểm soát, quản lý tài khoản, duyệt đơn mượn/trả
- **Giáo viên**: Quản lý vật tư, thiết bị, duyệt mượn/trả của sinh viên
- **Sinh viên**: Xem thông tin, mượn/trả vật tư, ghi nhận ra vào
- **Đối tác**: Xem thông tin xưởng, thống kê phát triển
- **Khách**: Xem giới thiệu về xưởng

### 2. **Quản Lý Vật Tư**
- Thêm/sửa/xóa vật tư xưởng
- Quản lý số lượng vật tư
- Tìm kiếm theo từ khóa
- Lọc theo trạng thái

### 3. **Quản Lý Thiết Bị**
- Quản lý các máy móc (máy cưa, máy cắt, máy khoan,...)
- Theo dõi trạng thái thiết bị (hoạt động, hỏng, bảo trì)
- Báo cáo hỏng hóc

### 4. **Mượn/Trả Vật Tư**
- Sinh viên đăng kí mượn
- Giáo viên/Admin duyệt đơn
- Xác nhận trả vật tư
- Lịch sử mượn/trả

### 5. **Quản Lý Ra Vào Sinh Viên**
- Ghi nhận vào/ra xưởng
- Thống kê ra vào theo ngày
- Lọc theo sinh viên hoặc ngày

### 6. **Giao Tiếp Và Thông Báo**
- Chat popup ở góc dưới bên phải
- Icon chuông thông báo trên navbar
- Tin nhắn trong hệ thống

### 7. **Tìm Kiếm Toàn Cục**
- Tìm kiếm vật tư
- Tìm kiếm thiết bị
- Tìm kiếm sinh viên

## 📁 Cấu Trúc Thư Mục

```
/source
  /config
    firebase.js          # Cấu hình Firebase
  /services
    authService.js       # Xác thực người dùng
    dbService.js         # Thao tác cơ sở dữ liệu
  /components
    layout.js            # Layout chính với sidebar
    chatBubble.js        # Component chat
  /views
    login.js             # Trang đăng nhập/đăng kí
    roleSelector.js      # Chọn vai trò
    /admin
      dashboard.js       # Dashboard Admin
      materials.js       # Quản lý vật tư
      equipments.js      # Quản lý thiết bị
      borrows.js         # Quản lý mượn/trả
      users.js           # Quản lý người dùng
      entries.js         # Quản lý ra vào
    /teacher
      dashboard.js       # Dashboard Giáo viên
    /student
      dashboard.js       # Dashboard Sinh viên
    /public
      page.js            # Trang giới thiệu (khách)
      partnerPage.js     # Trang đối tác
  /utils
    helpers.js           # Hàm tiện ích
  app.js                 # File khởi động ứng dụng
```

## 🚀 Cài Đặt và Sử Dụng

### 1. **Yêu Cầu**
- Node.js (để chạy server dev)
- Firebase account

### 2. **Cấu Hình Firebase**

Cập nhật file `source/config/firebase.js` với thông tin Firebase của bạn:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### 3. **Khởi Động Ứng Dụng**

```bash
# Cài đặt dependencies
npm install

# Chạy development server (nếu cần)
npm start

# Deploy lên Firebase Hosting
firebase deploy
```

### 4. **Firestore Database Schema**

Tạo các collection sau trong Firestore:

#### **Collection: users**
```
{
  uid: string,
  email: string,
  fullName: string,
  role: string (admin, teacher, student, partner, guest),
  status: string (active, pending, rejected),
  phone: string,
  organization: string (cho partner),
  address: string,
  createdAt: timestamp
}
```

#### **Collection: materials**
```
{
  name: string,
  quantity: number,
  unit: string (cái, bộ, kg,...),
  description: string,
  status: string (active, inactive),
  createdAt: timestamp
}
```

#### **Collection: equipments**
```
{
  name: string,
  type: string (máy cưa, máy cắt,...),
  description: string,
  status: string (working, broken, maintenance),
  createdAt: timestamp
}
```

#### **Collection: borrowRequests**
```
{
  studentId: string,
  studentName: string,
  materialId: string,
  materialName: string,
  quantity: number,
  returnDate: timestamp,
  note: string,
  status: string (pending, approved, rejected, returned),
  createdAt: timestamp
}
```

#### **Collection: studentEntries**
```
{
  studentId: string,
  studentName: string,
  type: string (in, out),
  timestamp: timestamp,
  date: string (YYYY-MM-DD),
  note: string
}
```

#### **Collection: messages**
```
{
  conversationId: string,
  senderId: string,
  senderName: string,
  text: string,
  createdAt: timestamp
}
```

#### **Collection: notifications**
```
{
  recipientId: string,
  title: string,
  message: string,
  type: string,
  read: boolean,
  createdAt: timestamp
}
```

#### **Collection: schedules**
```
{
  title: string,
  description: string,
  startTime: timestamp,
  endTime: timestamp,
  location: string,
  createdAt: timestamp
}
```

## 🔐 Firestore Security Rules

Thêm vào `firestore.rules`:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Quy tắc chung
    match /users/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.uid || 
                               request.auth.uid == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /materials/{document=**} {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'teacher'];
    }

    match /equipments/{document=**} {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'teacher'];
    }

    match /borrowRequests/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'teacher'];
    }

    match /studentEntries/{document=**} {
      allow read: if request.auth != null;
      allow create, write: if request.auth != null;
    }

    match /messages/{document=**} {
      allow read, write: if request.auth != null;
    }

    match /notifications/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.recipientId;
      allow create: if request.auth != null;
    }

    match /schedules/{document=**} {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'teacher'];
    }
  }
}
```

## 👥 Tài Khoản Demo

Để test ứng dụng, bạn có thể:
1. Chọn vai trò là "Khách" để xem trang giới thiệu
2. Đăng kí tài khoản mới với vai trò "Sinh viên", "Giáo viên", hoặc "Đối tác"
3. Chờ admin duyệt (hoặc tạo tài khoản trực tiếp trong Firebase)

### Admin Account
- Phải tạo thủ công trong Firebase console
- Đặt `role: 'admin'` và `status: 'active'`

## 🎨 Tùy Chỉnh Giao Diện

Các biến CSS chính trong `style.css`:

```css
:root {
  --primary-color: #2C3E50;
  --secondary-color: #3498DB;
  --success-color: #27AE60;
  --warning-color: #E67E22;
  --danger-color: #E74C3C;
  --light-color: #ECF0F1;
  --dark-color: #2C3E50;
}
```

## 📝 Hướng Dẫn Sử Dụng

### Cho Admin
1. Đăng nhập bằng tài khoản admin
2. Quản lý người dùng (duyệt tài khoản mới)
3. Thêm/sửa vật tư và thiết bị
4. Duyệt các đơn mươn/trả của sinh viên
5. Xem thống kê ra vào

### Cho Giáo Viên
1. Đăng nhập bằng tài khoản giáo viên
2. Quản lý vật tư và thiết bị
3. Duyệt đơn mượn/trả của sinh viên
4. Ghi nhận ra vào sinh viên

### Cho Sinh Viên
1. Đăng kí tài khoản hoặc đăng nhập
2. Xem vật tư và thiết bị của xưởng
3. Đăng kí mượn vật tư
4. Ghi nhận vào/ra xưởng

### Cho Đối Tác
1. Đăng kí tài khoản đối tác
2. Xem thông tin xưởng
3. Xem thống kê phát triển
4. Xem các đối tác khác

## 🐛 Troubleshooting

### Không thể đăng nhập
- Kiểm tra Firebase config
- Đảm bảo email verification được bật trong Firebase Auth

### Không thể lưu dữ liệu
- Kiểm tra Firestore rules
- Đảm bảo người dùng có quyền thích hợp

### Chat không hoạt động
- Xem console.log để tìm lỗi
- Kiểm tra conversationId

## 📚 Tài Liệu Tham Khảo

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

## 📄 License

Dự án này là mã nguồn mở dành cho mục đích giáo dục.

## 👨‍💻 Tác Giả

Xây dựng bởi GitHub Copilot

---

**Lưu ý**: Đây là phiên bản beta. Một số tính năng vẫn đang phát triển.
