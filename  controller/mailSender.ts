import express,{Response,Request,NextFunction} from "express";

import dotenv from "dotenv";
import {ApiError} from "../Errors/ApiError";
import {errorHandler} from "../middleware/errorHandle";
import {User} from "../models/User";
import nodemailer from "nodemailer";
import {Receipt} from "../models/Receipt";

dotenv.config();


export const mailSender = async (userModel:User) =>{
    try {

        const ToEmail = userModel.email;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: (process.env.E_MAIL),
                pass: (process.env.PASSWORD)
            }
        })

        const mailOptions = {
            from: (process.env.E_MAIL),
            to: ToEmail,
            subject: 'Verification Code',
            text: `Your verification code is ${userModel.verificationCode}`
        };

        const info = await transporter.sendMail(mailOptions);
        const code:number = 200
        const code_1:number = 404

        if(info){
             console.log("Email sent: " + info.response);
             return code
         }else{
            return code_1
        }


    }catch (error:any) {
       console.log("Network error check your internet connection")
    }
}

export const mailReceipt = async (receiptModel: Receipt) => {
    try {
        const ToEmail = receiptModel.memberEmail;
        const referenceId = receiptModel.referenceNumber;
        const bookId = receiptModel.bookId;
        const bookTitle = receiptModel.bookTitle;
        const memberId = receiptModel.memberId;
        const borrowDate = receiptModel.borrowDate.toLocaleDateString();
        const returnDate = receiptModel.returnDate.toLocaleDateString();
        const payStatus = receiptModel.payStatus;
        const payAmount = receiptModel.payAmount;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.E_MAIL,
                pass: process.env.PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.E_MAIL,
            to: ToEmail,
            subject: `Library Receipt - ${referenceId}`,
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .logo {
                        max-width: 150px;
                    }
                    .receipt-container {
                        border: 1px solid #e0e0e0;
                        border-radius: 8px;
                        padding: 25px;
                        background-color: #f9f9f9;
                    }
                    .receipt-title {
                        text-align: center;
                        color: #2c3e50;
                        margin-bottom: 20px;
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .receipt-details {
                        margin-bottom: 30px;
                    }
                    .detail-row {
                        display: flex;
                        margin-bottom: 10px;
                    }
                    .detail-label {
                        font-weight: bold;
                        width: 150px;
                        color: #555;
                    }
                    .detail-value {
                        flex: 1;
                    }
                    .total-row {
                        border-top: 1px solid #e0e0e0;
                        padding-top: 15px;
                        margin-top: 15px;
                        font-weight: bold;
                        font-size: 18px;
                    }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        font-size: 12px;
                        color: #777;
                    }
                    .status-paid {
                        color: #27ae60;
                        font-weight: bold;
                    }
                    .status-pending {
                        color: #e67e22;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="https://example.com/logo.png" alt="Library Logo" class="logo">
                    <h1>Library Management System</h1>
                </div>
                
                <div class="receipt-container">
                    <div class="receipt-title">Book Borrowing Receipt</div>
                    
                    <div class="receipt-details">
                        <div class="detail-row">
                            <div class="detail-label">Receipt Number:</div>
                            <div class="detail-value">${referenceId}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Member ID:</div>
                            <div class="detail-value">${memberId}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Book ID:</div>
                            <div class="detail-value">${bookId}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Book Title:</div>
                            <div class="detail-value">${bookTitle}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Borrow Date:</div>
                            <div class="detail-value">${borrowDate}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Return Date:</div>
                            <div class="detail-value">${returnDate}</div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-label">Payment Status:</div>
                            <div class="detail-value">
                                <span class="${payStatus === 'paid' ? 'status-paid' : 'status-pending'}">
                                    ${payStatus.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div class="detail-row total-row">
                            <div class="detail-label">Amount Paid:</div>
                            <div class="detail-value">$${payAmount.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Thank you for using our library services.</p>
                    <p>For any questions, please contact support@library.com</p>
                    <p>© ${new Date().getFullYear()} Library Management System. All rights reserved.</p>
                </div>
            </body>
            </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        const code: number = 200;
        const code_1: number = 404;

        if (info) {
            console.log("Email sent: " + info.response);
            return code;
        } else {
            return code_1;
        }
    } catch (error) {
        console.error("Error sending email:", error);
        return 500; // Internal Server Error
    }
};

export const overdueEmail = async (receiptModel: Receipt) => {
    console.log(receiptModel);
    const ToEmail = receiptModel.memberEmail;
    const referenceId = receiptModel.referenceNumber;
    const bookId = receiptModel.bookId;
    const bookTitle = receiptModel.bookTitle;
    const memberId = receiptModel.memberId;
    const borrowDate = receiptModel.borrowDate.toLocaleDateString();
    const returnDate = receiptModel.returnDate.toLocaleDateString();
    const payStatus = receiptModel.payStatus;
    const payAmount = receiptModel.payAmount;

    const transporter =nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.E_MAIL,
            pass: process.env.PASSWORD
        }
    })

    const mailOptions = {
        from: process.env.E_MAIL,
        to: ToEmail,
        subject: `Overdue Notice - ${referenceId}`,
        html: `
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                .container { max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; }
                h2 { color: #d9534f; }
                p { font-size: 16px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Overdue Notice</h2>
                <p>Dear User,</p>
                <p>Your borrowed book is overdue. Please return it as soon as possible.</p>
                <p><strong>Reference Number:</strong> ${referenceId}</p>
                <p><strong>Book ID:</strong> ${bookId}</p>
                <p><strong>Book Title:</strong> ${bookTitle}</p>
                <p><strong>Member ID:</strong> ${memberId}</p>
                <p><strong>Borrow Date:</strong> ${borrowDate}</p>
                <p><strong>Return Date:</strong> ${returnDate}</p>
                <p><strong>Payment Status:</strong> ${payStatus}</p>
                <p><strong>Amount Due:</strong> $${payAmount.toFixed(2)}</p>
                <p>Please contact us if you have any questions.</p>
            </div>
        </body>
        </html>`
    }


    try {
        const info = await transporter.sendMail(mailOptions);
        const code: number = 200;
        const code_1: number = 404;

        if (info) {
            console.log("Overdue email sent: " + info.response);
            return code;
        } else {
            return code_1;
        }
    } catch (error) {
        console.error("Error sending overdue email:", error);
        return 500;
    }

}