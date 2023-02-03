import axios from "axios";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import {
	Typography,
	Box,
	Modal,
	TextField,
	Stack,
	Snackbar,
	Alert,
	MenuItem,
	InputLabel,
	FormControl,
	Select
} from "@mui/material";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { style } from "../constants/modalStyle";
import { LoadingButton } from "@mui/lab";


const AddRowModal = ({ open, close, dbTable, columns, handleSubmit, control}) => {
	const [snackbar, setSnackbar] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isDisabled, setIsDisabled] = useState(false);
	const [inputColumns, setInputColumns] = useState([]);
	const [inputData, setInputData] = useState([]);


	useEffect(() => {
		axios.get("http://localhost:5002/getAllowableInputTables")
		.then((response) => {
			// console.log(response);
			setInputData(response.data);	
		})
		.catch((err) => {
			console.log(err);
		});
	}, []);

	const inputNames = inputData["input_table_name"];
	
	const handleInputColumns = (event) => {
		let val = event.target.value
		setInputColumns(inputData["input_table_column"][val]);
	};

	columns = columns.filter(
		(elem) =>
			elem[2] !== "PRI" &&
			!["created_at", "last_modified_by", "modified_at"].includes(elem[0])
	);

	const onSubmit = (props) => {
		setIsLoading(true);
		let processValidationUrl = "http://localhost:5011/processActivatedRules";
		let url;
		if (dbTable.includes("input")) {
			url = "http://localhost:5003/insertInputTable";
		} else {
			url = "http://localhost:5002/insertConfigTable";
		}

		// Format datetime and date objects to ISO format
		columns.forEach((col) => {
			if (col[1] === "datetime" || col[1] === "date") {
				props[col[0]] = props[col[0]]
					.toISOString()
					.slice(0, 19)
					.replace("T", " ");
			}
		});

		axios
			.post(processValidationUrl, {
				table_name: dbTable,
				row: props,
			})
			.then((res) => {
				axios
					.post(url, {
						table: dbTable,
						cols: columns.map((col) => col[0]).join(","),
						values: Object.values(props),
						email: localStorage.getItem("userEmail"),
					})
					.then(() => {
						setIsLoading(false);
						setIsDisabled(true);
						setSnackbar({
							children: "New row validated and added successfully! Page will now reload.",
							severity: "success",
						});
						setTimeout(() => window.location.reload(), 1000);
					});
			})
			.catch((err) => {
				// Validation failed
				setIsLoading(false);
				const err_data = err.response.data;
				let err_msg = err_data.message + ":\n" + err_data.resulting_code + " returned false";
				setSnackbar({
					children: err_msg,
					severity: "error",
				});
			});
	};
	const handleCloseSnackbar = () => setSnackbar(null);

	return (
		<>
			<Modal open={open} onClose={close}>
				<Box sx={style}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<Stack spacing={2}>
							<Typography fontWeight={"500"}>Add new data to table</Typography>
							{columns.map((col) => (
								<Controller
									key={col[0]}
									name={col[0]}
									control={control}
									render={({
										field: { onChange, value },
										fieldState: { error },
									}) =>
										col[0] === "input_table_name" ? (
											<FormControl fullWidth>
												<InputLabel id=	"table-select-label">{col[0]}</InputLabel>
												<Select
													labelId="table-select-label"
													id="table-select"
													value={value}
													label={col[0]}
													onChange={e => {
														onChange(e);
														handleInputColumns(e);
													}}
												>
													{
														inputNames.map((value) =>
															<MenuItem value={value}>{value}</MenuItem>
													)}
												</Select>
											</FormControl>
										) : col[0] === "input_table_column" ? (
											<FormControl fullWidth>
												<InputLabel id=	"column-select-label">{col[0]}</InputLabel>
												<Select
													labelId="column-select-label"
													id="column-select"
													value={value}
													label={col[0]}
													onChange={onChange}
												>
													{
														inputColumns.map((value) =>
															<MenuItem value={value}>{value}</MenuItem>
													)}
												</Select>
											</FormControl>
										) : (
											<TextField
												onChange={onChange}
												defaultValue={value}
												label={`${col[0]} (${col[1]})`}
												error={!!error}
												helperText={error ? error.message : null}
											/>
										)
									}
									rules={{ required: `${col} required` }}
								/>
							))}
							<LoadingButton
								loading={isLoading}
								type="submit"
								variant="contained"
								color="primary"
								disabled={isDisabled}
							>
								Add!
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

export default AddRowModal;
