const prisma = require('../../prisma/client')

const findUserByEmail = (email) => {
  return prisma.user.findUnique({ where: { email } })
}

const findUserById = (id) => {
  return prisma.user.findUnique({ where: { id } })
}

const createUser = (data) => {
  return prisma.user.create({ data })
}

const createEmailVerificationToken = (data) => {
  return prisma.emailVerificationToken.create({ data })
}

const findEmailVerificationToken = (token) => {
  return prisma.emailVerificationToken.findUnique({ where: { token } })
}

const deleteEmailVerificationToken = (id) => {
  return prisma.emailVerificationToken.delete({ where: { id } })
}

const markUserVerified = (id) => {
  return prisma.user.update({
    where: { id },
    data: { is_verified: true }
  })
}

const createRefreshToken = (data) => {
  return prisma.refreshToken.create({ data })
}

const findRefreshToken = (token) => {
  return prisma.refreshToken.findUnique({ where: { token } })
}

const revokeRefreshToken = (id) => {
  return prisma.refreshToken.update({
    where: { id },
    data: { revoked_at: new Date() }
  })
}

const createPasswordResetToken = (data) => {
  return prisma.passwordResetToken.create({ data })
}

const findPasswordResetToken = (token) => {
  return prisma.passwordResetToken.findUnique({ where: { token } })
}

const markPasswordResetTokenUsed = (id) => {
  return prisma.passwordResetToken.update({
    where: { id },
    data: { used_at: new Date() }
  })
}

const updateUserPassword = (id, password_hash) => {
  return prisma.user.update({
    where: { id },
    data: { password_hash }
  })
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  createEmailVerificationToken,
  findEmailVerificationToken,
  deleteEmailVerificationToken,
  markUserVerified,
  createRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  createPasswordResetToken,
  findPasswordResetToken,
  markPasswordResetTokenUsed,
  updateUserPassword,
}