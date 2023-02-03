import axios from "axios";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	Typography,
	Box,
	Modal,
	TextField,
	Stack,
	Snackbar,
	Alert,
} from "@mui/material";
import { style } from "../constants/modalStyle";
import { LoadingButton } from "@mui/lab";

const CreateFormulaManipulationModal = ({ open, close, dbTable, columns }) => {
	const { handleSubmit, control } = useForm();
	const [snackbar, setSnackbar] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isDisabled, setIsDisabled] = useState(false);

	const onSubmit = (props) => {
		setIsLoading(true);
		let url = "http://localhost:5020/insertManipulationFormula"
		axios
			.post(url, {
				table: dbTable,
				cols: columns.join(","),
				values: Object.values(props),
			})
			.then(() => {
				setIsLoading(false);
				setIsDisabled(true);
				setSnackbar({
					children: "New formula has been added successfully! Page will now reload.",
					severity: "success",
				});
				setTimeout(() => window.location.reload(), 1000);
			})
			.catch((err) => {
				setIsLoading(false);
				setSnackbar({
					children: err.response.data.message,
					severity: "error",
				})
			});
	};
	const handleCloseSnackbar = () => setSnackbar(null);

	return (
		<>
			<Modal open={open} onClose={close}>
				<Box sx={style}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<Stack spacing={2}>
							<Typography fontWeight={"500"}>Create a New Formula</Typography>
							<Controller
								key={"Formula Name"}
								name={"Formula Name"}
								control={control}
								render={({
									field: { onChange, value },
									fieldState: { error },
								}) => (
									<TextField
										onChange={onChange}
										defaultValue={value}
										label={"Formula Name"}
										error={!!error}
										helperText={error ? error.message : null}
									/>
								)}
								rules={{ required: `${"Formula Name"} required` }}
							/>
							<Controller
								key={"Formula Description"}
								name={"Formula Descriptione"}
								control={control}
								render={({
									field: { onChange, value },
									fieldState: { error },
								}) => (
									<TextField
										onChange={onChange}
										defaultValue={value}
										label={"Formula Description"}
										error={!!error}
										helperText={error ? error.message : null}
									/>
								)}
								rules={{ required: `${"Formula Description"} required` }}
							/>
							<Controller
								key={"Variables"}
								name={"Variables"}
								control={control}
								render={({
									field: { onChange, value },
									fieldState: { error },
								}) => (
									<TextField
										onChange={onChange}
										defaultValue={value}
										label={"Variables, separate by comma (e.g. var1,var2)"}
										error={!!error}
										helperText={error ? error.message : null}
									/>
								)}
								rules={{ required: `${"At least one variable is"} required` }}
							/>
							<Controller
								key={"Code"}
								name={"Code"}
								control={control}
								render={({
									field: { onChange, value },
									fieldState: { error },
								}) => (
									<TextField
										onChange={onChange}
										defaultValue={value}
										label={"Code"}
										multiline
										maxRows={10}
										error={!!error}
										helperText={error ? error.message : null}
									/>
								)}
								rules={{ required: `${"Some code is"} required` }}
							/>

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

export default CreateFormulaManipulationModal;
