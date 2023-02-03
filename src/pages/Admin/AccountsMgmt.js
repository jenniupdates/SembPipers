import { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import {
	Breadcrumbs,
	Box,
	Button,
	Link,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Snackbar,
	Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import AddUserModal from "../../components/AddUserModal";
import { LoadingButton } from "@mui/lab";

const AccountsMgmt = () => {
	const breadcrumbs = [
		<Link
			component={RouterLink}
			to="/admin"
			underline="hover"
			key="1"
			color="inherit"
		>
			Home
		</Link>,
		<Typography key="3" color="text.primary">
			Accounts Management
		</Typography>,
	];
	let navigate = useNavigate();
	const [users, setUsers] = useState([]);
	const [openAddUser, setOpenAddUser] = useState(false);
	const [snackbar, setSnackbar] = useState(null);
	const [toDeleteUser, setToDeleteUser] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isDisabled, setIsDisabled] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem("token");
		const role = localStorage.getItem("role");
		if (!token || role !== "admin") {
			navigate("/noAccess");
		} else {
			axios
				.get("http://localhost:5001/getUsers")
				.then((res) => setUsers(res.data.users));
		}
	}, [navigate]);

	const [openCfmDel, setOpenCfmDel] = useState(false);
	const handleOpenCfmDel = (email) => {
		setOpenCfmDel(true);
		setToDeleteUser(email);
	};
	const handleCloseCfmDel = () => setOpenCfmDel(false);
	const handleCloseSnackbar = () => setSnackbar(null);

	const handleDeleteAccount = () => {
		setIsLoading(true);
		setIsDisabled(true);
		axios
			.delete("http://localhost:5001/deleteUser", {
				data: {
					email: toDeleteUser,
				},
			})
			.then(() => {
				setIsLoading(false);
				setSnackbar({
					children: "Delete successful. Page will now refresh.",
					severity: "success",
				});
				setTimeout(() => window.location.reload(), 1000);
			})
			.catch((e) => {
				setIsLoading(false);
				setIsDisabled(false);
				setSnackbar({
					children: e.response.data.message,
					severity: "error",
				})
			}
			);
	};

	return (
		<Box m={10}>
			<Breadcrumbs
				separator={<NavigateNextIcon fontSize="small" />}
				alignItems={"flex-start"}
			>
				{breadcrumbs}
			</Breadcrumbs>
			<Stack direction="row" justifyContent="space-between" mt={5}>
				<Typography variant="h4">List of users</Typography>
				<Box>
					<Button
						variant="outlined"
						startIcon={<AddIcon />}
						onClick={() => setOpenAddUser(true)}
					>
						Create User
					</Button>
				</Box>
			</Stack>
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Email</TableCell>
							<TableCell>Role</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{users.map((user) => (
							<TableRow key={user.email}>
								<TableCell>{user.email}</TableCell>
								<TableCell>{user.role}</TableCell>
								<TableCell>
									<Button
										color="error"
										variant="contained"
										onClick={_ => handleOpenCfmDel(user.email)}
									>
										Delete Account
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<AddUserModal open={openAddUser} close={() => setOpenAddUser(false)} />
			<Dialog open={openCfmDel} onClose={handleCloseCfmDel}>
				<DialogTitle id="alert-dialog-title">Delete user?</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						You will lose this account once you confirm this deletion.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseCfmDel} disabled={isDisabled}>Close</Button>
					<LoadingButton
						onClick={handleDeleteAccount}
						autoFocus
						variant="outlined"
						color="error"
						loading={isLoading}
						disabled={isDisabled}
					>
						Confirm
					</LoadingButton>
				</DialogActions>
			</Dialog>

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
};

export default AccountsMgmt;
