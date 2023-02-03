IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'sembcorp')
  BEGIN
    CREATE DATABASE [sembcorp]
    END
    GO
       USE [sembcorp]
    GO



IF NOT EXISTS(SELECT * FROM sys.sysobjects WHERE name = 'project_config')
    CREATE TABLE project_config (
        id INT IDENTITY PRIMARY KEY,
        input_table_name VARCHAR(255),
        input_table_column VARCHAR(255),
        input_allowed_value VARCHAR(255),
        last_modified_by VARCHAR(255),
        created_at DATETIME,
        modified_at DATETIME
    );
GO

IF NOT EXISTS(SELECT * FROM sys.sysobjects WHERE name = 'coal_input')
    CREATE TABLE coal_input (
        id int not null identity,
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
GO

IF NOT EXISTS(SELECT * FROM sys.sysobjects WHERE name = 'lab_reading')
    CREATE TABLE lab_reading (
        id int not null identity,
        measure_date date not null,
        instrument varchar(255),
        metric_1 float,
        primary key(id)
    );
GO

IF NOT EXISTS(SELECT * FROM sys.sysobjects WHERE name = 'validation_rules')
    CREATE TABLE validation_rules (
        id int not null identity,
        rule_name varchar(50) not null unique,
        rule_description varchar(100) not null,
        rule_variables varchar(80) not null,
        rule_code varchar(150) not null,
        primary key(id)
    );
GO

IF NOT EXISTS(SELECT * FROM sys.sysobjects WHERE name = 'validation_rules_functions')
    CREATE TABLE validation_rules_functions (
        rule_id int not null,
        function_name varchar(50) not null,
        num_parameters int not null,
        primary key(rule_id, function_name),
        foreign key (rule_id)
        references validation_rules(id)
    );
GO

IF NOT EXISTS(SELECT * FROM sys.sysobjects WHERE name = 'generic_functions')
    CREATE TABLE generic_functions (
        id int not null identity,
        function_name varchar(50) not null unique,
        function_params varchar(100) not null,
        num_params int not null,
        function_description varchar(500) not null,
        function_code varchar(500) not null, 
        primary key (id, function_name)
    );
GO

IF NOT EXISTS(SELECT * FROM sys.sysobjects WHERE name = 'activated_validation_rules')
    CREATE TABLE activated_validation_rules (
        id int not null identity,
        rule_used varchar(50) not null,
        table_name varchar(50) not null,
        column_variables varchar(80),
        primary key (id)
    );
GO

IF NOT EXISTS(SELECT * FROM sys.sysobjects WHERE name = 'activated_functions')
    CREATE TABLE activated_functions (
        activated_id int not null,
        function_name varchar(50) not null,
        function_used varchar(100) not null,
        primary key (activated_id,function_name,function_used)
    );
GO

IF NOT EXISTS(SELECT * FROM sys.sysobjects WHERE name = 'users')
    CREATE TABLE users (
        email varchar(64),
        password varchar(64),
        role varchar(64),
        has_logged_in BIT NOT NULL DEFAULT 0,
        primary key(email)
    );
GO

IF NOT EXISTS(SELECT * FROM sys.sysobjects WHERE name = 'internal_directory')
    CREATE TABLE internal_directory (
        internal_name varchar(64) not null,
        internal_type varchar(16) not null,
        primary key (internal_name)
    );
GO

IF NOT EXISTS(SELECT * FROM sys.sysobjects WHERE name = 'internal_formula')
    CREATE TABLE internal_formula (
        internal_name varchar(64) not null,
        formula_python varchar(255),
        primary key (internal_name),
        foreign key (internal_name)
        references internal_directory (internal_name)
    );
GO

IF NOT EXISTS(SELECT * FROM sys.sysobjects WHERE name = 'internal_tag')
    CREATE TABLE internal_tag (
        internal_name varchar(64) not null,
        tag varchar(64),
        primary key (internal_name),
        foreign key (internal_name)
        references internal_directory (internal_name)
    );
GO

IF NOT EXISTS(SELECT * FROM sys.sysobjects WHERE name = 'sensor_data')
    CREATE TABLE sensor_data (
        internal_name varchar(64) not null,
        tag varchar(64),
        primary key (internal_name),
        foreign key (internal_name)
        references internal_directory (internal_name)
    );
GO

IF NOT EXISTS(SELECT * FROM sys.sysobjects WHERE name = 'annotation_data')
    CREATE TABLE annotation_data (
        dashboard_id varchar(64),
        annotation_text varchar(64),
        tags varchar(64),
        start_time varchar(64),
        end_time varchar(64),
        primary key (start_time)
    );
GO

IF NOT EXISTS(SELECT * FROM sys.sysobjects WHERE name = 'validation_formula')
    CREATE TABLE validation_formula (
        formula_name varchar(64) not null unique,
        formula_description varchar(64),
        formula_variables varchar(100) not null,
        formula_code  varchar(255) not null,
        primary key (formula_name)
    );
GO

IF NOT EXISTS(SELECT * FROM sys.sysobjects WHERE name = 'activated_validation_formula')
    CREATE TABLE activated_validation_formula (
        formula_used varchar(64) not null,
        internal_name varchar(64) not null unique,
        column_variables varchar(100) not null,
        primary key (internal_name),
        foreign key (formula_used)
        references validation_formula (formula_name)
    );
GO
