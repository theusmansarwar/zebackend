const User = require("../Models/adminModel");
const bcrypt = require("bcryptjs");


const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !email.includes("@gmail.com")) {
    return res.status(400).json({
      status: 400,
      message: "Email field must contain @gmail.com",
     
    });
  }
  if (!name) {
    return res.status(400).json({
      status: 400,
      message: "Name field is required",
    });
  }

  if (!password) {
    return res.status(400).json({
      status: 400,
      message: "Password field is required",
    });
  }


  try {
    const emailAvailable = await User.findOne({ email });

    if (emailAvailable) {
      return res.status(400).json({
        status: 400,
        message: "Email already exists",
      });
    }

 

    const hashedPassword = await bcrypt.hash(password, 4);
    

    const user= await User.create({
      name,
         email,
    
      password: hashedPassword,
    
    });
    const type = "Registion process";

    res.status(201).json({
      status: 201,
      message: "User registered successfully",
      data: {
        name: user.name,
        email: user.email,
        },
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};


const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !email.includes("@gmail.com")) {
    return res.status(400).json({
      status: 400,
      message: "Email field must contain @gmail.com",
    });
  }
  if (!password) {
    return res.status(400).json({
      status: 400,
      message: "Password field is required",
    });
  }
  const user = await User.findOne({ email });
  if (!user) {
    
    return res.status(404).json({
      message: "Email not found",
    });
  } else {
    const matchPassword = await bcrypt.compare(password, user.password);
    if (matchPassword) {
      res.status(200).json({
        status:200,
        message: "LoggedIn Successfully",
        data:user,
        token: await user.generateToken(),
      });
    } else {
      res.status(400).json({
        message: "Invalid credientials",
      });
    }
  }
};

module.exports = {
  register,

  login,

};