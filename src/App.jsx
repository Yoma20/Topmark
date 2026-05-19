import React, { lazy, Suspense, useContext, useEffect } from 'react';
import './App.scss';
import { createBrowserRouter, RouterProvider, Outlet, useLocation, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import AuthContext from './AuthContext.jsx';
import { MessagingProvider } from './MessagingContext.jsx';
import Footer from './components/Footer/Footer.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import newRequest from './utils/newRequest.js';

const Add            = lazy(() => import('./pages/add/Add.jsx'));
const MessagingPage  = lazy(() => import('./pages/MessagingPage.jsx'));
const Orders         = lazy(() => import('./pages/orders/Orders.jsx'));
const Dashboard      = lazy(() => import('./pages/home/Dashboard.jsx'));
const MyGigs         = lazy(() => import('./pages/myGigs/MyGigs.jsx'));
const Gig            = lazy(() => import('./pages/gig/Gig.jsx'));
const Gigs           = lazy(() => import('./pages/gigs/Gigs.jsx'));
const StudentProfile = lazy(() => import('./pages/studentProfile/Studentprofile.jsx'));
const Home           = lazy(() => import('./pages/home/Home.jsx'));
const AdminEarnings  = lazy(() => import('./pages/Earning/Adminearnings.jsx'));
const SellerEarnings = lazy(() => import('./pages/Earning/Sellerearnings.jsx'));
const Pay            = lazy(() => import('./pages/pay/Pay.jsx'));
const Success        = lazy(() => import('./pages/success/Success.jsx'));
const Login          = lazy(() => import('./pages/login/Login.jsx'));
const Settings       = lazy(() => import('./pages/settings/Settings.jsx'));
const Register       = lazy(() => import('./pages/register/Register.jsx'));
const BecomeSeller   = lazy(() => import('./components/becomeSeller/BecomeSeller.jsx'));
const BecomeSeller2  = lazy(() => import('./components/becomeSeller2/BecomeSeller2.jsx'));
const ProfileEdit    = lazy(() => import('./pages/profile/ProfileEdit.jsx'));


const About          = lazy(() => import('./pages/about/About.jsx'));
const FAQ            = lazy(() => import('./pages/faq/FAQ.jsx'));
const PrivacyPolicy  = lazy(() => import('./pages/legal/PrivacyPolicy.jsx'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService.jsx'));
const RefundPolicy   = lazy(() => import('./pages/legal/RefundPolicy.jsx'));
const Disclaimer     = lazy(() => import('./pages/legal/Disclaimer.jsx'));
const Support        = lazy(() => import('./pages/support/Support.jsx'));

const queryClient = new QueryClient();

function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (user.user_type !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function Layout() {
  const { pathname } = useLocation();
  const isMessaging = pathname.startsWith("/messages");

  useEffect(() => {
    newRequest.get('/users/csrf/').catch(() => {
      console.warn('Could not fetch CSRF cookie — login may fail.');
    });
  }, []);

  return (
    <div className={`app ${isMessaging ? "app--fullscreen" : ""}`}>
      <Navbar />
      <div style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: isMessaging ? 'hidden' : 'auto',
      }}>
        <Suspense fallback={<div className="page-loading">Loading…</div>}>
          <Outlet />
        </Suspense>
      </div>
      {!isMessaging && <Footer />}
    </div>
  );
}

function HomeOrDashboard() {
  const { user } = useContext(AuthContext);
  return user ? <Dashboard /> : <Home />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/",                    element: <HomeOrDashboard /> },
      { path: "/gigs",                element: <Gigs /> },
      { path: "gig/:slug",            element: <Gig /> },
      { path: "/orders",              element: <Orders /> },
      { path: "/mygigs",              element: <MyGigs /> },
      { path: "/add",                 element: <Add /> },
      { path: "/messages",            element: <MessagingPage /> },
      { path: "/messages/:convId",    element: <MessagingPage /> },
      { path: "/login",               element: <Login /> },
      { path: "/settings",            element: <Settings /> },
      { path: "/register",            element: <Register /> },
      { path: "/sprofile",            element: <StudentProfile /> },
      { path: "/pay/:id",             element: <Pay /> },
      { path: "/pay/token/:token",    element: <Pay /> },
      { path: "/admin/earnings", element: <AdminRoute><AdminEarnings /></AdminRoute> },
      { path: "/earnings",       element: <SellerEarnings /> },
      { path: "/success",             element: <Success /> },
      { path: "/becomeSeller",        element: <BecomeSeller /> },
      { path: "/becomeSeller2",       element: <BecomeSeller2 /> },
      { path: "/profile",             element: <ProfileEdit /> },

      { path: "/about",               element: <About /> },
      { path: "/faq",                 element: <FAQ /> },
      { path: "/privacy-policy",      element: <PrivacyPolicy /> },
      { path: "/terms-of-service",    element: <TermsOfService /> },
      { path: "/refund-policy",       element: <RefundPolicy /> },
      { path: "/disclaimer",          element: <Disclaimer /> },
      { path: "/support",             element: <Support /> },
    ]
  }
]);

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MessagingProvider>
          <RouterProvider router={router} />
        </MessagingProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;