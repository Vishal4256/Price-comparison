class UserDTO {
  static toResponse(user) {
    if (!user) return null;
    return {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };
  }
}

module.exports = UserDTO;
