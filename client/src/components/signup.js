import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosCloseCircle, IoMdCheckmarkCircle } from "react-icons/io";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/signup.css";
import { Home } from "./home";
import axios from "axios";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

const kenikAPI = "https://app.kenikwifi.com";
// const kenikAPI = "http://localhost:8000";

export const Signup = () => {
  const userData = JSON.parse(localStorage.getItem("JSUD"));

  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [successfulSignup, setSuccessfulSignup] = useState(false);
  const [phoneValidation, setPhoneValidation] = useState(false);
  const [passwordLength, setPasswordLength] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [validPhone, setValidPhone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isValidPhone = (number) => /^(?:07\d{8}|01\d{8})$/.test(number);

  const validField = <IoMdCheckmarkCircle />;
  const invalidField = <IoIosCloseCircle />;

  const handleShowPassword = () =>
    setShowPassword((prevShowPassword) => !prevShowPassword);

  useEffect(() => {
    const handleFocus = () => setIsFocused(true);

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const checkPhone = useCallback(async () => {
    if (!isValidPhone(phone)) return;

    try {
      const Phone = `254${phone.substring(1)}`;

      const res = await axios.post(`${kenikAPI}/api/user/check-phone`, {
        phone: Phone,
      });

      setPhoneValidation(res.data ? false : true);
    } catch (error) {
      console.log(error.message);
    }
  }, [phone]);

  const Signup = async (e) => {
    e.preventDefault();

    const headers = {
      "Content-Type": "application/json",
    };

    const config = {
      headers: headers,
    };

    try {
      const res = await axios.post(
        `${kenikAPI}/api/user/signup`,
        {
          phone: `254${phone.substring(1)}`,
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
          `Welcome ${res.data.result.username}, Your account created successfully.`,
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
          setSuccessfulSignup(true);
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

  const isDisabled =
    !phone ||
    phone.length !== 10 ||
    !validPhone ||
    !password ||
    password.length < 4 ||
    phoneValidation === false ||
    !isFocused;

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
    setPasswordLength(password.length >= 4 ? true : false);
  }, [password]);

  useEffect(() => {
    setSuccessfulSignup(false);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (successfulSignup) {
    return <Home />;
  }
  return (
    <>
      {userData !== null ? (
        <Home />
      ) : (
        <div className="signupwrapper">
          <div className="header">
            <h2>Kenik Wi-Fi</h2>
          </div>
          <hr className="hr" />

          <form onSubmit={Signup} className="signup">
            <input
              type="tel"
              maxLength={10}
              name="phone"
              required
              autoComplete="new-phone"
              placeholder="Enter phone, e.g (07|01)12xxxxx78"
              onChange={(e) => setPhone(e.target.value.replace(/\s/g, ""))}
              value={phone}
              onFocus={() => {
                setIsFocused(true);
                checkPhone();
              }}
            />

            {validPhone && (
              <span className="checkstatus">
                {phoneValidation && phone.length === 10 ? (
                  <small className="available">
                    {validField} Phone available.
                  </small>
                ) : (
                  <small className="taken">{invalidField} Phone taken.</small>
                )}
              </span>
            )}

            <div className="passwordcontainer">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                minLength={4}
                placeholder="Enter password"
                onChange={(e) => setPassword(e.target.value.replace(/\s/g, ""))}
                value={password}
                required
                onFocus={() => {
                  setIsFocused(true);
                }}
              />
              <i onClick={handleShowPassword}>
                {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
              </i>
            </div>

            {password && (
              <span className="checkstatus" id="characters">
                {passwordLength === false ? (
                  <small className="taken">
                    {invalidField} Type at least 4 characters.
                  </small>
                ) : (
                  ""
                )}
              </span>
            )}

            <button disabled={isDisabled}>Signup</button>
            <div className="signupinfo">
              <div>
                Already have an account?
                <Link to="/login" className="link">
                  Login
                </Link>
              </div>
            </div>
          </form>
          <hr className="hr" id="footerhr" />

          <div className="footer">
            &copy; {new Date().getFullYear()}, Kenik Wi-Fi
          </div>
        </div>
      )}
    </>
  );
};
