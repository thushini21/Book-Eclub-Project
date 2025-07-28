import {Router} from "express";
import {authenticate} from "../middleware/authenticate";
import {addBook, deleteBook, getAllBook, getBook, updateBook} from "../ controller/bookController";

const bookRoute = Router();
bookRoute.post("/addBook",authenticate,addBook);
bookRoute.put("/updateBook/:id",authenticate, updateBook);
bookRoute.delete("/deleteBook/:id",authenticate, deleteBook);
bookRoute.get("/getAll",authenticate, getAllBook);
bookRoute.get("/getBook",authenticate, getBook);
export default bookRoute;
