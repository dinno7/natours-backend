const mongoose = require('mongoose');
const app = require('./src/app');

// - Inject environment variables
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

let DB;
if (process.env.NODE_ENV === 'development') {
  DB = process.env.DB_URL_LOCAL;
} else {
  DB = process.env.DB_URL.replace(
    /<USERNAME>/,
    process.env.DB_USERNAME
  ).replace(/<PASSWORD>/, process.env.DB_PASSWORD);
}

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('✨', 'Mogodb connected successful.'))
  .catch(err =>
    console.log('⭕️ ~ ERROR  ~ in natours: server.js at line 21 ~> ❗', err)
  );

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('Listening on port ', PORT);
});
