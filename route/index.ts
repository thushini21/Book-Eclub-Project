import express, { Router } from "express";
import userRoute from "./userRoute";
import bookRoute from "./bookRoute";
import bookBorrowRoute from "./borrowBookRoute";
/*
import bookRoute from "./bookRoute";
*/

const rootRouter = Router();
rootRouter.use('/users',userRoute)
rootRouter.use('/books',bookRoute)
rootRouter.use('/booksBorrow',bookBorrowRoute)

export default rootRouter
