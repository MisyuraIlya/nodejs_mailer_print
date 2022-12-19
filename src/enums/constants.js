require("dotenv").config();

const auth = {
  type: "OAuth2",
  user: "nurlight1992ltd@gmail.com",
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  refreshToken: process.env.REFRESH_TOKEN,
};

const mailoptions = {
  from: "Siddhant &lt;sid.cd.varma@gmail.com>",
  to: "sid.cd.varma@gmail.com",
  subject: "Gmail API NodeJS",
};

module.exports = {
  auth,
  mailoptions,
};