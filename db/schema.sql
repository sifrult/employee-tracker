DROP DATABASE IF EXISTS personnel_db;
CREATE DATABASE personnel_db;

USE personnel_db;

CREATE TABLE department (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

CREATE TABLE role (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INT,
    FOREIGN KEY (department_id)
    REFERENCES department(id)
    ON DELETE SET NULL
);

CREATE TABLE employee (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT,
    manager_id INT,
    FOREIGN KEY (role_id)
    REFERENCES role(id)
    ON DELETE SET NULL,
    FOREIGN KEY (manager_id)
    REFERENCES employee(id)
    ON DELETE SET NULL
);

SELECT concat(first_name, last_name) FROM employee WHERE id =1


SELECT 
employee.id, employee.first_name, employee.last_name, role.title, department.name, role.salary 
FROM employee 
JOIN role ON employee.role_id = role.id 
JOIN department ON role.department_id = department.id

RIGHT JOIN concat(first_name, last_name) AS manager FROM employee ON employee.manager_id = employee.id

