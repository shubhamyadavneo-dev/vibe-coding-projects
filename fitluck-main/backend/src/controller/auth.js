const authService = require('../service/auth')

const register = async (req, res) => {
  try {
    const result = await authService.register(req.body)
    res.status(201).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query
    const result = await authService.verifyEmail(token)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body
    const result = await authService.logout(refreshToken)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    const result = await authService.forgotPassword(email)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const resetPassword = async (req, res) => {
  try {
    const result = await authService.resetPassword(req.body)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword
}