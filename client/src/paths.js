import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Home } from "./components/home";
import { Notfound } from "./components/notfound";
import { Login } from "./components/login";
import { Signup } from "./components/signup";
import { Reseller } from "./components/reseller";

const Paths = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reseller" element={<Reseller />} />
        <Route path="*" element={<Notfound />} />
      </Routes>
    </Router>
  );
};

export default Paths;
