import express from "express";
import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
dotenv.config();
//import multer from "multer";
//import cron from "node-cron";
import fs from "fs";
import path from "path";
//import { v4 as uuidv4 } from "uuid";

import {
  addToCart,
  checkexistinguser,
  getDataforDashboard,
  getInventory,
  getInventoryinorder,
  getOrderHistory,
  getOrderHistorybyuser,
  getotherproducts,
  getProductByName,
  getProducts,
  getPurchase,
  getPurchaseHistory,
  getSimilarproducts,
  gettingcartdata,
  getUser,
  getUserdata,
  insertingaddress,
  insertingInventory,
  insertingProduct,
  insertingPurchase,
  insertinguser,
  //insertingPurchase,
  insertOrder,
  insertUser,
  Screenshot,
  Screenshotdelete,
  Screenshottofind,
  setcode,
  toDeleteinventory,
  toDeleteProduct,
  togetallProduct,
  togetinventory,
  togetOrder,
  togetProduct,
  togetProducts,
  toPutData,
  updateInventory,
  updateOrderStatus,
  updateproduct,
  updateuser,
  updateuserprofile,
  updatingInventory,
  userData,
  //updatingProduct,
} from "./queries.js";
import {
  authenticate,
  authorize,
  comparepassword,
  gencode,
  generateSKU,
  // generateOrderId,
  genjwt,
  genjwtforuser,
  hashPassword,
} from "./helper.js";

export const router = express.Router();

/*routes for client side */

/*user registertion*/
router.post("/userregister", async (req, res) => {
  const { name, email, phone, password } = req.body.registeruser;
  if (!name || !email || !phone || !password) {
    return res.status(400).send("Invalid Data");
  }
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const checkuser = await checkexistinguser(normalizedEmail);
    if (checkuser) {
      return res.status(409).send("User already exist");
    }
    const passhash = await hashPassword(password);
    if (!passhash) {
      return res.status(500).send("Internal server error");
    }
    const newUser = {
      name: name,
      email: normalizedEmail,
      phone: phone,
      password: passhash,
    };
    const registering = await insertinguser(newUser);
    if (!registering) {
      return res.status(500).send("Internal server error");
    }
    res.status(200).send("User Registered successfully");
  } catch (error) {
    res.status(500).send("Internal server Error");
  }
});
/*login */
router.post("/userlogin", async (req, res) => {
  const { email, password } = req.body;
  const user = await getUserdata(email);
  if (!user) {
    return res.status(404).send("User not Exist");
  }
  const comparing = await comparepassword(password, user);
  if (!comparing) {
    return res.status(401).send("Invalid Credentials");
  }
  const token = await genjwtforuser(user);
  res.status(200).json({
    success: true,
    message: "Login Successful",
    user,
    token,
  });
});
/*forgotpassword */ //pending work
router.post("/forgotpassword", async (req, res) => {
  const { email } = req.body.reset;
  if (!email) {
    return res.status(400).send("Invalid data");
  }
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const checkuser = await checkexistinguser(normalizedEmail);
    if (checkuser) {
      const code = await gencode();
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.email,
          pass: process.env.password,
        },
      });

      const mailoption = {
        from: process.env.email,
        to: normalizedEmail,
        subject: "Password Reset Code",
        text: `Enter the following code to reset your password: ${code} Or click this link: http://localhost:5173/reset-password`,
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Password Reset Request</h2>
        <p>Enter the following <b>code</b> to reset your password:</p>
        <h3 style="color:#2c3e50;">${code}</h3>
        <p>Or simply click the link below:</p>
        <a href="http://localhost:5173/resetpassword?email=${email}"
   style="display:inline-block; padding:10px 15px; background:#007bff; color:#fff; text-decoration:none; border-radius:5px;">
  Reset Password
</a>
</div> `,
      };

      try {
        const info = await transporter.sendMail(mailoption);
        const setcodeindb = await setcode(email, code);
        console.error(setcodeindb);
        return res.json({ message: "Code sent to email", code });
      } catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: "Failed to send email" });
      }
    } else {
      return res.status(404).send("Email Not Found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});
//to reset password
router.post("/resetpassword", async (req, res) => {
  const { email, code, password } = req.body;
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const getuser = await checkexistinguser(normalizedEmail);
    if (!getuser) {
      return res.status(500).send("Internal Server Error");
    }
    const passhash = await hashPassword(password);
    if (!passhash) {
      return res.status(500).send("Internal server error");
    }
    if (getuser.code === code) {
      const updatepassword = await updateuser(email, passhash);
      if (!updatepassword) {
        return res.status(500).send("Internal Server Error");
      }
      return res.status(200).send("Password reset successfull");
    }
  } catch (error) {
    console.log(error);
    return false;
  }
});
//update profile
/*router.post("/updateprofile",async(req,res)=>{
  try{
    
    const data=req.body;
    const updateprofile=await updateuserprofile(data);
    if(!updateprofile|| updateprofile.length===0){
      return res.status(404).send("user not found");
    }
    res.status(200).send("Update successful")
  }catch(error){
    console.log(error);
    res.status(500).send("Internal server error")
  }
})*/
router.put("/updateprofile", async (req, res) => {
  try {
    const data = req.body;

    const updateprofile = await updateuserprofile(data);

    // check for "no match"
    if (!updateprofile) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Update successful",
      updatedUser: updateprofile, // send back updated doc if useful
    });
  } catch (error) {
    console.error("❌ Error in /updateprofile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//post address
router.post("/putaddress", authenticate, async (req, res) => {
  try {
    const address = req.body;
    const user = req.user;
    const insetaddress = await insertingaddress(address);
    if (!insetaddress || insetaddress.length === 0) {
      return res.status(500).send("Failed to insert");
    }
    res.status(200).send("Adrres added successfull");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});
//to get profile
router.get("/getprofile", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const id = user.userid;
    const getuserdata = await userData(id);
    if (!getuserdata) {
      return res.status(404).send("User not found");
    }
    res.status(200).json(getuserdata);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

/*getting data for cart*/
router.get("/getcartdata", authenticate, async (req, res) => {
  try {
    const user = req.user;

    // Fetch cart data by userId from token
    const getcart = await gettingcartdata(user.userid);

    if (!getcart || getcart.length === 0) {
      return res.status(404).send("No Items in cart");
    }

    // Collect all productIds from cart docs
    const productIds = getcart.flatMap((item) => item.productIds);

    if (!productIds || productIds.length === 0) {
      return res.status(404).send("No Items in cart");
    }

    // Convert to ObjectId and fetch products
    const getproduct = await togetProducts(productIds);
    if (!getproduct || getproduct.length === 0) {
      return res.status(404).send("No Items in cart");
    }

    res.status(200).json(getproduct);
  } catch (error) {
    console.error("Error in /getcartdata:", error);
    return res.status(500).send("Internal server error");
  }
});

//to get order data
router.get("/myorders", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const orders = await getOrderHistorybyuser(user.userid);
    if (!orders || orders.length === 0) {
      return res.status(404).send("No orders found");
    }
    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

/*addto cart*/
router.post("/addtocart/:id", authenticate, async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  try {
    const gettingproduct = await togetProduct(id);
    if (!gettingproduct) {
      return res.status(404).send("Product Not Found");
    }

    const addingtocart = await addToCart(user.userid, id);
    if (!addingtocart) {
      return res.status(400).send("Unable to add to cart");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("internal server error");
  }
});
/*product page */
//get products by category
router.get("/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const products = await getProducts(category);
    if (!products || products.length === 0) {
      return res.status(404).send("No products found for this category");
    }
    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching category:", err);
    res.status(500).send("Internal server error");
  }
});
//to get product by id
router.get("/productdetails/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const products = await togetProduct(id);
    if (!products || products.length === 0) {
      return res.status(404).send("No products found for this category");
    }
    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching category:", err);
    res.status(500).send("Internal server error");
  }
});


/*product details in order page*/
//to get similar or other products
router.get("/order/similarproducts", async (req, res) => {
  try {
    const { category, Id } = req.query;
    const Similarproducts = await getSimilarproducts(category, Id);
    if (!Similarproducts) {
      res.status(404).send("Products Not found");
    }
    res.status(200).json(Similarproducts);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});
//to get other or other products
router.get("/order/othercategoryproducts", async (req, res) => {
  try {
    const { category } = req.query;
    const Otherproducts = await getotherproducts(category);
    if (!Otherproducts) {
      res.status(404).send("Products Not found");
    }
    res.status(200).json(Otherproducts);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});
//get product by id
router.get("/product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const productData = await togetProduct(id);
    if (!productData) {
      return res.status(404).send("Product not found");
    }
    res.status(200).json(productData);
  } catch (error) {
    console.error("Error fetching product by id:", error);
    res.status(500).send("Internal server error");
  }
});

//to place order
/*router.post("/placeorder",authenticate, async (req, res) => {
   const user = req.user;
  try {
    const { orderdetails } = req.body;
    const fulldetails = {
      UserId: user.userid,
      ...orderdetails,
     // orderId: orderId,
      OrderedAt: new Date(),
    };
    //order details
    //to insert order details
    const orderDetail = await insertOrder(fulldetails);
    if (!orderDetail) {
      return res.status(400).send("Failed to process order");
    }

    const productnames = orderdetails.products.map((p) => p.product);
    //get inventory
    const gettinginventory = await getInventoryinorder(productnames);
    for (const p of orderdetails.products) {
      const invDoc = gettinginventory.find((doc) => doc.product === p.product);
      if (!invDoc) {
        console.log(`No inventory record found for product ${p.product}`);
        continue;
      }

      // calculate new quantity
      const updatedQuantity = invDoc.Quantity - p.quantity;
      // update inventory
      await updateInventory(p.product, -p.quantity); // use negative value with $inc
    }
    res.status(201).send("Order placed successfully");
  } catch (error) {
    console.error("Error processing order:", error);
    return res.status(500).send("Internal server error");
  }
});*/
router.post("/placeorder", authenticate, async (req, res) => {
  const user = req.user;

  try {
    const { orderdetails } = req.body;


    const fulldetails = {
      UserId: user.userid,
      ...orderdetails,
      OrderedAt: new Date(),
    };

    // Insert order details
    const orderDetail = await insertOrder(fulldetails);
    if (!orderDetail) {
      return res.status(400).send("Failed to process order");
    }

    // Get all product names + variants from the order
    const productVariantPairs = orderdetails.products.map((p) => ({
      product: p.productname,
      variants: p.variants || null, // fallback if no variant
    }));

    // Fetch inventory documents for all ordered products and variants
    const gettinginventory = await getInventoryinorder(productVariantPairs);


    // Reduce quantity for each ordered product
    for (const p of orderdetails.products) {
      const invDoc = gettinginventory.find(
        (doc) =>
          doc.product === p.productname &&
          (doc.variants || null) === (p.variants || null)
      );

      if (!invDoc) {
        console.log(
          `No inventory record found for ${p.productname} ${p.variants || ""}`
        );
        continue;
      }

      const updatedQuantity = invDoc.Quantity - p.quantity;
      if (updatedQuantity < 0) {
        console.log(
          `Not enough inventory for ${p.productname} ${p.variants || ""}`
        );
        continue; // or handle as out-of-stock
      }

      await updateInventory(invDoc._id, -p.quantity); // reduce quantity
      console.log(
        `Inventory updated for ${p.productname} ${p.variants || ""}: -${
          p.quantity
        }`
      );
    }

    res.status(201).send("Order placed successfully");
  } catch (error) {
    console.error("Error processing order:", error);
    return res.status(500).send("Internal server error");
  }
});

//all products for user side
/*router.get("/product",async(req,res)=>{
  try{
    const productData=await getallProducts();
    
    res.status(200).json(productData || []);
  }catch(err){
    console.error("Error fetching products:", err);
    res.status(500).send("Internal server error");  
  }
})*/

//Admin side routes
/*login api */

//login route
router.post("/login", async (req, res) => {
  const { userid, password } = req.body;
  const user = await getUser(userid);
  if (!user) {
    return res.status(404).send("User not Exist");
  }
  const comparing = await comparepassword(password, user);
  if (!comparing) {
    return res.status(401).send("Invalid Credentials");
  }
  const token = await genjwt(user);
  res.status(200).json({
    success: true,
    message: "Login Successful",
    user,
    token,
  });
});

/*dsahboard  api*/
//dashboard data
router.get(
  "/loggedin/dashboard",
  authenticate,
  authorize("owner"),
  async (req, res) => {
    try {
      //to get dashboard data
      const dashboardData = await getDataforDashboard();
      // const dashboardData=await getInventory();
      if (!dashboardData || dashboardData.length === 0) {
        return res.status(404).send("No dashboard data found");
      }
      res.status(200).json(dashboardData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      res.status(500).send("Internal server error");
    }
  }
);
//get product to edit product
router.get(
  "/loggedin/product/:id",
  authenticate,
  authorize("owner"),
  async (req, res) => {
    try {
      const { id } = req.params;
      //to get product by id
      const product = await togetinventory(id);
      if (!product) {
        return res.status(404).send("Product not found");
      }
      res.status(200).json(product);
    } catch (error) {
      console.error("Error fetching product by id:", error);
      res.status(500).send("Internal server error");
    }
  }
);
//to put edited product details
router.put(
  "/loggedin/product/:id",
  authenticate,
  authorize("owner"),
  async (req, res) => {
    const { id } = req.params;
    const { editedProduct } = req.body;
    try {
      const putProduct = await toPutData(editedProduct, id);
      if (!putProduct) {
        return res.status(404).send("Failed to update.");
      }
      res.status(200).send(putProduct);
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server Error");
    }
  }
);
//to delete inventory data
router.delete("/loggedin/dashboard/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid product ID" });
    }
    //to delete product by id
    const deleteProduct = await toDeleteinventory(id);

    if (!deleteProduct) {
      return res.status(404).send({
        success: false,
        message: "Product not found or already deleted",
      });
    }

    res
      .status(200)
      .send({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
});
/*inventory api */

router.post("/loggedin/inventory", authenticate, async (req, res) => {
  try {
    const {
      product,
      category,
      quantity,
      price,
      size,
      color,
      quantityType,
      foodVariant,
    } = req.body;

    // Validation
    if (!product || !category || !quantity  || !price) {
      return res.status(400).send("Missing required fields");
    }

    // ✅ Build variant info for SKU
    let variant = null;
    if (category === "Wear") {
      variant = `${size || ""}-${color || ""}`;
    } else if (category === "Food") {
      variant = `${quantityType || ""}-${foodVariant || ""}`;
    }

    // ✅ Generate unique SKU
    const sku = generateSKU(product, category, variant);

    // ✅ Check if inventory already exists
    const existingInventory = await getInventory(sku);

    if (!existingInventory) {
      // New Inventory Entry
      const newInventory = {
  SKU:sku,
  product,
  Category:category,
  Quantity: Number(quantity),
  Price: Number(price),
  ...(category === "Wear" && { size, color }),
  ...(category === "Food" && { quantityType, foodVariant }),
  date: new Date(),
};


      const insertingInventorydata = await insertingInventory(newInventory);
      if (!insertingInventorydata) {
        return res.status(400).send("Failed to add inventory");
      }

      return res.status(201).send("Inventory added successfully");
    } else {
      // Update existing inventory (increase quantity)
      const updatedQuantity = existingInventory.quantity + Number(quantity);

      const updateInventory = await updatingInventory(sku, updatedQuantity);
      if (!updateInventory) {
        return res.status(400).send("Failed to update inventory quantity");
      }

      return res.status(201).send("Inventory quantity updated successfully");
    }
  } catch (error) {
    console.error("Error handling inventory:", error);
    res.status(500).send("Internal server error");
  }
});

/*purchase api*/
//to get purchase history
router.get(
  "/loggedin/purchasehistory",
  authenticate,
  authorize("owner"),
  async (req, res) => {
    try {
      //to get purchase history
      const getHistory = await getPurchaseHistory();

      if (!getHistory || getHistory.length === 0) {
        return res.status(404).send("No purchase history found");
      }

      // Format purchasedAt for each record
      const formattedHistory = getHistory.map((purchase) => {
        const d = new Date(purchase.Date);

        return {
          ...purchase,
          //date: d.toISOString().split("T")[0],               // e.g. "2025-08-20"
          //time: d.toTimeString().split(" ")[0],              // e.g. "04:07:41"
          // OR use locale if you want nice format:
          date: d.toLocaleDateString("en-GB"), // "20/08/2025"
          time: d.toLocaleTimeString("en-US"), // "4:07:41 AM"
        };
      });
      res.status(200).json(formattedHistory);
    } catch (err) {
      console.error("Error fetching purchase history:", err);
      res.status(500).send("Internal server error");
    }
  }
);
//to add inventory or to update product while inserting purchase
router.post(
  "/loggedin/purchase",
  authenticate,
  authorize("owner"),
  async (req, res) => {
    try {
      const {
        product,
        category,
        quantity,
        supplier,
        price,
        //variant,
        size,
        color,
        quantityType,
        foodVariant,
      } = req.body;
      const quantityNumber = Number(quantity);
      const priceNumber = Number(price);

      if (
        !product ||
        !category ||
        !quantityNumber ||
        quantityNumber <= 0 ||
        !supplier ||
        priceNumber <= 0
      ) {
        return res.status(400).send("Invalid purchase data");
      }

      // build SKU differently for each category
      let sku;
      if (category === "Wear") {
        sku = generateSKU(product, category, `${size}${color}`);
      } else if (category === "Food") {
        sku = generateSKU(product, category, `${foodVariant} ${quantityType}`);
      } else {
        sku = generateSKU(product, category);
      }

     const newInventory = {
  product,
  Category: category,
  Quantity: quantityNumber,
  Price: priceNumber,
  SKU: sku,
  ...(category === "Wear" && { size, color }),
  ...(category === "Food" && { quantityType, foodVariant }),
};

const newPurchase = {
  product,
  Category: category,
  Quantity: quantityNumber,
  Supplier: supplier,
  Price: priceNumber,
  Date: new Date(),
  SKU: sku,
  ...(category === "Wear" && { size, color }),
  ...(category === "Food" && { quantityType, foodVariant }),
};

      // ✅ Check inventory using SKU (unique per product+variant)
      const getInventorydata = await getInventory(sku);

      const getpurchasedata = await getPurchase(sku);

      if (!getInventorydata && !getpurchasedata) {
        // Insert new inventory + purchase
        const insertingInventorydata = await insertingInventory(newInventory);
        if (!insertingInventorydata) {
          return res.status(400).send("Failed to add purchase");
        }

        const insertingPurchasedata = await insertingPurchase(newPurchase);
        if (!insertingPurchasedata) {
          return res.status(400).send("Failed to add purchase");
        }

        res.status(201).send("Purchase added successfully");
      } else {

        const id = getInventorydata._id;

        // Insert purchase log
        const insertingPurchasedata = await insertingPurchase(newPurchase);
        if (!insertingPurchasedata) {
          return res.status(400).send("Failed to add purchase");
        }

        // Update inventory quantity
        const updateInventory = await updatingInventory(id, quantityNumber);
        if (!updateInventory) {
          return res.status(400).send("Failed to update inventory quantity");
        }

        res.status(201).send("Product Quantity updated successfully");
      }
    } catch (err) {
      console.error("Error in /loggedin/purchase:", err);
      res.status(500).send("Internal server error");
    }
  }
);

/*product api */
//to get products
router.get(
  "/loggedin/products",
  authenticate,
  authorize("owner"),
  async (req, res) => {
    try {
      const products = await togetallProduct();
      if (!products) {
        return res.status(404).send("no products found");
      }
      res.status(200).json(products);
    } catch (err) {
      console.error("Error adding product:", err);
      res.status(500).send("Internal server error");
    }
  }
);
//to add products
router.post(
  "/loggedin/addingproduct",
  authenticate,
  authorize("owner"),
  async (req, res) => {
    try {
      //const { productname, description, category, price, img } = req.body;
      const payload = req.body;
      /*const Product =
        payload.productname.charAt(0).toUpperCase() +
        payload.productname.slice(1).toLowerCase();
      const Category =
        category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
*/

      const isproductExist = await getProductByName(payload);

      if (!isproductExist) {
        const insertProduct = await insertingProduct(payload);
        if (!insertProduct) {
          return res.status(400).send("Failed to add product");
        }
        return res.status(201).send("Product added successfully");
      }
    } catch (err) {
      console.error("Error adding product:", err);
      res.status(500).send("Internal server error");
    }
  }
);
//to delete product data
router.delete(
  "/loggedin/product/:id",
  authenticate,
  authorize("owner"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .send({ success: false, message: "Invalid product ID" });
      }
      //to delete product by id
      const deleteProduct = await toDeleteProduct(id);

      if (!deleteProduct) {
        return res.status(404).send({
          success: false,
          message: "Product not found or already deleted",
        });
      }

      res
        .status(200)
        .send({ success: true, message: "Product deleted successfully" });
    } catch (err) {
      console.error("Error deleting product:", err);
      res
        .status(500)
        .send({ success: false, message: "Internal server error" });
    }
  }
);
//get product by id to edit loggedin/products/${id}
router.get("/loggedin/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    //to get product by id
    const productData = await togetProduct(id);
    if (!productData) {
      return res.status(404).send("Product not found");
    }
    res.status(200).json(productData);
  } catch (error) {
    console.error("Error fetching product by id:", error);
    res.status(500).send("Internal server error");
  }
});
//to edit product details
router.put(
  "/loggedin/products/:id",
  authenticate,
  authorize("owner"),
  async (req, res) => {
    const { id } = req.params;
    const { editedProduct } = req.body;

    try {
      const putProduct = await updateproduct(editedProduct, id);
      if (!putProduct) {
        return res.status(404).send("Failed to update.");
      }
      res.status(200).send(putProduct);
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server Error");
    }
  }
);

/*order api */
//to get order history
router.get(
  "/loggedin/orderhistory",
  authenticate,
  authorize("owner"),
  async (req, res) => {
    try {
      //to get order history
      const getHistory = await getOrderHistory();
      if (!getHistory || getHistory.length === 0) {
        return res.status(404).send("No order history found");
      }
      // Format purchasedAt for each record
      const formattedHistory = getHistory.map((order) => {
        const d = new Date(order.orderedAt);

        return {
          ...order,
          //date: d.toISOString().split("T")[0],               // e.g. "2025-08-20"
          //time: d.toTimeString().split(" ")[0],              // e.g. "04:07:41"
          // OR use locale if you want nice format:
          date: d.toLocaleDateString("en-GB"), // "20/08/2025"
          time: d.toLocaleTimeString("en-US"), // "4:07:41 AM"
        };
      });
      res.status(200).json(formattedHistory);
    } catch (err) {
      console.error("Error fetching order history:", err);
      res.status(500).send("Internal server error");
    }
  }
);
//Update order status
router.put(
  "/loggedin/order/:id/status",
  authenticate,
  authorize("owner"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      //to get order by id
      const getorder = await togetOrder(id);
      if (!getorder) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (!["processing", "shipped", "delivered"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // update DB
      const updated = await updateOrderStatus(id, status);
      if (!updated) return res.status(404).json({ message: "Order not found" });
      res.status(200).json({ message: "Order status updated & WhatsApp sent" });
    } catch (err) {
      console.error("Error updating status:", err);
      res.status(500).send("Internal server error");
    }
  }
);

/* */
//route to authorize or rgister by  owner
router.post("/register", async (req, res) => {
  const { userid, password, role } = req.body;
  try {
    const existingUser = await getUser(userid);
    if (existingUser) {
      return res.status(400).send("User already exists");
    }
    const hashedpassword = await hashPassword(password);
    const userData = {
      userid: userid,
      password: hashedpassword,
      role: role,
      createdAt: new Date(),
    };
    await insertUser(userData);
    res.status(201).send("User registered successfully");
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).send("Internal server error");
  }
});

export default router;
