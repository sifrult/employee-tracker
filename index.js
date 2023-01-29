const inquirer = require('inquirer');
const mysql = require('mysql2');
const express = require('express');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// Connect to database
const db = mysql.createConnection(
    {
        host: '127.0.0.1',
        user: 'root',
        password: process.env.MYSQL_PASSWORD,
        database: 'personnel_db'
    },
    console.log('Connected to the personnel_db database')
);

// Starting point for questions
const init = () => {
    console.log("--------------");
    inquirer .prompt([
        {
            type: 'list',
            name: 'options',
            message: 'What would you like to do?',
            choices: ['View all departments',
                    'View all roles',
                    'View all employees',
                    'Add a department',
                    'Add a role',
                    'Add an employee',
                    'Update an employee role',
                    'Quit'],
        }
    ])
    // Choice response triggers functions inside folder >options
    .then((data) => {
        switch(data.options) {
            case 'View all departments':
                viewDepts();
                break;
            case 'View all roles':
                viewRoles();
                break;
            case 'View all employees':
                viewEmployees();
                break;
            case 'Add a department':
                addDept();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update an employee role':
                updateRole();
                break;
            case 'Quit':
                console.log(data.options);
                process.exit(0);
        }
    })
}

// -------------- View all departments --------------
const viewDepts = () => {
    const sql = `SELECT * FROM department`;
    db.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        init();
    })
}

// -------------- View all roles --------------
const viewRoles = () => {
    const sql = `SELECT role.id, role.title, department.name, role.salary FROM role JOIN department ON role.department_id = department.id`;
    db.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        init();
    })
}

// -------------- View all employees --------------
const viewEmployees = () => {
    const sql = `SELECT A.id, A.first_name, A.last_name, role.title, department.name AS department, role.salary, concat(B.first_name, ' ', B.last_name) AS manager FROM employee A JOIN role ON A.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee B ON A.manager_id = B.id;`;

    db.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        init();
    })
}

// -------------- Add a department --------------
const addDept = () => {
    inquirer .prompt([
        {
            type: 'input',
            name: 'department',
            message: 'What is the name of the department?'
        }
    ])
    .then ((data) => {
        const sql = `INSERT INTO department (name) VALUES (?)`;
        const params = data.department;

        db.query(sql, params, (err, res) => {
            if (err) throw err;
        });
        console.log(`Added ${data.department} to the database`);
        init();
    });
}

// -------------- Add a role --------------
const addRole = () => {

    // Selects all the department names and puts them in the variable
    var deptOptions = [];

    const sql = `SELECT * FROM department`;
    db.query(sql, (err, res) => {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            deptOptions.push(res[i].name)
        }

        // Questions for user
        inquirer .prompt([
            {
                type: 'input',
                name: 'title',
                message: 'What is the name of the role?',
            },
            {
                type: 'input',
                name: 'salary',
                message: 'What is the salary of the role?'
            },
            {
                type: 'list',
                name: 'department',
                message: 'Which department does this role belong to?',
                choices: deptOptions
            }
        ])
        .then ((data) => {
            // Selects the id associated with the selected department
            const sql1 = `SELECT id FROM department WHERE name = '${data.department}'`

            db.query(sql1, (err, res) => {
                if (err) throw err;
                var deptId = res[0].id;

                // Inputs the title, salary, and department id
                const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
                const params = [data.title, data.salary, deptId];

                db.query(sql, params, (err, res) => {
                    if (err) throw err;
                })
            })
            console.log(`Added ${data.department} to the database`);
            init();
        });
    });
};

// -------------- Add an employee --------------
const addEmployee = () => {

    // Selects all the role names and puts them in a variable
    var roleOptions = [];

    const sql = `SELECT * FROM role`;
    db.query(sql, (err, res) => {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            roleOptions.push(res[i].title)
        }

        // Selects all names of employees and puts them in a variable
        var managerOptions = [];

        const sql1 = `SELECT concat(first_name, ' ', last_name) AS managers FROM employee`;
        db.query(sql1, (err, res) => {
            if (err) throw err;
            for (let x = 0; x < res.length; x++) {
                managerOptions.push(res[x].managers)
            }

            // Questions for user
            inquirer .prompt ([
                {
                    type: 'input',
                    name: 'first_name',
                    message: "What is the employee's first name?"
                },
                {
                    type: 'input',
                    name: 'last_name',
                    message: "What is the employee's last name?"
                },
                {
                    type: 'list',
                    name: 'role',
                    message: "What is the employee's role?",
                    choices: roleOptions
                },
                {
                    type: 'list',
                    name: 'manager',
                    message: "Who is the employee's manager?",
                    choices: managerOptions
                }
            ])
            .then ((data) => {

                // Selects the id associated with the selected role and manager
                const sql2 = `SELECT (SELECT role.id FROM role WHERE title = '${data.role}') AS role_id, (SELECT employee.id FROM employee WHERE concat(first_name, " ", last_name) = '${data.manager}') AS manager_id;`

                db.query(sql2, (err, res) => {
                    if (err) throw err;
                    var roleId = res[0].role_id;
                    var managerId = res[0].manager_id

                    // Inputs the first name, last name, role id, and manager id
                    const sql3 = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
                    const params3 = [data.first_name, data.last_name, roleId, managerId]

                    db.query(sql3, params3, (err, res) => {
                        if (err) throw err;
                    })
                })
                console.log(`Added ${data.first_name} ${data.last_name} to the database`)
                init();
            });
        });
    });
};

// -------------- Update an employee role --------------
const updateRole = () => {

    // Selects all the employee names and puts them in a variable
    let employeeOptions = [];

    const sql = `SELECT concat(first_name, ' ', last_name) AS employees FROM employee`;
    db.query(sql, (err, res) => {
        if (err) throw err;

        for (let x = 0; x < res.length; x++) {
            employeeOptions.push(res[x].employees)
        }

    // Selects all the role names and puts them in a variable
        let roleOptions = [];

        const sql1 = `SELECT * FROM role`;
        db.query(sql1, (err, res) => {
            if (err) throw err;
            for (let i = 0; i < res.length; i++) {
                roleOptions.push(res[i].title)
            }

            // Questions for user
            inquirer .prompt ([
                {
                    type: 'list',
                    name: 'employee',
                    message: "Which employee's role do you want to update?",
                    choices: employeeOptions
                },
                {
                    type: 'list',
                    name: 'role',
                    message: 'Which role do you want to assign the selected employee?',
                    choices: roleOptions
                }
            ])
            .then((data) => {

                // Selects id associated with selected employee and role
                const sql2 = `SELECT (SELECT role.id FROM role WHERE title = '${data.role}') AS role_id, (SELECT employee.id FROM employee WHERE concat(first_name, " ", last_name) = '${data.employee}') AS employee_id;`

                db.query(sql2, (err, res) => {
                    if (err) throw err;
                    var roleId = res[0].role_id;
                    var employeeId = res[0].employee_id;

                    const sql3 = `UPDATE employee SET role_id = ${roleId} WHERE id = ${employeeId}`;

                    db.query(sql3, (err, res) => {
                        if (err) throw err;
                    });
                })

                console.log("Updated employee's role");
                init();
            });
        });
    });
};

// -------------- Begins the program --------------
init();
