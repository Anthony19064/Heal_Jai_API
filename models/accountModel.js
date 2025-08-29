const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  username: String,
  password: String,
  mail: String,
  photoURL: String,
  googleId: String,
  refreshToken : String,
}, { versionKey: false });

const Account = mongoose.model('account', AccountSchema);

module.exports = Account;