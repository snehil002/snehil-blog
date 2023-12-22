# Snehil's Little Tech Blog

## Exciting Features
* Authentication
  * Login using Username and Password
  * Google Authentication
* CRUD - Create, View, Edit and Delete Articles

## How to Run this app?

* Install and Start MongoDB server locally (or online):
  * [Windows](https://www.mongodb.com/docs/v4.4/tutorial/install-mongodb-on-windows-unattended/#run-mongodb-community-edition-as-a-windows-service):
    * In an Admin Command Prompt:
      * `net start MongoDB`, or
      * `net stop MongoDB`
    * Or, Open Task Manager > Services > MongoDB > Right Click > Start
  * [Linux](https://www.mongodb.com/docs/v4.4/administration/install-on-linux/)
* Set the following environment variables:
  * Windows:
    * `SET SNEHIL_BLOG_PORT=<desired port number>`
      * Example: `SET SNEHIL_BLOG_PORT=4000`
    * `SET SNEHIL_BLOG_LIVE_URL=<live url of project with above port number (no trailing slash)>`
      * Example: `SET SNEHIL_BLOG_LIVE_URL=http://localhost:4000`
    * `SET SNEHIL_BLOG_MONGODB_URL=<url at which mongodb is running (no trailing slash)>`
      * Example: `SET SNEHIL_BLOG_MONGODB_URL=mongodb://127.0.0.1:27017`
  * Linux:
    * `export SNEHIL_BLOG_PORT=<desired port number>`
      * Example: `export SNEHIL_BLOG_PORT=4000`
    * `export SNEHIL_BLOG_LIVE_URL=<live url of project with above port number (no trailing slash)>`
      * Example: `export SNEHIL_BLOG_LIVE_URL=http://localhost:4000`
    * `export SNEHIL_BLOG_MONGODB_URL=<url at which mongodb is running (no trailing slash)>`
      * Example: `export SNEHIL_BLOG_MONGODB_URL=mongodb://127.0.0.1:27017`
* `npm install`
* `npm start`

## Technologies Used
EJS, Node.js, Express.js, MongoDB, Mongoose.js, Passport.js, HTML, CSS, JS