module.exports = {
    Success: { code: 0, message: '成功' },
    Invalid: { code: 1, message: '無效' },
    Fail: { code: 2, message: '失敗' },
    Token_Invalid: { code: 3, message: 'token無效' },
    No_Permission: { code: 4, message: '無權限' },
    Parameter_Error: { code: 5, message: '請求參數有誤' },
    
    // Register
    Register_Fail: { code: 1000, message: '註冊失敗' },
    Register_Account_Invalid: { code: 1001, message: '帳號無效' },
    Register_Password_Invalid: { code: 1002, message: '密碼無效' },

    // Login
    Login_Fail: { code: 2000, message: '登入失敗' },
    Login_Account_Invalid: { code: 2001, message: '帳號無效' },
    Login_Password_Invalid: { code: 2002, message: '密碼無效' },
    Login_Password_Incorrect: { code: 2003, message: '密碼有誤' },

    // Clinic
    Clinic_Search_Fail: { code: 3000, message: '診所搜尋失敗' },
    Clinic_GetForm_Fail: { code: 3001, message: '獲取門診表失敗' },

    // Doctor
    Doctor_List_Fail: { code: 4000, message: '獲取醫生列表失敗' },

    // Reservation
    Reservation_Reserve_Fail: { code: 5000, message: '預約失敗' },
    Reservation_Reserve_Full: { code: 5001, message: '該時段預約人數已滿' },
    Reservation_GetClinicForm_Fail: { code: 5002, message: '獲取門診表失敗' },
    Reservation_GetAvalibleTime_Fail: { code: 5003, message: '獲取可預約的時間失敗' },
}