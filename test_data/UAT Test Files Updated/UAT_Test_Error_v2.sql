/*Missing primary key*/

CREATE DATABASE IF NOT EXISTS sembcorp;
USE sembcorp;

CREATE TABLE IF NOT EXISTS UAT_Test_Working_v2_input (
    id int NOT NULL AUTO_INCREMENT,
    "date" datetime NOT NULL,
    mean_temperature real NOT NULL,
    mean_wind_speed real NOT NULL,
    total_rainfall real NOT NULL,
    modified_datetime datetime NOT NULL,
    modified_by varchar(60) NOT NULL

);