
CREATE TABLE IF NOT EXISTS solar_input (
    id int not null auto_increment,
    measure_date datetime not null,
    location varchar(255),
    sun_amount varchar(10),
    temperature_celsius float,
    last_modified_by varchar(255),
    created_at datetime,
    modified_at datetime,
    PRIMARY KEY (id)
);