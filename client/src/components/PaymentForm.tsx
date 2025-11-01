import axios from "axios";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Alert, AlertDescription } from "./ui/alert";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { LogOut, User, CreditCard, GraduationCap, Shield } from "lucide-react";

interface PaymentFormProps {
  user: any;
  onLogout: () => void;
}

// Define interface for student data (from Student Service)
interface StudentData {
  _id: string; // Đây là ObjectId của sinh viên
  studentId: string; // Mã sinh viên (e.g., ST0001)
  fullName: string;
  phone: string;
  email: string;
  tuitionFee: number;
  balance: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// Define interface for transaction history item (from Payment Service)
interface Transaction {
  _id: string; // MongoDB ObjectId của giao dịch
  userId: string;
  studentId: string; // ObjectId của sinh viên
  studentCode: string; // Mã sinh viên (ví dụ: ST0001)
  amount: number;
  created_at: string;
}

// Fetch transaction history
async function fetchTransactionHistory(userId: string) {
  const api = `http://localhost:5000/api/transactions/${userId}`;
  try {
    const response = await axios.get(api);
    if (!response.data) {
      return [];
    }
    return response.data as Transaction[];
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }
}

export function PaymentForm({ user, onLogout }: PaymentFormProps) {
  const [studentCode, setStudentCode] = useState(""); // Dùng cho input
  const [paymentAmount, setPaymentAmount] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState("");
  const [isGeneratingOtp, setIsGeneratingOtp] = useState(false);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
const [localBalance, setLocalBalance] = useState<number>(Number(user?.balance ?? 0));
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);

  // KHÔNG DÙNG useMemo cho safeUser
  const safeUser = {
    // Lấy ID MongoDB (dùng cho backend)
    id: user?.id || user?._id || user?.uid || "",
    fullName: user?.fullName || user?.fullname || "Unknown User",
    phone: user?.phone || user?.phoneNumber || "N/A",
    email: user?.email || "N/A",
    balance: Number(user?.balance ?? 0),
  };

  const safeStudent = (() => {
    if (!studentData) {
      return {
        _id: "",
        studentId: "",
        fullName: "",
        tuitionFee: 0,
        balance: 0,
      } as Partial<StudentData> & { _id: string, studentId: string, fullName: string, tuitionFee: number, balance: number };
    }
    return studentData;
  })();

  // Transaction History Fetching
  useEffect(() => {
    async function loadTransactionHistory() {
      try {
        if (safeUser.id) {
          const fetchedHistory = await fetchTransactionHistory(safeUser.id);
          setTransactionHistory(fetchedHistory);
        }
      } catch (error) {
        console.error("Error loading transaction history:", error);
      }
    }

    if (safeUser.id) {
      loadTransactionHistory();
    }
  }, [safeUser.id]);

  // Auto-calculate tuition when student code is entered
  useEffect(() => {
    const fetchStudentData = async () => {
      const code = studentCode;

      if (code && code.length >= 5) {
        setIsLoadingStudent(true);
        setError("");

        try {
          const response = await axios.get(
            `http://localhost:5000/api/students/${code}`,
            {
              timeout: 5000,
            }
          );
          const student: StudentData = response.data;

          // Kiểm tra xem ID của sinh viên có phải là ObjectId hợp lệ không
          if (student._id && !student._id.match(/^[0-9a-fA-F]{24}$/)) {
            setError(`Student ID retrieved is not a valid MongoDB ObjectId. ID: ${student._id}`);
            setStudentData(null);
            return;
          }

          setStudentData(student);
          // Auto-set amount
          setPaymentAmount(student.tuitionFee.toString());
          setError("");

        } catch (err: any) {
          setStudentData(null);
          setPaymentAmount("");

          if (err.code === 'ECONNABORTED') {
            setError("Request timeout. Please check if Student Service is running.");
          } else if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
            setError("Cannot connect to Student Service. Please ensure it's running on port 5002.");
          } else if (err.response?.status === 404) {
            setError("Student code not found. Please check and try again.");
          } else {
            setError("Error loading student data. Please try again.");
          }
          console.error("Student fetch error:", err);
        } finally {
          setIsLoadingStudent(false);
        }
      } else if (code.length > 0) {
        setStudentData(null);
        setPaymentAmount("");
        setError("Please enter a complete student code (min 5 characters)");
      } else {
        setStudentData(null);
        setPaymentAmount("");
        setError("");
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchStudentData, 500);
    return () => clearTimeout(timeoutId);
  }, [studentCode]);

  const isFormValid = () => {
    const currentPaymentAmount = parseFloat(paymentAmount || '0');

    return (
      safeUser.id &&
      safeStudent._id && // Đảm bảo student ID tồn tại
      safeStudent._id.match(/^[0-9a-fA-F]{24}$/) && // Đảm bảo Student ID là ObjectId
      safeStudent.tuitionFee > 0 && // Đảm bảo tuition fee đã được fetch
      currentPaymentAmount > 0 &&
      currentPaymentAmount <= safeUser.balance &&
      currentPaymentAmount <= safeStudent.tuitionFee &&
      agreedToTerms &&
      !isLoadingStudent
    );
  };

  const handleConfirmTransaction = async () => {
    if (!isFormValid()) {
      setError("Form is invalid. Check all fields and ensure Student ID is a valid ObjectId.");
      return;
    }

    setShowOtpForm(true);
    setError("");
    setSuccess("");
    setOtpValue("");
    setOtpError("");

    setIsGeneratingOtp(true);

    try {
      const tempTransactionId = `TX-${Date.now()}-${safeUser.id}`;

      await axios.post('http://localhost:5000/api/otp/generate',
        {
          transactionId: tempTransactionId,
          recipientEmail: safeUser.email,
        }
      );

      setCurrentTransactionId(tempTransactionId);

    } catch (err: any) {
      let errorMsg = "Failed to generate OTP. Please try again. Check OTP Service on port 5003.";
      if (err.response) {
        errorMsg = `OTP Service Error: ${err.response.data?.message || 'Internal error.'}`;
      }
      setError(errorMsg);
      setShowOtpForm(false);
    } finally {
      setIsGeneratingOtp(false);
    }
  };

  const handleOtpVerification = async () => {
    if (otpValue.length !== 6) {
      setOtpError("Please enter a 6-digit OTP code");
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError("");

    try {
      const response = await axios.post('http://localhost:5000/api/otp/verify',
        {
          transactionId: currentTransactionId,
          otpCode: otpValue
        }
      );

      if (response.data.success) {
        await processTransaction();
      } else {
        setOtpError(response.data.message || "OTP verification failed. Please try again.");
        setIsVerifyingOtp(false);
        return;
      }
    } catch (error: any) {
      let errorMsg = "Failed to verify OTP. Please try again. Check OTP Service on port 5003.";
      if (error.response?.status === 401) {
        errorMsg = `OTP Service Error (401 Unauthorized): ${error.response.data?.message || 'Invalid OTP or expired.'}`;
      } else if (error.response) {
        errorMsg = `OTP Service Error: ${error.response.data?.message || 'Internal error.'}`;
      }
      setOtpError(errorMsg);
      setIsVerifyingOtp(false);
      return;
    }
  };

  const processTransaction = async () => {
    setIsProcessing(true);

    // Đóng OTP modal
    setShowOtpForm(false);

    const amount = parseFloat(paymentAmount);

    if (!safeStudent._id || !safeUser.id || !safeStudent.studentId) {
      setError("Missing user ID or valid student data. Transaction aborted.");
      setIsProcessing(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/transactions/transaction',
        {
          userId: safeUser.id,
          studentId: safeStudent._id,
          // studentCode: studentCode,
          amount: amount,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        const updatedHistory = await fetchTransactionHistory(safeUser.id);
        setTransactionHistory(updatedHistory);
        setLocalBalance(prev => prev - amount);

        // Lưu ý: user.balance sẽ không được cập nhật trừ khi bạn có hàm updateUserBalance trong PaymentFormProps
        setSuccess(`Payment of $${amount.toFixed(2)} for ${safeStudent.studentId} processed successfully!`);
      } else {
        setError(response.data.message || "Transaction failed");
      }
    } catch (err: any) {
      let errorMsg = "Transaction failed. Please check if Payment Service is running on port 5004.";

      if (err.response?.status === 400) {
        const backendMessage = err.response.data?.message;
        if (backendMessage && (backendMessage.includes("ObjectId") || backendMessage.includes("Invalid"))) {
          errorMsg = `Transaction Failed (400 Bad Request): ${backendMessage}`;
        } else {
          errorMsg = `Transaction Failed (400 Bad Request): Please check the data you sent.`;
        }
      } else if (err.response) {
        errorMsg = `Transaction Service Error: ${err.response.data?.message || 'Internal service error.'}`;
      }
      setError(errorMsg);
      console.error("Transaction POST error:", err);
    }


    setIsProcessing(false);

    // Reset form
    setStudentCode("");
    setStudentData(null);
    setPaymentAmount("");
    setAgreedToTerms(false);
    setOtpValue("");
    setOtpError("");
  };

  const handleCancelOtp = () => {
    setShowOtpForm(false);
    setOtpValue("");
    setOtpError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-inter">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-xl border-t-4 border-blue-600">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Tuition Payment System</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {safeUser.fullName}</p>
          </div>
          <Button variant="outline" onClick={onLogout} className="shadow-md">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {success && (
          <Alert className="border-green-400 bg-green-50 rounded-lg shadow-md">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Payer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input value={safeUser.fullName} disabled className="bg-gray-100" />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input value={safeUser.phone} disabled className="bg-gray-100" />
                  </div>
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input value={safeUser.email} disabled className="bg-gray-100" />
                </div>
                <div className="text-sm text-muted-foreground">
                  This information is automatically filled and cannot be modified.
                </div>
              </CardContent>
            </Card>

            {/* Tuition Information */}
            <Card className="rounded-xl shadow-lg">
              <CardHeader className="bg-gray-50/50 border-b">
                <CardTitle className="flex items-center gap-2 text-xl text-blue-800">
                  <GraduationCap className="w-5 h-5" />
                  Tuition Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="studentCode">Student Code</Label>
                    <Input
                      id="studentCode"
                      value={studentCode}
                      onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
                      placeholder="Enter student code (e.g., ST0001)"
                      className="rounded-lg"
                    />
                    {isLoadingStudent && <p className="text-sm text-blue-500 mt-1">Loading student data...</p>}
                  </div>
                  <div>
                    <Label>Student Name</Label>
                    <Input
                      value={safeStudent.fullName || ""}
                      disabled
                      className="bg-gray-100 rounded-lg"
                      placeholder="Auto-filled when student code is entered"
                    />
                  </div>
                </div>
                <div>
                  <Label>Tuition Amount</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={safeStudent.tuitionFee > 0 ? `$${safeStudent.tuitionFee.toLocaleString('en-US')}` : ""}
                      disabled
                      className="bg-gray-100 rounded-lg"
                      placeholder="Auto-calculated based on student code"
                    />
                    {safeStudent.tuitionFee > 0 && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">Auto-calculated</Badge>
                    )}
                  </div>
                </div>
                {/* Hiển thị Student ID nếu có để tiện debug
                {safeStudent._id && (
                  <div className="text-sm mt-2">
                      <Label>Student MongoDB ID</Label>
                      <Input 
                          value={safeStudent._id} 
                          disabled 
                          className={`font-mono text-xs rounded-lg ${safeStudent._id.match(/^[0-9a-fA-F]{24}$/) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                          title="This ID must be a valid 24-character MongoDB ObjectId."
                      />
                  </div>
                )} */}
                <div className="text-sm text-muted-foreground">
                  Demo student codes: **ST0001, ST0002, ST0003, ST0004, ST0005**
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="rounded-xl shadow-lg">
              <CardHeader className="bg-gray-50/50 border-b">
                <CardTitle className="flex items-center gap-2 text-xl text-blue-800">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Available Balance</Label>
                    <div className="text-2xl font-bold text-green-600">
                      ${safeUser.balance.toLocaleString('en-US')}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="paymentAmount">Payment Amount</Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      max={Math.min(safeUser.balance, safeStudent.tuitionFee)}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter amount to pay"
                      className="rounded-lg"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked: any) => setAgreedToTerms(checked as boolean)}
                      className="rounded"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label htmlFor="terms" className="text-sm font-medium cursor-pointer">
                        I agree to the terms and conditions
                      </label>
                      <p className="text-xs text-muted-foreground">
                        By checking this box, you acknowledge that you have read and agree to our payment terms and conditions.
                      </p>
                    </div>
                  </div>

                  {parseFloat(paymentAmount || '0') > safeUser.balance && (
                    <Alert variant="destructive" className="rounded-lg">
                      <AlertDescription>
                        Payment amount cannot exceed available balance of **${safeUser.balance.toLocaleString('en-US')}**
                      </AlertDescription>
                    </Alert>
                  )}

                  {parseFloat(paymentAmount || '0') > safeStudent.tuitionFee && safeStudent.tuitionFee > 0 && (
                    <Alert variant="destructive" className="rounded-lg">
                      <AlertDescription>
                        Payment amount cannot exceed tuition amount of **${safeStudent.tuitionFee.toLocaleString('en-US')}**
                      </AlertDescription>
                    </Alert>
                  )}

                  {error && (
                    <Alert variant="destructive" className="rounded-lg">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <Button
                  onClick={handleConfirmTransaction}
                  disabled={!isFormValid() || isProcessing || isGeneratingOtp}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-transform transform hover:scale-[1.01]"
                  size="lg"
                >
                  {isGeneratingOtp
                    ? "Requesting OTP..."
                    : isProcessing
                      ? "Processing Transaction..."
                      : "Confirm Transaction"}
                </Button>
              </CardContent>
            </Card>
          </div>
          {/* Sidebar - Transaction History */}
          <div className="space-y-6">
            <Card className="rounded-xl shadow-lg">
              <CardHeader className="bg-gray-50/50 border-b">
                <CardTitle className="text-xl text-gray-800">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {transactionHistory?.slice(0, 5).map((transaction: Transaction) => (
                    <div key={transaction._id} className="flex justify-between items-start text-sm p-2 border-b last:border-b-0">
                      <div className="flex-1">
                        <div className="font-medium">
                          {`Payment from ${safeUser.fullName}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className="font-bold text-red-600">
                        -${transaction.amount.toLocaleString('en-US')}
                      </div>
                    </div>
                  ))}
                  {transactionHistory.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No transactions yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-lg">
              <CardHeader className="bg-gray-50/50 border-b">
                <CardTitle className="text-xl text-gray-800">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Available Balance:</span>
                    <span className="font-bold text-green-600">${safeUser.balance.toLocaleString('en-US')}</span>
                  </div>
                  {safeStudent.tuitionFee > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tuition Amount:</span>
                        <span className="font-medium">${safeStudent.tuitionFee.toLocaleString('en-US')}</span>
                      </div>
                      {paymentAmount && (
                        <>
                          <Separator className="my-2" />
                          <div className="flex justify-between text-lg font-bold text-blue-600">
                            <span>Total Payment:</span>
                            <span>${parseFloat(paymentAmount).toLocaleString('en-US')}</span>
                          </div>
                          {safeUser.balance >= parseFloat(paymentAmount) && (
                            <div className="flex justify-between text-xs text-green-500">
                              <span>New Balance:</span>
                              <span>${(safeUser.balance - parseFloat(paymentAmount)).toLocaleString('en-US')}</span>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* OTP Verification Modal */}
        <Dialog open={showOtpForm} onOpenChange={setShowOtpForm}>
          <DialogContent className="sm:max-w-md rounded-xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 justify-center text-2xl text-blue-600">
                <Shield className="w-6 h-6" />
                OTP Verification
              </DialogTitle>
              <DialogDescription className="text-center">
                Please enter the 6-digit OTP code sent to **{safeUser.email}** to confirm your transaction.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="text-center">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otpValue}
                    onChange={(value: any) => setOtpValue(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              {otpError && (
                <Alert variant="destructive" className="rounded-lg">
                  <AlertDescription>{otpError}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={handleCancelOtp}
                  disabled={isVerifyingOtp || isProcessing}
                  className="rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleOtpVerification}
                  disabled={otpValue.length !== 6 || isVerifyingOtp || isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md"
                >
                  {isVerifyingOtp ? "Verifying..." : isProcessing ? "Processing..." : "Verify & Pay"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
