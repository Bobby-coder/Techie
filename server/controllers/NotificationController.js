import Notification from "../Schema/Notification.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const getNewNotification = async (req, res, next) => {
  let user_id = req.user;

  try {
    const result = await Notification.exists({
      notification_for: user_id,
      seen: false,
      user: { $ne: user_id },
    });

    if (result) {
      return res.status(200).json({ new_notifications_available: true });
    } else {
      return res.status(200).json({ new_notifications_available: false });
    }
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};

// done
export const getNotifications = async (req, res, next) => {
  let user_id = req.user;

  let { page, filter, deletedDocCount } = req.body;

  let maxLimit = 10;

  let findQuery = { notification_for: user_id, user: { $ne: user_id } };

  let skipDocs = (page - 1) * maxLimit;

  if (filter != "all") {
    findQuery.type = filter;
  }

  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
  }

  try {
    const notifications = await Notification.find(findQuery)
      .skip(skipDocs)
      .limit(maxLimit)
      .populate("blog", "title blog_id")
      .populate(
        "user",
        "personal_info.fullname personal_info.username personal_info.profile_img"
      )
      .populate("comment", "comment")
      .populate("reply", "comment")
      .populate("replied_on_comment", "comment")
      .sort({ createdAt: -1 })
      .select("createdAt type seen reply");

    await Notification.updateMany(findQuery, { seen: true })
      .skip((page - 1) * maxLimit)
      .limit(maxLimit);

    return res.status(200).json({ notifications });
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};

// done
export const getAllNotificationsCount = async (req, res, next) => {
  let user_id = req.user;

  let { filter } = req.body;

  let findQuery = { notification_for: user_id, user: { $ne: user_id } };

  if (filter != "all") {
    findQuery.type = filter;
  }

  try {
    const count = await Notification.countDocuments(findQuery);

    return res.status(200).json({ totalDocs: count });
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};
