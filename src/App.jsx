
import React from 'react';
import './App.scss';
import Footer from './components/Footer/Footer.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import Add from './pages/add/Add.jsx';
import MessagingPage from './pages/MessagingPage.jsx';
import Orders from "./pages/orders/Orders.jsx";
import Dashboard from './pages/home/Dashboard.jsx';
import MyGigs from "./pages/myGigs/MyGigs.jsx";
import Gig from "./pages/gig/Gig.jsx";
import Gigs from "./pages/gigs/Gigs.jsx";
import Home from './pages/home/Home.jsx';
import Pay from './pages/pay/Pay.jsx';
import Success from './pages/success/Success.jsx';
import Login from './pages/login/Login.jsx';
import Settings from './pages/settings/Settings.jsx';
import Register from './pages/register/Register.jsx';
import BecomeSeller from './components/becomeSeller/BecomeSeller.jsx';
import BecomeSeller2 from './components/becomeSeller2/BecomeSeller2.jsx';
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { useContext } from 'react';
import AuthContext from './AuthContext.jsx';

const queryClient = new QueryClient();

// Layout reads user from context *inside* the router tree so it re-renders
// whenever AuthContext changes — this is what was missing before.
function Layout() {
  const { user } = useContext(AuthContext);

  return (
    <QueryClientProvider client={queryClient}>
      <div className='app'>
        <Navbar />
        <Outlet context={{ user }} />
        <hr />
        <Footer />
      </div>
    </QueryClientProvider>
  );
}

// HomeOrDashboard also reads from context so the "/" route switches
// immediately after login without needing a page refresh.
function HomeOrDashboard() {
  const { user } = useContext(AuthContext);
  return user ? <Dashboard /> : <Home />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/",          element: <HomeOrDashboard /> },
      { path: "/gigs",      element: <Gigs /> },
      { path: "gig/:id",    element: <Gig /> },
      { path: "/orders",    element: <Orders /> },
      { path: "/mygigs",    element: <MyGigs /> },
      { path: "/add",       element: <Add /> },
      { path: "/messages",  element: <MessagingPage /> },
      { path: "/login",     element: <Login /> },
      { path: "/settings", element: <Settings /> },
      { path: "/register",  element: <Register /> },
      { path: "/pay/:id",   element: <Pay /> },
      { path: "/success",   element: <Success /> },
      { path: "/becomeSeller",  element: <BecomeSeller /> },
      { path: "/becomeSeller2", element: <BecomeSeller2 /> },
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