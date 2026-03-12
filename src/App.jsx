import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./routes/auth/login";
import Dashboard from "./routes/Public/dashboard";
import ProjectDetail from "./routes/Public/projectDetail";
import AddProductDetail from "./routes/Public/addproductdetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/project/:id/add-product" element={<AddProductDetail />} />
        <Route path="/project/:id/product/:productId" element={<AddProductDetail />} />
      </Routes>
    </BrowserRouter>
  );
}