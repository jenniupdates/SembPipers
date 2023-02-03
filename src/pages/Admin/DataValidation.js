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
import StarIcon from "@mui/icons-material/Star";
import AddIcon from "@mui/icons-material/Add";
import CodeIcon from '@mui/icons-material/Code';
import SourceIcon from '@mui/icons-material/Source';
import { LoadingButton } from "@mui/lab";

import EditableTable from "../../components/EditableTable";
import TabPanel from "../../components/TabPanel";
import CreateRuleValidationModal from "../../components/CreateRuleValidationModal";
import ActivateRuleValidationModal from "../../components/ActivateRuleValidationModal";

const DataValidation = () => {
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
		<Typography key="3" color="text.primary">
			Rules Management
		</Typography>,
	];
	let navigate = useNavigate();

	const validationTable = "validation_rules";
	const activatedValidationTable = "activated_validation_rules";
	const { register } = useForm();

	const [tabIndex, setTabIndex] = useState(0);
	const [openAddRow, setOpenAddRow] = useState(false);
	const [openActivate, setOpenActivate] = useState(false);
	const [idsToDelete, setIdsToDelete] = useState([]);

	const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
	const handleOpenDelCfm = () => setOpenDeleteConfirmation(true);
	const handleCloseDelCfm = () => setOpenDeleteConfirmation(false);


	const [validationTableCols, SetValidationTableCols] = useState([]);
	const [validationTableRows, SetValidationTableRows] = useState([
		{ id: 1, name: "Sanity", tag: "Check" },
	]);
	const [activationTableCols, SetActivationTableCols] = useState([]);
	const [activationTableRows, SetActivationTableRows] = useState([
		{ id: 1, name: "Sanity", tag: "Check" },
	]);
	const [snackbar, setSnackbar] = useState(null);
	const [rules, setRules] = useState([]);
	const [validationPrimaryKeys, setValidationPrimaryKeys] = useState([]);
	const [activationPrimaryKeys, setActivationPrimaryKeys] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isDisabled, setIsDisabled] = useState(false);
	const [isLoadingDelete, setIsLoadingDelete] = useState(false);
	const [isDisabledDelete, setIsDisabledDelete] = useState(false);

	const handleCloseSnackbar = () => setSnackbar(null);
	const handleOpen = () => {
		setOpenAddRow(true);
	};

	const handleClose = () => {
		setOpenAddRow(false);
	};

	const handleOpenActivate = () => {
		setOpenActivate(true)
	};

	const handleCloseActivate = () => {
		setOpenActivate(false)
	};

	useEffect(() => {
		if (localStorage.getItem("validationTabIndex") !== null) {
			setTabIndex(parseInt(localStorage.getItem("validationTabIndex")));
		}
		else {
			localStorage.setItem("validationTabIndex",0);
		}
		axios.get("http://localhost:5005/getRuleNames").then((res) => setRules(res.data.rule_names))
		axios.get("http://localhost:5005/getValidationTableColInfo").then((res) => {
			SetValidationTableCols(res.data.columns);
			setValidationPrimaryKeys(res.data.primary_keys);
		})
		axios.get("http://localhost:5006/getActivatedTableColInfo").then((res) => {
			SetActivationTableCols(res.data.columns);
			setActivationPrimaryKeys(res.data.primary_keys);
			})
		axios.get("http://localhost:5005/getValidationRows").then((res) => SetValidationTableRows(res.data.rows))
		axios.get("http://localhost:5006/getActivatedValidationRows").then((res) => SetActivationTableRows(res.data.rows))
	}, [validationTable, activatedValidationTable]);

	const handleChange = (event, newValue) => {
		localStorage.setItem("validationTabIndex",newValue);
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
		let endpoint =
			tabIndex === 0
				? "http://localhost:5005/deleteRules"
				: "http://localhost:5006/deleteActivatedValidationRows";

		axios
			.delete(endpoint, data)
			.then(() => {
				setIsLoadingDelete(false);
				setSnackbar({
					children: "Delete successful. Page will now refresh.",
					severity: "success",
				});
				setTimeout(() => window.location.reload(), 1000);
			})
			.catch((e) =>  {
				setIsLoadingDelete(false);
				setIsDisabledDelete(false);
				setSnackbar({
					children: e.response.data.message,
					severity: "error",
				});
			});
	};

	const handleFileUpload = (event) => {
		setIsLoading(true);
		event.preventDefault();
		let fileData = event.target.files[0]
		let form_data = new FormData()
    	form_data.set('file',fileData)
		axios.post("http://localhost:5004/processFileForRules", 
        form_data)
			.then((response) => {
				if (response.status === 201) {
					setIsLoading(false);
					setIsDisabled(true);
					setSnackbar({
						children: "Upload of rules is successful. Reloading page",
						severity: "success",
					});
					setTimeout(() => window.location.reload(), 1000);
				}

			})
			.catch((e) => {
				setIsLoading(false);
				setSnackbar({
					children: e.response.data.message,
					severity: "error",
				})
			});

	}

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
						<Tab label="Validation Rules" />
						<Tab label="Activated Rules" />
					</Tabs>

					<Stack direction="row" spacing={3}>
						<Button
							variant="outlined"
							startIcon={<CodeIcon />}
							onClick={handleOpen}
						>
						<Link
							component={RouterLink}
							to="/admin/dataEntryOptions/rulesMgmt/genericFunctions"
							underline="hover"
							key="1"
							color="inherit"
						>
							Manage Functions
						</Link>
						</Button>

						<LoadingButton variant="contained" component="label" startIcon={<SourceIcon />} loading={isLoading} disabled={isDisabled}>
							Import Rules
							<input
								hidden
								{...register('fileData', { required: true })}
								id='fileData'
								type="file"
								accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
								onChange={handleFileUpload}
								name="fileData"
							/>
						</LoadingButton>

						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={handleOpen}
						>
							Create new Rule
						</Button>
						<Button
							variant="contained"
							color="secondary"
							startIcon={<StarIcon/>}
							onClick={handleOpenActivate}
						>
							Activate a Rule
						</Button>
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
						rows={validationTableRows}
						columns={validationTableCols}
						dbTable={validationTable}
						setIdsToDelete={setIdsToDelete}
						primaryKeys={validationPrimaryKeys}
					/>
				</TabPanel>
				<TabPanel value={tabIndex} index={1}>
					<EditableTable
						rows={activationTableRows}
						columns={activationTableCols}
						dbTable={activatedValidationTable}
						setIdsToDelete={setIdsToDelete}
						primaryKeys={activationPrimaryKeys}
					/>
				</TabPanel>

				<CreateRuleValidationModal
					open={openAddRow}
					close={handleClose}
					dbTable={tabIndex === 0 ? validationTable : activatedValidationTable}
					columns={validationTableCols}
				/>
				<ActivateRuleValidationModal
					open={openActivate}
					close={handleCloseActivate}
					rules={rules}
				/>
			</Box>
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
						If you are deleting generic validation rules, you will also delete activated rules linked to it.
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
		
	);
};

export default DataValidation;
