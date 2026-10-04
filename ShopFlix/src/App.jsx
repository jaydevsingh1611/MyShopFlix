import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Navbar from "./component/Navbar";
import Login from "./component/Login";
import Signup from "./component/Signup";
import Home from "./component/Home";
import Shop from "./component/Shop";
import Movie from "./component/Movie";
import ProtectedRoute from "./component/ProtectedRoute";
import ToggleCircle from "./component/ToggleCircle";
import Profile from "./component/Profile";
import WatchLater from "./component/WatchLater";
import Electronics from "./component/Electronic";
import BeautyAndGrooming from "./component/BeautyAndGrooming";
import WomensCloth from "./component/WomensCloth";
import SearchResults from "./component/SearchResults"; // <-- Import your SearchResults component
import KitchenStorage from "./component/KitchenStorage";
import Contact from "./Footer/Contact";
import AboutUs from "./Footer/AboutUs";
import FAQ from "./Footer/FAQ";
import Blog from "./Footer/Blog";
import PrivacyPolicy from "./Footer/PrivacyPolicy";
import AdminDashboard from "./Admin/AdminDashboard";
import ManageMovies from "./Admin/ManageMovies";
import ManageOrders from "./Admin/ManageOrders";
import ManageProducts from "./Admin/ManageProducts";
import ManageUsers from "./Admin/ManageUsers";
import UsersOrder from "./component/UsersOrder";
import TermsOfService from "./component/TermsOfService";

// order
import CartReview from './OrderSection/CartReview';
import Delivery   from './OrderSection/Delivery';
import Payment    from './OrderSection/Payment';
import ReviewOrder from "./OrderSection/ReviewOrder";
import ThankYou from "./OrderSection/ThankYou";



const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/about",
    element: <AboutUs/>,
  },
    {
    path: "/terms",
    element: <TermsOfService/>,
  },
  {
    path: "/faq",
    element: (
      <>
        <FAQ/>
      </>
    )
  },
  {
    path: "/blog",
    element: (
      <>
        <Blog/>
      </>
    )
  },
  {
    path: "/contact",
    element: (
      <>
        <Contact/>
      </>
    )
  },
  {
    path: "/privacy",
    element: (
      <>
        <PrivacyPolicy/>
      </>
    )
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/shop",
    element: (
      <>
        <Navbar />
        <Shop />
        <ToggleCircle />
      </>
    ),
  },
  {
    path: "/search",
    element: (
      <>
        <Navbar />
        <SearchResults />  {/* This component should display your search results */}
        <ToggleCircle />
      </>
    ),
  },
  {
    path: "/category/electronics",
    element: (
      <ProtectedRoute>
        <>
          <Navbar />
          <ToggleCircle />
          <Electronics />
        </>
      </ProtectedRoute>
    ),
  },
  {
    path: "/category/kitchenstorage",
    element: (
      <ProtectedRoute>
        <>
          <Navbar />
          <ToggleCircle />
          <KitchenStorage />
        </>
      </ProtectedRoute>
    ),
  },
  {
    path: "/category/beautyandgroomings",
    element: (
      <ProtectedRoute>
        <>
          <Navbar />
          <ToggleCircle />
          <BeautyAndGrooming />
        </>
      </ProtectedRoute>
    ),
  },
  {
    path: "/category/fashion",
    element: (
      <ProtectedRoute>
        <>
          <Navbar />
          <ToggleCircle />
          <WomensCloth />
        </>
      </ProtectedRoute>
    ),
  },
  {
    path: "/movies",
    element: (
      <>
        <Navbar />
        <Movie />
        <ToggleCircle />
      </>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <>
          <Navbar />
          <Profile />
          <ToggleCircle />
        </>
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile/orders",
    element: (
      <ProtectedRoute>
        <>
          <Navbar/>
          <UsersOrder />
        </>
      </ProtectedRoute>
    ),
  },
  {
    path: "/watchlist",
    element: (
      <ProtectedRoute>
        <>
          <Navbar />
          <WatchLater />
          <ToggleCircle />
        </>
      </ProtectedRoute>
    ),
  },   

  {
    path:"/admin",
    element:(
      <ProtectedRoute>
        <>
              <AdminDashboard/>
        </>
      </ProtectedRoute>
    ),
  },
    {
    path:"/admin/managemovies",
    element:(
      <ProtectedRoute>
        <>
              <ManageMovies/>
        </>
      </ProtectedRoute>
    ),
  },
    {
    path:"/admin/manageorders",
    element:(
      <ProtectedRoute>
        <>
              <ManageOrders/>
        </>
      </ProtectedRoute>
    ),
  },
     {
    path:"/admin/manageproducts",
    element:(
      <ProtectedRoute>
        <>
              <ManageProducts/>
        </>
      </ProtectedRoute>
    ),
  },
      {
    path:"/admin/manageusers",
    element:(
      <ProtectedRoute>
        <>
              <ManageUsers/>
        </>
      </ProtectedRoute>
    ),
  },

 // ShopFlix order flow (protected & wrapped inside Navbar + ToggleCircle)
  {
    path: "/shop/:userId/cart",
    element: (
      <ProtectedRoute>
        <Navbar/>
        <CartReview/>
        <ToggleCircle/>
      </ProtectedRoute>
    )
  },
  {
    path: "/shop/:userId/cart/address",
    element: (
      <ProtectedRoute>
        <Navbar/>
        <Delivery/>
        <ToggleCircle/>
      </ProtectedRoute>
    )
  },
  {
    path: "/shop/:userId/cart/address/review",
    element: (
      <ProtectedRoute>
        <Navbar/>
        <ReviewOrder/>
        <ToggleCircle/>
      </ProtectedRoute>
    )
  },
  {
    path: "/shop/:userId/cart/address/review/payment/:addressId",
    element: (
      <ProtectedRoute>
        <Navbar/>
        <Payment/>
        <ToggleCircle/>
      </ProtectedRoute>
    )
  },

   {
    path: "/shop/:userId/thankyou",
    element: (
      <ProtectedRoute>
        <ThankYou/>
      </ProtectedRoute>
    )
  },
  
]);

function App() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
