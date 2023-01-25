// const sequelize = require('./config/connection');
const inquirer = require('inquirer');
// const fs = require('fs');
const answerOptions = require('./options/index');


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
    // Choice response triggers functions inside folder >options
    .then((data) => {
        if (data.options === 'Quit') {
            console.log('Goodbye')
        } else {
            answerOptions(data);
            init();
        }
    })
}
    init();
