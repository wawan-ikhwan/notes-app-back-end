const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;
  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const finished = pageCount === readPage;

  const newBook = {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
    id,
    insertedAt,
    updatedAt,
    finished,
  };

  books.push(newBook);

  // validating
  const isBookValid = books.filter((book) => book.id === id).length > 0;
  const isNameValid = name !== undefined;
  const isPageValid = readPage <= pageCount;

  // jika semua data valid
  const isSuccess = isBookValid && isNameValid && isPageValid;

  let response = h.response({ // respon bawaan
    status: 'error',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  if (!isPageValid) {
    response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    books.pop(); // batalkan
    return response;
  }
  if (!isNameValid) {
    response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    books.pop(); // batalkan
    return response;
  }
  if (isSuccess) {
    response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }
  books.pop(); // batalkan
  return response;
};

const getAllBooksHandler = (request) => {
  const { reading, finished } = request.query; // OPSIONAl
  let { name } = request.query;
  if (name !== undefined) {
    name = name.toLowerCase();
  } else {
    name = null;
  }
  const newBooks = [];
  if (reading !== undefined || finished !== undefined || name !== null) {
    books.forEach((book) => { // SUPPORT MULTI QUERY
      if (Number(book.reading) === Number(reading)
      || Number(book.finished) === Number(finished)
      || book.name.toLowerCase().includes(name)) {
        newBooks.push({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        });
      }
    });
  } else {
    books.forEach((book) => {
      newBooks.push({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      });
    });
  }
  return {
    status: 'success',
    data: {
      books: newBooks,
    },
  };
};

const getBookByIdHandler = (request, h) => {
  let response = h.response({ // respon bawaan
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);

  const { bookId } = request.params;

  const book = books.filter((n) => n.id === bookId)[0];
  if (book !== undefined) {
    response = h.response({
      status: 'success',
      data: {
        book,
      },
    });
    response.code(200);
    return response;
  }
  return response;
};

const editBookByIdHandler = (request, h) => {
  let response = h.response({ // respon bawaan
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });

  response.code(404);
  const { bookId } = request.params;

  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;
  const updatedAt = new Date().toISOString();

  const index = books.findIndex((book) => book.id === bookId);

  // validating
  const isNameValid = name !== undefined;
  const isPageValid = readPage < pageCount;

  if (!isPageValid) {
    response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }
  if (!isNameValid) {
    response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }
  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };
    response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
