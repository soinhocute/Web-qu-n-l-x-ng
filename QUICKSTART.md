# 🚀 Quick Start - Hướng Dẫn Nhanh

## Bước 1: Khởi Động Nhanh (5 phút)

### 1.1 Clone/Download Project
```bash
cd d:\Bảo\WEB
npm install
```

### 1.2 Cấu Hình Firebase
1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Tạo project mới: "web-quan-li-xuong"
3. Copy Firebase config
4. Cập nhật vào file `source/config/firebase.js`

### 1.3 Khởi Động Dev Server
```bash
# Option 1: Live Server (nếu cài)
live-server

# Option 2: Python http server
python -m http.server 8000

# Option 3: Node.js http-server
npx http-server
```

Mở browser: `http://localhost:8000` hoặc port đang chạy

---

## Bước 2: Setup Database (5 phút)

### 2.1 Tạo Firestore Collections
Vào Firebase Console > Firestore > Create Database:
- Chọn "Start in test mode"
- Chọn region: "asia-southeast1"

### 2.2 Deploy Security Rules
1. Copy nội dung file `firestore.rules`
2. Dán vào Firebase Console > Firestore > Rules
3. Nhấn "Publish"

### 2.3 Tạo Admin Account
Vào Firebase Console > Authentication > Create user:
```
Email: admin@xuong.edu.vn
Password: Admin123456
```

### 2.4 Tạo Admin Document
Firestore > users > New Document:
```json
{
  "uid": "UID_CỦA_ADMIN_ACCOUNT",
  "email": "admin@xuong.edu.vn",
  "fullName": "Admin Xưởng",
  "role": "admin",
  "status": "active",
  "phone": "0901234567",
  "address": "123 Đường Lê Lợi",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

---

## Bước 3: Test Ứng Dụng (5 phút)

### 3.1 Test Đăng Nhập
1. Mở http://localhost:8000
2. Chọn "Khách"
3. Nhấn "Đăng nhập Admin"
4. Đăng nhập: `admin@xuong.edu.vn` / `Admin123456`
5. Bạn sẽ thấy Admin Dashboard

### 3.2 Test Thêm Vật Tư
1. Vào mục "Vật tư xưởng"
2. Nhấn "Thêm Vật Tư"
3. Nhập:
   - Tên: "Gỗ Sồi"
   - Số lượng: 50
   - Đơn vị: "bộ"
4. Nhấn "Lưu"

### 3.3 Test Đăng Kí Sinh Viên
1. Chọn "Sinh viên"
2. Nhấn "Đăng kí"
3. Nhập:
   - Email: student@xuong.edu.vn
   - Mật khẩu: Student123456
   - Họ tên: Nguyễn Văn A
   - Số điện thoại: 0901234567
4. Nhấn "Đăng kí"
5. Chờ admin duyệt

---

## Lỗi Thường Gặp & Cách Khắc Phục

### ❌ "Firebase config is not defined"
**Giải pháp**: Cập nhật Firebase config trong `source/config/firebase.js`

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // ... các field khác
};
```

### ❌ "Permission denied" khi thêm vật tư
**Giải pháp**: Kiểm tra Firestore rules, đảm bảo user là admin

### ❌ "User is not authenticated"
**Giải pháp**: Xóa localStorage và làm mới:
```javascript
// Mở DevTools Console (F12)
localStorage.clear();
location.reload();
```

### ❌ Chat không hoạt động
**Giải pháp**: Kiểm tra:
1. `getMessages` function trong dbService.js
2. Collection "messages" đã được tạo chưa

---

## 📱 Cấu Trúc Thư Mục Quan Trọng

```
/source
  /config
    firebase.js          ← Cấu hình Firebase (CẬP NHẬT NGAY)
  /services
    authService.js       ← Đăng nhập/Đăng kí
    dbService.js         ← Thao tác database
  /views
    login.js             ← Trang đăng nhập
    roleSelector.js      ← Chọn vai trò
    /admin
      dashboard.js       ← Dashboard Admin
      materials.js       ← Quản lý vật tư
      ← Các file quản lý khác
  /components
    layout.js            ← Giao diện chính
    chatBubble.js        ← Chat
  app.js                 ← Khởi động ứng dụng

style.css               ← CSS chính (KHÔNG CẦN SỬA)
main.html               ← HTML chính (KHÔNG CẦN SỬA)
```

---

## ✅ Checklist Hoàn Thành

- [ ] Cài đặt npm packages (`npm install`)
- [ ] Cấu hình Firebase config
- [ ] Tạo Firestore database
- [ ] Deploy Firestore rules
- [ ] Tạo admin account
- [ ] Tạo admin document trong Firestore
- [ ] Khởi động dev server
- [ ] Test đăng nhập admin
- [ ] Test thêm vật tư
- [ ] Test đăng kí sinh viên

---

## 🎯 Next Steps

Sau khi setup thành công:

1. **Test toàn bộ chức năng** - Xem FEATURES_GUIDE.md
2. **Tùy chỉnh giao diện** - Sửa CSS variables trong style.css
3. **Deploy lên Firebase** - Chạy `firebase deploy`
4. **Thêm dữ liệu sample** - Tạo vật tư, thiết bị, sinh viên demo

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra [Firebase Docs](https://firebase.google.com/docs)
2. Xem SETUP_GUIDE.md để hướng dẫn chi tiết
3. Mở DevTools Console (F12) để xem lỗi

---

**Chúc bạn setup thành công! 🎉**

Sau khi setup xong, hãy thử chức năng sau:
- Đăng nhập → Admin Dashboard
- Thêm vật tư → Vật tư xuất hiện trong danh sách
- Đăng kí → Chợ admin duyệt → Đăng nhập lại

Nếu các bước này hoạt động, ứng dụng đã sẵn sàng!
