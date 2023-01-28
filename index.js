const inquirer = require('inquirer');
const mysql = require('mysql2');
const express = require('express');
const { query } = require('express');

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
                console.log(data.options);
                init();
                break;
            case 'Update an employee role':
                console.log(data.options);
                init();
                break;
            case 'Quit':
                console.log(data.options);
                break;
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
    const sql = `SELECT A.id, A.first_name, A.last_name, role.title, department.name, role.salary, concat(B.first_name, ' ', B.last_name) AS manager FROM employee A JOIN role ON A.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee B ON A.manager_id = B.id;
    `;
    // const sql = `SELECT concat(first_name, ' ', last_name) AS manager FROM employee WHERE id = 1`;
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
    })

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
        console.log(`Added ${data.department} to the database`)
        init();
    });
}

// -------------- Add an employee --------------
const addEmployee = () => {

    // Selects all the role names and puts them in a variable
    var roleOptions = [];

    const sql = 'SELECT title FROM role';
    db.query(sql, (err, res) => {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            roleOptions.push(res[i].name)
        }
    })

    // Selects all names of employees
    var managerOptions = [];

    const sql2 = `SELECT concat(first_name, last_name) FROM employee`;
    db.query(sql2, (err, res) => {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            console.log(res)
        }
    })
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
        // Selects the id associated with the selected role
        const sql1 = `SELECT id FROM role WHERE title = ${data.role}`

        db.query(sql1, (err, res) => {
            if (err) throw err;
            var roleId = res[0].id;

            // Inputs the first name, last name, and role id
            const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
            const params = [data.first_name, data.last_name, roleId]
        })
    })
}
// -------------- Update an employee role --------------

// -------------- Runs the program --------------
init();
