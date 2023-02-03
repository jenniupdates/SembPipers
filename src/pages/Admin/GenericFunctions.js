import { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import {
	Link,
	Typography,
	Breadcrumbs,
	Tabs,
	Tab,
	Box,
	Button,
	Alert,
	Snackbar,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
} from "@mui/material";
import { Stack } from "@mui/system";
import { useForm } from "react-hook-form";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import DeleteIcon from "@mui/icons-material/Delete";
import DataObjectIcon from '@mui/icons-material/DataObject';
import SourceIcon from '@mui/icons-material/Source';
import { LoadingButton } from "@mui/lab";

import EditableTable from "../../components/EditableTable";
import TabPanel from "../../components/TabPanel";
import TestFunctionModal from "../../components/TestFunctionModal";

const GenericFunctions = () => {
    useEffect(() => {
		const token = localStorage.getItem("token");
		const role = localStorage.getItem("role");
		if (!token || role !== "admin") {
			navigate("/noAccess");
		}
	});


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
		<Link
		component={RouterLink}
		to="/admin/dataEntryOptions"
		underline="hover"
		key="1"
		color="inherit"
	>
		Data Entry
	</Link>,
	<Link
		component={RouterLink}
		to="/admin/dataEntryOptions/rulesMgmt"
		underline="hover"
		key="1"
		color="inherit"
	>
		Rules Management
	</Link>,
		<Typography key="3" color="text.primary">
			Generic Functions
		</Typography>,
	];
    let navigate = useNavigate();
	

	const deleteFunctionsURL = "http://localhost:5007/deleteFunctions"

    const { register } = useForm();
	const functionTable = "generic_functions";

	const [tabIndex, setTabIndex] = useState(0);
	const [openTest, setOpenTest] = useState(false);
	const [idsToDelete, setIdsToDelete] = useState([]);

	const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
	const handleOpenDelCfm = () => setOpenDeleteConfirmation(true);
	const handleCloseDelCfm = () => setOpenDeleteConfirmation(false);

	const [functionTableCols, setFunctionTableCols] = useState([]);
	const [functionTableRows, setFunctionTableRows] = useState([]);

	const [snackbar, setSnackbar] = useState(null);
	const [primaryKeys, setPrimaryKeys] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isDisabled, setIsDisabled] = useState(false);
	const [isLoadingDelete, setIsLoadingDelete] = useState(false);
	const [isDisabledDelete, setIsDisabledDelete] = useState(false);

	useEffect(() => {
		axios.get(`http://localhost:5007/getFunctionColInfo`).then((res) =>{
		setFunctionTableCols(res.data.columns);
		setPrimaryKeys(res.data.primary_keys);
		})
		axios.get(`http://localhost:5007/getFunctionRows`).then((res) => setFunctionTableRows(res.data.rows))

	},[])

	const handleCloseSnackbar = () => setSnackbar(null);
	const handleOpen = () => {
		setOpenTest(true);
	};

	const handleClose = () => {
		setOpenTest(false);
	};

	const handleChange = (event, newValue) => {
		setTabIndex(newValue);

	};

	const handleDelete = () => {
		setIsLoadingDelete(true);
		setIsDisabledDelete(true);
		const data = {
			data: {
				ids: idsToDelete,
			},
		};
		axios.delete(deleteFunctionsURL, data)
		.then(() => {
			setIsLoadingDelete(false);
			setSnackbar({
				children: "Delete successful. Page will now refresh.",
				severity: "success",
			});
			setTimeout(() => window.location.reload(), 1000);
		})
		.catch((e) => {
			setIsLoadingDelete(false);
			setIsDisabledDelete(false);
			setSnackbar({
				children: e.response.data.message,
				severity: "error",
			});
		});
	}

	const handleFileUpload = (event) => {
		setIsLoading(true);
		event.preventDefault();
		const data = new FormData();
		data.append("file", event.target.files[0]);
		axios
			.post(
				`http://localhost:5004/processPythonFile`,
				data
			)
			.then(() => {
				setIsLoading(false);
				setIsDisabled(true);
				setSnackbar({
					children: "File upload successful. Page will now refresh.",
					severity: "success",
				});
				setTimeout(() => window.location.reload(), 1000);
			})
			.catch((e) => {
				setIsLoading(false);
				setSnackbar({
					children: e.response.data.message,
					severity: "error",
				})
			}
			);

	};

	return (
		<>
			<Box sx={{ p: 5 }}>
				<Breadcrumbs
					separator={<NavigateNextIcon fontSize="small" />}
					alignItems={"flex-start"}
				>
					{breadcrumbs}
				</Breadcrumbs>

				<Stack
					direction="row"
					justifyContent={"space-between"}
					alignItems={"flex-end"}
				>
					<Tabs value={tabIndex} onChange={handleChange} sx={{ pt: 10 }}>
						<Tab label="Generic Functions" />
					</Tabs>

					<Stack direction="row" spacing={3}>
							<Button
							variant="contained"
							color="secondary"
							startIcon={<DataObjectIcon />}
							onClick={handleOpen}
						>
							Test Function
						</Button>
						<LoadingButton variant="contained" component="label" startIcon={<SourceIcon />} loading={isLoading} disabled={isDisabled}>
							Import Functions
							<input
								hidden
								{...register('fileData', { required: true })}
								id='fileData'
								type="file"
								accept=".py"
								onChange={handleFileUpload}
								name="fileData"
							/>
						</LoadingButton>
						<Button
							variant="contained"
							color="error"
							startIcon={<DeleteIcon />}
							onClick={handleOpenDelCfm}
							disabled={idsToDelete.length === 0 ? true : false}
						>
							Delete Rows
						</Button>
					</Stack>
				</Stack>

				<TabPanel value={tabIndex} index={0}>
					<EditableTable
						rows={functionTableRows}
						columns={functionTableCols}
						dbTable={functionTable}
						setIdsToDelete={setIdsToDelete}
						primaryKeys={primaryKeys}
					/>
				</TabPanel>
			</Box>
			<TestFunctionModal
				open={openTest}
				close={handleClose}

			/>
			
			{!!snackbar && (
				<Snackbar
					open
					anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
					onClose={handleCloseSnackbar}
				>
					<Alert {...snackbar} onClose={handleCloseSnackbar} />
				</Snackbar>
			)}
			<Dialog open={openDeleteConfirmation} onClose={handleCloseDelCfm}>
				<DialogTitle id="alert-dialog-title">Delete Rules?</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						Are you sure you want to delete? Once deleted, the functions CANNOT be recovered.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDelCfm} disabled={isDisabledDelete}>Close</Button>
					<LoadingButton
						onClick={handleDelete}
						autoFocus
						variant="outlined"
						color="error"
						loading={isLoadingDelete}
						disabled={isDisabledDelete}
					>
						Confirm
					</LoadingButton>
				</DialogActions>
			</Dialog>
		</>
	)

}

export default GenericFunctions;