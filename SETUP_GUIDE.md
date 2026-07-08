# 📋 Hướng Dẫn Setup Chi Tiết

## Bước 1: Chuẩn Bị Firebase Project

### 1.1 Tạo Firebase Project
1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Nhấn "Create a new project"
3. Nhập tên project: "web-quan-li-xuong"
4. Hoàn tất quá trình tạo

### 1.2 Kích Hoạt Firestore Database
1. Vào Console, chọn "Firestore Database"
2. Nhấn "Create database"
3. Chọn "Start in test mode" (sau sẽ cập nhật security rules)
4. Chọn vị trí: "asia-southeast1" (hoặc gần nhất)

### 1.3 Kích Hoạt Authentication
1. Vào "Authentication"
2. Chọn "Sign-in method"
3. Kích hoạt "Email/Password"

### 1.4 Lấy Thông Tin Firebase Config
1. Vào "Project settings" (gear icon)
2. Chọn tab "Your apps"
3. Chọn hoặc tạo web app
4. Copy Firebase config

## Bước 2: Cấu Hình Ứng Dụng

### 2.1 Cập Nhật Firebase Config
```bash
# Mở file source/config/firebase.js
# Cập nhật firebaseConfig với thông tin từ Firebase Console
```

### 2.2 Cập Nhật Firestore Rules
```bash
# Copy nội dung firestore.rules vào Firebase Console
1. Vào Firestore Database > Rules
2. Xóa rules cũ
3. Paste nội dung firestore.rules
4. Publish
```

## Bước 3: Cài Đặt Dependencies

```bash
# Cài đặt npm packages
npm install

# Cài đặt Firebase CLI (nếu chưa có)
npm install -g firebase-tools

# Login vào Firebase
firebase login

# Khởi tạo Firebase project
firebase init
```

## Bước 4: Tạo Dữ Liệu Demo

### 4.1 Tạo Admin Account
1. Vào Firebase Console > Authentication
2. Nhấn "Create user"
3. Nhập:
   - Email: admin@xuong.edu.vn
   - Password: Admin123456

Sau đó:
1. Vào Firestore Database
2. Tạo collection "users"
3. Tạo document mới:
```json
{
  "uid": "COPY_UID_TỪ_ADMIN_ACCOUNT",
  "email": "admin@xuong.edu.vn",
  "fullName": "Admin Xưởng",
  "role": "admin",
  "status": "active",
  "phone": "0901234567",
  "address": "123 Đường Lê Lợi, TP.HCM",
  "createdAt": "CURRENT_TIMESTAMP"
}
```

### 4.2 Tạo Dữ Liệu Sample

**Materials (Vật tư):**
```json
[
  {
    "name": "Gỗ sồi",
    "quantity": 50,
    "unit": "bộ",
    "description": "Gỗ sồi nhập khẩu",
    "status": "active",
    "createdAt": "CURRENT_TIMESTAMP"
  },
  {
    "name": "Gỗ thông",
    "quantity": 100,
    "unit": "cái",
    "description": "Gỗ thông Việt Nam",
    "status": "active",
    "createdAt": "CURRENT_TIMESTAMP"
  }
]
```

**Equipments (Thiết bị):**
```json
[
  {
    "name": "Máy Cưa CNC-500",
    "type": "máy cưa",
    "description": "Máy cưa tự động cnc",
    "status": "working",
    "createdAt": "CURRENT_TIMESTAMP"
  },
  {
    "name": "Máy Khoan Bosch",
    "type": "máy khoan",
    "description": "Máy khoan điều khiển số",
    "status": "working",
    "createdAt": "CURRENT_TIMESTAMP"
  }
]
```

## Bước 5: Chạy Ứng Dụng

### 5.1 Development
```bash
# Cách 1: Sử dụng Firebase emulator
npm start

# Cách 2: Sử dụng live server
# Cài đặt live-server: npm install -g live-server
live-server
```

### 5.2 Production (Deploy)
```bash
# Build (không cần build step cho SPA)
npm run build

# Deploy lên Firebase Hosting
firebase deploy

# URL sẽ như: https://web-quan-li-xuong.firebaseapp.com
```

## Bước 6: Test Ứng Dụng

### 6.1 Test Login
1. Mở http://localhost:5500 (hoặc URL Firebase)
2. Chọn "Khách" > Không đăng nhập
3. Hoặc chọn "Sinh viên" > Đăng kí tài khoản mới

### 6.2 Test Admin
1. Chọn vai trò "Khách"
2. Nhấn "Đăng nhập Admin"
3. Đăng nhập bằng admin account

### 6.3 Test Chức Năng
1. Thêm vật tư (Admin/Teacher)
2. Thêm thiết bị
3. Tạo đơn mượn (Student)
4. Duyệt đơn (Admin/Teacher)
5. Ghi nhận ra vào

## Lỗi Thường Gặp và Cách Khắc Phục

### Lỗi: "Firebase config is not defined"
- **Nguyên nhân**: Config Firebase chưa được load
- **Giải pháp**: Kiểm tra file `source/config/firebase.js` đã cập nhật chưa

### Lỗi: "Permission denied" khi truy cập Firestore
- **Nguyên nhân**: Security rules chưa đúng
- **Giải pháp**: Cập nhật firestore.rules và publish

### Lỗi: "User is not authenticated"
- **Nguyên nhân**: User chưa đăng nhập hoặc session hết hạn
- **Giải pháp**: Kiểm tra localStorage, xóa authToken nếu cần

### Chat không hoạt động
- **Nguyên nhân**: conversationId chưa được khởi tạo
- **Giải pháp**: Kiểm trap sessionStorage, xóa và làm mới

## Các Tài Khoản Test

```
Admin:
- Email: admin@xuong.edu.vn
- Password: Admin123456

Teacher (tạo via đăng kí):
- Email: teacher@xuong.edu.vn
- Password: Teacher123456
- Role: teacher
- (Cần admin duyệt)

Student (tạo via đăng kí):
- Email: student@xuong.edu.vn  
- Password: Student123456
- Role: student
- (Cần admin duyệt)
```

## Deployment Checklist

- [ ] Firebase config đã cập nhật
- [ ] Firestore rules đã deploy
- [ ] Admin account đã tạo
- [ ] Dữ liệu sample đã thêm
- [ ] Test toàn bộ chức năng
- [ ] Update README với URL production
- [ ] Deploy lên Firebase Hosting: `firebase deploy`

## Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra console.log trong browser DevTools
2. Kiểm tra Firebase Logs trong Console
3. Xem lại Firestore Rules
4. Kiểm tra Authentication settings

---

**Chúc bạn setup thành công! 🎉**
