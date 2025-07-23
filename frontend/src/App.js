import React from 'react';
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


function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home/>} />
           <Route path="/login" element={<LoginForm />} />
           <Route path ="/adminlogin" element={<Contribute/>}/>
          <Route path='/register' element={<RegisterForm/>}/>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/problem/:QID" element={<Solve />} />
            <Route path="/admindashboard" element={<ADashboard />} />
          <Route path="/problems" element={< Problems/>} />
          <Route path="/adminproblems" element={< AProblems/>} />
           <Route path="/postproblem" element={< PostProblems/>} />
            <Route path="/adminproblem/:QID" element={<Adminview />} />
              <Route path="/test" element={<UploadTestCase />} />
          < Route path="/contribute" element={<Contribute/>} />
          <Route path = "/sub" element={<Submission/>}/>
        <Route path ="/contexts" element ={<Contexts/>}  />
        </Routes>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
