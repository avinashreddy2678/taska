import UserModel from "../models/UserModel";
export const searchUsers = async (req, res) => {
  try {
    const { searchKey } = req.body;
    const userList = await UserModel.find({
      email: { $regex: searchKey, $options: "i" },
    });

    return res.json({ success: true, usersList: userList });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "somehting went wronf" });
  }
};
