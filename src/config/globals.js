require('dotenv').config()

module.exports = {
  MONGO_URL: process.env.MONGO_URL || '',
  EXP_TIME: process.env.EXP_TIME || 60000,
  PORT: process.env.PORT || 8080
}
