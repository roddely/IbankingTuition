const axios = require("axios");

const transactionModel = require("../models/transactionsModel");

const saveTransaction = async (userId, studentId, amount) => {
    try{
        const createTransaction = await transactionModel.create({ userId, studentId, amount});
        if(createTransaction){
            return{
                status: "success",
                message: "Transaction created successfully",
                transaction: createTransaction
            }
        }
    }
    catch(error){
        throw error;
    }
};

const processTransaction = async (userId, studentId, amount) => {
    try{
        const responseUpdateStudent = await axios.post('http://localhost:5002/api/students/pay',
            {
                studentId
            }
        );
        if(responseUpdateStudent === 200){
            return{
                status: "success",
                message: "UpdateStudent processed successfully",
                transaction: responseUpdateStudent.data
            }
        }
    }
    catch(error){
        throw error;
    }
    try{
        const responseUpdateUser = await axios.post('http://localhost:5001/api/users/updateBalance',
            {
                userId,
                amount
            }
        );
        if(responseUpdateUser !== 200){
            return{
                status: "success",
                message: "UpdateUser processed successfully",
                transaction: responseUpdateUser.data
            }        
        }
    }
    catch(error){
        throw error;
    }
};

const getTransactionByUserId = async (userId) => {
    try{
        const transactionHistory = await transactionModel.find({ userId });
        return transactionHistory;
    }
    catch(error){
        throw error;
    }
};

module.exports = { saveTransaction, processTransaction, getTransactionByUserId };