import React, { useCallback, useEffect, useState } from "react";
import { IoCallOutline, IoLogoWhatsapp, IoMailOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/home.css";
import axios from "axios";

const goldwinAPI = "https://app.kenikwifi.com";

export const Home = () => {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [userIP, setUserIP] = useState("");
  const [phoneValidation, setPhoneValidation] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [validPhone, setValidPhone] = useState(false);
  const [activePackage, setActivePackage] = useState(null);

  const isValidPhone = (number) => /^(?:07\d{8}|01\d{8})$/.test(number);
  const navigate = useNavigate();

  // Get pricing preview when amount changes
  useEffect(() => {
    const getPreview = async () => {
      if (amount && parseInt(amount) >= 5) {
        try {
          const response = await axios.post(
            `${goldwinAPI}/api/payment/preview`,
            {
              amount: parseInt(amount),
            }
          );

          if (response.data.success) {
            setPreview(response.data.preview);
          }
        } catch (error) {
          console.error("Preview error:", error);
          setPreview(null);
        }
      } else {
        setPreview(null);
      }
    };

    const delayDebounce = setTimeout(getPreview, 300);
    return () => clearTimeout(delayDebounce);
  }, [amount]);

  // Check for existing package and get user IP
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Get user IP
        const ipResponse = await axios.get(
          "https://api64.ipify.org?format=json"
        );
        setUserIP(ipResponse.data.ip);

        // Check for active package
        const packageResponse = await axios.post(
          `${goldwinAPI}/api/payment/check-package`,
          {
            ip: ipResponse.data.ip,
          }
        );

        if (packageResponse.data.hasActivePackage) {
          setActivePackage(packageResponse.data.package);
          toast.info(
            `You have an active ${
              packageResponse.data.package.tier
            } package until ${new Date(
              packageResponse.data.package.expiresAt
            ).toLocaleString()}`,
            {
              position: "top-right",
              autoClose: 6000,
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
              transition: Bounce,
            }
          );
        }
      } catch (error) {
        console.error("Initialization error:", error.message);
      }
    };

    initializeUser();
  }, []);

  const checkPhone = useCallback(async () => {
    if (!isValidPhone(phone)) return;

    try {
      const Phone = `254${phone.substring(1)}`;
      const res = await axios.post(`${goldwinAPI}/api/user/check-phone`, {
        phone: Phone,
      });
      setPhoneValidation(res.data ? false : true);
    } catch (error) {
      console.log(error.message);
    }
  }, [phone]);

  const handlePackage = async (e) => {
    e.preventDefault();

    if (!amount || amount < 5) {
      toast.warn("Please enter at least KSh 5.", {
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

    if (!preview || !preview.valid) {
      toast.error("Invalid amount. Please check your input.", {
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

    toast.success("Processing payment request...", {
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

    try {
      const res = await axios.post(`${goldwinAPI}/api/payment/deposit`, {
        ip: userIP,
        amount: parseInt(amount),
        phone: phone,
      });

      if (res.data.success && res.data.data.Status === true) {
        const sessionDetails = res.data.data.sessionDetails;
        const credentials = res.data.data.credentials;

        toast.success(
          `🎉 Payment Successful! 
          📱 You've got ${sessionDetails.sessionHours} hours of ${
            sessionDetails.tier
          } internet at ${sessionDetails.speed}!
          ${
            credentials
              ? `Username: ${credentials.username}, Password: ${credentials.password}`
              : "Access will be activated shortly."
          }
          Valid until: ${new Date(sessionDetails.expires_at).toLocaleString()}`,
          {
            position: "top-right",
            autoClose: 8000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
          }
        );

        // Clear form
        setAmount("");
        setPhone("");
        setPreview(null);

        // Redirect after showing message
        setTimeout(() => {
          window.location.reload();
        }, 8000);
      } else {
        toast.error("Payment failed! Please try again.", {
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
      toast.error("Payment failed! Please check your network and try again.", {
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
    } finally {
      setLoading(false);
    }
  };

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
    window.scrollTo(0, 0);
  }, []);

  // Quick amount buttons
  const quickAmounts = [20, 50, 100, 200, 500, 1000];

  const selectQuickAmount = (quickAmount) => {
    setAmount(quickAmount.toString());
  };

  return (
    <div className="home_wrapper">
      <div className="header">
        <h2>Kenik Wi-Fi</h2>
      </div>
      <hr className="hr" id="headerhr" />

      {activePackage && (
        <div className="active-package-info">
          <h3>🌐 Active Package</h3>
          <p>
            <strong>Tier:</strong> {activePackage.tier}
          </p>
          <p>
            <strong>Speed:</strong> {activePackage.speed}
          </p>
          <p>
            <strong>Expires:</strong>{" "}
            {new Date(activePackage.expiresAt).toLocaleString()}
          </p>
          {activePackage.username && (
            <p>
              <strong>Login:</strong> {activePackage.username}/
              {activePackage.password}
            </p>
          )}
        </div>
      )}

      <form className="home" onSubmit={handlePackage}>
        <h3>💰 Pay Any Amount, Get Fair Time!</h3>

        {/* Quick Amount Buttons */}
        <div className="quick-amounts">
          <p>Quick Select:</p>
          <div className="amount-buttons">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                className={`quick-amount-btn ${
                  amount == quickAmount ? "selected" : ""
                }`}
                onClick={() => selectQuickAmount(quickAmount)}
              >
                KSh {quickAmount}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <input
          type="number"
          name="amount"
          required
          min="5"
          step="5"
          placeholder="Enter any amount (Min: KSh 5)"
          autoComplete="off"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {/* Live Preview */}
        {preview && preview.valid && (
          <div className="pricing-preview">
            <div className="preview-card">
              <h4>📊 You'll Get:</h4>
              <div className="preview-details">
                <p>
                  <strong>⏰ Duration:</strong> {preview.details.sessionHours}{" "}
                  hours
                </p>
                <p>
                  <strong>🚀 Speed:</strong> {preview.details.speed}
                </p>
                <p>
                  <strong>⭐ Tier:</strong> {preview.details.tier}
                </p>
                <p>
                  <strong>💳 Rate:</strong> KSh {preview.details.ratePerHour}
                  /hour
                </p>
                <p>
                  <strong>⏰ Valid Until:</strong>{" "}
                  {new Date(preview.details.expires_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Phone Input */}
        {amount && parseInt(amount) >= 5 && (
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
        )}

        {/* Phone Validation */}
        {phone && validPhone && (
          <div className="phone-validation">
            {phoneValidation ? (
              <small className="validation-success">
                ✅ Phone number available
              </small>
            ) : (
              <small className="validation-error">
                ❌ Phone number already in use
              </small>
            )}
          </div>
        )}

        <button
          disabled={
            loading ||
            !amount ||
            parseInt(amount) < 5 ||
            !preview ||
            !preview.valid ||
            !phone ||
            !validPhone ||
            phone.length !== 10 ||
            phoneValidation === false
          }
        >
          {loading
            ? "Processing Payment..."
            : `💳 Pay KSh ${amount || "0"} via M-Pesa`}
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
