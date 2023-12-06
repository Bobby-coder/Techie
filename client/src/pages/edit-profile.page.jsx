import { useContext, useLayoutEffect, useState, useRef } from "react";
import { uploadImage } from "../common/aws";
import AnimationWrapper from "../common/page-animation";
import axios from "axios";
import { UserContext } from "../App";
import { storeInSession } from "../common/session";
import toast, { Toaster } from "react-hot-toast";
import Loader from "../components/loader.component";
import Input from "../components/inputt.component";

const EditProfile = () => {
  // contexts
  let {
    userAuth,
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  // states
  let bioLimit = 200;
  const [uploadedImg, setUploadedImg] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    username: "",
    bio: "",
    profile_img: "",
    charactersLeft: bioLimit,
    social_links: {
      youtube: "",
      instagram: "",
      facebook: "",
      twitter: "",
      github: "",
      website: "",
    },
  });

  useLayoutEffect(() => {
    if (access_token) {
      axios
        .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", {
          username: userAuth.username,
        })
        .then(({ data }) => {
          setFormData({
            fullname: data.personal_info.fullname,
            email: data.personal_info.email,
            username: data.personal_info.username,
            bio: data.personal_info.bio,
            profile_img: data.personal_info.profile_img,
            social_links: {
              youtube: data.social_links.youtube,
              instagram: data.social_links.instagram,
              facebook: data.social_links.facebook,
              twitter: data.social_links.twitter,
              github: data.social_links.github,
              website: data.social_links.website,
            },
          });
          setLoading(false);
        })
        .catch(({ response }) => {
          return toast.error(response.data.error);
        });
    }
  }, [access_token]);

  function handleInputChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleSocialLinksChange(e) {
    setFormData({
      ...formData,
      social_links: {
        ...formData.social_links,
        [e.target.name]: e.target.value,
      },
    });
  }

  const handleCharacterChange = (e) => {
    setFormData({
      ...formData,
      charactersLeft: bioLimit - e.target.value.length,
      bio: e.target.value,
    });
  };

  const handleImagePreview = (e) => {
    let img = e.target.files[0];

    setFormData({
      ...formData,
      profile_img: URL.createObjectURL(img),
    });

    setUploadedImg(img);
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (uploadedImg) {
      let loadingToast = toast.loading("Uploading.....");
      e.target.setAttribute("disabled", true);

      const url = await uploadImage(uploadedImg);
      if (url) {
        try {
          const { data } = await axios.post(
            import.meta.env.VITE_SERVER_DOMAIN + "/update-profile-img",
            { url },
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            }
          );
          let newUserAuth = { ...userAuth, profile_img: data.profile_img };

          storeInSession("user", JSON.stringify(newUserAuth));
          setUserAuth(newUserAuth);

          setUploadedImg(null);

          toast.dismiss(loadingToast);
          e.target.removeAttribute("disabled");
          toast.success("Uploaded 👍");
        } catch ({ response }) {
          toast.dismiss(loadingToast);
          e.target.removeAttribute("disabled");
          toast.error(response.data.error);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // validate form

    let {
      username,
      bio,
      social_links: { youtube, instagram, facebook, twitter, github, website },
    } = formData;

    if (username.length < 3) {
      return toast.error("You must fill username with more than 3 letters");
    }
    if (bio.length > bioLimit) {
      return toast.error(`Bio should not be more than ${bioLimit}`);
    }

    let loadingToast = toast.loading("Updating....");
    e.target.setAttribute("disabled", true);

    // sending data to server to store
    try {
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/update-profile",
        {
          username,
          bio,
          social_links: {
            youtube,
            instagram,
            facebook,
            twitter,
            github,
            website,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (userAuth.username != data.username) {
        let newUserAuth = { ...userAuth, username: data.username };
        storeInSession("user", JSON.stringify(newUserAuth));
        setUserAuth(newUserAuth);
      }

      toast.dismiss(loadingToast);

      toast.success("Profile Updated");

      e.target.removeAttribute("disabled");
    } catch ({ response }) {
      toast.dismiss(loadingToast);

      e.target.removeAttribute("disabled");

      toast.error(response.data.error);
    }
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <form>
          <Toaster />
          <h1 className="max-md:hidden">Edit Profile</h1>

          <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
            <div className="max-lg:center mb-5">
              <label
                htmlFor="UploadImage"
                className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden"
              >
                <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/80 opacity-0 hover:opacity-100 cursor-pointer">
                  Upload Image
                </div>
                <img src={formData.profile_img} />
              </label>

              <input
                type="file"
                id="UploadImage"
                accept=".jpeg, .png, .jpg"
                className="hidden"
                onChange={handleImagePreview}
              />
              <button
                className="btn-light mt-5 max-lg:center lg:w-full px-10"
                onClick={handleImageUpload}
              >
                Upload
              </button>
            </div>

            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                <div>
                  <Input
                    type="text"
                    name="fullname"
                    placeholder="Full Name"
                    className="input-box"
                    icon="fi-sr-user"
                    value={formData.fullname}
                    disabled={true}
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    name="email"
                    placeholder="Email"
                    className="input-box"
                    icon="fi-sr-envelope"
                    value={formData.email}
                    disabled={true}
                  />
                </div>
              </div>

              <Input
                type="text"
                name="username"
                placeholder={"username"}
                className="input-box"
                value={formData.username}
                handleInputChange={handleInputChange}
                icon="fi-sr-at"
              />
              <p className="text-dark-grey -mt-3">
                Username will be used to search user and visible to all users
              </p>

              <textarea
                name="bio"
                maxLength={bioLimit}
                defaultValue={formData.bio}
                className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5"
                onChange={handleCharacterChange}
                placeholder="Bio"
              ></textarea>
              <p className="mt-1 text-dark-grey">
                {formData.charactersLeft} characters left
              </p>

              <p className="my-6 text-dark-grey">
                Add Your Social Handles below
              </p>

              <div className="md:grid md:grid-cols-2 gap-x-6">
                {Object.keys(formData.social_links).map((link, i) => {
                  let value = formData.social_links[link];

                  return (
                    <>
                      <Input
                        key={i}
                        name={link}
                        type="text"
                        value={value}
                        handleInputChange={handleSocialLinksChange}
                        placeholder="https://"
                        className="input-box"
                        icon={
                          "fi " +
                          (link != "website"
                            ? "fi-brands-" + link
                            : "fi-br-link-alt")
                        }
                      />
                    </>
                  );
                })}
              </div>

              <button
                className="btn-dark w-auto px-10"
                type="submit"
                onClick={handleSubmit}
              >
                Update
              </button>
            </div>
          </div>
        </form>
      )}
    </AnimationWrapper>
  );
};

export default EditProfile;
