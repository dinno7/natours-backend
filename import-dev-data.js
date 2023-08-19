const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('./src/modules/v1/tour/tour.model');
const Review = require('./src/modules/v1/review/review.model');

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
  fs.readFileSync(`${__dirname}/src/static/data/tours.json`)
);

const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/src/static/data/reviews.json`)
);

// >> Import data to db
const importData = async (Model, entity) => {
  try {
    await Model.insertMany(entity);
    console.log('✨', 'Data imported successful.');
  } catch (err) {
    console.log(
      '⭕️ ~ ERROR  ~ in natours: import-dev-data.js at line 42 ~> ❗',
      err.message || ''
    );
  }
  process.exit();
};

const deleteData = async Model => {
  try {
    await Model.deleteMany({});
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
if (!process.argv[2] || !process.argv[3]) {
  console.log('✨', 'Nothing changed!\nPlease define action and entity.');
  return process.exit();
}

if (process.argv[2] == '-i' || process.argv[2] == '--import') {
  if (process.argv[3]?.startsWith('tour')) importData(Tour, tours);
  else if (process.argv[3]?.startsWith('review')) importData(Review, reviews);
} else if (process.argv[2] == '-d' || process.argv[2] == '--delete') {
  if (process.argv[3]?.startsWith('tour')) deleteData(Tour);
  else if (process.argv[3]?.startsWith('review')) deleteData(Review);
} else {
  console.log('✨', 'Nothing changed!');
  process.exit();
}

// ?> node import-dev-date.js -i OR node import-dev-date.js -import => Import Tours data in db
// ?> node import-dev-date.js -d OR node import-dev-date.js -delete => Remove all Tours data from db
