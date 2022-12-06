const Sequelize = require('sequelize');
var sequelize = new Sequelize('vxjaybiq', 'vxjaybiq', '7pofy7lg8Eigsld5RZ8q6moRIdv3sRZi', {
    host: 'peanut.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: true
    },
    query: { raw: true }
});
var Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.Sequelize.STRING,

})
var Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
})
sequelize.authenticate().then(() => console.log('Connection success.'))
    .catch((err) => console.log("Unable to connect to DB.", err));


exports.initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            console.log("connected to database")
            resolve()
        }).catch(err => reject("unable to sync the database"))
    })
}

exports.getAllEmployees = () => {
    return new Promise((resolve, reject) => {
        Employee.findAll().then(data => {
            resolve(data)
        }).catch(err => reject("no results returned(getAllEmployees)"))
    })
}

exports.getDepartments = () => {
    return new Promise((resolve, reject) => {
        Department.findAll().then(data => {
            resolve(data)
        }).catch(err => reject("no results returned(getDepartments)"))
    })
}

exports.addEmployee = (employeeData) => {
    return new Promise((resolve, reject) => {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (const property in employeeData) {
            if (employeeData[property] == '') {
                employeeData[property] = null
            }
        }
        Employee.create({
            employeeNum: employeeData.employeeNum,
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addressCity: employeeData.addressCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            maritalStatus: employeeData.maritalStatus,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            department: employeeData.department,
            hireDate: employeeData.hireDate,
        }).then(() => {
            resolve()
        }).catch(err => reject("unable to create employee"))
    })
}

exports.getEmployeesByStatus = (status) => {
    return new Promise((resolve, reject) => {
        Employee.findAll({ where: { status } }).then(data => {
            resolve(data)
        }).catch(err => reject("no results returned(getEmployeesByStatus)"))
    })
}
exports.getEmployeesByDepartment = (department) => {
    return new Promise((resolve, reject) => {
        Employee.findAll({ where: { department } }).then(data => {
            resolve(data)
        }).catch(err => reject("no results returned(getEmployeesByDepartment)"))
    })
}

exports.getEmployeesByManager = (manager) => {
    return new Promise((resolve, reject) => {
        Employee.findAll({ where: { employeeManagerNum: manager } }).then(data => {
            resolve(data)
        }).catch(err => reject("no results returned(getEmployeesByManager)"))
    })
}

exports.getEmployeeByNum = (num) => {
    return new Promise((resolve, reject) => {
        Employee.findAll({ where: { employeeNum: num } }).then(data => {
            resolve(data[0])
        }).catch(err => reject("no results returned(getEmployeeByNum)"))
    })
}

exports.updateEmployee = (employeeData) => {
    return new Promise((resolve, reject) => {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (const property in employeeData) {
            if (employeeData[property] == '') {
                employeeData[property] = null
            }
        }
        Employee.update({
            employeeNum: employeeData.employeeNum,
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addressCity: employeeData.addressCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            maritalStatus: employeeData.maritalStatus,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            department: employeeData.department,
            hireDate: employeeData.hireDate,
        }, { where: { employeeNum: employeeData.employeeNum } }).then(() => {
            resolve()
        }).catch(err => reject("unable to create employee"))
    })
}
exports.addDepartment = (departmentData) => {
    return new Promise((resolve, reject) => {
        for (const property in departmentData) {
            if (departmentData[property] == '') {
                departmentData[property] = null
            }
        }
        Department.create({
            departmentId: departmentData.departmentId,
            departmentName: departmentData.departmentName
        }).then(() => {
            resolve()
        }).catch(err => { reject("unable to create department") })
    })
}
exports.updateDepartment = (departmentData) => {
    return new Promise((resolve, reject) => {
        for (const property in departmentData) {
            if (departmentData[property] == '') {
                departmentData[property] = null
            }
        }
        Department.update({
            departmentId: departmentData.departmentId,
            departmentName: departmentData.departmentName
        }, { where: { departmentId: departmentData.departmentId } }).then(() => {
            resolve()
        }).catch(err => { reject("unable to update department") })
    })
}
exports.getDepartmentById = (id) => {
    return new Promise((resolve, reject) => {
        Department.findAll({ where: { departmentId: id } }).then(data => {
            resolve(data[0])
        }).catch(err => reject("no results returned(getDepartmentById)"))
    })
}
exports.deleteEmployeeByNum = (empNum) => {
    return new Promise((resolve, reject) => {
        Employee.destroy({ where: { employeeNum: empNum } }).then(() => {
            resolve()
        }).catch(err => reject("unable to delete a employee"))
    })
}