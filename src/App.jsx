
import './App.css'
import { ProductList } from './pages/admin/productlist'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {ProductAdd} from "./pages/admin/productadd"
import { Register } from './pages/user/register.jsx';
import { Login } from './pages/user/login.jsx';
import Navbar from './pages/navbar.jsx';
import { CustomerDashboard } from './pages/customer/CustomerDashboard.jsx';
function App() {

  return (
    <>
    <BrowserRouter>
         <Navbar />

      <Routes>
        <Route path="/customer-dashboard" element={<ProductList />} />
        <Route path="/addproduct" element={<ProductAdd />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<CustomerDashboard />} />

      


      </Routes>
    </BrowserRouter>
     
    </>
  )
}

export default App
