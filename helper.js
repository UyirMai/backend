import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

export async function hashPassword(password) {
  try {
    const salting = await bcrypt.genSalt(10);
    const hashing = await bcrypt.hash(password, salting);
    return hashing;
  } catch (err) {
    console.error("Error hashing password:", err);
    throw new Error("Hashing failed");
  }
}
export async function comparepassword(password,user) {
  try {
    const isMatch = await bcrypt.compare(password,user.password);
    return isMatch;
  } catch (err) {
    console.error("Error comparing passwords:", err);
    return false;
  }
}

export async function genjwt(user) {
  const secret = process.env.jwt_secret;
  try {
    const token = jwt.sign(
      { userid: user.userid, password: user.password, role: user.role },
      secret
    );
    return token;
  } catch (err) {
    console.error("Error generating JWT:", err);
    throw new Error("JWT generation failed");
  }
}
//jwt for user
export async function genjwtforuser(user) {
  const secret = process.env.jwt_secret;
  try {
    const token = jwt.sign(
      { userid:user._id,useremail: user.email},
      secret
    );
    return token;
  } catch (err) {
    console.error("Error generating JWT:", err);
    throw new Error("JWT generation failed");
  }
}
function verifytoken(token){
      const secret = process.env.jwt_secret;
    try{
        const decode=jwt.verify(token,secret)
        return decode;
    }catch(err){
        throw new Error("Token verification failed");
    }
}

export async function authenticate(req,res,next){
    try{
        const token=req.headers.authorization;
        if(!token){
            return res.status(401).send("Unauthorized access: No token provided");
        }
        const decoded = verifytoken(token);
        req.user = decoded;
        next();
    }catch(err){
        console.error("Authentication error:", err);
        return res.status(401).send("Unauthorized access");
    }
}

export  function authorize(...roles){
    try{
        return (req, res, next) => {
            if (!req.user || !roles.includes(req.user.role)) {
                return res.status(403).send("Forbidden: You do not have permission to access this resource");
            }
            next();
        };
    }catch(err){
        console.error("Authorization error:", err);
        throw new Error("Authorization failed");
    }
}
//to generate a 6 digit code
export async function gencode(){
  try{
    const digit= Math.floor(100000+Math.random()*900000).toString();
    return digit
  }catch(error){
    console.log("Error Generating code")
  }
}

//to generate sku
export const generateSKU = (productName, category, variant) => {
  const nameCode = productName.toUpperCase().slice(0, 4); // first 4 letters
  const categoryCode = category.toUpperCase().slice(0, 3); // first 3 letters of category

  if (variant) {
    const variantCode = variant.toUpperCase().replace(/\s+/g, "");
    return `${categoryCode}-${nameCode}-${variantCode}`;
  }

  return `${categoryCode}-${nameCode}`;
};

