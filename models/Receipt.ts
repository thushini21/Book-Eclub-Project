export type Receipt = {
    referenceNumber:string,
    bookId: string;
    bookTitle: string;
    memberId: string;
    memberEmail: string;
    borrowDate: Date;
    returnDate: Date;
    payStatus: "paid" | "lending";
    payAmount: number;
}