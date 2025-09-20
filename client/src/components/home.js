import React, { useEffect, useState } from "react";
import { IoCallOutline, IoLogoWhatsapp, IoMailOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/home.css";
import axios from "axios";

const kenikAPI = "https://app.kenikwifi.com";
// const kenikAPI = "http://localhost:8000";

export const Home = () => {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [validPhone, setValidPhone] = useState(false);
  const [mac, setMac] = useState("");

  const isValidPhone = (number) => /^(?:07\d{8}|01\d{8})$/.test(number);

  const pricePerDay = 67;
  const hoursPerDay = 24;

  const currentDateTime = new Date().toLocaleString();

  const time = (amount / pricePerDay) * hoursPerDay;

  const now = new Date();
  now.setHours(now.getHours() + time);

  const expireTime = now.toLocaleString();

  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userMac = params.get("mac");
    if (userMac) {
      setMac(userMac);
    }
  }, []);

  useEffect(() => {
    calculateDuration(amount);
  }, [amount]);

  const calculateDuration = (value) => {
    if (!value || isNaN(value) || value <= 0) {
      setDuration("");
      return;
    }

    const totalHours = (value / pricePerDay) * hoursPerDay;
    let days = Math.floor(totalHours / hoursPerDay);
    let hours = Math.round(totalHours % hoursPerDay);

    if (hours === 24) {
      hours = 0;
      days += 1;
    }

    if (days === 0 && hours === 0) {
      hours = 1;
    }

    setDuration(`${days} Days ${hours} Hours`);
  };

  // useEffect(() => {
  //   axios
  //     .get("https://api64.ipify.org?format=json")
  //     .then(({ data }) => {
  //       setUserIP(data.ip);

  //       return axios.post(`${kenikAPI}/api/user/package`, { ip: data.ip });
  //     })
  //     .then(({ data }) => {
  //       if (data) {
  //         return navigate("/");
  //       }
  //     })
  //     .catch((error) => {
  //       console.error(error.message);
  //     });
  // }, [navigate]);

  const generateTransactionCode = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const alphanumeric = letters + numbers;

    const getRandomChar = (charset) =>
      charset[Math.floor(Math.random() * charset.length)];

    const code =
      getRandomChar(letters) +
      getRandomChar(letters) +
      [...Array(6)].map(() => getRandomChar(alphanumeric)).join("");

    return code;
  };

  const handlePackage = async (e) => {
    e.preventDefault();

    if (!amount || amount < 1) {
      toast.warn("Please enter at least 1 KES.", {
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
      return;
    }

    const totalHours = (amount / pricePerDay) * hoursPerDay;

    const transactionCode = generateTransactionCode();

    toast.success("Message sent, Wait for M-Pesa to reply.", {
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

    setLoading(true);
    console.log("stkpush!");

    try {
      const res = await axios.post(`${kenikAPI}/api/payment/deposit`, {
        amount,
        phone,
        // username: `KW${Date.now()}`,
        // hours: parseInt(totalHours),
        // mac,
      });

      setAmount("");
      setPhone("");

      console.log("stksent!");

      if (res.data.data.Status === true) {
        toast.success(
          `Congratulations! You have successfully subscribed to ${duration} access valid until ${expireTime} worth KES ${amount}.00 on ${currentDateTime}.
          Transaction Ref ID: ${transactionCode}. Thank you.`,
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
          return navigate("/");
        }, 4000);
      } else {
        return toast.error("Payment failed!", {
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
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   const getUserData = async () => {
  //     try {
  //       const userInfoData = JSON.parse(localStorage.getItem("JSUD"));
  //       if (!userInfoData) {
  //         return redirect("/login");
  //       }
  //       const userID = userInfoData.SESSID;

  //       const res = await axios.get(
  //         `${kenikAPI}/api/user/${userID}/user-data`
  //       );
  //       if (res) {
  //         setUserInfo(res.data);
  //       }
  //     } catch (err) {
  //       console.log(err.message);
  //     }
  //   };

  //   getUserData();
  // }, []);

  useEffect(() => {
    setValidPhone(isValidPhone(phone));
  }, [phone]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="home_wrapper">
      <div className="header">
        {/* <img src={""} alt="Kenik Wi-Fi" /> */}
        <h2>Kenik Wi-Fi</h2>
      </div>
      <hr className="hr" id="headerhr" />
      <form
        className="home"
        onSubmit={(e) => {
          handlePackage(e);
          calculateDuration(e.target.value);
        }}
      >
        <h3>Make Your Hook</h3>

        <input
          type="number"
          name="amount"
          required
          placeholder="Enter at least 1 KES"
          autoComplete="off"
          onChange={(e) => setAmount(e.target.value)}
        />

        <div className="duration">
          {amount >= 1 && duration && (
            <>
              <small>
                Valid:<span> {duration}</span>
              </small>
              <small>
                Expires:<span> {expireTime}</span>
              </small>
            </>
          )}
        </div>

        {amount && amount >= 1 && (
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
            }}
          />
        )}

        <button
          disabled={
            loading ||
            amount < 1 ||
            !isFocused ||
            !phone ||
            phone.length !== 10 ||
            !validPhone
          }
        >
          {loading ? "Processing..." : "Subscribe"}
        </button>
      </form>

      <div className="contacts">
        <a
          href="https://wa.me/254725540469"
          target="_blank"
          rel="noopener noreferrer"
        >
          <IoLogoWhatsapp />
        </a>

        <a href="tel:+254725540469">
          <IoCallOutline />
        </a>
        <a href="mailto:kenikwifi@gmail.com">
          <IoMailOutline />
        </a>
      </div>

      <hr className="hr" id="footerhr" />

      <div className="footer">
        &copy; {new Date().getFullYear()}, Kenik Wi-Fi
      </div>
    </div>
  );
};
