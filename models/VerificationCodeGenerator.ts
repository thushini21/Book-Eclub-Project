export const VerificationCodeGenerator = () => {
    const randomSixDigit:number = Math.floor(100000 + Math.random() * 900000);
    return randomSixDigit;
}

