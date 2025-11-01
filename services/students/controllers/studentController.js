const studentService = require('../services/studentService');

const getStudentByStudentId = async (req, res) => {
    try {
        const student = await studentService.getStudentByStudentId(req.params.studentId);
        if(!student) {
            return res.status(404).json({ message: "Student not found!"});
        }
        return res.json(student);
    } catch (error) {
        return res.status(500).json({ message: error.message});
    }
};

const payTuition = async (req, res) => {
    try {
        const { studentId } = req.body;
        const student = await studentService.payTuition(studentId);

        return res.json({
            success: true,
            message: "Tuition fee paid successfully",
            student,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = { 
    payTuition,
    getStudentByStudentId
};
