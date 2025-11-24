import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import ItemList from "./pages/Items/ItemList";
import SignupForm from "./pages/SignupForm";
import InvocieList from "./pages/Invoices/InvocieList";

export default function App() {

  const hasToken = localStorage.getItem("token")
  if (hasToken) {
    return (

      <Layout>
        <Routes>
          <Route path="/Home" element={<Home />} />
          <Route path="/Items" element={<ItemList />} />
          <Route path="/Invoices" element={<InvocieList />} />
        </Routes>
      </Layout>
    )
  }
  else {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

}
