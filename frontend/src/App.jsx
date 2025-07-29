import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./components/Homepage";
import Collection from "./components/Collection";
import Login from "./components/Login";
import Register from "./components/Register";
import Footer from "./components/Footer";
import ProductDetail from "./components/ProductDetail";

import CategoryProducts from "./components/CategoryProducts";

import PaymentPage from "./components/PaymentPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <HomePage />
              <Collection /> <Footer />{" "}
            </>
          }
        />
        <Route path="/product/:id" element={<ProductDetail />} />

        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/:id" element={<PaymentPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Legacy routes for backward compatibility */}
        <Route path="/t-shirt" element={<CategoryProducts />} />
        <Route path="/shirt" element={<CategoryProducts />} />
        <Route path="/jacket" element={<CategoryProducts />} />
        <Route path="/shoes" element={<CategoryProducts />} />
        <Route path="/skirt" element={<CategoryProducts />} />
        <Route path="/shorts" element={<CategoryProducts />} />
        <Route path="/jeans" element={<CategoryProducts />} />
        <Route path="/trouser" element={<CategoryProducts />} />
        <Route path="/dress" element={<CategoryProducts />} />

        {/* Catch-all route for any category/subcategory combination */}
        <Route path="/:category/:subcategory" element={<CategoryProducts />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
