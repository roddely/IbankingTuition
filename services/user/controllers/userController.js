const userService = require('../services/userService');

//Create user (no UI)
const signUp = async (req, res) => {
    try{
        const { username, password, fullName, phone, email, balance } = req.body;
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
        const isCheckMail = reg.test(email);
        // if(!username || !password || !fullName || !phone || !email || !balance) {
        //     return res.status(400).json({
        //         status: 'error',
        //         message: 'Missing required fields'
        //     })
        if(!username) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing username'
            })
        }
        else if(!password) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing password'
            })
        }
        else if (!fullName) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing fullName'
            })
        }

        else if (!phone) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing phone'
            })
        }
        else if (!email) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing email'
            })
        }
        else if (!balance) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing balance'
            })
        }
        else if (!isCheckMail) {
            return res.status(400).json({
                status: 'error',
                message: 'Email is not valid'
            })
        }
        const result =  await userService.signUp(req.body);
        return res.status(200).json(result);
    }catch(error){
       return res.status(400).json({ message: error.message });
    }
}

// Đăng nhập bằng email + password

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await userService.login(email, password);

        // Lưu token vào cookie (15 phút)
        res.cookie("token", result.token, {
            httpOnly: true,         // cookie an toàn, không đọc bằng JS
            secure: false,          // true nếu deploy HTTPS
            maxAge: 15 * 60 * 1000  //15 phut
        });

        res.json({ message: "Sign in successfully", user: result.user });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const logout = async (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Sign out successfully" });
}

const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) return res.status(400).json({ message: "Student not found!" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getMe = async (req, res) => {
    try {
        const user = await userService.getUserById(req.userId);
        if(!user) return req.status(400),json({ message: "Student not found!"});
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
}

const deposit = async (req, res) => {
  try {
    const id = req.userId; 
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: "Invalid deposit amount" });
    }

    const result = await userService.deposit(id, parseFloat(amount));

    return res.status(200).json({
      success: true,
      message: result.message,
      balance: result.balance,
      user: result.user,
    });
  } catch (error) {
    console.error("Deposit error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to deposit",
    });
  }
};


const updateBalance = async (req, res) => {
    const { userId, amount} = req.body;

    if (!userId || !amount) return res.status(400).json({ message: "Missing userdId or amount"});
    try {
        const result = await userService.updateBalance(userId, amount);
        res.status(200).json({
            message: "Balance deducted successfully!",
            newBalance: result.balance
        })

    } catch (error) {
        if (error.message.includes("Insufficient balance")) {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }
            
        if (error.message.includes("User not found")) {
            return res.status(404).json({ 
                success: false, 
                message: error.message 
            });
        }
    }
}

module.exports = {
    signUp,
    login,
    logout,
    getUserById,
    getMe,
    deposit,
    updateBalance,
}