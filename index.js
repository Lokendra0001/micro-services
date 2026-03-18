const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = 3002;
const productsFilePath = path.join(__dirname, "data", "products.json");

const readProducts = () => {
  try {
    if (!fs.existsSync(productsFilePath)) {
      fs.mkdirSync(path.dirname(productsFilePath), { recursive: true });
      fs.writeFileSync(productsFilePath, "[]");
    }
    return JSON.parse(fs.readFileSync(productsFilePath, "utf8"));
  } catch (error) {
    return [];
  }
};

const writeProducts = (products) => {
  fs.mkdirSync(path.dirname(productsFilePath), { recursive: true });
  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), "utf8");
};

app.get("/", (req, res) => {
  res.json(readProducts());
});

app.get("/:id", (req, res) => {
  const products = readProducts();
  const product = products.find((p) => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

app.post("/", (req, res) => {
  const { name, price, description } = req.body;
  if (!name || price === undefined)
    return res.status(400).json({ error: "Name and price required" });

  const products = readProducts();
  const newProduct = {
    id: Date.now(),
    name,
    price,
    description: description || "",
  };

  products.push(newProduct);
  writeProducts(products);

  res.status(201).json({ message: "Product created", product: newProduct });
});

app.listen(PORT, () => {
  console.log(`[Product Service] Running on http://localhost:${PORT}`);
});
