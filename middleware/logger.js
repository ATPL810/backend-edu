const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    //It logs the HTTP method, URL, IP address, User-Agent, and request body (for GET/DELETE/POST/PUT requests) of each incoming request.  
    const method = req.method;
    const url = req.url;
    const ip = req.ip || req.connection.remoteAddress;
    
    console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - User-Agent: ${req.get('User-Agent')}`);
    
    // Log request body for POST/PUT requests and indents by 2 spaces
    if (['POST', 'PUT'].includes(method) && req.body) {
        console.log('Request Body:', JSON.stringify(req.body, null, 2));
    }
    // proceed to the next middleware 
    next();
};

module.exports = logger;