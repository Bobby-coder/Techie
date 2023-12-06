import axios from "axios";

export const uploadImage = async (img) => {
  let imgUrl = null;

  try {
    const {
      data: { uploadURL },
    } = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url");
    await axios({
      method: "PUT",
      url: uploadURL,
      headers: { "Content-Type": "multipart/form-data" },
      data: img,
    });
    imgUrl = uploadURL.split("?")[0];
  } catch (err) {
    console.log(err);
  }

  return imgUrl;
};
