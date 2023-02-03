import axios from "axios";
import { useEffect, useState } from "react";
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

const TestFunctionModal = ({ open, close, dbTable, columns }) => {
	const getAllFunctionsURL = "http://localhost:5007/getFunctionRows";
	const getFunctionURL = "http://localhost:5007/getFunctionRow/";
	const processFunctionURL = "http://localhost:5007/processFunction";
	const { handleSubmit, control } = useForm();
	const [snackbar, setSnackbar] = useState(null);
	const [functions, setFunctions] = useState([]);
	const [selectFunction, setSelectFunction] = useState("");
	const [selectFunctionDesc, setSelectFunctionDesc] = useState("");
	const [variables, setVariables] = useState([]);
	const [output, setOutput] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		axios.get(getAllFunctionsURL).then((res) => setFunctions(res.data.rows));
	});

	const onSubmit = (props) => {
		setIsLoading(true);
		var body = {};
		for (let prop in props) {
			if (variables.includes(prop)) {
				body[prop] = props[prop];
			}
		}
		const submit_data = JSON.stringify({
			variable_dict: body,
			function_id: selectFunction,
		});
		axios
			.post(processFunctionURL, submit_data, {
				headers: { "Content-Type": "application/json" },
			})
			.then((response) => {
				setIsLoading(false);
				const res = response.data;
				setOutput(res.output);
			})
			.catch((error) => {
				setIsLoading(false);
			});
	};
	const handleSelectedFunction = (event) => {
		setSelectFunction(event.target.value);
		axios.get(getFunctionURL + event.target.value).then((res) => {
			setSelectFunctionDesc(res.data.function.function_description);
			setVariables(res.data.function.function_params);
		});
	};
	const handleCloseSnackbar = () => setSnackbar(null);

	function FunctionDescription(props) {
		if (props.desc !== "") {
			return (
				<>
					<Typography fontWeight={"500"}>Function Description</Typography>
					<TextField
						disabled
						label="Function Description"
						defaultValue={selectFunctionDesc}
						maxRows={8}
						multiline
					/>
				</>
			);
		}
	}

	function Output(props) {
		if (props.output !== "") {
			return (
				<>
					<TextField
						disabled
						label="Output"
						defaultValue={output}
						maxRows={8}
						multiline
					/>
				</>
			);
		}
	}

	return (
		<>
			<Modal open={open} onClose={close}>
				<Grid container spacing={2}>
					<Grid item xs={6}>
						<Box sx={style}>
							<form onSubmit={handleSubmit(onSubmit)}>
								<Stack spacing={2}>
									<Typography fontWeight={"500"}>Test a Function</Typography>
									<Controller
										key={"Select Function"}
										name={"Select Function"}
										control={control}
										render={({ fieldState: { error } }) => (
											<Select
												displayEmpty
												labelId={"select-rule"}
												onChange={handleSelectedFunction}
												value={selectFunction}
												label={"Select Function"}
											>
												{functions.map((func) => (
													<MenuItem key={func.function_name} value={func.id}>
														{func.function_name}
													</MenuItem>
												))}
											</Select>
										)}
									/>
									<FunctionDescription desc={selectFunctionDesc} />
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
															<TextField
																onChange={onChange}
																defaultValue={value}
																label={`Enter value for ${variable}`}
																error={!!error}
																helperText={error ? error.message : null}
															/>
														)}
														rules={{ required: `${variable} cannot be blank` }}
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
									>
										Run Test
									</LoadingButton>
								</Stack>
							</form>
							<br />
							<Output output={output} />
						</Box>
					</Grid>
					<Grid item xs={4}></Grid>
				</Grid>
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

export default TestFunctionModal;
