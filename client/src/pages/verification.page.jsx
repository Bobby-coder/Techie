import axios from "axios";
import { MuiOtpInput } from "mui-one-time-password-input";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../imgs/logo.png";

const Verification = () => {
  const { tokenState } = useContext(UserContext);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleChange = (newValue) => {
    setOtp(newValue);
  };

  async function handleSubmit() {
    const toastId = toast.loading("Loading...");
    try {
      const activationToken = tokenState.token;

      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/activate",
        { activationCode: otp, activationToken }
      );

      toast.dismiss(toastId);
      toast.success(data.message);
      navigate("/signin");
    } catch ({ response }) {
      toast.dismiss(toastId);
      toast.error(response.data.message);
    }
  }

  function matchIsNumeric(text) {
    const isNumber = typeof text === "number";
    const isString = typeof text === "string";
    return (isNumber || (isString && text !== "")) && !isNaN(Number(text));
  }

  const validateChar = (value) => {
    return matchIsNumeric(value);
  };

  return (
    <div className="flex flex-col items-center justify-center w-[400px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <Link
        href="/"
        className="flex items-center mb-6 text-2xl font-semibold text-gray-900"
      >
        <img className="w-8 h-8 mr-2" src={logo} alt="logo" />
        Techie
      </Link>
      <div className="w-full p-6 bg-white rounded-lg shadow md:mt-0 sm:max-w-md sm:p-8">
        <h1 className="mb-2 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-[30px]">
          Email Verification
        </h1>
        <p className="font-light text-gray-500 mb-4">
          We have sent a code to your email
        </p>
        <MuiOtpInput
          value={otp}
          autoFocus
          onChange={handleChange}
          validateChar={validateChar}
          TextFieldsProps={{ placeholder: "-" }}
          error
          variant
        />
        <button
          className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-[14px] px-5 py-2.5 text-center mt-4"
          onClick={handleSubmit}
        >
          Verify Email
        </button>
        <div
          onClick={() => navigate("/signup")}
          className="flex gap-1 cursor-pointer items-center mt-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>

          <span className="text-[14px] leading-tight font-medium mb-[-1.58px]">
            Back To Signup
          </span>
        </div>
      </div>
    </div>
  );
};

export default Verification;
