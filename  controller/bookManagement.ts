import {NextFunction, Request, Response} from "express";
import {BorrowBookModel} from "../models/BookManage";
import {BookModel} from "../models/Book";
import {LibraryMemberUserModel} from "../models/LibraryMemberUser";
import {Receipt} from "../models/Receipt";
import {mailReceipt, overdueEmail} from "./mailSender";
// import {BorrowBookModel} from "../models/BookManage";
// import {BookModel} from "../model/Book";
// import {Receipt} from "../model/Receipt";
// import {mailReceipt, overdueEmail} from "./mailSender";
// import {UserModel} from "../model/User";
// import {LibraryMemberUserModel} from "../model/LibraryMemberUser";

export const addBookBorrow = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    console.log("Add book borrow function called...........",req.body);
    try {
        const bookBorrowData = new BorrowBookModel(req.body);
        const { bookId, memberId } = bookBorrowData;
        console.log("memberid",memberId)


        const book = await BookModel.findById(bookId);
        const user = await LibraryMemberUserModel.findById({
            _id: memberId
        })


        bookBorrowData.memberEmail = user?.email || "";
        bookBorrowData.bookTitle = book?.title || "";

        const saveBorrow = await bookBorrowData.save();

        if (saveBorrow) {
            //update available book -1
            const getBook = await BookModel.findOne({ _id: bookId });
            if (!getBook) {
                return res.status(400).json({
                    message: "Book not found",
                    status: 400
                });
            }
            if (getBook.availableCopies <= 0) {
                return res.status(400).json({
                    message: "No available copies of this book",
                    status: 400
                });
            }
            getBook.availableCopies = getBook.availableCopies - 1;
            const updateBook = await getBook.save();
            if (updateBook) {
                const receipt:Receipt = {
                    referenceNumber: saveBorrow._id.toString(),
                    bookId: bookBorrowData.bookId.toString(),
                    bookTitle: updateBook.title,
                    memberId: bookBorrowData.memberId.toString(),
                    memberEmail:bookBorrowData.memberEmail,
                    borrowDate: bookBorrowData.borrowDate,
                    returnDate: bookBorrowData.returnDate,
                    payStatus: bookBorrowData.payStatus,
                    payAmount:bookBorrowData.payAmount
                }
                await mailReceipt(receipt)
                return res.status(201).json({
                    message: "Book borrow added successfully",
                    bookBorrow: saveBorrow,
                    status: 201
                });
            }
            return res.status(400).json({
                message: "Book borrow not added",
                status: 400
            });

        }
    } catch (error) {
        console.error("Error adding book borrow:", error);
        next(error);
        return res.status(500).json({
            message: "Internal server error",
            status: 500
        });
    }
}
export const updateBookBorrow = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const borrow = req.body;
    borrow.status = 'returned'
    borrow.payStatus = 'paid'
    console.log("Update book borrow function called with ID:", borrow._id);
    try {
        const existingBorrow = await BorrowBookModel.findById(borrow._id);
        if (!existingBorrow) {
            return res.status(404).json({
                message: "Book borrow not found",
                status: 404
            });
        }
        const updatedBorrow = await BorrowBookModel.findByIdAndUpdate(
            borrow._id,
            borrow,
            { new: true, runValidators: true }
        );
        if (!updatedBorrow) {
            return res.status(400).json({
                message: "Book borrow not updated",
                status: 400
            });
        }
        // If the status is changed to 'returned', update the book's available copies
        if (updatedBorrow.status === "returned") {
            const book = await BookModel.findById(updatedBorrow.bookId);
            if (!book) {
                return res.status(400).json({
                    message: "Book not found",
                    status: 400
                });
            }
            book.availableCopies += 1; // Increment available copies
            await book.save();

            return res.status(200).json({
                message: "Book borrow updated successfully",
                bookBorrow: updatedBorrow,
                status: 200
            });
        }

    } catch (error) {
        console.error("Error updating book borrow:", error);
        next(error);
        return res.status(500).json({
            message: "Internal server error",
            status: 500
        });
    }


}
export const overDueSendEmail = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const borrowBook = req.body;
    console.log("Overdue send email function called with ID:", borrowBook._id);
    try {
        const existingBorrow = await BorrowBookModel.findById(borrowBook._id);
        if (!existingBorrow) {
            console.log("wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww11111111111111111111111")

            return res.status(404).json({
                message: "Book borrow not found",
                status: 404
            });
        }


        const receipt: Receipt = {
            referenceNumber: existingBorrow._id.toString(),
            bookId: existingBorrow.bookId.toString(),
            bookTitle: existingBorrow.bookTitle,
            memberId: existingBorrow.memberId.toString(),
            memberEmail: borrowBook.memberEmail,
            borrowDate: existingBorrow.borrowDate,
            returnDate: existingBorrow.returnDate,
            payStatus: existingBorrow.payStatus,
            payAmount: existingBorrow.payAmount
        };

        console.log("recepit",receipt)

        console.log("Receipt to be sent:", receipt);
        const emailStatus = await overdueEmail(receipt);
        if (emailStatus === 200) {
            return res.status(200).json({
                message: "Overdue email sent successfully",
                status: 200
            });
        } else {
            return res.status(500).json({
                message: "Failed to send overdue email",
                status: 500
            });
        }
    } catch (error) {
        console.error("Error sending overdue email:", error);
        next(error);
        return res.status(500).json({
            message: "Internal server error",
            status: 500
        });
    }

}
export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    console.log("Get all book borrow function called");
    try {
        const bookBorrows = await BorrowBookModel.find();
        if (bookBorrows.length === 0) {
            return res.status(404).json({
                message: "No book borrows found",
                status: 404
            });
        }
        return res.status(200).json({
            message: "Book borrows retrieved successfully",
            bookBorrows,
            status: 200
        });
    } catch (error) {
        console.error("Error retrieving book borrows:", error);
        next(error);
        return res.status(500).json({
            message: "Internal server error",
            status: 500
        });
    }
}
