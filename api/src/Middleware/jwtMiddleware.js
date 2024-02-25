/* to get encryption key */
const hkdf = require("@panva/hkdf");
const jose = require("jose");
const { SECRET } = require("../constants");
const jwtMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            return res.status(401).json({error: 'Unauthorized'});
        }

        const token = authHeader.replace('Bearer ', '');
        // we need to replace this with env value
        //const secret = "gBsuHo9HV6D4zrF+HtLBQ1C8n9W7h37W5beOuDXBw0A="
    
        const encryptionSecret = await hkdf.hkdf("sha256", SECRET, "",  "NextAuth.js Generated Encryption Key", 32);
        const {payload} = await jose.jwtDecrypt(token, encryptionSecret);
        console.log("\nJWT AUTHENTICATED SUCCESSFULLY!\n\nJWT payload is:", payload);
        next();
    }
    catch (err) {
        console.log("Error with authentication in backend:", err);
        return res.status(401).json({error: 'Unauthorized'});
    }
}

module.exports = jwtMiddleware;
