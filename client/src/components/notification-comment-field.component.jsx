/* eslint-disable react/prop-types */
import { useContext, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { UserContext } from "../App";

const NotificationCommentField = ({
  _id,
  blog_author,
  index = undefined,
  replyingTo = undefined,
  setReplying,
  notification_id,
  notificationData,
}) => {
  const [comment, setComment] = useState();

  let { _id: user_id } = blog_author;
  let {
    userAuth: { access_token },
  } = useContext(UserContext);
  let {
    notifications,
    notifications: { results },
    setNotifications,
  } = notificationData;

  const handleComment = async () => {
    if (!comment.length) {
      return toast.error("Write something to leave a comment...");
    }

    // sending comment to store in database
    try {
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/add-comment",
        {
          _id,
          blog_author: user_id,
          comment,
          replying_to: replyingTo,
          notification_id,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      setReplying ? setReplying(false) : "";

      results[index].reply = { comment, _id: data._id };
      setNotifications({ ...notifications, results });
    } catch ({ response }) {
      return toast.error(response.data.message);
    }
  };

  return (
    <>
      <Toaster />
      <textarea
        onChange={(e) => setComment(e.target.value)}
        placeholder="Leave a comment..."
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
      ></textarea>
      <button className="btn-dark mt-5 px-10" onClick={handleComment}>
        Reply
      </button>
    </>
  );
};

export default NotificationCommentField;
