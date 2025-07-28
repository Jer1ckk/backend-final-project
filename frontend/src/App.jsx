import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./components/Homepage";
import Collection from "./components/Collection";
import Login from "./components/Login";
import Register from "./components/Register";
import Footer from "./components/Footer";
import ProductDetail from "./components/ProductDetail";
import TestPaymentNew from "./components/TestPaymentNew";
import CategoryProducts from "./components/CategoryProducts";

import PaymentPage from "./components/PaymentPage";
import Women_T_shirt from "./components/Women_T_shirt";
import Women_shirt from "./components/Women_shirt";
import Women_jacket from "./components/Women_jacket";
import Women_shoes from "./components/Women_shoes";
import Women_skirt from "./components/Women_skirt";
import Women_shorts from "./components/Women_shorts";
import Women_jeans from "./components/Women_jeans";
import Women_trouser from "./components/Women_trouser";
import Women_dress from "./components/Women_dress";
import Men_T_shirt from "./components/Men_T_shirt";
import Men_jeans from "./components/Men_jeans";
import Men_jacket from "./components/Men_jacket";
import Men_trouser from "./components/Men_trouser";
import Men_shirt from "./components/Men_shirt";
import Men_shoes from "./components/Men_shoes";
import Girls_shoes from "./components/Girls_shoes";
import Girls_clothing from "./components/Girls_clothing";
import Boys_clothing from "./components/Boys_clothing";
import Boys_shoes from "./components/Boys_shoes";
import Accessories_glasses from "./components/Accessories_glasses";
import Accessories_watches from "./components/Accessories_watches";
import Accessories_gloves from "./components/Accessories_gloves";
import Accessories_belt from "./components/Accessories_belt";
import Accessories_hat from "./components/Accessories_hat";
import Accessories_bag from "./components/Accessories_bag";
import Accessories_wallet from "./components/Accessories_wallet";

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
        <Route path="/test-payment" element={<TestPaymentNew />} />

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
