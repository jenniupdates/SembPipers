import axios from "axios";
import { useState } from "react";
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

const ActivateFormulaManipulationModal = ({ open, close, rules }) => {
	const { handleSubmit, control } = useForm();
	const [snackbar, setSnackbar] = useState(null);
	const [selectedFormula, setSelectedFormula] = useState("");
	const [variables, setVariables] = useState([]);
	const [code, setCode] = useState("");
	const [selectColumns, setSelectColumns] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isDisabled, setIsDisabled] = useState(false);

	function AddConstantValue(props) {
		if (props.input === "CONSTANT") {
			let name = props.name + "-CONSTANT";
			let label = `Enter constant value for '${props.name}'`;
			return (
				<>
					<br /><br />
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
					<TextField disabled label="Formula Code" defaultValue={code} />
				</>
			);
		} else {
			return <div></div>;
		}
	}

	const handleSelectFormula = (event) => {
		setSelectedFormula(event.target.value);
		axios
			.get(
				`http://localhost:5020/getFormulaVariablesCode/${event.target.value}`
			)
			.then((res) => {
				setVariables(res.data.variables);
				setCode(res.data.code);
			});
	};

	const handleFormulaCols = (event) => {
		axios
			.get(`http://localhost:5010/getFormulaColInfo`)
			.then((res) => {
				let internal_names = res.data.internal_names;
				internal_names.push("CONSTANT");
				setSelectColumns(internal_names);
			})
			.catch(function (error) {
			});
	};

	const onSubmit = (props) => {
		setIsLoading(true);
		let url = "http://localhost:5021/insertActivatedFormula"; // To change
		let column_variables = "";
		let internal_name = props["Type Internal Name"];
		for (let prop in props) {
			let prop_index = "";
			if (variables.includes(prop)) {
				// Check if columns are custom
				if (props[prop] === "CONSTANT") {
					prop_index = prop + "-CONSTANT";
				} else {
					prop_index = prop;
				}
				column_variables += props[prop_index] + ",";
			}
		}
		column_variables = column_variables.substring(0,column_variables.length-1)
		axios.post(url,{
			formula_name: selectedFormula,
			column_variables: column_variables,
			internal_name: internal_name
		}).then(() => {
			setIsLoading(false);
			setIsDisabled(true);
			setSnackbar({
				children: "New formula has been activated successfully. Page will now reload.",
				severity: "success"
			});
			setTimeout(() => window.location.reload(), 1000)
		}).catch((err) => {
			setIsLoading(false);
			setSnackbar({
				children: err.response.data.message,
				severity: "error"
			})
		});
	};
	const handleCloseSnackbar = () => setSnackbar(null);
	return (
		<>
			<Modal open={open} onClose={close} style={{ overflow: "scroll" }}>
				<Box sx={style}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<Stack spacing={2}>
							<Typography fontWeight={"500"}>
								Select Formula to Apply
							</Typography>
							<InputLabel id="select-formula">Select Formula </InputLabel>
							<Controller
								key={"Select Formula"}
								name={"Select Formula"}
								control={control}
								render={({ fieldState: { error } }) => (
									<Select
										displayEmpty
										labelId={"select-formula"}
										onChange={(e) => {
											handleSelectFormula(e);
											handleFormulaCols(e);
										}}
										value={selectedFormula}
										label={"Select Formula"}
									>
										{rules.map((rule) => (
											<MenuItem key={rule} value={rule}>
												{rule}
											</MenuItem>
										))}
									</Select>
								)}
							/>
							<Controller
								key={"Type Internal Name"}
								name={"Type Internal Name"}
								control={control}
								render={({
									field: { onChange, value },
									fieldState: { error },
								}) => (
									<TextField
										onChange={onChange}
										defaultValue={value}
										label={"Type Internal Name"}
										error={!!error}
										helperText={error ? error.mesage : null}
									/>
								)}
							/>
							<DisplayCode rule={setSelectedFormula} />
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
														<AddConstantValue input={value} name={variable} />
													</>
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
								Activate Formula
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

export default ActivateFormulaManipulationModal;
