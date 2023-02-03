import axios from "axios";
import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	Typography,
	Grid,
	Box,
	Modal,
	TextField,
	Stack,
	Snackbar,
	Alert,
	Select,
	MenuItem,
	InputLabel,
} from "@mui/material";
import { style } from "../constants/modalStyle";
import { LoadingButton } from "@mui/lab";

const ActivateRuleValidationModal = ({ open, close, rules }) => {
	const { handleSubmit, control } = useForm();
	const [snackbar, setSnackbar] = useState(null);
	const [selectedRule, setSelectedRule] = useState("");
	const [variables, setVariables] = useState([]);
	const [functions, setFunctions] = useState([]);
	const [functionNames, setFunctionNames] = useState([]);
	const [code, setCode] = useState("");
	const [table, setTable] = useState("");
	const [tables, setTables] = useState([]);
	const [selectColumns, setSelectColumns] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isDisabled, setIsDisabled] = useState(false);

	useEffect(() => {
		axios.get(`http://localhost:5003/getInputTables`).then((res) => {
			setTables(res.data.tables);
		});
	}, []);

	function AddCustomInput(props) {
		if (props.input === "CUSTOM") {
			let name = props.name + "-CUSTOM";
			let label = `Enter custom value for '${props.name}'`;
			return (
				<>
					<br /> <br />
					<Controller
						key={name}
						name={name}
						control={control}
						render={({ field: { onChange, value }, fieldState: { error } }) => (
							<TextField
								onChange={onChange}
								defaultValue={value}
								label={label}
								error={!!error}
								helperText={error ? error.message : null}
							/>
						)}
						rules={{ required: `${name} required` }}
					/>
				</>
			);
		}
		return <div></div>;
	}

	function DisplayCode(props) {
		if (props.rule !== "") {
			return (
				<>
					<Typography fontWeight={"500"}>Code</Typography>
					<TextField disabled label="Rule Code" defaultValue={code} />
				</>
			);
		} else {
			return <div></div>;
		}
	}

	const handleSelectRule = (event) => {
		let functionNameList = [];
		setSelectedRule(event.target.value);
		axios
			.get(`http://localhost:5005/getVariablesCode/${event.target.value}`)
			.then((res) => {
				setVariables(res.data.variables);
				setCode(res.data.code);
			});
		axios
			.get(
				`http://localhost:5005/getFunctionNameAndCount/${event.target.value}`
			)
			.then((res) => {
				setFunctions(res.data.functions);
				for (let funcList of res.data.functions) {
					functionNameList.push(funcList[0]);
				}
				setFunctionNames(functionNameList);
			});
	};

	const handleTableCols = (event) => {
		setTable(event.target.value);
		axios
			.get(
				`http://localhost:5003/getInputTableColInfo?table=${event.target.value}`
			)
			.then((res) => {
				let tableColumns = res.data.columns;
				console.log(tableColumns);
				let displayColumns = [];
				for (let colArr of tableColumns) {
					displayColumns.push(colArr[0])
				}
				displayColumns.push("CUSTOM");
				setSelectColumns(displayColumns);
			});
	};

	const onSubmit = (props) => {
		setIsLoading(true);
		let url = "http://localhost:5006/insertActivatedRule";
		let column_variables = "";
		let function_variables = "";
		let function_string = "";
		for (let prop in props) {
			let prop_index = "";
			if (variables.includes(prop)) {
				// Check if columns are custom
				if (props[prop] === "CUSTOM") {
					prop_index = prop + "-CUSTOM";
				} else {
					prop_index = prop;
				}
				column_variables += props[prop_index] + ",";
			} else if (functionNames.includes(prop)) {
				function_variables += props[prop] + ",";
				function_string += prop + ",";
			}
		}
		column_variables = column_variables.substring(
			0,
			column_variables.length - 1
		);
		function_variables = function_variables.substring(
			0,
			function_variables.length - 1
		);
		function_string = function_string.substring(0, function_string.length - 1);
		axios
			.post(url, {
				rule_name: selectedRule,
				table_name: table,
				column_variables: column_variables,
				function_variables: function_variables,
				function_string: function_string,
			})
			.then(() => {
				setIsLoading(false);
				setIsDisabled(true);
				setSnackbar({
					children:
						"New rule has been activated successfully. Page will now reload.",
					severity: "success",
				});
				setTimeout(() => window.location.reload(), 1000);
			})
			.catch((err) => {
				setIsLoading(false);
				setSnackbar({
					children: err.response.data.message,
					severity: "error",
				});
			});
	};
	const handleCloseSnackbar = () => setSnackbar(null);
	return (
		<>
			<Modal open={open} onClose={close} style={{ overflow: "scroll" }}>
				<Box sx={style}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<Stack spacing={2}>
							<Typography fontWeight={"500"}>Select Rule to Apply</Typography>
							<InputLabel id="select-table">Select Table to Apply </InputLabel>
							<Controller
								key={"Table"}
								name={"Table"}
								control={control}
								render={({ fieldState: { error } }) => (
									<Select
										displayEmpty
										labelId={"select-table"}
										onChange={handleTableCols}
										value={table}
										label="Select Table"
									>
										{tables.map((table_name) => (
											<MenuItem key={table_name} value={table_name}>
												{table_name}
											</MenuItem>
										))}
									</Select>
								)}
							/>

							<InputLabel id="select-rule">Select Rule </InputLabel>
							<Controller
								key={"Select Rule"}
								name={"Select Rule"}
								control={control}
								render={({ fieldState: { error } }) => (
									<Select
										displayEmpty
										labelId={"select-rule"}
										onChange={handleSelectRule}
										value={selectedRule}
										label={"Select Rule"}
									>
										{rules.map((rule) => (
											<MenuItem key={rule} value={rule}>
												{rule}
											</MenuItem>
										))}
									</Select>
								)}
							/>
							<DisplayCode rule={selectedRule} />
							<Grid container spacing={2}>
								{variables.map((variable) => (
									<>
										<Grid item xs={6}>
											<InputLabel id={variable}>{variable}:</InputLabel>
											<Controller
												key={variable}
												name={variable}
												control={control}
												render={({
													field: { onChange, value },
													fieldState: { error },
												}) => (
													<>
														<Select
															displayEmpty
															labelId={variable}
															onChange={onChange}
															value={value}
															label={variable}
														>
															{selectColumns.map((col) => (
																<MenuItem key={col} value={col}>
																	{col}
																</MenuItem>
															))}
														</Select>
														<AddCustomInput input={value} name={variable} />
													</>
												)}
											/>
										</Grid>
									</>
								))}
								{functions.map((func) => (
									<>
										<Grid item xs={6}>
											<InputLabel id={func[0]}>{func[0]}:</InputLabel>
											<Controller
												key={func[0]}
												name={func[0]}
												control={control}
												render={({
													field: { onChange, value },
													fieldState: { error },
												}) => (
													<Select
														displayEmpty
														labelId={func[0]}
														onChange={onChange}
														value={value}
														label={func[0]}
													>
														{func[2].map((col) => (
															<MenuItem
																key={col.function_name}
																value={col.function_name}
															>
																{col.function_name}
															</MenuItem>
														))}
													</Select>
												)}
											/>
										</Grid>
									</>
								))}
							</Grid>

							<LoadingButton
								loading={isLoading}
								type="submit"
								variant="contained"
								color="primary"
								disabled={isDisabled}
							>
								Activate Rule
							</LoadingButton>
						</Stack>
					</form>
				</Box>
			</Modal>
			{!!snackbar && (
				<Snackbar
					open
					anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
					onClose={handleCloseSnackbar}
				>
					<Alert {...snackbar} onClose={handleCloseSnackbar} />
				</Snackbar>
			)}
		</>
	);
};

export default ActivateRuleValidationModal;
