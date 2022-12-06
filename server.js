/********************************************************************************* 
 * WEB322 – Assignment 6 
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
 * of this assignment has been copied manually or electronically from any other source 
 * (including 3rd party web sites) or distributed to other students.
 * 
 * Name: Mehrad Akbari Student ID: 130077217 Date: 06/12/2022 * 
 * Online (Cyclic) Link: ________________________________________________________ 
 * 
 * ********************************************************************************/

const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const handleBars = require('express-handlebars')
const clientSessions = require('client-sessions')
const dataServiceAuth = require('./data-service-auth')

const dataService = require('./data-service')
const { isTypedArray } = require('util/types')

require('dotenv').config()


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/uploaded')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})



const app = express()

const port = process.env.PORT

const upload = multer({ storage: storage })

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(clientSessions({
    cookieName: "session",
    secret: "MehradAkbari",
    duration: 10 * 60 * 1000,
    activeDuration: 1000 * 60
}))

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

app.use(function (req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});
app.engine('.hbs', handleBars.engine({
    extname: '.hbs', helpers: {
        navLink: function (url, options) {
            if (url == app.locals.activeRoute) {
                return `<a href="${url}" class="link active">${options.fn(this)}</a>`
            } else {
                return `<a href="${url}" class="link">${options.fn(this)}</a>`
            }
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }

    }
}));
app.set('view engine', '.hbs');


// routes

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/about', (req, res) => {
    res.render('about')
})

app.get('/employees', ensureLogin, (req, res) => {
    if (req.query.status) {
        dataService.getEmployeesByStatus(req.query.status)
            .then((data) => {
                if (data.length > 0) {
                    res.render('employees', { employees: data })
                } else {
                    res.render("employees", { message: "no results" });
                }
            })
            .catch(err => console.log(err))
    }
    if (req.query.manager) {
        dataService.getEmployeesByManager(req.query.manager)
            .then((data) => {
                if (data.length > 0) {
                    res.render('employees', { employees: data })
                } else {
                    res.render("employees", { message: "no results" });
                }
            })
            .catch(err => console.log(err))
    }
    if (req.query.department) {
        dataService.getEmployeesByDepartment(req.query.department)
            .then((data) => {
                if (data.length > 0) {
                    res.render('employees', { employees: data })
                } else {
                    res.render("employees", { message: "no results" });
                }
            })
            .catch(err => console.log(err))
    }
    dataService.getAllEmployees()
        .then(data => {
            if (data.length > 0) {
                res.render('employees', { employees: data })
            } else {
                res.render("employees", { message: "no results" });
            }
        })
        .catch(err => console.log(err))

})
app.get("/employee/:empNum", ensureLogin, (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    dataService.getEmployeeByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null if none were returned
        }
    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error
    }).then(dataService.getDepartments)
        .then((data) => {
            viewData.departments = data; // store department data in the "viewData" object as
            "departments"
            // loop through viewData.departments and once we have found the departmentId that matches
            // the employee's "department" value, add a "selected" property to the matching
            // viewData.departments object
            13
            for (let i = 0; i < viewData.departments.length; i++) {
                if (viewData.departments[i].departmentId == viewData.employee.department) {
                    viewData.departments[i].selected = true;
                }
            }
        }).catch(() => {
            viewData.departments = []; // set departments to empty if there was an error
        }).then(() => {
            if (viewData.employee == null) { // if no employee - return an error
                res.status(404).send("Employee Not Found");
            } else {
                res.render("employee", { viewData: viewData }); // render the "employee" view
            }
        });
});
app.get('/departments', ensureLogin, (req, res) => {
    dataService.getDepartments()
        .then(data => {
            if (data.length > 0) {
                res.render('departments', { departments: data })
            } else {
                res.render('departments', { message: "no results" })
            }
        })
        .catch(err => console.log(err))
})
app.get('/employees/add', ensureLogin, (req, res) => {
    dataService.getDepartments().then(data => {
        res.render("addEmployee", { departments: data });
    }).catch(err => res.render("addEmployee", { departments: [] }))
})

app.get('/images/add', ensureLogin, (req, res) => {
    res.render('addImage')
})
app.post('/images/add', ensureLogin, upload.single("imageFile"), (req, res) => {
    res.redirect('/images')
})
app.get('/images', ensureLogin, (req, res) => {
    fs.readdir("./public/images/uploaded", function (err, items) {
        if (err) return res.render('images', { message: err })
        res.render('images', { data: items })
    })
})

app.post('/employee/update', ensureLogin, (req, res) => {
    dataService.updateEmployee(req.body).then(res.redirect('/employees'))
})
app.post('/employees/add', ensureLogin, (req, res) => {
    dataService.addEmployee(req.body).then(() => {
        res.redirect("/employees");
    }).catch(err => console.log(err))
})
app.get('/departments/add', ensureLogin, (req, res) => {
    res.render('addDepartment')
})
app.post('/departments/add', ensureLogin, (req, res) => {
    dataService.addDepartment(req.body).then(() => {
        res.redirect('/departments')
    })
})
app.post('/department/update', ensureLogin, (req, res) => {
    dataService.updateDepartment(req.body).then(() => {
        res.redirect('/departments')
    })
})
app.get("/department/:departmentId", ensureLogin, (req, res) => {
    dataService.getDepartmentById(req.params.departmentId).then(data => {
        if (data == undefined) {
            res.status(404).send("Department Not Found")
        } else {
            res.render('department', { department: data })
        }
    }).catch(err => res.status(404).send("Department Not Found"))
})
app.get('/employees/delete/:empNum', ensureLogin, (req, res) => {
    dataService.deleteEmployeeByNum(req.params.empNum).then(() => {
        res.redirect('/employees')
    }).catch(err => res.status(500).send("Unable to Remove Employee / Employee not found"))
})
app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', (req, res) => {
    req.body.userAgent = req.get('User-Agent');

    dataServiceAuth.checkUser(req.body).then((User) => {
        req.session.user = {
            userName: User.userName,
            email: User.email,
            loginHistory: User.loginHistory
        }

        res.redirect('/employees')
    }).catch(err => {
        res.render('login', { errorMessage: err, userName: req.body.userName })
    })

})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', (req, res) => {
    dataServiceAuth.registerUser(req.body).then(() => {
        res.render('register', { successMessage: "User created" })
    }).catch(err => {
        res.render('register', { errorMessage: err, userName: req.body.userName })
    })
})

app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect("/")
})

app.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory')
})
// 404 not found
app.get('*', function (req, res) {
    res.render('404')
})



// starting the server
dataService.initialize()
    .then(dataServiceAuth.initialize)
    .then(
        app.listen(port, () => {
            console.log(`Express http server listening on ${port}`)
        })
    )
    .catch(err => console.log(err))

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}