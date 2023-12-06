import dotenv from "dotenv";
import ErrorHandler from "../utils/ErrorHandler.js";
import User from "../Schema/User.js";
import Blog from "../Schema/Blog.js";
import Notification from "../Schema/Notification.js";
import Comment from "../Schema/Comment.js";
import { nanoid } from 'nanoid'

// Load env variables
dotenv.config();

export const createBlog = async (req, res, next) => {
  let authorId = req.user;

  let { title, des, banner, content, tags, id, draft } = req.body;

  if (!draft) {
    if (!title.length) {
      return res
        .status(403)
        .json({ error: "You must provide a title to publish the blog" });
    } else if (!des.length || des.length > 200) {
      return res.status(403).json({
        error: "You must provide blog description under 200 characters",
      });
    } else if (!banner.length) {
      return res
        .status(403)
        .json({ error: "You must provide Blog Banner to publish it" });
    } else if (!content.blocks.length) {
      return res
        .status(403)
        .json({ error: "There must be some blog content to publish it" });
    } else if (!tags.length) {
      return res
        .status(403)
        .json({ error: "Provide at least 1 tag to help us rank your blog" });
    }
  }
  // everything is good

  // lowercasing tags first.
  tags = tags.map((tag) => tag.toLowerCase());

  let blog_id =
    id ||
    title
      .replace(/[^a-zA-Z0-9 ]/g, " ")
      .replace(/\s+/g, "-")
      .trim() + nanoid();

  if (id) {
    // update existing blog
    try {
      const blog = await Blog.findOneAndUpdate(
        { blog_id },
        { title, des, banner, content, tags, draft: draft ? draft : false }
      );

      return res.status(200).json({ id: blog.blog_id });
    } catch (err) {
      return next(new ErrorHandler(err.message, 400));
    }
  } else {
    // creating new blog

    let blogs = new Blog({
      title,
      des,
      banner,
      content,
      tags,
      author: authorId,
      blog_id,
      draft: Boolean(draft),
    });

    try {
      const blog = await blogs.save();

      let increamentVal = draft ? 0 : 1;

      // updaing total post number in users database
      await User.findOneAndUpdate(
        { _id: authorId },
        {
          $inc: { "account_info.total_posts": increamentVal },
          $push: { blogs: blog.id },
        }
      );

      return res.status(200).json({ id: blog.blog_id });
    } catch (err) {
      return next(new ErrorHandler(err.message, 400));
    }
  }
};

// done
export const searchBlogs = async (req, res, next) => {
  let { query, tag, page, author, limit, eliminate_blog } = req.body;

  let findQuery;

  if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  } else if (tag) {
    findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
  } else if (author) {
    findQuery = { author, draft: false };
  }

  let maxLimit = limit ? limit : 3;

  try {
    const blogs = await Blog.find(findQuery)
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .select("blog_id title des banner activity tags publishedAt -_id")
      .sort({ publishedAt: -1 })
      .skip((page - 1) * maxLimit)
      .limit(maxLimit);

    return res.status(200).json({ blogs });
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};

// done
export const searchBlogsCount = async (req, res, next) => {
  let { query, tag, author } = req.body;

  let findQuery;

  if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  } else if (tag) {
    findQuery = { tags: tag, draft: false };
  } else if (author) {
    findQuery = { author, draft: false };
  }

  try {
    const count = await Blog.countDocuments(findQuery);

    return res.status(200).json({ totalDocs: count });
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};

// done
export const searchUsers = async (req, res, next) => {
  let { query } = req.body;

  User.find({ "personal_info.username": new RegExp(query, "i") })
    .sort({ publishedAt: -1 })
    .limit(50)
    .select(
      "personal_info.fullname personal_info.username personal_info.profile_img -_id "
    )
    .then((users) => {
      return res.status(200).json({ users });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};

// done
export const getTrendingBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.profile_img personal_info.fullname personal_info.username -_id"
      )
      .sort({
        "activity.total_reads": -1,
        "activity.total_likes": -1,
        publishedAt: -1,
      })
      .select("blog_id title publishedAt -_id")
      .limit(5);

    return res.status(200).json({ blogs });
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};

// done
export const getLatestBlogs = async (req, res, next) => {
  let { page } = req.body;

  let maxLimit = 6;

  try {
    const blogs = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title des banner activity tags publishedAt -_id")
      .skip((page - 1) * maxLimit)
      .limit(maxLimit);

    return res.status(200).json({ blogs });
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};

// done
export const getLatestBlogCount = async (req, res, next) => {
  try {
    const count = await Blog.countDocuments({ draft: false });

    return res.status(200).json({ totalDocs: count });
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};

// done
export const getBlog = async (req, res, next) => {
  let { blog_id, draft, mode } = req.body;

  let increamentVal = mode != "edit" ? 1 : 0;

  try {
    const blog = await Blog.findOneAndUpdate(
      { blog_id },
      { $inc: { "activity.total_reads": increamentVal } }
    )
      .populate(
        "author",
        "personal_info.username personal_info.profile_img personal_info.fullname"
      )
      .select(
        "title des content banner activity publishedAt blog_id tags draft"
      );

    await User.findOneAndUpdate(
      { "personal_info.username": blog.author.personal_info.username },
      {
        $inc: { "account_info.total_reads": increamentVal },
      }
    );

    if (blog.draft && !draft) {
      return res.status(500).json({ error: "You can not access draft blogs" });
    }

    return res.status(200).json({ blog });
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};

export const likeBlog = async (req, res, next) => {
  let user_id = req.user;

  let { _id, likedByUser } = req.body;

  let increamentVal = !likedByUser ? 1 : -1;

  try {
    const blog = await Blog.findOneAndUpdate(
      { _id },
      { $inc: { "activity.total_likes": increamentVal } }
    );

    await User.findByIdAndUpdate(
      { _id: blog.author },
      { $inc: { "account_info.total_likes": increamentVal } }
    );

    if (!likedByUser) {
      let like = new Notification({
        type: "like",
        blog: blog._id,
        notification_for: blog.author,
        user: user_id,
      });

      await like.save();
      return res.json({ liked_by_user: true });
    } else {
      await Notification.findOneAndDelete({
        user: user_id,
        blog: _id,
        type: "like",
      });
      return res.json({ liked_by_user: false });
    }
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};

export const isLikedByUser = async (req, res, next) => {
  let user_id = req.user;
  let { blog_id } = req.body;

  try {
    const result = await Notification.exists({
      user: user_id,
      type: "like",
      blog: blog_id,
    });

    return res.status(200).json({ result });
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};

export const addComment = async (req, res, next) => {
  let user_id = req.user;

  let { _id, comment, replying_to, blog_author, notification_id } = req.body;

  if (!comment.length) {
    return res
      .status(403)
      .json({ error: "Write something to leave a comment..." });
  }

  // create a comment object

  let commentObj = {
    blog_id: _id,
    blog_author,
    comment,
    commented_by: user_id,
    isReply: Boolean(replying_to),
  };

  if (replying_to) {
    commentObj.parent = replying_to;
  }
  try {
    const commentFile = await new Comment(commentObj).save();

    let { comment, commentedAt, children } = commentFile;

    await Blog.findOneAndUpdate(
      { _id },
      {
        $push: { comments: commentFile._id },
        $inc: {
          "activity.total_comments": 1,
          "activity.total_parent_comments": replying_to ? 0 : 1,
        },
      }
    );

    let notificationObj = {
      type: replying_to ? "reply" : "comment",
      blog: _id,
      notification_for: blog_author,
      user: user_id,
      comment: commentFile._id,
    };

    if (replying_to) {
      notificationObj.replied_on_comment = replying_to;

      const reply = await Comment.findOneAndUpdate(
        { _id: replying_to },
        { $push: { children: commentFile._id } }
      );
      notificationObj.notification_for = reply.commented_by;
    }

    if (notification_id) {
      await Notification.findOneAndUpdate(
        { _id: notification_id },
        { reply: commentFile._id }
      );
    }

    await new Notification(notificationObj).save();

    return res.status(200).json({
      comment,
      commentedAt,
      _id: commentFile._id,
      user_id,
      children,
    });
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};

export const getBlogComment = async (req, res, next) => {
  let { blog_id, skip } = req.body;
  let maxLimit = 5;

  try {
    const comment = await Comment.find({ blog_id, isReply: false })
      .populate(
        "commented_by",
        "personal_info.username personal_info.fullname personal_info.profile_img"
      )
      .skip(skip)
      .limit(maxLimit)
      .sort({
        commentedAt: -1,
      });

    return res.status(200).json(comment);
  } catch (err) {
    console.log(err.message);
    return next(new ErrorHandler(err.message, 400));
  }
};

export const getBlogCommentCount = async (req, res, next) => {
  let { blog_id } = req.body;

  try {
    const count = await Comment.countDocuments({ blog_id, isReply: false });

    return res.status(200).json({ totalDocs: count });
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};

// server.post('/get-all-comments', verifyJWT, async (req, res, next) => {
//     let user_id = req.user;

//     let { page } = req.body;
//     let maxLimit = 10;
//     try{
//     const comments = await Comment.find({ blog_author: user_id, isReply: false })
//     .populate("commented_by", " personal_info.fullname personal_info.username personal_info.profile_img -_id")
//     .populate("blog_id", " blog_id title ")
//     .sort({ commentedAt: -1 })
//     .skip((page - 1) * maxLimit)
//     .limit(maxLimit)
//     .select("comment commentedAt")
//
//     res.status(200).json({ comments })
//     }
//     catch(err){
//         return next(new ErrorHandler(err.message, 400));
//     }
// })

export const getReplies = async (req, res, next) => {
  let { _id, skip } = req.body;

  let maxLimit = 5;

  try {
    const replies = await Comment.findOne({ _id })
      .populate({
        path: "children",
        options: {
          limit: maxLimit,
          skip: skip,
          sort: { commentedAt: -1 },
        },
        populate: {
          path: "commented_by",
          select:
            "personal_info.username personal_info.profile_img personal_info.fullname",
        },
        select: "-blog_id -updatedAt",
      })
      .select("children");

    return res.status(200).json({ replies: replies.children });
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};

const deleteComments = async (_id) => {
  try {
    const comment = await Comment.findOneAndDelete({ _id });
    if (comment.parent) {
      await Comment.findOneAndUpdate(
        { _id: comment.parent },
        { $pull: { children: _id } }
      );
    }

    await Notification.findOneAndDelete({ comment: _id });

    await Notification.findOneAndUpdate(
      { reply: _id },
      { $unset: { reply: 1 } }
    );

    await Blog.findOneAndUpdate(
      { _id: comment.blog_id },
      {
        $pull: { comments: _id },
        $inc: {
          "activity.total_comments": -1,
          "activity.total_parent_comments": comment.parent ? 0 : -1,
        },
      }
    );

    if (comment.children.length) {
      comment.children.map((child) => {
        deleteComments(child);
      });
    }
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};

export const deleteComment = async (req, res, next) => {
  let user_id = req.user;

  let { _id } = req.body;

  try {
    const comment = await Comment.findOne({ _id });

    if (user_id == comment.commented_by || user_id == comment.blog_author) {
      deleteComments(_id);

      return res.status(200).json({ status: "done" });
    } else {
      //return next(new ErrorHandler("You can't delete this comment", 400));
      return res.status(200).json({ error: "You can't delete this comment" });
    }
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};

export const getAccountInfo = async (req, res, next) => {
  let user_id = req.user;

  try {
    const user = await User.findOne({ _id: user_id }).select("account_info");

    return res.status(200).json({ acc_info: user.account_info });
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};

// done
export const getUserWriitenBlog = async (req, res, next) => {
  let user_id = req.user;
  let { page, draft, query, deletedDocCount } = req.body;

  let maxLimit = 2;
  let skipDocs = (page - 1) * maxLimit;

  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
  }

  try {
    const blogs = await Blog.find({
      author: user_id,
      draft,
      title: new RegExp(query, "i"),
    })
      .skip(skipDocs)
      .limit(maxLimit)
      .sort({ publishedAt: -1 })
      .select(" title banner publishedAt blog_id activity des draft -_id");

    return res.status(200).json({ blogs });
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};

// done
export const getUserWriitenBlogCount = async (req, res, next) => {
  let user_id = req.user;

  let { draft, query } = req.body;

  try {
    const count = await Blog.countDocuments({
      author: user_id,
      draft,
      title: new RegExp(query, "i"),
    });

    return res.status(200).json({ totalDocs: count });
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};

export const deleteBlog = async (req, res, next) => {
  let user_id = req.user;
  let { blog_id } = req.body;

  try {
    const blog = await Blog.findOneAndDelete({ blog_id });

    await Notification.deleteMany({ blog: blog._id });

    await Comment.deleteMany({ blog_id: blog._id });

    await User.findOneAndUpdate(
      { _id: user_id },
      { $pull: { blogs: blog._id }, $inc: { "account_info.total_posts": -1 } }
    );

    return res.status(200).json({ status: "done" });
  } catch (err) {
    return next(new ErrorHandler(err.message, 400));
  }
};
