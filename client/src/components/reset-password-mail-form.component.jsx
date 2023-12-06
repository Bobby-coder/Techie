import { useState } from "react";
import logo from "../imgs/logo.png";
import toast from "react-hot-toast";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const ResetPasswordMailForm = () => {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const toastId = toast.loading("Loading...");
    try {
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/reset-password-link",
        { email }
      );

      toast.dismiss(toastId);
      toast.success(data.message);
      setIsSent(true);
    } catch ({ response }) {
      toast.dismiss(toastId);
      toast.error(response.data.message);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-[400px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <Link
        href="/"
        class="flex items-center mb-6 text-2xl font-semibold text-gray-900"
      >
        <img className="w-8 h-8 mr-2" src={logo} alt="logo" />
        Techie
      </Link>
      <div className="w-full p-6 bg-white rounded-lg shadow md:mt-0 sm:max-w-md sm:p-8">
        <h1 className="mb-2 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
          {isSent ? "Check email" : "Forgot your password?"}
        </h1>
        <p className="font-light text-gray-500">
          {isSent
            ? `We have sent the reset email to ${email}`
            : "Don't fret! Just type in your email and we will send you a code to reset your password!"}
        </p>
        <form
          className="mt-4 space-y-4 lg:mt-5 md:space-y-5"
          onSubmit={handleSubmit}
        >
          {!isSent && (
            <div>
              <label
                for="email"
                className="block mb-2 text-md font-medium text-gray-900"
              >
                Your email
              </label>
              <input
                type="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-md rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                placeholder="name@domain.com"
                required={true}
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-md px-5 py-2.5 text-center"
          >
            {isSent ? "Resend Email" : "Submit"}
          </button>
        </form>
        <div
          onClick={() => navigate("/signin")}
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
            Back To Login
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordMailForm;
