CREATE DATABASE IF NOT EXISTS project_config;
USE project_config;

CREATE TABLE IF NOT EXISTS project_config (
    id INT NOT NULL auto_increment,
    input_table_name VARCHAR(255),
    input_table_column VARCHAR(255),
    input_allowed_value VARCHAR(255),
    last_modified_by VARCHAR(255),
    created_at DATETIME,
    modified_at DATETIME,
    PRIMARY KEY (id)
);


CREATE DATABASE IF NOT EXISTS data_input;
USE data_input;

CREATE TABLE IF NOT EXISTS coal_input (
    id INT NOT NULL auto_increment,
    measure_date DATETIME NOT NULL,
    coal_type VARCHAR(255),
    unit VARCHAR(255),
    moisture_pct FLOAT,
    ash_pct FLOAT,
    vm_pct FLOAT,
    last_modified_by VARCHAR(255),
    created_at DATETIME,
    modified_at DATETIME,
    PRIMARY KEY (id)
);


CREATE DATABASE IF NOT EXISTS lab_reading;
USE lab_reading;

CREATE TABLE IF NOT EXISTS lab_reading (
    id INT NOT NULL auto_increment,
    measure_date DATE NOT NULL,
    instrument VARCHAR(255),
    metric_1 FLOAT,
    PRIMARY KEY(id)
);


CREATE DATABASE IF NOT EXISTS data_validation;
USE data_validation;

CREATE TABLE IF NOT EXISTS validation_rules (
    id INT NOT NULL auto_increment,
    rule_name VARCHAR(50) NOT NULL unique,
    rule_description VARCHAR(100) NOT NULL,
    rule_variables VARCHAR(80) NOT NULL,
    rule_code VARCHAR(150) NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS validation_rules_functions (
	rule_id INT NOT NULL,
    function_name VARCHAR(50) NOT NULL,
    num_parameters INT NOT NULL,
    PRIMARY KEY(rule_id, function_name),
    FOREIGN KEY function_FK1 (rule_id)
    REFERENCES validation_rules(id)
);


CREATE TABLE IF NOT EXISTS generic_functions (
    id INT NOT NULL auto_increment,
    function_name VARCHAR(50) NOT NULL unique,
    function_params VARCHAR(100) NOT NULL,
    num_params INT NOT NULL,
    function_description VARCHAR(500) NOT NULL,
    function_code VARCHAR(500) NOT NULL,

    PRIMARY KEY (id, function_name)
);

CREATE TABLE IF NOT EXISTS activated_validation_rules (
    id INT NOT NULL auto_increment,
    rule_used VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    column_variables VARCHAR(80),
    PRIMARY KEY(id),
    FOREIGN KEY (rule_used)
    REFERENCES validation_rules(rule_name)
);

CREATE TABLE IF NOT EXISTS activated_functions (
    activated_id INT NOT NULL,
    function_name VARCHAR(50) NOT NULL,
    function_used VARCHAR(100) NOT NULL,
    PRIMARY KEY (activated_id,function_name,function_used),
    FOREIGN KEY act_func_FK1 (function_name) REFERENCES generic_functions(function_name),
    FOREIGN KEY act_func_FK2 (activated_id) REFERENCES activated_validation_rules(id)
);


CREATE DATABASE IF NOT EXISTS users;
USE users;

CREATE TABLE IF NOT EXISTS users (
    email VARCHAR(64),
    password VARCHAR(64),
    role VARCHAR(64),
    has_logged_in BOOLEAN NOT NULL DEFAULT 0,
    PRIMARY KEY(email)
);


CREATE DATABASE IF NOT EXISTS internal_information;
USE internal_information;

CREATE TABLE IF NOT EXISTS internal_directory (
    internal_name VARCHAR(64) NOT NULL,
    internal_type VARCHAR(16) NOT NULL,
    PRIMARY KEY (internal_name)
);


CREATE TABLE IF NOT EXISTS internal_formula (
    internal_name VARCHAR(64) NOT NULL,
    formula_python VARCHAR(255),
    PRIMARY KEY (internal_name),
    FOREIGN KEY (internal_name)
    REFERENCES internal_directory (internal_name)
);


CREATE TABLE IF NOT EXISTS internal_tag (
    internal_name VARCHAR(64) NOT NULL,
    tag VARCHAR(64),
    PRIMARY KEY (internal_name),
    FOREIGN KEY (internal_name)
    REFERENCES internal_directory (internal_name)
);


CREATE DATABASE IF NOT EXISTS sensor_data;
USE sensor_data;

CREATE TABLE IF NOT EXISTS sensor_data (
    time_stamp datetime,
    sensor varchar(20),
    sensor_value float,
    primary key (time_stamp, sensor)
);


CREATE DATABASE IF NOT EXISTS annotation_data;
use annotation_data;

CREATE TABLE IF NOT EXISTS annotation_data (
    dashboard_id varchar(64),
    annotation_text varchar(64),
    tags varchar(64),
    start_time varchar(64),
    end_time varchar(64),
    primary key (start_time)
);