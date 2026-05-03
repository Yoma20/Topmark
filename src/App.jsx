import React, { useState } from 'react';
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
import Register from './pages/register/Register.jsx';
import BecomeSeller from './components/becomeSeller/BecomeSeller.jsx';
import BecomeSeller2 from './components/becomeSeller2/BecomeSeller2.jsx';
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';


const queryClient = new QueryClient();

function App() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  const Layout = () => {
    return (
      <QueryClientProvider client={queryClient} key={55}>
        <div className='app'>
          <Navbar key={3} />
          <Outlet key={5454} />
          <hr></hr>
          <Footer key={6563} />
        </div>
      </QueryClientProvider>
    );
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { path: "/", element: currentUser ? <Dashboard /> : <Home /> },
        { path: "/gigs", element: <Gigs /> },
        { path: "gig/:id", element: <Gig /> },
        { path: "/orders", element: <Orders /> },
        { path: "/mygigs", element: <MyGigs /> },
        { path: "/add", element: <Add /> },
        { path: "/messages", element: <MessagingPage currentUser={currentUser} /> },
        { path: "/login", element: <Login /> },
        { path: "/register", element: <Register /> },
        { path: "/pay/:id", element: <Pay /> },
        { path: "/success", element: <Success /> },
        { path: "/becomeSeller", element: <BecomeSeller /> },
        { path: "/becomeSeller2", element: <BecomeSeller2 /> },
      ]
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App;