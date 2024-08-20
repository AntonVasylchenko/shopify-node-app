function notFoundMiddleware(req, res) {
    res.status(404).send("Roure does not exist");
  }
  
  export default notFoundMiddleware;
  