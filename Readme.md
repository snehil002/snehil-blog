# Snehil's Little Tech Blog

## Exciting Features
* Authentication - Login, Register
* CRUD - Create, View, Edit and Delete Articles

## How to Run this app?

* Install and Start MongoDB server locally (or online):
  * [Windows](https://www.mongodb.com/docs/v4.4/tutorial/install-mongodb-on-windows-unattended/#run-mongodb-community-edition-as-a-windows-service):
    * In an Admin Command Prompt:
      * `net start MongoDB`, or
      * `net stop MongoDB`
    * Or, Open Task Manager > Services > MongoDB > Right Click > Start
  * [Linux](https://www.mongodb.com/docs/v4.4/administration/install-on-linux/)
* Set SNEHIL_BLOG_PORT and SNEHIL_BLOG_MONGODB_URL env var written in .env file
  * Windows:
    * SET SNEHIL_BLOG_PORT=<desired port number>
    * SET SNEHIL_BLOG_MONGODB_URL=<url at which mongodb is running>
    * SET SNEHIL_BLOG_LIVE_URL=<live url of project>
      * Example: SET SNEHIL_BLOG_LIVE_URL=`http://localhost:4000`
  * Linux:
    * export SNEHIL_BLOG_PORT=production
    * export SNEHIL_BLOG_MONGODB_URL=production
* `npm install`
* `npm start`

## Technologies Used
EJS, Node.js, Express.js, MongoDB, Mongoose.js, Passport.js, HTML, CSS, JS