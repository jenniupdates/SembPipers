IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'project_config')
  BEGIN
    CREATE DATABASE [project_config]
    END
    GO
       USE [project_config]
    GO

IF OBJECT_ID('project_config', 'U') IS NULL
BEGIN
    CREATE TABLE project_config 
    (
        id INT IDENTITY PRIMARY KEY,
        input_table_name VARCHAR(255),
        input_table_column VARCHAR(255),
        input_allowed_value VARCHAR(255),
        last_modified_by VARCHAR(255),
        created_at DATETIME,
        modified_at DATETIME
    );
END;

IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'data_input')
  BEGIN
    CREATE DATABASE [data_input]
    END
    GO
       USE [data_input]
    GO

IF OBJECT_ID('coal_input', 'U') IS NULL
BEGIN
    CREATE TABLE coal_input 
    (
        id INT IDENTITY PRIMARY KEY,
        measure_DATE DATETIME NOT NULL,
        coal_type VARCHAR(255),
        unit VARCHAR(255),
        moisture_pct FLOAT,
        ash_pct FLOAT,
        vm_pct FLOAT,
        last_modified_by VARCHAR(255),
        created_at DATETIME,
        modified_at DATETIME,
    );
END;

IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'lab_reading')
  BEGIN
    CREATE DATABASE [lab_reading]
    END
    GO
       USE [lab_reading]
    GO

IF OBJECT_ID('lab_reading', 'U') IS NULL
BEGIN
    CREATE TABLE lab_reading 
    (
        id INT IDENTITY PRIMARY KEY,
        measure_DATE DATE NOT NULL,
        instrument VARCHAR(255),
        metric_1 FLOAT,
    );
END;

IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'data_validation')
  BEGIN
    CREATE DATABASE [data_validation]
    END
    GO
       USE [data_validation]
    GO

IF OBJECT_ID('validation_rules', 'U') IS NULL
BEGIN
    CREATE TABLE validation_rules 
    (
        id INT IDENTITY PRIMARY KEY,
        rule_name VARCHAR(50) NOT NULL UNIQUE,
        rule_description VARCHAR(100) NOT NULL,
        rule_variables VARCHAR(80) NOT NULL,
        rule_code VARCHAR(150) NOT NULL,
    );
END;

IF OBJECT_ID('validation_rules_functions', 'U') IS NULL
BEGIN
    CREATE TABLE validation_rules_functions (
        rule_id INT NOT NULL FOREIGN KEY REFERENCES validation_rules(id),
        function_name VARCHAR(50) NOT NULL,
        num_parameters INT NOT NULL,
        PRIMARY KEY(rule_id, function_name),
    );
END;

IF OBJECT_ID('generic_functions', 'U') IS NULL
BEGIN
    CREATE TABLE generic_functions (
        id INT NOT NULL IDENTITY,
        function_name VARCHAR(50) NOT NULL UNIQUE,
        function_params VARCHAR(100) NOT NULL,
        num_params INT NOT NULL,
        function_description VARCHAR(500) NOT NULL,
        function_code VARCHAR(500) NOT NULL,

        PRIMARY KEY (id, function_name)
    );
END;

IF OBJECT_ID('activated_validation_rules', 'U') IS NULL
BEGIN
    CREATE TABLE activated_validation_rules (
        id INT NOT NULL IDENTITY,
        rule_used VARCHAR(50) NOT NULL,
        table_name VARCHAR(50) NOT NULL,
        column_variables VARCHAR(80),
        PRIMARY KEY(id),
        FOREIGN KEY (rule_used)
        REFERENCES validation_rules(rule_name)
    );
END;

IF OBJECT_ID('activated_functions', 'U') IS NULL
BEGIN
    CREATE TABLE activated_functions (
        activated_id INT NOT NULL FOREIGN KEY REFERENCES activated_validation_rules(id),
        function_name VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES generic_functions(function_name),
        function_used VARCHAR(100) NOT NULL,
        PRIMARY KEY (activated_id,function_name,function_used),
    );
END;


IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'users')
  BEGIN
    CREATE DATABASE [users]
    END
    GO
       USE [users]
    GO

IF OBJECT_ID('users', 'U') IS NULL
BEGIN
    CREATE TABLE users (
        email VARCHAR(64),
        password VARCHAR(64),
        role VARCHAR(64),
        has_logged_in BIT NOT NULL DEFAULT 0,
        PRIMARY KEY(email)
    );
END;


IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'internal_information')
  BEGIN
    CREATE DATABASE [internal_information]
    END
    GO
       USE [internal_information]
    GO

IF OBJECT_ID('internal_directory', 'U') IS NULL
BEGIN
    CREATE TABLE internal_directory (
        internal_name VARCHAR(64) NOT NULL,
        internal_type VARCHAR(16) NOT NULL,
        PRIMARY KEY (internal_name)
    );
END;

IF OBJECT_ID('internal_formula', 'U') IS NULL
BEGIN
    CREATE TABLE internal_formula (
        internal_name VARCHAR(64) NOT NULL,
        formula_python VARCHAR(255),
        PRIMARY KEY (internal_name),
        FOREIGN KEY (internal_name)
        REFERENCES internal_directory (internal_name)
    );
END;

IF OBJECT_ID('internal_tag', 'U') IS NULL
BEGIN
    CREATE TABLE internal_tag (
        internal_name VARCHAR(64) NOT NULL,
        tag VARCHAR(64),
        PRIMARY KEY (internal_name),
        FOREIGN KEY (internal_name)
        REFERENCES internal_directory (internal_name)
    );
END;

IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'sensor_data')
  BEGIN
    CREATE DATABASE [sensor_data]
    END
    GO
       USE [sensor_data]
    GO

IF OBJECT_ID('sensor_data', 'U') IS NULL
BEGIN
    CREATE TABLE sensor_data (
        time_stamp DATETIME,
        sensor VARCHAR(20),
        sensor_value FLOAT,
        PRIMARY KEY (time_stamp, sensor)
    );
END;