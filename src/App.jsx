import React from 'react';
import './App.scss';
import Footer from './components/Footer/Footer.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import Add from './pages/add/Add.jsx';
import Message from './pages/message/Message.jsx';
import Messages from './pages/messages/Messages.jsx';
import Orders from "./pages/orders/Orders.jsx";
import MyGigs from "./pages/myGigs/MyGigs.jsx";
import Gig from "./pages/gig/Gig.jsx";
import Gigs from "./pages/gigs/Gigs.jsx";
import Home from './pages/home/Home.jsx';
import Pay from './pages/pay/Pay.jsx';
import Success from './pages/success/Success.jsx';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import Login from './pages/login/Login.jsx';
import Register from './pages/register/Register.jsx';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import BecomeSeller from './components/becomeSeller/BecomeSeller.jsx';
import BecomeSeller2 from './components/becomeSeller2/BecomeSeller2.jsx';

function App() {
  const queryClient = new QueryClient();
  const Layout = () => {
    return (
      <QueryClientProvider client={queryClient} key={55}>
        <div className='app'>
          <Navbar key={3} />
          <Outlet key={5454} />
          <hr></hr>
          <Footer key={6563}/>
        </div>
      </QueryClientProvider>
    )
  }
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout></Layout>,
      children: [
        {
          path: "/",
          element: <Home />
        },
        {
          path: "/gigs",
          element: <Gigs></Gigs>
        },
        {
          path: "gig/:id",
          element: <Gig />
        },
        {
          path: "/orders",
          element: <Orders />
        },
        {
          path: "/mygigs",
          element: <MyGigs />
        },
        {
          path: "/add",
          element: <Add />
        },
        {
          path: "/messages",
          element: <Messages />
        },
        {
          path: "/message/:id",
          element: <Message />
        },
        {
          path: "/login",
          element: <Login />
        },
        {
          path: "/register",
          element: <Register />
        },
        {
          path: "/pay/:id",
          element: <Pay />
        },
        {
          path: "/success",
          element: <Success />
        },
        {
          path: "/becomeSeller",
          element: <BecomeSeller />
        },
        {
          path: "/becomeSeller2",
          element: <BecomeSeller2 />
        },
      ]
    }
  ]);
  return (
    [
      <RouterProvider key={1} router={router} />
    ]
  );
}

export default App;
