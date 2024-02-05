import {Router} from "express";
import {ProductWithoutId} from "../types";
import {imagesUpload} from "../multer";
import mysqlDb from "../mysqlDb";
import {ResultSetHeader, RowDataPacket} from "mysql2";
const productsRouter = Router();


productsRouter.get('/', async (req, res, next) => {
  try {
    const [results] = await mysqlDb.getConnection().query(
        'SELECT p.id, p.title, p.price, p.image, c.name category_name FROM products p ' +
        'LEFT JOIN shop.categories c on p.category_id = c.id'
    );

    res.send(results);
  } catch (e) {
    return next(e);
  }
});

productsRouter.get('/:id', async (req, res) => {
  const [results] = await mysqlDb.getConnection().query(
      'SELECT p.id, p.title, p.price, p.image, c.name category_name FROM products p ' +
      'LEFT JOIN shop.categories c on p.category_id = c.id ' +
      'WHERE p.id = ?',
      [req.params.id]
  ) as RowDataPacket[];

  const product = results[0];

  if (!product) {
    return res.status(404).send({error: 'Not found!'});
  }

  res.send(product);
});

productsRouter.post('/', imagesUpload.single('image'), async (req, res) => {
  const product: ProductWithoutId = {
    title: req.body.title,
    price: parseFloat(req.body.price),
    description: req.body.description,
    image: req.file ? req.file.filename : null,
    categoryId: parseInt(req.body.categoryId),
  };

  const [result] = await mysqlDb.getConnection().query(
      'INSERT INTO products (category_id, title, price, description, image)' +
      'VALUES (?, ?, ?, ?, ?)',
      [product.categoryId, product.title, product.price, product.description, product.image],
  ) as ResultSetHeader[];

  console.log(result.insertId);

  res.send({
    id: result.insertId,
    ...product,
  });
});


export default productsRouter;