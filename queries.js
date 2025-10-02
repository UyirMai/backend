import { MongoClient, ObjectId } from "mongodb";
import * as dotenv from "dotenv";
dotenv.config();

const mongo = process.env.MONGO_URL;


async function connectToMongo() {
  const client = new MongoClient(mongo);
  await client.connect();
  console.log("Connected to MongoDB");
  return client;
}

const client = await connectToMongo();


/*register query*/ //userdata collection for user data storing
export async function insertinguser(newUser) {
  try {
    return await client.db("uyirmai").collection("userdata").insertOne(newUser);
  } catch (error) {
    return false;
  }
}
//to check user already exist or not
export async function checkexistinguser(email) {
  try {
    return client
      .db("uyirmai")
      .collection("userdata")
      .findOne({ email: email });
  } catch (error) {
        return false;
  }
}

//query to get client data by id
export async function userData(id) {
  try {
    return await client
      .db("uyirmai")
      .collection("userdata")
      .findOne({ _id: new ObjectId(id) });
  } catch (error) {
    return false;
  }
}
//update user profile data
export async function updateuserprofile(data) {
  const { _id, ...updatedata } = data;
  try {
    return await client
      .db("uyirmai")
      .collection("userdata")
      .findOneAndUpdate(
        { _id: new ObjectId(_id) },
        { $set: { updatedata, updatedAt: new Date() } },
        { returnDocument: "after" }
      );
  } catch (error) {
    return false;
  }
}
//inserting address
export async function insertingaddress(address){
  try{
    return await client
      .db("uyirmai")
      .collection("address")
      .insertOne(address); 
  }catch(error){
    return false
  }
}

/*login query */
// Find user by userid
export async function getUser(userid) {
  return await client
    .db("uyirmai")
    .collection("user")
    .findOne({ userid: userid });
}
export async function getUserdata(email) {
  try {
    return await client
      .db("uyirmai")
      .collection("userdata")
      .findOne({ email: email });
  } catch (error) {
    return false;
  }
}
/*set ocde in db */
export async function setcode(email, code) {
  try {
    return await client
      .db("uyirmai")
      .collection("userdata")
      .findOneAndUpdate({ email: email }, { $set: { code: code } });
  } catch (error) {
    return false;
  }
}
/*reset password query*/
export async function updateuser(email, newpass) {
  try {
    return await client
      .db("uyirmai")
      .collection("userdata")
      .findOneAndUpdate(
        { email: email },
        {
          $set: { password: newpass },
          $unset: { code: "" },
        },
        { returnDocument: "after" }
      );
  } catch (err) {
    return false;
  }
}
/*query to store file url */
export async function Screenshot(email, fileUrl) {
  try {
    return await client
      .db("uyirmai")
      .collection("payment")
      .insertOne({ email: email, fileurl: fileUrl, createdAt: new Date() });
  } catch (error) {
    return false;
  }
}
/*query to find screenshot */
export async function Screenshottofind(expiryDate) {
  try {
    return await client
      .db("uyirmai")
      .collection("payment")
      .find({ createdAt: { $lt: expiryDate } })
      .toArray();
  } catch (error) {
    return false;
  }
}
/*query to delete schreenshot */
export async function Screenshotdelete(ids) {
  try {
    return await client
      .db("uyirmai")
      .collection("payment")
      .deleteMany({ _id: { $in: ids } });
  } catch (error) {
    return false;
  }
}

/*queries used for admin page */
/*dsahboard queries*/
//get dashboard data
export async function getDataforDashboard() {
  try {
    return await client.db("uyirmai").collection("inventory").find().toArray();
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    return false;
  }
}
//to get product from inventory by id to edit
export async function togetinventory(id) {
  try {
    return client
      .db("uyirmai")
      .collection("inventory")
      .findOne({ _id: new ObjectId(id) });
  } catch (err) {
    return false;
  }
}
//to update inventory by id
export async function toPutData(editedProduct, id) {
  try {
    const { _id, ...updateFields } = editedProduct;
    return await client
      .db("uyirmai")
      .collection("inventory")
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updateFields });
  } catch (error) {
    return false;
  }
}
//delete inventory
export async function toDeleteinventory(id) {
  try {
    return await client
      .db("uyirmai")
      .collection("inventory")
      .findOneAndDelete({ _id: new ObjectId(id) });
  } catch (err) {
    return false;
  }
}

/*purchase queries */
//get purchase history
export async function getPurchaseHistory() {
  try {
    return await client
      .db("uyirmai")
      .collection("purchase")
      .find()
      .sort({ purchasedAt: -1 })
      .toArray();
  } catch (err) {
    console.error("Error fetching purchase history:", err);
    return false;
  }
}
//get inventory
export async function getInventory(product) {
  try {
    return await client
      .db("uyirmai")
      .collection("inventory")
      .findOne({ product: product });
  } catch (err) {
    console.error("Error fetching inventory:", err);
    return false;
  }
}
//get inventory for order endpoint
export async function getInventoryinorder(productnames) {
  try {
    return await client
      .db("uyirmai")
      .collection("inventory")
      .find({ product: { $in: productnames } })
      .toArray(); // convert cursor to array
  } catch (err) {
    console.error("Error fetching inventory:", err);
    return false;
  }
}
//insert incentory
export async function insertingInventory(newInventory) {
  try {
    return await client
      .db("uyirmai")
      .collection("inventory")
      .insertOne(newInventory);
  } catch (err) {
    console.error("Error inserting inventory:", err);
    return false;
  }
}
//to update inventory quantity
export async function updatingInventory(id, quantity) {
  try {
    return await client
      .db("uyirmai")
      .collection("inventory")
      .updateOne(
        { _id: id },
        { $inc: { Quantity: quantity }, $set: { UpdatedAt: new Date() } }
      );
  } catch (err) {
    console.error("Error inserting inventory:", err);
    return false;
  }
}
//get purchase by product to update
export async function getPurchase(product) {
  try {
    return await client
      .db("uyirmai")
      .collection("purchase")
      .findOne({ product: product })
      .toArray();
  } catch (err) {
    console.error("Error fetching purchase history:", err);
    return false;
  }
}
//inserting purchase
export async function insertingPurchase(newPurchase) {
  try {
    return client.db("uyirmai").collection("purchase").insertOne(newPurchase);
  } catch (error) {
    console.error("Error inserting product:", err);
    return false;
  }
}

/*product query*/
//to get all product
export async function togetallProduct() {
  try {
    return await client.db("uyirmai").collection("products").find().toArray();
  } catch (err) {
    console.error("Error inserting product:", err);
    return false;
  }
}
//get product by name
export async function getProductByName(product) {
  try {
    return await client
      .db("uyirmai")
      .collection("products")
      .findOne({ product: product });
  } catch (err) {
    console.error("Error inserting product:", err);
    return false;
  }
}
//inserting new product
export async function insertingProduct(newProduct) {
  try {
    return await client
      .db("uyirmai")
      .collection("products")
      .insertOne(newProduct);
  } catch (err) {
    console.error("Error inserting product:", err);
    return false;
  }
}
//to delete product
export async function toDeleteProduct(id) {
  return await client
    .db("uyirmai")
    .collection("products")
    .findOneAndDelete({ _id: new ObjectId(id) });
}
//to updateproduct
export async function updateproduct(editedProduct, id) {
  try {
    const { _id, ...updateFields } = editedProduct;
    return await client
      .db("uyirmai")
      .collection("products")
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updateFields });
  } catch (error) {
    return false;
  }
}

/*order api */
//get order history
export async function getOrderHistory() {
  try {
    return await client
      .db("uyirmai")
      .collection("orders")
      .find()
      .sort({ orderedAt: -1 })
      .toArray();
  } catch (err) {
    console.error("Error fetching order history:", err);
    return false;
  }
}
//get order by id
export async function togetOrder(id) {
  try {
    return await client
      .db("uyirmai")
      .collection("orders")
      .findOne({ _id: new ObjectId(id) });
  } catch (err) {
    console.error("Error fetching order:", err);
    return false;
  }
}
//update  order status
export async function updateOrderStatus(id, status) {
  try {
    return await client
      .db("uyirmai")
      .collection("orders")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: status, updatedAt: new Date() } }
      );
  } catch (err) {
    console.error("Error updating order status:", err);
    return false;
  }
}
export async function getOrderHistorybyuser(id){
  try{
    return await client
      .db("uyirmai")
      .collection("orders")
      .find({ UserId: id })
      .toArray();
  }catch(error){
    return false;
  }
}

/*queries used for client side */
//to get product by category
export async function getProducts(category) {
  try {
    return await client
      .db("uyirmai")
      .collection("products")
      .find({ category: category })
      .toArray();
  } catch (error) {
    console.error("Error fetching products:", error);
    return false;
  }
}

/*product details in order page */
//get product by id
export async function togetProduct(id) {
  try {
    return await client
      .db("uyirmai")
      .collection("products")
      .findOne({ _id: new ObjectId(id) });
  } catch (err) {
    console.error("Error inserting product:", err);
    return false;
  }
}
//multiple product fro cart using map
/*export async function togetProducts(productIds) {
  const objectIds = productIds.map(id => new ObjectId(id));
  return await client
    .db("uyirmai")
    .collection("products")
    .find({ _id: { $in: objectIds } })
    .toArray();
}*/

//to getSimilarproducts
export async function getSimilarproducts(category, Id) {
  try {
    return await client
      .db("uyirmai")
      .collection("products")
      .find({
        category: category,
        _id: { $ne: new ObjectId(Id) },
      })
      .toArray();
  } catch (err) {
    return false;
  }
}
//to get other product
export async function getotherproducts(category){
  try{
    return await client
      .db("uyirmai")
      .collection("products")
        .find({ category: { $ne: category } }) 
      .toArray(); 
  }catch(error){
    return false;
  }
}
//insering order
export async function insertOrder(fulldetails) {
  try {
    return await client
      .db("uyirmai")
      .collection("orders")
      .insertOne(fulldetails);
  } catch (err) {
    console.error("Error inserting product:", err);
    return false;
  }
}

//add to cart
export async function addToCart(userId, productId) {
  try {
    return await client
      .db("uyirmai")
      .collection("cart")
      .updateOne(
        { userId: userId },
        { $addToSet: { productIds: new ObjectId(productId) } },
        { upsert: true }
      );
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
}
//get cart data
export async function gettingcartdata(userId) {
  try {
    return await client
      .db("uyirmai")
      .collection("cart")
      .find({ userId: userId })
      .toArray();
  } catch (error) {
    return false;
  }
}
export async function togetProducts(productIds) {
  const objectIds = productIds.map((id) => new ObjectId(id));
  return await client
    .db("uyirmai")
    .collection("products")
    .find({ _id: { $in: objectIds } })
    .toArray();
}

//getinventory palced in purchase query above

//to update inventory quantity after order placed
/*export async function updateInventory(id, quantity) {
  try {
    return await client
      .db("uyirmai")
      .collection("inventory")
      .updateOne(
        { id: new ObjectId(id) },
        { $inc: { Quantity: quantity }, $set: { UpdatedAt: new Date() } }
      );
  } catch (error) {
    console.error("Error updating inventory:", error);
    return false;
  }
}*/
export async function updateInventory(product, quantityChange) {
  try {
    const result = await client
      .db("uyirmai")
      .collection("inventory")
      .updateOne(
        { product: product },
        {
          $inc: { Quantity: quantityChange },
          $set: { UpdatedAt: new Date() },
        }
      );
    return result;
  } catch (error) {
    return false;
  }
}

// Insert new user
export async function insertUser(userData) {
  try {
    return await client.db("uyirmai").collection("user").insertOne(userData);
  } catch (error) {
    console.error("Error inserting user:", error);
    return false;
  }
}

//to get all product
/*export async function getallProducts() {
  try {
    return await client.db("uyirmai").collection("products").find().toArray();
  } catch (error) {
    console.error("Error fetching products:", error);
    return false;
  }
}
*/
