module.exports = {
    Success: { code: 0, message: '成功' },
    Invalid: { code: 1, message: '無效' },
    Fail: { code: 2, message: '失敗' },

    // Token
    Token_Invalid: { code: 1000, message: 'token無效' },
    
    // Register
    Register_Fail: { code: 2000, message: '註冊失敗' },
    Register_UserId_Invalid: { code: 2001, message: '帳號無效' },
    Register_Password_Invalid: { code: 2002, message: '密碼無效' },

    // Login
    Login_Fail: { code: 3000, message: '登入失敗' },
    Login_UserId_Invalid: { code: 3001, message: '帳號無效' },
    Login_Password_Invalid: { code: 3002, message: '密碼無效' },
    Login_Password_Incorrect: { code: 3003, message: '密碼有誤' },

    // Search
    Search_Fail: { code: 4000, message: '搜尋失敗' },
    Search_Type_Invalid: { code: 4001, message: '類型無效' }
}