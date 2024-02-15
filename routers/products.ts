import { Router } from 'express';
import mongoose, { Types } from 'mongoose';
import { ProductMutation } from '../types';
import { imagesUpload } from '../multer';
import Product from '../models/Product';

const productsRouter = Router();

productsRouter.get('/', async (_req, res, next) => {
  try {
    const results = await Product.find().populate(
      'category',
      'title description',
    );

    res.send(results);
  } catch (e) {
    return next(e);
  }
});

productsRouter.get('/:id', async (req, res, next) => {
  try {
    let _id: Types.ObjectId;
    try {
      _id = new Types.ObjectId(req.params.id);
    } catch {
      return res.status(404).send({ error: 'Wrong ObjectId!' });
    }

    const product = await Product.findById(_id);

    if (!product) {
      return res.status(404).send({ error: 'Not found!' });
    }

    res.send(product);
  } catch (e) {
    next(e);
  }
});

productsRouter.post(
  '/',
  imagesUpload.single('image'),
  async (req, res, next) => {
    try {
      const productData: ProductMutation = {
        category: req.body.category,
        title: req.body.title,
        price: parseFloat(req.body.price),
        description: req.body.description,
        image: req.file ? req.file.filename : null,
      };

      const product = new Product(productData);
      await product.save();

      res.send(product);
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        return res.status(422).send(e);
      }

      next(e);
    }
  },
);

export default productsRouter;
