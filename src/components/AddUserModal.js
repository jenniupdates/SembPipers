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
  Select,
  MenuItem,
  FormHelperText,
  InputLabel,
  FormControl,
} from "@mui/material";
import { style } from "../constants/modalStyle"
import { LoadingButton } from "@mui/lab";

const AddUserModal = ({ open, close }) => {
	const { handleSubmit, control } = useForm({
		defaultValues: { email: "", password: "", role: "" },
	});
	const [snackbar, setSnackbar] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isDisabled, setIsDisabled] = useState(false);

	const onSubmit = ({ email, password, role }) => {
		setIsLoading(true);
		axios
			.post("http://localhost:5001/createUser", {
				email: email, 
        password: password,
        role: role,
			})
			.then(() => {
				setIsLoading(false);
				setIsDisabled(true);
				setSnackbar({
					children: "New user added successfully! Page will now reload.",
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
							<Typography fontWeight={"500"}>
								Create new user account
							</Typography>
							<Controller
								name={"email"}
								control={control}
								render={({
									field: { onChange, value },
									fieldState: { error },
								}) => (
									<TextField
										onChange={onChange}
										value={value}
										label={"Email"}
										error={!!error}
										helperText={error ? error.message : null}
									/>
								)}
								rules={{
									required: "Email required",
									pattern: {
										value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
										message: "Invalid email address",
									},
								}}
							/>
							<Controller
								name={"password"}
								control={control}
								render={({
									field: { onChange, value },
									fieldState: { error },
								}) => (
									<TextField
										onChange={onChange}
										value={value}
										label={"Password"}
										type="password"
										error={!!error}
										helperText={error ? error.message : null}
									/>
								)}
								rules={{ required: "Password required" }}
							/>
							<Controller
								name={"role"}
								control={control}
								render={({
									field: { onChange, value },
									fieldState: { error },
								}) => (
									<FormControl>
										<InputLabel id="demo-simple-select-helper-label">
											Role
										</InputLabel>
										<Select
											labelId="demo-simple-select-helper-label"
											onChange={onChange}
											value={value}
											label={"Role"}
											error={!!error}
										>
											<MenuItem value={"admin"}>Admin</MenuItem>
											<MenuItem value={"engineer"}>Engineer</MenuItem>
										</Select>
										{error ? (
											<FormHelperText>{error.message}</FormHelperText>
										) : null}
									</FormControl>
								)}
								rules={{ required: "Role required" }}
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

export default AddUserModal;
