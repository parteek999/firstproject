
const DAO = require('../DAOManager').queries,
    mail = require('../DAOManager').mail,
    Config = require('../Config'),
    ERROR = Config.responseMessages.ERROR,
    TokenManager = require('../Libs/TokenManager'),
    Models = require('../Models'),
    Bcrypt = require('bcryptjs'),
    Libs = require('../Libs/notification');



const signup = async (payload) => {
     const { email } = payload
    let query = {
        email
    };
    // console.log(query);
     let result = await DAO.getData(Models.Users, query, { _id: 1, fullName: 1, isVerified: 1 }, { limit: 1 });
    //  console.log(result._id);
    // console.log(result);
    // console.log(result.length);
    // if (result.isverified === true) { throw "email is already verified" };
    if (result.length) {
        throw ERROR.EMAIL_ALREADY_EXIST;
    }

    payload.password = Bcrypt.hashSync(payload.password, Config.APP_CONSTANTS.SERVER.SALT);
    let final = await DAO.saveData(Models.Users, payload);
    //console.log(final)
    console.log(final._id)
    // var otp = await Libs.OTP(payload.phoneNo)
    // console.log(otp)
    var ot=1234;
    const query1={otp:ot}
    console.log(query1)
    const data = await DAO.findAndUpdate(Models.Users, { _id:final._id}, query1,{new:true});
    console.log(data)

    return {
        data
    }
}
const login = async (payload) => {

    try {
        const { email, password } = payload;
        const query = {
            email,isVerified:true,
        };
        const result = await DAO.getDataOne(Models.Users, query, {});
        console.log(result);
        if (result === null) throw ERROR.INVALID_CREDENTIALS;
        const checkPassword = Bcrypt.compareSync(password, result.password);
        if (!checkPassword) throw ERROR.INVALID_PASSWORDMATCH;
        let tokenData = {
            scope: Config.APP_CONSTANTS.SCOPE.USER,
            _id: result._id,
            time: new Date(),
        };
        const Token = await TokenManager.GenerateToken(tokenData, Config.APP_CONSTANTS.SCOPE.USER);
        return {
            Token,
        }
    }
    catch (err) {
        throw err
    }
}
const verifyotp = async (payload) => {
    const { _id, otp } = payload
    let query = {
        _id,
        isVerified: false,
    };
    let res = await DAO.getDataOne(Models.Users, query, { otp: 1, _id: 0 }, { limit: 1 });
    // console.log(res)
    // console.log(otp)
    if (otp != res.otp) {
        throw ERROR.INCORRECT_DETAILS;
    }
    let tokenData = {
        scope: Config.APP_CONSTANTS.SCOPE.USER,
        _id: res,
        time: new Date(),
    };
    const accessToken = await TokenManager.GenerateToken(tokenData, Config.APP_CONSTANTS.SCOPE.USER);
    const data = await DAO.findAndUpdate(Models.Users, { _id: query._id }, { isVerified: true }, {});
    return {
        accessToken,
    }
}
const forgotpassword = async (payload) => {
    try {
        const { email } = payload;
        const query = {
            email,

        };
        const result = await DAO.getDataOne(Models.Users, query, {});
        //  console.log(result);
        if (result === null) throw "email dosent exists";
        let tokenData = {
            scope: Config.APP_CONSTANTS.SCOPE.USER,
            _id: result._id,
            time: new Date(),
        };
        const accessToken = await TokenManager.GenerateToken(tokenData, Config.APP_CONSTANTS.SCOPE.USER)
        // const data = await DAO.findAndUpdate(Models.Users, { email: result.email }, { accessToken: accessToken }, {})
        const qwe = await mail.sentmail(accessToken);
        console.log(qwe)

        return {
            accessToken,
        }
    }
    catch (err) {
        throw err
    }
}
const resetpassword = async (payload) => {
    try {
        const { accessToken, newpassword } = payload;
        const query = {
            email,
        };
        const result = await DAO.getDataOne(Models.Users, query, {});
        if (result === null) throw "email dosent exists";
        let pass = Bcrypt.hashSync(newpassword, Config.APP_CONSTANTS.SERVER.SALT);
        console.log(pass);
        const data = await DAO.findAndUpdate(Models.Users, { email:query }, { password: pass }, {});
        console.log(data);
        return {
            result,

        }
    }
    catch (err) {
        throw err
    }
}
module.exports = {
    signup,
    login,
    verifyotp,
    forgotpassword,
    resetpassword
}