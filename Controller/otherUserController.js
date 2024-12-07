import UserModel from "../models/UserModel.js";
export const searchUsers = async (req, res) => {
  try {
    console.log(req.query);
    const { useremail } = req.query;
    const userList = await UserModel.findOne(
      {
        email: useremail,
      },
      "_id username email"
    );

    return res.json({ success: true, usersList: userList });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "somehting went wronf" });
  }
};
