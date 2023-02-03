-- use project_config;
INSERT INTO project_config (input_table_name, input_table_column, input_allowed_value) VALUES ("coal_input", "Coal Type", "INDO CLV");
INSERT INTO project_config (input_table_name, input_table_column, input_allowed_value) VALUES ("lab_reading", "Instrument", "MICRO-1");

-- use data_input;
INSERT INTO coal_input (measure_date,coal_type,unit,moisture_pct,ash_pct,vm_pct,last_modified_by,created_at,modified_at) VALUES ("2022-06-06", "INDO CLV", "P1 U1", 45.3, 0.6, 28.7,'jon@gmail.com',now(),now());

-- use lab_reading;
INSERT INTO lab_reading VALUES (1, "2022-06-06", "MICRO-1", 150.82);

-- use data_validation;
INSERT INTO validation_rules VALUES (2, "Date Formatting", "All data format for uploaded files should be DD/MM/YYYY","A,B,C","A * B + C > 1" );

-- use internal_directory;
INSERT INTO internal_directory VALUES ("P1T001", "Tag");
INSERT INTO internal_directory VALUES ("P1T002", "Tag");
INSERT INTO internal_directory VALUES ("P1T003", "Tag");
INSERT INTO internal_directory VALUES ("P1T004", "Tag");

INSERT INTO internal_tag VALUES ("P1T001", "SW1000");
INSERT INTO internal_tag VALUES ("P1T002", "SW1350");
INSERT INTO internal_tag VALUES ("P1T003", "SW2000");
INSERT INTO internal_tag VALUES ("P1T004", "CI5000");

INSERT INTO activated_validation_rules VALUES (2,"Date Formatting","coal_input","200,measure_date,10");
