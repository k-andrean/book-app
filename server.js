const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const Book = require('./book');
const validateBook = require('./bookValidator');

const app = express();
const port = 3000;

mongoose.connect('your-mongodb-connection-string', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB...'))
  .catch((err) => console.error('Could not connect to MongoDB...', err));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(express.json());

app.use(helmet());

app.use(limiter);

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Create a Book
app.post('/books', async (req, res) => {
  const { error } = validateBook(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    let book = new Book({ title: req.body.title, author: req.body.author });
    book = await book.save();
    res.send(book);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get All Books
app.get('/books', async (req, res) => {
  const books = await Book.find();
  res.send(books);
});

// Get a Single Book
app.get('/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).send('Book not found');
    res.send(book);
  } catch (err) {
    console.error('Error updating book:', err); // Log the error
    res.status(500).send('Something went wrong');
  }
});

// Update a Book
app.put('/books/:id', async (req, res) => {
  const { error } = validateBook(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title, author: req.body.author },
      { new: true },
    );
    if (!book) return res.status(404).send('Book not found');
    res.send(book);
  } catch (err) {
    console.error('Error updating book:', err); // Log the error
    res.status(500).send('Something went wrong');
  }
});

// Delete a Book
app.delete('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndRemove(req.params.id);
    if (!book) return res.status(404).send('Book not found');
    res.status(204).send();
  } catch (err) {
    console.error('Error updating book:', err); // Log the error
    res.status(500).send('Something went wrong');
  }
});
