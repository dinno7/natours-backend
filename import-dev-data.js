const { select, checkbox, confirm } = require('@inquirer/prompts');
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
        name: '➕ import',
        value: 'import',
        description: "import dev data to a database's collection"
      },
      {
        name: '➖ delete',
        value: 'delete',
        description: 'delete all dev data documents from a database collection'
      },
      {
        name: 'exit',
        value: 'exit',
        description: 'Exit the program'
      }
    ]
  });
  if (action === 'exit') {
    console.clear();
    console.log('✨', 'Good bye...');
    return process.exit();
  }

  let collections = await checkbox({
    message: `Which collection(s) do you want to ${action}`,
    choices: [
      { name: '⚜ Tours', value: { model: Tour, data: tours, name: 'tours' } },
      {
        name: '⚜ Reviews',
        value: { model: Review, data: reviews, name: 'reviews' }
      },
      { name: '⚜ Users', value: { model: User, data: users, name: 'users' } }
    ]
  });

  const collectionNames = collections.map(c => c.name);
  if (action === 'import' && collectionNames.includes('users')) {
    const isCommentUserMiddlewares = await confirm({
      message: 'Are you comment all User model middlewares?'
    });
    if (!isCommentUserMiddlewares) {
      collections = collections.filter(c => c.name !== 'users');
      console.log(
        '❌',
        'The User collection is not valid to import\nbecause passwords encrypted there so you do not access to password for login in development\nPlease first comment all database middlewares in user model.'
      );
      if (collectionNames.length === 1 && collectionNames[0] === 'users')
        return process.exit(1);
    }
  }

  const promises = collections.map(async collection => {
    if (action === 'import') {
      return importData(collection.model, collection.data);
    } else if (action === 'delete') {
      return deleteData(collection.model);
    }
  });
  console.log('🕛', 'Proceeding');
  console.log(' >', 'Please wait...\n');

  await Promise.all(promises);
  process.exit();
})();
