import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Logo from "../assets/images/Logo.png";
import "../css/resetPassword.css";
import axios from "axios";

const kenikAPI = "https://api.kenikwifi.com";
// const kenikAPI = "http://localhost:8000";

export const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { token } = useParams();

  const navigate = useNavigate();

  const handleShowPassword = () =>
    setShowPassword((prevShowPassword) => !prevShowPassword);

  const resetPassword = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.put(
        `${kenikAPI}/api/user/reset-password/${token}`,
        {
          password,
        }
      );

      if (res.data) {
        toast.success("Password saved successfully.", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });

        setTimeout(() => {
          return navigate("/login");
        }, 4000);
      }
    } catch (error) {
      toast.error("Something went wrong!", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
  };

  return (
    <div className="resetpassword">
      <div className="header">
        <img src={Logo} alt="" />
        <h2>Kenik Wi-Fi</h2>
      </div>
      <hr />
      <form onSubmit={resetPassword}>
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          autoComplete="off"
          required
          placeholder="Enter new password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <i onClick={handleShowPassword}>
          {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
        </i>

        <button>Reset</button>
      </form>
    </div>
  );
};
