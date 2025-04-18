const crypto = require("crypto");

// Generate a 32-byte random string and convert it to hexadecimal
const sessionSecret = crypto.randomBytes(32).toString("hex");

console.log("SESSION_SECRET:", sessionSecret);