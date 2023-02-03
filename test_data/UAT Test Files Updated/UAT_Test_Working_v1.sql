CREATE DATABASE IF NOT EXISTS sembcorp;
USE sembcorp;

CREATE TABLE IF NOT EXISTS UAT_Test_Working_v1_input (
    test_id int NOT NULL,
    date datetime NOT NULL,
    unit varchar(20) NOT NULL,
    coal_name varchar(50) NOT NULL,
    unit_price real NOT NULL,
    lab_reading varchar(100) NOT NULL,
    mill_type varchar(20) NOT NULL,
    last_modified_by varchar(255),
    created_at datetime,
    modified_at datetime,
    PRIMARY KEY (test_id)
);