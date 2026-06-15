function toPublicUser(user) {
    if (!user) return null;
    const { password_hash, reset_token, reset_token_expiry, ...publicUser } = user;
    return publicUser;
}

function toPublicUsers(users) {
    if (!users) return [];
    return users.map(toPublicUser);
}

module.exports = { toPublicUser, toPublicUsers };
