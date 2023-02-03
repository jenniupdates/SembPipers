CREATE DATABASE IF NOT EXISTS sembcorp;
USE sembcorp;

CREATE TABLE IF NOT EXISTS UAT_Test_Working_v3_input (
    time datetime NOT NULL,
    inv_id int NOT NULL,
    irr_intensity real NOT NULL,
    str_current real NOT NULL,
    label varchar(10) NOT NULL,
    last_modified_by varchar(255),
    created_at datetime,
    modified_at datetime,
    PRIMARY KEY (time)
);