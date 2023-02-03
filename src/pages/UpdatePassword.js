import { Alert, Box, Button, Snackbar, Stack, TextField, Typography } from "@mui/material"
import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router-dom"


const UpdatePassword = () => {
  const email = localStorage.getItem("userEmail")
  const role = localStorage.getItem("role")
  const [newPassword, setNewPassword] = useState("")
	const [snackbar, setSnackbar] = useState(null);
  let navigate = useNavigate()

	const handleCloseSnackbar = () => setSnackbar(null);

  const handleSubmit = () => {
    axios
			.put("http://localhost:5001/updatePassword", {
        email: email,
        newPassword: newPassword,
			})
			.then(res => {
        let pageToRouteTo = role === "admin" ? "/admin" : "/engineer/entry"
				setSnackbar({
					children: res.message,
					severity: "success",
				});
				setTimeout(() => navigate(pageToRouteTo), 1000);
			})
			.catch((e) =>
				setSnackbar({
					children: e.response.data.message,
					severity: "error",
				})
			);
  }

  return (
		<Box m={10}>
			<Stack direction="column" spacing={3}>
				<Typography variant="h5">
					Please change your password before continuing.
				</Typography>
				<TextField
					disabled
					id="email"
					label="Email"
					variant="filled"
					defaultValue={email}
				/>
				<TextField
					id="password"
					label="Password"
					variant="outlined"
					type="password"
					onChange={(e) => setNewPassword(e.target.value)}
				/>
				<Button onClick={handleSubmit}>Submit</Button>
			</Stack>

			{!!snackbar && (
				<Snackbar
					open
					anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
					onClose={handleCloseSnackbar}
				>
					<Alert {...snackbar} onClose={handleCloseSnackbar} />
				</Snackbar>
			)}
		</Box>
	);
}

export default UpdatePassword