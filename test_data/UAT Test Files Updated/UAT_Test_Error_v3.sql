/*Missing Data Type*/

CREATE DATABASE IF NOT EXISTS sembcorp;
USE sembcorp;

CREATE TABLE IF NOT EXISTS UAT_Test_Error_v3_input (
    "time" datetime NOT NULL,
    inv_id int NOT NULL,
    irr_intensity NOT NULL,
    str_current real NOT NULL,
    label varchar(10) NOT NULL,
    PRIMARY KEY ("time")
);