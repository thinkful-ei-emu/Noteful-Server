const knex=require('knex');
const app = require('./app');

const {PORT ,DB_URL} = require('./config');


const db=knex({
  client:'pg',
  connection:process.env.DATABSE_URL,

});

app.set('db',db);

app.listen(PORT, () => {
  
});


