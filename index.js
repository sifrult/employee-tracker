// const sequelize = require('./config/connection');
const inquirer = require('inquirer');
// const fs = require('fs');

// Starting point for questions
const init = () => {
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
    // Choice response triggers another function
    .then((data) => {
        switch(data.options) {
            case 'View all departments':
                console.log(data.options);
                init();
                break;
            case 'View all roles':
                console.log(data.options);
                init();
                break;
            case 'View all employees':
                console.log(data.options);
                init();
                break;
            case 'Add a department':
                console.log(data.options);
                init();
                break;
            case 'Add a role':
                console.log(data.options);
                init();
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
                init();
                break;
        }
    })
}
    init();
