import React from 'react';
import { Helmet } from 'react-helmet';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import Problems from './components/Problem';
import Contribute from './components/contribute';
import Home from './components/home';
import ADashboard from './components/admindashboard';
import PostProblems from './components/postporblems';
import Solve from './components/solve';
import AProblems from './components/AProblem';
import Adminview from './components/adminview';
import UploadTestCase from './components/testcase';
import { ThemeProvider } from './context/ThemeContext'; // you'll create this file
import Submission from './components/submissions';
import Contexts from './components/context';
import Userview from './components/userview';
import Theory from './components/theory';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<>
              <Helmet>
                <title>Randoman</title>
              </Helmet>
              <Home /></>} />
            <Route path="/login" element={<>
              <Helmet>
                <title>Login - Randoman</title>
              </Helmet>
              <LoginForm /></>} />
            <Route
              path="/adminlogin"
              element={
                <>
                  <Helmet><title>Admin Login - Randoman</title></Helmet>
                  <Contribute />
                </>
              }
            />
            <Route
              path="/register"
              element={
                <>
                  <Helmet><title>Register - Randoman</title></Helmet>
                  <RegisterForm />
                </>
              }
            />
            <Route
              path="/dashboard"
              element={
                <>
                  <Helmet><title>Dashboard - Randoman</title></Helmet>
                  <Dashboard />
                </>
              }
            />
            <Route
              path="/problem/:QID"
              element={
                <>
                  <Helmet><title>Solve Problem - Randoman</title></Helmet>
                  <Solve />
                </>
              }
            />
            <Route
              path="/admindashboard"
              element={
                <>
                  <Helmet><title>Admin Dashboard - Randoman</title></Helmet>
                  <ADashboard />
                </>
              }
            />
             <Route
              path="/funda"
              element={
                <>
                  <Helmet><title>Fundamentals - Randoman</title></Helmet>
                  <Theory />
                </>
              }
            />
            <Route
              path="/problems"
              element={
                <>
                  <Helmet><title>Problems - Randoman</title></Helmet>
                  <Problems />
                </>
              }
            />
            <Route
              path="/adminproblems"
              element={
                <>
                  <Helmet><title>Admin Problems - Randoman</title></Helmet>
                  <AProblems />
                </>
              }
            />
            <Route
              path="/postproblem"
              element={
                <>
                  <Helmet><title>Post Problem - Randoman</title></Helmet>
                  <PostProblems />
                </>
              }
            />
            <Route
              path="/adminlogin"
              element={
                <>
                  <Helmet><title>Admin Login - Randoman</title></Helmet>
                  <Contribute />
                </>
              }
            />
            <Route
              path="/register"
              element={
                <>
                  <Helmet><title>Register - Randoman</title></Helmet>
                  <RegisterForm />
                </>
              }
            />
            <Route
              path="/dashboard"
              element={
                <>
                  <Helmet><title>Dashboard - Randoman</title></Helmet>
                  <Dashboard />
                </>
              }
            />
            <Route
              path="/problem/:QID"
              element={
                <>
                  <Helmet><title>Solve Problem - Randoman</title></Helmet>
                  <Solve />
                </>
              }
            />
            <Route
              path="/admindashboard"
              element={
                <>
                  <Helmet><title>Admin Dashboard - Randoman</title></Helmet>
                  <ADashboard />
                </>
              }
            />
            <Route
              path="/problems"
              element={
                <>
                  <Helmet><title>Problems - Randoman</title></Helmet>
                  <Problems />
                </>
              }
            />
            <Route
              path="/adminproblems"
              element={
                <>
                  <Helmet><title>Admin Problems - Randoman</title></Helmet>
                  <AProblems />
                </>
              }
            />
            <Route
              path="/postproblem"
              element={
                <>
                  <Helmet><title>Post Problem - Randoman</title></Helmet>
                  <PostProblems />
                </>
              }
            />
            <Route
              path="/adminproblem/:QID"
              element={
                <>
                  <Helmet><title>Admin View Problem - Randoman</title></Helmet>
                  <Adminview />
                </>
              }
            />
               <Route
              path="/userproblem/:QID"
              element={
                <>
                  <Helmet><title>View Problem - Randoman</title></Helmet>
                  <Userview />
                </>
              }
            />
            <Route
              path="/test"
              element={
                <>
                  <Helmet><title>Test Cases - Randoman</title></Helmet>
                  <UploadTestCase />
                </>
              }
            />
            <Route
              path="/contribute"
              element={
                <>
                  <Helmet><title>Contribute - Randoman</title></Helmet>
                  <Contribute />
                </>
              }
            />
            <Route
              path="/sub"
              element={
                <>
                  <Helmet><title>Submissions - Randoman</title></Helmet>
                  <Submission />
                </>
              }
            />
            <Route
              path="/contexts"
              element={
                <>
                  <Helmet><title>Contexts - Randoman</title></Helmet>
                  <Contexts />
                </>
              }
            />          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
