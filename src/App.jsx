import React, { lazy, Suspense, useContext } from 'react';
import './App.scss';
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import AuthContext from './AuthContext.jsx';

// These two are always needed immediately — keep them eager
import Footer from './components/Footer/Footer.jsx';
import Navbar from './components/Navbar/Navbar.jsx';

// Everything else — lazy loaded
const Add           = lazy(() => import('./pages/add/Add.jsx'));
const MessagingPage = lazy(() => import('./pages/MessagingPage.jsx'));
const Orders        = lazy(() => import('./pages/orders/Orders.jsx'));
const Dashboard     = lazy(() => import('./pages/home/Dashboard.jsx'));
const MyGigs        = lazy(() => import('./pages/myGigs/MyGigs.jsx'));
const Gig           = lazy(() => import('./pages/gig/Gig.jsx'));
const Gigs          = lazy(() => import('./pages/gigs/Gigs.jsx'));
const Home          = lazy(() => import('./pages/home/Home.jsx'));
const Pay           = lazy(() => import('./pages/pay/Pay.jsx'));
const Success       = lazy(() => import('./pages/success/Success.jsx'));
const Login         = lazy(() => import('./pages/login/Login.jsx'));
const Settings      = lazy(() => import('./pages/settings/Settings.jsx'));
const Register      = lazy(() => import('./pages/register/Register.jsx'));
const BecomeSeller  = lazy(() => import('./components/becomeSeller/BecomeSeller.jsx'));
const BecomeSeller2 = lazy(() => import('./components/becomeSeller2/BecomeSeller2.jsx'));
const ProfileEdit   = lazy(() => import('./pages/profile/ProfileEdit.jsx')); // ✅ correct name

const queryClient = new QueryClient();

function Layout() {
  const { user } = useContext(AuthContext);

  return (
    <QueryClientProvider client={queryClient}>
      <div className='app'>
        <Navbar />
        <Suspense fallback={<div className="page-loading">Loading…</div>}>
          <Outlet context={{ user }} />
        </Suspense>
        <hr />
        <Footer />
      </div>
    </QueryClientProvider>
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
      { path: "/",              element: <HomeOrDashboard /> },
      { path: "/gigs",          element: <Gigs /> },
      { path: "gig/:id",        element: <Gig /> },
      { path: "/orders",        element: <Orders /> },
      { path: "/mygigs",        element: <MyGigs /> },
      { path: "/add",           element: <Add /> },
      { path: "/messages",      element: <MessagingPage /> },
      { path: "/login",         element: <Login /> },
      { path: "/settings",      element: <Settings /> },
      { path: "/register",      element: <Register /> },
      { path: "/pay/:id",       element: <Pay /> },
      { path: "/success",       element: <Success /> },
      { path: "/becomeSeller",  element: <BecomeSeller /> },
      { path: "/becomeSeller2", element: <BecomeSeller2 /> },
      { path: "/profile",       element: <ProfileEdit /> }, // ✅ was <Profile /> — undefined
    ]
  }
]);

function App() {
  return (
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  );
}

export default App;