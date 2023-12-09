import { useContext, useRef, useState } from "react";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import AnimationWrapper from "../common/page-animation";
import axios from "axios";
import Input from "../components/inputt.component";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  let {
    userAuth: { access_token },
  } = useContext(UserContext);
  let changePasswordForm = useRef();

  function handleInputChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    let { currentPassword, newPassword } = formData;

    if (!currentPassword.length || !newPassword.length) {
      return toast.error("Fill all the inputs");
    }
    if (
      !passwordRegex.test(currentPassword) ||
      !passwordRegex.test(newPassword)
    ) {
      return toast.error(
        "Password should be 6 to 20 characters long with at least 1 numeric, 1 lowercase and 1 uppercase letter"
      );
    }

    // sending password to server
    e.target.setAttribute("disabled", true);

    let loadingToast = toast.loading("Updating....");

    try {
      await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/change-password",
        formData,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      toast.dismiss(loadingToast);
      e.target.removeAttribute("disabled");
      setFormData({
        currentPassword: "",
        newPassword: "",
      });
      return toast.success("Password Updated");
    } catch ({ response }) {
      toast.dismiss(loadingToast);
      e.target.removeAttribute("disabled");
      return toast.error(response.data.message);
    }
  };

  return (
    <AnimationWrapper>
      <Toaster />
      <form>
        <h1 className="max-md:hidden">Change Password</h1>

        <div className="py-10 w-full md:max-w-[400px]">
          <Input
            type="password"
            name="currentPassword"
            placeholder="Current Password"
            className="input-box"
            value={formData.currentPassword}
            handleInputChange={handleInputChange}
            icon="fi-rr-unlock"
          />

          <Input
            type="password"
            name="newPassword"
            placeholder="New Password"
            className="input-box"
            value={formData.newPassword}
            handleInputChange={handleInputChange}
            icon="fi-rr-unlock"
          />

          <button
            className="btn-dark px-10"
            type="submit"
            onClick={handleSubmit}
          >
            Change Password
          </button>
        </div>
      </form>
    </AnimationWrapper>
  );
};

export default ChangePassword;
