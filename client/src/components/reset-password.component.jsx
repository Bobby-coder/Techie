import { useState } from "react";
import logo from "../imgs/logo.png";
import toast from "react-hot-toast";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import ResetPasswordInput from "./reset-password-input";

const ResetPasswordForm = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  async function handleSubmit(e) {
    e.preventDefault();

    const toastId = toast.loading("Loading...");
    try {
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/reset-password",
        { newPassword, confirmPassword, resetPasswordToken: id }
      );

      toast.dismiss(toastId);
      toast.success(data.message);

      navigate("/signin");
    } catch ({ response }) {
      toast.dismiss(toastId);
      toast.error(response.data.message);
    }
  }

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
          Reset Password
        </h1>
        <p className="font-light text-gray-500">
          Don't fret! Just type in your email and we will send you a code to
          reset your password!
        </p>
        <form
          className="mt-4 space-y-4 lg:mt-5 md:space-y-5"
          onSubmit={handleSubmit}
        >
          <ResetPasswordInput
            value={newPassword}
            setFun={setNewPassword}
            label="New Password"
            id="newPassword"
            labelFor="newPassword"
          />
          <ResetPasswordInput
            value={confirmPassword}
            setFun={setConfirmPassword}
            label="Confirm Password"
            id="confirmPassword"
            labelFor="confirmPassword"
          />

          <button
            type="submit"
            className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-[14px] px-5 py-2.5 text-center"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
