const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('./src/modules/v1/tour/tour.model');

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

// >> Read json file

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/src/static/data/tours-simple.json`)
);

// >> Import data to db
const importData = async () => {
  try {
    await Tour.insertMany(tours);
    console.log('✨', 'Data imported successful.');
  } catch (err) {
    console.log(
      '⭕️ ~ ERROR  ~ in natours: import-dev-data.js at line 42 ~> ❗',
      err.message || ''
    );
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany({});
    console.log('✨', 'Data deleted successful.');
  } catch (err) {
    console.log(
      '⭕️ ~ ERROR  ~ in natours: import-dev-data.js at line 56 ~> ❗',
      err.message || ''
    );
  }
  process.exit();
};

// > Check agrs

if (process.argv[2] == '-i' || process.argv[2] == '--import') importData();
else if (process.argv[2] == '-d' || process.argv[2] == '--delete') deleteData();
else {
  console.log('✨', 'Nothing changed!');
  process.exit();
}
