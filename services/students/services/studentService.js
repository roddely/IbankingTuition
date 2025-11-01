const studentModel = require('../models/studentModel');

/**
 * Lấy thông tin sinh viên theo studentId (MSSV)
 */
const getStudentByStudentId = async (studentId) => {
  return await studentModel.findOne({ studentId });
};

/**
 * Thanh toán toàn bộ học phí
 */
const payTuition = async (studentId) => {
    const student = await studentModel.findById(studentId);
    if(!student) throw new Error("Student not found!");


    if(student.status === "paid") {
        throw new Error("Tuition fee has already been paid!");
    }
    student.status = "paid"; 
    await student.save();
    return student;
}

module.exports = { 
    payTuition,
    getStudentByStudentId
};
