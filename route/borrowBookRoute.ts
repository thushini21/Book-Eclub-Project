import {Router} from "express";
import {authenticate} from "../middleware/authenticate";
import {addBookBorrow, getAll, overDueSendEmail, updateBookBorrow} from "../ controller/bookManagement";

const bookBorrowRoute = Router();
bookBorrowRoute.post('/saveBorrowBook',authenticate,addBookBorrow);
bookBorrowRoute.get('/getAll',authenticate,getAll);
bookBorrowRoute.post('/updateBorrowBook',authenticate,updateBookBorrow);
bookBorrowRoute.post('/overDueBorrowBook',authenticate,overDueSendEmail);

export default bookBorrowRoute;