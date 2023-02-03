
CREATE DATABASE IF NOT EXISTS sembcorp;
USE sembcorp;


CREATE TABLE IF NOT EXISTS project_config (
    id int not null auto_increment,
    input_table_name varchar(255),
    input_table_column varchar(255),
    input_allowed_value varchar(255),
    last_modified_by varchar(255),
    created_at datetime,
    modified_at datetime,
    PRIMARY KEY (id)
);


CREATE TABLE IF NOT EXISTS coal_input (
    id int not null auto_increment,
    measure_date datetime not null,
    coal_type varchar(255),
    unit varchar(255),
    moisture_pct float,
    ash_pct float,
    vm_pct float,
    last_modified_by varchar(255),
    created_at datetime,
    modified_at datetime,
    PRIMARY KEY (id)
);


CREATE TABLE IF NOT EXISTS lab_reading (
    id int not null auto_increment,
    measure_date date not null,
    instrument varchar(255),
    metric_1 float,
    primary key(id)
);


CREATE TABLE IF NOT EXISTS validation_rules (
    id int not null auto_increment,
    rule_name varchar(50) not null unique,
    rule_description varchar(100) not null,
    rule_variables varchar(80) not null,
    rule_code varchar(150) not null,
    primary key(id)
);

CREATE TABLE IF NOT EXISTS validation_rules_functions (
	rule_id int not null,
    function_name varchar(50) not null,
    num_parameters int not null,
    primary key(rule_id, function_name),
    foreign key function_FK1 (rule_id)
    references validation_rules(id)
);


CREATE TABLE IF NOT EXISTS generic_functions (
    id int not null auto_increment,
    function_name varchar(50) not null unique,
    function_params varchar(100) not null,
    num_params int not null,
    function_description varchar(500) not null,
    function_code varchar(500) not null, # to be changed
    primary key (id, function_name)
);

CREATE TABLE IF NOT EXISTS activated_validation_rules (
    id int not null auto_increment,
    rule_used varchar(50) not null,
    table_name varchar(50) not null,
    column_variables varchar(80),
    primary key (id)
);

CREATE TABLE IF NOT EXISTS activated_functions (
    activated_id int not null,
    function_name varchar(50) not null,
    function_used varchar(100) not null,
    primary key (activated_id,function_name,function_used)

);


CREATE TABLE IF NOT EXISTS users (
    email varchar(64),
    password varchar(64),
    role varchar(64),
    has_logged_in BOOLEAN NOT NULL DEFAULT 0,
    primary key(email)
);


CREATE TABLE IF NOT EXISTS internal_directory (
    internal_name varchar(64) not null,
    internal_type varchar(16) not null,
    primary key (internal_name)
);


CREATE TABLE IF NOT EXISTS internal_formula (
    internal_name varchar(64) not null,
    formula_python varchar(255),
    primary key (internal_name),
    foreign key (internal_name)
    references internal_directory (internal_name)
);


CREATE TABLE IF NOT EXISTS internal_tag (
    internal_name varchar(64) not null,
    tag varchar(64),
    primary key (internal_name),
    foreign key (internal_name)
    references internal_directory (internal_name)
);


CREATE TABLE IF NOT EXISTS sensor_data (
    time_stamp datetime,
    sensor varchar(20),
    sensor_value float,
    primary key (time_stamp, sensor)
);


CREATE TABLE IF NOT EXISTS annotation_data (
    dashboard_id varchar(64),
    annotation_text varchar(64),
    tags varchar(64),
    start_time varchar(64),
    end_time varchar(64),
    primary key (start_time)
);


CREATE TABLE IF NOT EXISTS validation_formula (
    formula_name varchar(64) not null unique,
    formula_description varchar(64),
    formula_variables varchar(100) not null,
    formula_code  varchar(255) not null,
    primary key (formula_name)
);


CREATE TABLE IF NOT EXISTS activated_validation_formula (
    formula_used varchar(64) not null,
    internal_name varchar(64) not null unique,
    column_variables varchar(100) not null,
    primary key (internal_name),
    foreign key (formula_used)
    references validation_formula (formula_name)
);