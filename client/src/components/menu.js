import React, { useEffect, useState } from "react";
import "../css/menu.css";
import { Link, redirect, useNavigate } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { PiHandDeposit } from "react-icons/pi";

import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const kenikAPI = "https://api.kenik.com";

export const Menu = () => {
  const [userInfo, setUserInfo] = useState({});

  const navigate = useNavigate();

  function logoutUser() {
    localStorage.clear();

    toast.success("You logged out successfully.", {
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

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userInfoData = JSON.parse(localStorage.getItem("JSUD"));
        if (!userInfoData) {
          return redirect("/login");
        }
        const userID = userInfoData.SESSID;

        const res = await axios.get(`${kenikAPI}/api/user/${userID}/user-data`);
        if (res) {
          setUserInfo(res.data);
        }
      } catch (err) {
        console.log(err.message);
      }
    };

    getUserData();
  }, []);

  return (
    <>
      <div className="menu">
        <div className="menuitems">
          <Link to="/">
            <div className="menuitem">
              <RxDashboard className="menuicon" /> Home
            </div>
          </Link>

          <Link to="/settings">
            <div className="menuitem">
              <PiHandDeposit className="menuicon" /> Recharge
            </div>
          </Link>
        </div>

        <button onClick={() => logoutUser()}>Logout</button>
      </div>
    </>
  );
};
