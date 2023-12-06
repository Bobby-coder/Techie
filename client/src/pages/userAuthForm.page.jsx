import google from "../imgs/google.png";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import { authWithGoogle } from "../common/firebase";
import AnimationWrapper from "../common/page-animation";
import Input from "../components/inputt.component";

const UserAuthForm = ({ type }) => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  let {
    userAuth: { access_token },
    setUserAuth,
    dispatch,
  } = useContext(UserContext);

  const navigate = useNavigate();

  function handleInputChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  const userAuthThroughServer = async (formData, serverRoute) => {
    if (serverRoute === "/signup") {
      const toastId = toast.loading("Loading...");
      try {
        const { data } = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + serverRoute,
          formData
        );

        const activationToken = data.activationToken;

        dispatch({
          type: "UPDATE_TOKEN",
          payload: activationToken,
        });

        toast.dismiss(toastId);
        toast.success(data.message);

        navigate("/verification");
      } catch ({ response }) {
        toast.dismiss(toastId);
        toast.error(response.data.message);
      }
    } else {
      const toastId = toast.loading("Loading...");
      try {
        const { data } = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + serverRoute,
          formData
        );

        toast.dismiss(toastId);
        toast.success(data.message);
        storeInSession("user", JSON.stringify(data.user));

        setUserAuth(data.user);
      } catch ({ response }) {
        toast.dismiss(toastId);
        toast.error(response.data.message);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // stopping form from getting submit

    let serverRoute = type == "sign_in" ? "/signin" : "/signup";

    // validations

    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // email for password

    // console.log(formData, authForm.current);
    let { fullname, email, password } = formData;

    // form validation
    if (fullname) {
      if (fullname.length < 3) {
        return toast.error("Full name should be at least 3 letters long");
      }
    }

    if (!email) {
      return toast.error("Enter your email");
    }

    if (!password) {
      return toast.error("Enter your password");
    }

    if (type !== "sign_in") {
      if (!emailRegex.test(email)) {
        return toast.error("Invalid email");
      }

      if (!passwordRegex.test(password)) {
        return toast.error(
          "Password should be 6 to 20 characters long with at least 1 numeric, 1 lowercase and 1 uppercase letter"
        );
      }
    }

    // sending data to server
    userAuthThroughServer(formData, serverRoute);
  };

  const handleGoogleAuth = (e) => {
    e.preventDefault();

    authWithGoogle()
      .then((user) => {
        let serverRoute = "/google-auth";

        let formData = {
          accessToken: user.accessToken,
        };

        userAuthThroughServer(formData, serverRoute);
      })
      .catch((err) => {
        toast.error("Trouble login in through google");
        console.log("trouble login in through google =>", err);
      });
  };

  return access_token ? (
    <Navigate to="/" />
  ) : (
    <AnimationWrapper keyValue={type}>
      <section className="h-cover flex items-center justify-center">
        <form className="w-[80%] max-w-[400px]" id="formElement">
          <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
            {type == "sign_in" ? "Welcome Back" : "Join Us Today"}
          </h1>

          {
            // condition to check for whether to create name field or not
            type !== "sign_in" && (
              <Input
                type="text"
                name="fullname"
                placeholder="Full Name"
                className="input-box"
                value={formData.fullname}
                handleInputChange={handleInputChange}
                icon="fi-ss-user"
              />
            )
          }

          <Input
            type="email"
            name="email"
            placeholder="Email"
            className="input-box"
            value={formData.email}
            handleInputChange={handleInputChange}
            icon="fi-sr-envelope"
          />

          <Input
            type="password"
            name="password"
            placeholder="Password"
            className="input-box"
            value={formData.password}
            handleInputChange={handleInputChange}
            icon="fi-ss-lock"
          />

          {type === "sign_in" && (
            <div
              onClick={() => navigate("/reset-password")}
              className="flex cursor-pointer mt-6 justify-end"
            >
              <span className="text-[15px] leading-tight font-medium">
                Forgot Password ?
              </span>
            </div>
          )}

          <button
            className="btn-dark center mt-14"
            type="submit"
            onClick={handleSubmit}
          >
            {type.replace("_", " ")}
          </button>

          <div className="relative w-full flex items-center gap-2  my-10 opacity-10 uppercase text-black font-blod">
            <hr className="w-1/2 border-black" />
            <p>or</p>
            <hr className="w-1/2 border-black" />
          </div>

          <button
            className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
            onClick={handleGoogleAuth}
          >
            <img src={google} className="w-5" />
            Continue with google
          </button>

          {
            // condition to check for whether to its a sign_in form or signup form
            type == "sign_in" ? (
              <p className="mt-6 text-dark-grey text-xl text-center">
                Don’t have an account ?
                <Link
                  className="underline text-black text-xl ml-1"
                  to="/signup"
                >
                  Join us today
                </Link>
              </p>
            ) : (
              <p className="mt-6 text-dark-grey text-xl text-center">
                Already a member ?
                <Link
                  className="underline text-black text-xl ml-1"
                  to="/signin"
                >
                  Sign in here
                </Link>
              </p>
            )
          }
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;
