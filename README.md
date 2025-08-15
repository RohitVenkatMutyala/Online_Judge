# Online_Judge

# 🎯 Randoman — Your Smart Coding Companion


> **Randoman** is not just a code editor. It’s a developer-friendly, cloud-based platform designed to guide, support, and secure your coding journey — like a mentor who’s always there when you’re stuck.
#### Check_Out_Here :- https://randoman.online


---

## 🚀 Features

### ✅ Language Support
- C++
- Python
- Java

### 🆘 Smart Help Feature
- Identify where your code is stuck and get contextual hints.
- **Limited to 20 helps/day** to encourage smart debugging.
- Same submission can't receive multiple helps.
- Stores the **last help** for later reference.

### 💾 Auto Save (Cloud-Based)
- No traditional local storage.
- Saves automatically in the **cloud** even across browser sessions.

### 🔐 Security Highlights
- Code execution inside **Docker containers** (isolated).
- Users **can’t access or overwrite** system-level files.
- Admin and user accounts are securely separated.

### 🧪 Test Case Management
- All system test cases are **hidden** for real challenge.
- Users can create **custom test cases**.
- Admin can upload **500+ test cases** at once using `input.txt` / `output.txt`.

### 💬 Motivational Quotes
- Inspirational messages based on coding session durations ⏱️

---

## 🔐 Authentication & Authorization

- JWT-based login system with expiry support.
- Auth state managed using a custom `useAuth` hook.
- HTTP-only **secure cookies** to prevent token access from client side.
- **Admin Panel**:
  - Add problems & bulk upload test cases.
  - Fully isolated from user access.

---

## ⚙️ Tech Stack

| Category         | Technology                          |
|------------------|--------------------------------------|
| 🌐 Frontend       | React.js (Vercel deployment)         |
| 🧠 Backend        | Node.js + Express.js                 |
| 📦 Database       | MongoDB + Firebase Firestore         |
| 🐳 Containers     | Docker                               |
| 🔒 Security       | JWT + Cookie + Docker isolation      |
| ☁️ Hosting        | AWS EC2 + Nginx + Certbot SSL        |

---

## 📝 Upcoming Features


- 📈 **User Analytics**: Track your improvement.
- 🧠 **Smart HELP **: Deep integration for smarter suggestions based upon the user code writing style and thinking.

---
👨‍💻 Developed By
Rohith Venkat Mutyala



