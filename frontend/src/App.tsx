import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login'; // Naya Login page import kiya
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SearchPapers from './pages/SearchPapers';
import DocSpace from './pages/DocSpace';
import Workspace from './pages/Workspace';
import AITools from './pages/AITools';
import UploadPDF from './pages/UploadPDF';
// Security Guard Component

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('token');
  // Agar token nahi hai, toh wapas login par phek do
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes (Inke aage guard khada hai) */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Home />} />  
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="search" element={<SearchPapers />} />
          <Route path="workspace/:id" element={<Workspace />} />
          <Route path="ai-tools" element={<AITools />} />
          <Route path="upload" element={<UploadPDF />} />
          <Route path="/docspace" element={<DocSpace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;