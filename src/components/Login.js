import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
	Avatar,
	Button,
	CssBaseline,
	TextField,
	Link,
	Box,
	Typography,
	Container,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

function Copyright(props) {
	return (
		<Typography
			variant="body2"
			color="text.secondary"
			align="center"
			{...props}
		>
			{"Copyright © "}
			<Link
				color="inherit"
				href="https://github.com/jonjonnyjonjon/is483-sembpipers"
			>
				IS483 FYP - SembPipers
			</Link>{" "}
			{new Date().getFullYear()}
			{"."}
		</Typography>
	);
}

function Login(props) {
	const [errors, setErrors] = useState("")
	let navigate = useNavigate();
	const [loginForm, setloginForm] = useState({
		email: "",
		password: "",
	});
	

	function logMeIn(event) {
		axios({
			method: "POST",
			url: "http://localhost:5001/login",
			data: {
				email: loginForm.email,
				password: loginForm.password,
			},
		})
			.then((response) => {
				props.setToken(
					response.data.access_token,
					response.data.role,
					response.data.email
				);
				if (!response.data.has_logged_in) {
					navigate("/updatePassword");
				} else if (response.data.role === "admin") {
					navigate("/admin");
				} else {
					navigate("/engineer/entry");
				}
			})
			.catch((e) => {
				setErrors(e.response.data.message)
			});

		event.preventDefault();
	}

	function handleChange(event) {
		const { value, name } = event.target;
		setloginForm((prevNote) => ({
			...prevNote,
			[name]: value,
		}));
	}

	return (
		<Container component="main" maxWidth="xs">
			<CssBaseline />
			<Box
				sx={{
					marginTop: 8,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
					<LockOutlinedIcon />
				</Avatar>
				<Typography component="h1" variant="h5">
					Sign in
				</Typography>
				<Box component="form" noValidate sx={{ mt: 1 }}>
					<TextField
						margin="normal"
						required
						fullWidth
						id="email"
						label="Email Address"
						name="email"
						autoComplete="email"
						error={Boolean(errors)}
						onChange={handleChange}
					/>
					<TextField
						margin="normal"
						required
						fullWidth
						name="password"
						label="Password"
						type="password"
						id="password"
						autoComplete="current-password"
						onChange={handleChange}
						error={Boolean(errors)}
						helperText={errors}
					/>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						sx={{ mt: 3, mb: 2 }}
						onClick={logMeIn}
					>
						Sign In
					</Button>
				</Box>
			</Box>
			<Copyright sx={{ mt: 8, mb: 4 }} />
		</Container>
	);
}

export default Login;
