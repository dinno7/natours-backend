const { select, checkbox } = require('@inquirer/prompts');
const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('./src/modules/v1/tour/tour.model');
const Review = require('./src/modules/v1/review/review.model');
const User = require('./src/modules/v1/user/user.model');

// - Inject environment variables
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

async function connectToDatabase() {
  let DB;
  if (process.env.NODE_ENV === 'development') {
    DB = process.env.DB_URL_LOCAL;
  } else {
    DB = process.env.DB_URL.replace(
      /<USERNAME>/,
      process.env.DB_USERNAME
    ).replace(/<PASSWORD>/, process.env.DB_PASSWORD);
  }

  try {
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log('✨', 'Mogodb connected successful.');
  } catch (err) {
    console.log('\n❌ ~ ERROR  ~ in natours: server.js at line 21 ~> ❗', err);
    process.exit(1);
  }
}

// >> Read json file

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/src/static/data/tours.json`, 'utf-8')
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/src/static/data/reviews.json`, 'utf-8')
);

// ? All user password is test1234
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/src/static/data/users.json`, 'utf-8')
);

// >> Import data to db
const getModelName = Model => Model?.modelName || '';
const importData = async (Model, entity) => {
  try {
    await Model.create(entity, { validateBeforeSave: false });
    console.log('🔰', `${getModelName(Model)} dev data imported successful.`);
  } catch (err) {
    console.log(
      '❌ ~ ERROR  ~ in natours: import-dev-data.js at line 42 ~> ❗',
      err.message || ''
    );
  }
};

const deleteData = async Model => {
  try {
    await Model.deleteMany({});
    console.log('⭕', `${getModelName(Model)} documents deleted successful.`);
  } catch (err) {
    console.log(
      '❌ ~ ERROR  ~ in natours: import-dev-data.js at line 56 ~> ❗',
      err.message || ''
    );
  }
};

(async () => {
  await connectToDatabase();
  const action = await select({
    message: 'Select a action',
    choices: [
      {
        name: 'import',
        value: 'import',
        description: "import dev data to a database's collection"
      },
      {
        name: 'delete',
        value: 'delete',
        description: 'delete all dev data documents from a database collection'
      }
    ]
  });

  const collections = await checkbox({
    message: `Which collection(s) do you want to ${action}`,
    choices: [
      { name: 'Tours', value: { model: Tour, data: tours } },
      { name: 'Reviews', value: { model: Review, data: reviews } },
      { name: 'Users', value: { model: User, data: users } }
    ]
  });

  const promises = collections.map(collection => {
    if (action === 'import') {
      return importData(collection.model, collection.data);
    } else if (action === 'delete') {
      return deleteData(collection.model);
    }
  });
  console.log('🕛', 'Proceeding...');
  await Promise.all(promises);
  process.exit();
})();
