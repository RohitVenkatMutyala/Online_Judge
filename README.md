# ONLINE_JUDGE

*Empowering Innovation Through Seamless Coding Excellence*

<div align="center">


![repo-top-language](https://img.shields.io/github/languages/top/RohitVenkatMutyala/Online_Judge?style=flat&color=0080ff)
![repo-language-count](https://img.shields.io/github/languages/count/RohitVenkatMutyala/Online_Judge?style=flat&color=0080ff)

### Built with the tools and technologies:

![Express](https://img.shields.io/badge/Express-000000.svg?style=flat&logo=Express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB.svg?style=flat&logo=React&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933.svg?style=flat&logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=flat&logo=JavaScript&logoColor=black)

![MongoDB](https://img.shields.io/badge/MongoDB-47A248.svg?style=flat&logo=MongoDB&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-DD2C00.svg?style=flat&logo=Firebase&logoColor=white)


![Docker](https://img.shields.io/badge/Docker-2496ED.svg?style=flat&logo=Docker&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-FF9900.svg?style=flat&logo=amazonaws&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000.svg?style=flat&logo=Vercel&logoColor=white)

**🌐 Check it out:** [https://randoman.online](https://randoman.online)

</div>

---

## 📋 Table of Contents

- Overview
- Features
- Tech Stack
- Authentication & Authorization
- Getting Started
  - Prerequisites
  - Installation
  - Usage
  - Testing
- Upcoming Features
- Developer

---

## 🎯 Overview

Online_Judge is an all-in-one platform that facilitates real-time coding, collaboration, and problem-solving for developers and learners alike. It combines decentralized peer-to-peer communication with a scalable cloud environment, supporting multiple programming languages and secure code execution.

### Why Online_Judge?

This project aims to enhance coding education and competitive programming through seamless collaboration and automation. The core features include:

- 🧑‍💻 **Peer-to-peer communication:** Enables real-time audio, video, and data exchange for collaborative coding sessions
- 🚀 **Scalable cloud environment:** Supports multiple languages with secure execution and debugging tools
- 🔒 **Role-based access control:** Differentiates admin and user workflows for problem management and platform moderation
- 🌐 **Firebase integration:** Powers real-time data updates, user profiles, and session sharing
- ⚙️ **Automated testing & evaluation:** Facilitates code submission, testing, and feedback across diverse programming challenges
- 🎯 **Problem & session management:** Simplifies creation, filtering, and sharing of coding problems and collaborative sessions

---

## 🚀 Features

### ✅ Language Support
- **C++** - Full compiler support with standard libraries
- **Python** - Python 3.x with common packages
- **Java** - JDK with comprehensive standard library access

### 🆘 Smart Help Feature
- Identifies where your code is stuck and provides contextual hints
- **Limited to 20 helps per day** to encourage smart debugging
- Same submission can't receive multiple helps
- Stores the **last help** for later reference

### 💾 Cloud-Based Auto Save
- No traditional local storage dependency
- Automatic cloud saves persist across browser sessions
- Code is never lost, even if you close the browser

### 🔐 Security Highlights
- Code execution inside **Docker containers** for complete isolation
- Users **cannot access or overwrite** system-level files
- Admin and user accounts are securely separated
- Sandboxed environment prevents malicious code execution

### 🧪 Test Case Management
- All system test cases are **hidden** to maintain challenge integrity
- Users can create and test **custom test cases**
- Admins can upload **500+ test cases** at once using `input.txt` / `output.txt` files
- Comprehensive edge case coverage

### 💬 Motivational Quotes
- Inspirational messages based on coding session duration
- Encourages persistence and learning

---

## ⚙️ Tech Stack

| Category          | Technology                           |
|-------------------|--------------------------------------|
| 🌐 **Frontend**   | React.js (Vercel deployment)         |
| 🧠 **Backend**    | Node.js + Express.js                 |
| 📦 **Database**   | MongoDB + Firebase Firestore         |
| 🐳 **Containers** | Docker                               |
| 🔒 **Security**   | JWT + HTTP-only Cookies + Docker     |
| ☁️ **Hosting**    | AWS EC2 + Nginx + Certbot SSL        |

---

## 🔐 Authentication & Authorization

- **JWT-based authentication** with token expiry support
- Auth state managed using a custom `useAuth` hook
- **HTTP-only secure cookies** prevent client-side token access
- **Admin Panel**:
  - Add and manage problems
  - Bulk upload test cases
  - Fully isolated from regular user access

---

## 🚀 Getting Started

### Prerequisites

This project requires the following dependencies:

- **Programming Language:** JavaScript (Node.js v14+)
- **Package Manager:** npm or yarn
- **Container Runtime:** Docker
- **Database:** MongoDB

### Installation

Build Online_Judge from source and install dependencies:

1. **Clone the repository:**

   ```sh
   git clone https://github.com/RohitVenkatMutyala/Online_Judge
   ```

2. **Navigate to the project directory:**

   ```sh
   cd Online_Judge
   ```

3. **Install the dependencies:**

   **Using Docker:**

   ```sh
   docker build -t online-judge .
   ```

   **Using npm:**

   ```sh
   npm install
   ```

4. **Set up environment variables:**

   Create a `.env` file in the root directory with your configuration:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   FIREBASE_CONFIG=your_firebase_config
   ```

### Usage

Run the project with:

**Using Docker:**

```sh
docker run -it -p 3000:3000 online-judge
```

**Using npm:**

```sh
npm start
```

The application will be available at `http://localhost:3000`

### Testing

Run the test suite with:

**Using Docker:**

```sh
docker exec -it <container_name> npm test
```

**Using npm:**

```sh
npm test
```

---

## 📝 Upcoming Features

- 📈 **User Analytics** - Track your progress and improvement over time
- 🧠 **Enhanced Smart HELP** - Deep integration for smarter suggestions based on user code writing style and thinking patterns
- 🏆 **Leaderboards** - Competitive rankings and achievements
- 👥 **Collaboration Mode** - Real-time pair programming features

---

---

## License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2025 Rohith Venkat Mutyala

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---
## 👨‍💻 Developer

**Developed by:** Rohith Venkat Mutyala

---

<div align="center">


Made with ❤️ for the coding community

</div>
