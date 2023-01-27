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
                console.log(data.options);
                init();
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
        })

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

        init();
    });
}

// -------------- Add an employee --------------

// -------------- Update an employee role --------------

// -------------- Runs the program --------------
init();
