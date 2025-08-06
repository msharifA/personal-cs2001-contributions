
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';

// Page Imports
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import TestLogin from './pages/TestLogin';
import UserProfile from './pages/UserProfile';
import Dashboard from './pages/Dashboard';
import ResetPassword from './pages/ResetPassword';
import ResetPasswordRequest from './pages/ResetPasswordRequest';
import BookForm from './pages/BookForm';
import Marketplace from './pages/Marketplace';
import Clothes from './pages/Clothes';
import Chat from './pages/chat';
import NavigationBar from './pages/NavigationBar';
import Messages from './pages/Messages';
import CharityRegistration from './pages/CharityRegistration';
import CharityProfile from './pages/CharityProfile';
import ReceiverDashboard from './pages/ReceiverDashboard';
import CollectionTracking from './pages/CollectionTracking';
import PublicProfile from './pages/PublicProfile';  
import ReviewSystem from './pages/ReviewSystem';   
import ScheduleCollection from './pages/ScheduleCollection';
import AdminDashboard from './pages/AdminDashboard';
import CharityList from './pages/CharityList';
import Notifications from './pages/Notifications';
import AdminMetrics from './components/AdminMetrics'; // Import AdminMetrics component
import AdminListings from './components/AdminListings'; // Import AdminListings component
import AdminUsers from './components/AdminUsers'; // Import AdminUsers component
import MetricsPage from './pages/MetricsPage';
import AdminHeader from './components/AdminHeader'; // Import AdminHeader component
import AdminReports from './components/AdminReports'; // Import AdminReports component
import ListingDetails from './pages/ListingDetails'; // Import ListingDetails component

// Context and Component Imports
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Notification from './components/Notification';

const App = () => {
  // Either remove the showNotification function or use it somewhere
  // if it's not being used

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <NavigationBar />
          
          <div className="notifications-container">
            {/* Either remove the showNotification function or use it somewhere
            if it's not being used */}
          </div>

          <div className="content-wrapper">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/test-login" element={<TestLogin />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/clothes" element={<Clothes />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/reset-password-request" element={<ResetPasswordRequest />} />
              <Route path="/charity-registration" element={<CharityRegistration />} />
              <Route path="/charities" element={<CharityList />} />
              <Route path="/metrics" element={<MetricsPage />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile/:userId" element={<UserProfile />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/book-form" element={<BookForm />} />
                <Route path="/chat/:userId" element={<Chat />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/charity-profile/:charityId" element={<CharityProfile />} />
                <Route path="/receiver-dashboard" element={<ReceiverDashboard />} />
                <Route path="/collection-tracking/:itemId" element={<CollectionTracking />} />
                <Route path="/public-profile/:userId" element={<PublicProfile />} />
                <Route path="/reviews/:itemId" element={<ReviewSystem />} />
                <Route path="/reviews/book/:bookId" element={<ReviewSystem />} />
                <Route path="/schedule-collection/:itemId" element={<ScheduleCollection />} />
                <Route path="/schedule-collection/book/:bookId" element={<ScheduleCollection />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/admin-metrics" element={<><AdminHeader /><AdminMetrics /></>} />
                <Route path="/admin-listings" element={<AdminListings />} />
                <Route path="/admin-users" element={<AdminUsers />} />
                <Route path="/admin-reports" element={<><AdminHeader /><AdminReports /></>} />
                <Route path="/listing-details/:listingId" element={<ListingDetails />} />
              </Route>

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;