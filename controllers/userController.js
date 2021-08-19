const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const dbConnection = require("../utils/dbConnection");

// Home Page
exports.homePage = async (req, res, next) => {
    const [row] = await dbConnection.execute("SELECT * FROM `users` WHERE `id`=?", [req.session.userID]);

    if (row.length !== 1) {
        return res.redirect('/logout');
    }

    res.render('index', {
        user: row[0]
    });
}

// Register Page
exports.registerPage = (req, res, next) => {
    res.render("register");
};

// User Registration
exports.register = async (req, res, next) => {
    const errors = validationResult(req);
    const { body } = req;

    if (!errors.isEmpty()) {
        return res.render('register', {
            error: errors.array()[0].msg
        });
    }

    try {

        const [row] = await dbConnection.execute(
            "SELECT * FROM `users` WHERE `email`=?",
            [body._email]
        );

        if (row.length >= 1) {
            return res.render('register', {
                error: 'This email already in use.'
            });
        }
        
        
        if (body._password!==body._confirm_password) {
            return res.render('register', {
                error: 'Password and confirm password is incorrect.'
            });
        }

        const hashPass = await bcrypt.hash(body._password, 12);

        const [rows] = await dbConnection.execute(
            "INSERT INTO `users`(`name`,`email`,`password`) VALUES(?,?,?)",
            [body._name, body._email, hashPass]
        );

        if (rows.affectedRows !== 1) {
            return res.render('register', {
                error: 'Your registration has failed.'
            });
        }
        
        res.render("register", {
            msg: 'You have successfully registered.'
        });

    } catch (e) {
        next(e);
    }
};


// Login Page
exports.loginPage = (req, res, next) => {
    res.render("login");
};

// Login User
exports.login = async (req, res, next) => {

    const errors = validationResult(req);
    const { body } = req;

    if (!errors.isEmpty()) {
        return res.render('login', {
            error: errors.array()[0].msg
        });
    }

    try {

        const [row] = await dbConnection.execute('SELECT * FROM `users` WHERE `email`=?', [body._email]);

        if (row.length != 1) {
            return res.render('login', {
                error: 'Invalid email address.'
            });
        }

        const checkPass = await bcrypt.compare(body._password, row[0].password);

        if (checkPass === true) {
            req.session.userID = row[0].id;
            return res.redirect('/');
        }

        res.render('login', {
            error: 'Invalid Password.'
        });


    }
    catch (e) {
        next(e);
    }

}

//change password
exports.changepasswordPage = (req, res, next) => {
    res.render("changepass");
};

exports.changepassword = async (req, res, next) => {
    const errors = validationResult(req);
    const { body } = req;

    if (!errors.isEmpty()) {
        return res.render('changepass', {
            error: errors.array()[0].msg
        });
    }

    try {

        // select email that we input have or not
        const [row] = await dbConnection.execute(
            "SELECT * FROM users WHERE email=?;",
            [body._email]
        );
        console.log("1")
        console.log([row])
           // display err when cannot find
        if (row.length != 1) {
            return res.render('changepass', {
                error: 'Invalid email address.'
            });
        }
        //check old password
        const checkPass = await bcrypt.compare(body._password, row[0].password);
        if (checkPass !== true) {
            return res.render('changepass', {
                error: 'Invalid email address.'
            });
        } 
        console.log("2")
        console.log(checkPass);
        //compare new password/ confirm pass

        if (body._new_password != body._confirm_password) {
            return res.render('changepass', {
                error: 'Password and confirm password is incorrect.'
            });
        }
        console.log("3");
      
        // //compare password
        const hashPass = await bcrypt.hash(body._new_password, 12);
        console.log("4");
        console.log( hashPass);
        const [rows] = await dbConnection.execute(
            "UPDATE `users` SET password=?  where email=?",[hashPass,body._email]
        );

        if (rows.affectedRows !== 1) {
            return res.render('changepass', {
                error: 'Your change password has failed.'
            });
        }
        
        res.render("changepass", {
            msg: 'You have successfully registered.'
        });

    } catch (e) {
        next(e);
    }
};
//////////////////////////////////////////////
// //product 
// exports.productPage = (req, res, next) => {
//     res.render("product");
// };
// //checkout
// exports.checkoutPage = (req, res, next) => {
//     res.render("checkout");
// };
//////////////////////////////////////////////