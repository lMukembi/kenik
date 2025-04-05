import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosCloseCircle, IoMdCheckmarkCircle } from "react-icons/io";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/reseller.css";
import { Home } from "./home";
import axios from "axios";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

const goldwinAPI = "https://app.kenikwifi.com";
// const goldwinAPI = "http://localhost:8000";

export const Reseller = () => {
  const userData = JSON.parse(localStorage.getItem("JSUD"));

  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [ip, setIP] = useState("");
  const [username, setUsername] = useState("");
  const [hostname, setHostname] = useState("");
  const [brand, setBrand] = useState("");
  const [password, setPassword] = useState("");
  const [successfulSignup, setSuccessfulSignup] = useState(false);
  const [phoneValidation, setPhoneValidation] = useState(false);
  const [ipValidation, setIPValidation] = useState(false);
  const [usernameValidation, setUsernameValidation] = useState(false);
  const [hostnameValidation, setHostnameValidation] = useState(false);
  const [passwordLength, setPasswordLength] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [validPhone, setValidPhone] = useState(false);
  const [validIP, setValidIP] = useState(false);
  const [validUsername, setValidUsername] = useState(false);
  const [validHostname, setValidHostname] = useState(false);
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

      const res = await axios.post(`${goldwinAPI}/api/reseller/check-phone`, {
        phone: Phone,
      });

      setPhoneValidation(res.data ? false : true);
    } catch (error) {
      console.log(error.message);
    }
  }, [phone]);

  const checkIP = useCallback(async () => {
    if (!ip) return;

    try {
      const res = await axios.post(`${goldwinAPI}/api/reseller/check-ip`, {
        ip,
      });

      setIPValidation(res.data ? false : true);
    } catch (error) {
      console.log(error.message);
    }
  }, [ip]);

  const checkUsername = useCallback(async () => {
    if (!username) return;

    try {
      const res = await axios.post(`${goldwinAPI}/api/reseller/check-username`, {
        username,
      });

      setUsernameValidation(res.data ? false : true);
    } catch (error) {
      console.error(error.message);
    }
  }, [username]);

  const checkHostname = useCallback(async () => {
    if (!hostname) return;

    try {
      const res = await axios.post(`${goldwinAPI}/api/reseller/check-hostname`, {
        hostname,
      });

      setHostnameValidation(res.data ? false : true);
    } catch (error) {
      console.error(error.message);
    }
  }, [hostname]);

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
        `${goldwinAPI}/api/reseller/signup`,
        {
          username,
          hostname,
          phone: `254${phone.substring(1)}`,
          brand,
          password,
          ip,
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
          `Welcome ${res.data.result.username}, Account created successfully.`,
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
    !username ||
    !validUsername ||
    !hostname ||
    !validHostname ||
    !password ||
    !ip ||
    !validIP ||
    password.length < 4 ||
    phoneValidation === false ||
    usernameValidation === false ||
    hostnameValidation === false ||
    ipValidation === false ||
    !isFocused;

    useEffect(() => {
      setValidUsername(username);
  
      const delayDebounce = setTimeout(() => {
        if ((username)) {
          checkUsername();
        }
      }, 500);
  
      return () => clearTimeout(delayDebounce);
    }, [username, checkUsername]);

    useEffect(() => {
      setValidHostname(hostname);
  
      const delayDebounce = setTimeout(() => {
        if ((hostname)) {
          checkHostname();
        }
      }, 500);
  
      return () => clearTimeout(delayDebounce);
    }, [hostname, checkHostname]);

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
    setValidIP(ip);

    const delayDebounce = setTimeout(() => {
      if (ip) {
        checkIP();
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [ip, checkIP]);

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
        <div className="resellerwrapper">
          <div className="header">
            <h2>Kenik Wi-Fi</h2>
          </div>
          <hr className="hr" />

          <form onSubmit={Signup} className="reseller">

          <input
              type="text"
              name="username"
              required
              autoComplete="new-username"
              placeholder="Enter username"
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
              value={username}
              onFocus={() => {
                setIsFocused(true);
                checkUsername();
              }}
            />

            {validUsername && (
              <span className="checkstatus">
                {usernameValidation ? (
                  <small className="available">
                    {validField} Username available.
                  </small>
                ) : (
                  <small className="taken">{invalidField} Username taken.</small>
                )}
              </span>
            )}

            
            <input
              type="tel"
              maxLength={10}
              name="phone"
              required
              autoComplete="new-phone"
              placeholder="Enter M-Pesa number, e.g (07|01)12xxxxx21"
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

            {/* <select value={brand} onChange={(e) => setBrand(e.target.value)} >
              <option value="Tenda">Tenda</option>
              <option value="TP-Link">TP-Link</option>
            </select> */}

            <input
              type="text"
              name="brand"
              required
              autoComplete="new-brand"
              placeholder="Enter router name"
              onChange={(e) => setBrand(e.target.value.replace(/\s/g, ""))}
              value={brand}
              onFocus={() => {
                setIsFocused(true);
              }}
            />

            <input
              type="text"
              name="ip"
              required
              autoComplete="new-ip"
              placeholder="Enter router IP address"
              onChange={(e) => setIP(e.target.value.replace(/\s/g, ""))}
              value={ip}
              onFocus={() => {
                setIsFocused(true);
                checkIP();
              }}
            />

            {validIP && (
              <span className="checkstatus">
                {ipValidation ? (
                  <small className="available">
                    {validField} IP available.
                  </small>
                ) : (
                  <small className="taken">{invalidField} IP taken.</small>
                )}
              </span>
            )}

            <input
              type="text"
              name="hostname"
              required
              autoComplete="new-hostname"
              placeholder="Enter hostname"
              onChange={(e) => setHostname(e.target.value.replace(/\s/g, ""))}
              value={hostname}
              onFocus={() => {
                setIsFocused(true);
                checkHostname();
              }}
            />

            {validHostname && (
              <span className="checkstatus">
                {hostnameValidation ? (
                  <small className="available">
                    {validField} Hostname available.
                  </small>
                ) : (
                  <small className="taken">{invalidField} Hostname taken.</small>
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
              <span className="checkstatus">
                {!passwordLength ? (
                  <small className="taken">
                    {invalidField} Type at least 4 characters.
                  </small>
                ) : (
                  ""
                )}
              </span>
            )}

            <button disabled={isDisabled}>Save</button>
            <div className="resellerinfo">
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
