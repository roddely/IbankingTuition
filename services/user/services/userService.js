const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

// Tạo JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || "secret_key",
    { expiresIn: "15m" }
  );
};

// Đăng ký tài khoản
const signUp = async (user) => {
  const { username, password, fullName, phone, email, balance } = user;

  // Kiểm tra email tồn tại chưa
  const checkUser = await userModel.findOne({ email });
  if (checkUser !== null) {
    return {
      status: "error",
      message: "Email already exists",
    };
  }

  const hash = await bcrypt.hash(password, 10);

  try {
    const createUser = await userModel.create({
      username,
      passwordHash: hash,
      fullName,
      phone,
      email,
      balance,
    });

    if (createUser) {
      return {
        status: "success",
        message: "Create user successfully",
        data: createUser,
      };
    }
  } catch (error) {
    throw error;
  }
};

// Đăng nhập
const login = async (email, password) => {
  const user = await userModel.findOne({ email });
  if (!user) throw new Error("Account or password incorrect");

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new Error("Account or password incorrect");

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      balance: user.balance,
    },
  };
};

// Lấy thông tin user theo ID
const getUserById = async (id) => {
  return await userModel.findById(id).select("-passwordHash");
};

// Nạp tiền vào tài khoản user
const deposit = async (id, amount) => {
  const user = await userModel.findById(id);
  if (!user) throw new Error("User not found");

  if (amount <= 0) throw new Error("Deposit amount must be greater than 0");

  user.balance += amount;
  await user.save();

  return {
    status: "success",
    message: "Deposit successful",
    balance: user.balance,
    user,
  };
};

const updateBalance = async (userId, amount) => {
  const user = await userModel.findById(userId);
  if (!user) throw new Error("User not found!");
  if ( user.balance < amount) throw new Error("Insufficient balance!");

  user.balance -= amount;
  await user.save();

  return {
    status: "success",
    message: "Deduction successful!",
    balance: user.balance, user
  };
};

module.exports = {
  signUp,
  login,
  getUserById,
  deposit,
  updateBalance
};
