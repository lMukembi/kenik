import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Home } from "./home";
import "../css/login.css";
import axios from "axios";

const goldwinAPI = "https://demo.teslacarsonly.com";
// const goldwinAPI = "http://localhost:8000";

export const Login = () => {
  const userData = JSON.parse(localStorage.getItem("JSUD"));

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [successfulLogin, setSuccessfulLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const processLogin = async (e) => {
    e.preventDefault();

    const headers = {
      "Content-Type": "application/json",
    };

    const config = {
      headers: headers,
    };
    try {
      const res = await axios.post(
        `${goldwinAPI}/api/user/login`,
        {
          phone,
          password,
        },
        config
      );

      if (res.data) {
        localStorage.setItem(
          "JSUD",
          JSON.stringify({
            SESSID: res.data.result._id,
            UTKN: res.data.tokenID,
          })
        );

        toast.success(
          `Welcome back ${res.data.result.username}, logged in successfully.`,
          {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
          }
        );

        setTimeout(() => {
          setSuccessfulLogin(true);
          return navigate("/");
        }, 4000);
      }
    } catch (error) {
      return toast.error("Something went wrong.", {
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

  const handleShowPassword = () =>
    setShowPassword((prevShowPassword) => !prevShowPassword);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (successfulLogin) {
    return <Home />;
  }
  return (
    <>
      {userData !== null ? (
        <Home />
      ) : (
        <div className="loginwrapper">
          <div className="header">
            <h2>Kenik Wi-Fi</h2>
          </div>
          <hr className="hr" />
          <form onSubmit={processLogin} className="login">
            <input
              type="tel"
              name="phone"
              maxLength={10}
              required
              placeholder="Enter phone"
              onChange={(e) => setPhone(e.target.value)}
              value={phone}
            />

            <div className="passwordcontainer">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
              <i onClick={handleShowPassword}>
                {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
              </i>
            </div>

            <button>Login</button>

            <div className="logininfo">
              <div>
                Don't have an account?
                <Link to="/register" className="link">
                  Register
                </Link>
              </div>
            </div>
            <div className="logininfo">
              <div>
                <Link to="/reset-password" className="link">
                  Forgot password?
                </Link>
              </div>
            </div>
          </form>
          <hr className="hr" id="footerhr" />

          <div className="footer">
            &copy; {new Date().getFullYear()}, Kenik Solutions
          </div>
        </div>
      )}
    </>
  );
};
