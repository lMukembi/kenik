import React, { useCallback, useEffect, useState } from "react";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Logo from "../assets/images/Logo.png";
import "../styles/forgotPassword.css";
import axios from "axios";
import { IoIosCloseCircle, IoMdCheckmarkCircle } from "react-icons/io";

const goldwinAPI = "https://app.kenikwifi.com";
// const goldwinAPI = "http://localhost:8000";

const isValidPhone = (number) => /^(?:07\d{8}|01\d{8})$/.test(number);

export const ForgotPassword = () => {
  const [phone, setPhone] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [accountCheck, setAccountCheck] = useState(false);
  const [validPhone, setValidPhone] = useState(false);

  const validField = <IoMdCheckmarkCircle />;
  const invalidField = <IoIosCloseCircle />;

  const checkPhone = useCallback(async () => {
    if (!isValidPhone(phone)) return;

    try {
      const Phone = `254${phone.substring(1)}`;

      const res = await axios.post(`${goldwinAPI}/api/user/check-phone`, {
        phone: Phone,
      });

      setAccountCheck(res.data ? true : false);
    } catch (error) {
      console.log(error.message);
    }
  }, [phone]);

  useEffect(() => {
    setValidPhone(isValidPhone(phone));

    const delayDebounce = setTimeout(() => {
      if (isValidPhone(phone)) {
        checkPhone();
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [phone, checkPhone]);

  useEffect(() => {
    const handleFocus = () => setIsFocused(true);

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const forgotPassword = async (e) => {
    e.preventDefault();

    try {
      return await axios.post(`${goldwinAPI}/api/user/reset-password`, {
        phone,
      });
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

  return (
    <div className="forgotpassword">
      <div className="header">
        <img src={Logo} alt="" />
        <h2>Goldwin Adverts</h2>
      </div>
      <hr />
      <form onSubmit={(e) => forgotPassword(e)}>
        <input
          type="text"
          name="phone"
          required
          placeholder="Enter phone"
          onChange={(e) => setPhone(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            checkPhone();
          }}
        />

        {validPhone && (
          <span className="checkstatus">
            {phone === true ? (
              <small className="found">{validField} Account available.</small>
            ) : (
              <small className="notfound">
                {invalidField} Account not found.
              </small>
            )}
          </span>
        )}

        <button
          disabled={
            !phone ||
            accountCheck === false ||
            isFocused === false ||
            validPhone === false
              ? true
              : false
          }
        >
          Send
        </button>
      </form>
    </div>
  );
};
