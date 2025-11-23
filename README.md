# Backend of the Course Booking System

Student Name: Aayush Tridevrai Pratapsingh Lochun
Student Number: M01004726

In order to get the node_modules folder and the dependencies:

- open terminal in the folder's name
- type 'npm install' and press enter
- All the dependencies will be downloaded and ready to be used
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.1.0",
    "mongodb": "^7.0.0",
    "nodemon": "^3.1.10"
  }

The backend is designed such that to handle staticfiles, logs, API calls from frontend to backend, REST API, and manage MongoDB(Atlas and compass) data via Express.js App.

The Node.js is used as backend server and the REST API is developed with Express.js.

The backend is in the Git repository of [https://github.com/ATPL810/backend-edu]

The deployed backend URL: [https://courses-1n06.onrender.com]

## REST API (Representational State Transfer Application Programming Interface)

This is demonstrated and applied in the server.js file by using routes for lessons(api/lessons),search(api/search) and orders(api/orders). In the lessons route, the GET route was used to return all the lessons from the database, and the as well as for the image(images/***.jpg), if the image is present or not, the staticFiles.js(./middleware/staticFiles) manages it to show a proper message. There are 2 GETs ,1 to return all lessons and 1 return by id for testing purposes. The lessons consist also of a PUT route which can be modified by id where any field can be modified(subject, location, price,spaces, image and description). A POST route also adds new lesson(s) to the lessons table.

Orders consist of GET,POST and DELETE route. Once the user has checked out, a request is made for a POST, the given data is saved in the database. The GET route enables the admin user to see the orders in postman through a GET request(api/orders) and if the admin user wants to  delete an order, a Delete by id request is made(api/orders/:id). It manages also the fetch req for PUT to decrease the number of spaces as well as in the DELETE route to increase number of spaces once order is deleted.

## Search (Search as you type)

The user will type for a word in the frontend searchbox.For each letter that is typed(stroked), the frontend will execute a fetch of the letter or the group of letters to the backend where the search route(api/search?q=) will activate a GET route for all the fetched query(q). This is search as you type functionality. According to the request, aggregate is used by MongoDB to search related fields for the query using 'match', and to go through the fields(subject, location, price, space, description) to be searched, 'or' was used. When the exact word to be searched is entered, it will output only the searched item, else it will display nothing.

## Middleware

This consists of 2 files, logger.js and staticFiles.js.

The logger gives meaningfull messages for during the runtime of the website. It will display all the requests and can even track suspicious requests. It shows what data is being sent.

The staticFile will manage images, if the image does not exist, it will output a json error message else it will continue to express.static and serve the actual image.

## MongoDB

For the deployed project, MongoDB Atlas was used as database to store data for lessons(courses) and order, where MongoDB compass was used as a driver.
The database username is School in which the database name is Booking_courses where there are 2 collections:

1. lessons
    Fields: subject, location, price, spaces, image and description
2. orders
    Fields: name, phone, email, lessonId, subject, price, image, quantity, total

    The lessons information for the order is stored in a lesson array to able to save multiple lessons that have been purchased( it can store multiple lesson Ids with different quantities).

    
