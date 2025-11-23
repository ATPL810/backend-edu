# Backend of the Course Booking System

The backend is designed such as to handle staticfiles, logs, API calls from frontend to backend, REST API, and manage MongoDB(Atlas and compass) data via Express.js App.

The Node.js is used as backend server and the REST API is developed with Express.js.

The backend is 

The backend is in the Git repository of [https://github.com/ATPL810/backend-edu]

The deployed backend URL: [https://courses-1n06.onrender.com]

## REST API ( Representational State Transfer Application Programming Interface)

This is demonstrated and applied in the server.js file by using routes for lessons(api/lessons),search(api/search) and orders(api/orders). In the lessons route, the GET route was used to return all the lessons from the database, and the as well as for the image(images/***.jpg), if the image is present or not, the staticFiles.js(./middleware/staticFiles) manages it to show a proper message. There are 2 GETs ,1 to return all lessons and 1 return by id for testing purposes. The lessons consist also of a PUT route which can be modified by id where any field can be modified(subject, location, price,spaces, image and description). A POST route also adds new lesson(s) to the lessons table.

Orders consist of GET,POST and DELETE route. Once the user has checked out, a request is made for a POST, the given data is saved in the database. The GET route enables the admin user to see the orders in postman through a GET request(api/orders) and if the admin user wants to  delete an order, a Delete by id request is made(api/orders/:id)

Search
