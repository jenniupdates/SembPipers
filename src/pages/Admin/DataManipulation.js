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
} from "@mui/material";
import { Stack } from "@mui/system";
import { useForm } from "react-hook-form";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import AddIcon from "@mui/icons-material/Add";

import EditableTable from "../../components/EditableTable";
import TabPanel from "../../components/TabPanel";
import CreateFormulaManipulationModal from "../../components/CreateFormulaManipulationModal";
import ActivateFormulaManipulationModal from "../../components/ActivateFormulaManipulationModal";

const DataManipulation = () => {
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
		<Typography key="3" color="text.primary">
			Data Manipulation
		</Typography>,
	];
	let navigate = useNavigate();

	const manipulationTable = "manipulation_formula";
	const activatedManipulationTable = "activated_manipulation_formula";
	const { register } = useForm();

	const [tabIndex, setTabIndex] = useState(0);
	const [openAddRow, setOpenAddRow] = useState(false);
	const [openActivate, setOpenActivate] = useState(false);
	const [idsToDelete, setIdsToDelete] = useState([]);

	const [manipulationTableCols, SetManipulationTableCols] = useState([]);
	const [manipulationTableRows, SetManipulationTableRows] = useState([]);
	const [activationTableCols, SetActivationTableCols] = useState([]);
	const [activationTableRows, SetActivationTableRows] = useState([]);
	const [snackbar, setSnackbar] = useState(null);
	const [rules, setRules] = useState([]);
	const [manipulationPrimaryKeys, setManipulationPrimaryKeys] = useState([]);
	const [activationPrimaryKeys, setActivationPrimaryKeys] = useState([]);

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
		if (localStorage.getItem("manipulationTabIndex") !== null) {
			setTabIndex(parseInt(localStorage.getItem("manipulationTabIndex")));
		}
		else {
			localStorage.setItem("manipulationTabIndex",0);
		}

		axios.get("http://localhost:5020/getFormulaNames").then((res) => setRules(res.data.formula_names))
		axios.get("http://localhost:5020/getManipulationFormulaCols").then((res) => {
			SetManipulationTableCols(res.data.columns);
			setManipulationPrimaryKeys(res.data.primary_keys);	
		})
		axios.get("http://localhost:5021/getActivatedFormulaCols").then((res) => {
			SetActivationTableCols(res.data.columns);
			setActivationPrimaryKeys(res.data.primary_keys);
		})
		axios.get("http://localhost:5020/getManipulationFormulaRows").then((res) => SetManipulationTableRows(res.data.rows))
		axios.get("http://localhost:5021/getActivatedFormulaRows").then((res) => SetActivationTableRows(res.data.rows))
	}, [manipulationTable, activatedManipulationTable]);

	const handleChange = (event, newValue) => {
		localStorage.setItem("manipulationTabIndex",newValue);
		setTabIndex(newValue);

	};

	const handleDelete = () => {
		const data = {
			data: {
				ids: idsToDelete,
			},
		};
		let endpoint = 
			tabIndex === 0
				? "http://localhost:5020/deleteFormulaRows"
				: "http://localhost:5021/deleteActivatedFormulaRows"
		axios
			.delete(endpoint, data)
			.then(() => {
				setSnackbar({
					children: "Delete successful. Page will now refresh.",
					severity: "success",
				});
				setTimeout(() => window.location.reload(), 1000);
			})
	};

	const handleFileUpload = (event) => {
		event.preventDefault();
		let fileData = event.target.files[0]
		let form_data = new FormData()
    	form_data.set('file',fileData)
		axios
			.post(
				"http://localhost:5020/processGenericFormulaUpload", 
				form_data
			)
			.then (() => {
				setSnackbar({
					children: "File upload successful. Page will now refresh",
					severity: "success",
				});
				setTimeout(() => window.location.reload(), 1000);
			})
			.catch((e) => {
				setSnackbar({
					children: e.response.data.message,
					severity: "error",
				});
				setTimeout(() => window.location.reload(), 3000);
			});	
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
						<Tab label="Manipulation Formula" />
						<Tab label="Activated Formula" />
					</Tabs>

					<Stack direction="row" spacing={3}>
						<Button variant="contained" component="label">
							Import Formula
							<input
								hidden
								{...register('fileData', { required: true })}
								id='fileData'
								type="file"
								accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
								onChange={handleFileUpload}
								name="fileData"
							/>
						</Button>

						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={handleOpen}
						>
							Create New Formula
						</Button>
						<Button
							variant="contained"
							color="secondary"
							startIcon={<StarIcon/>}
							onClick={handleOpenActivate}
						>
							Activate A Formula
						</Button>
						<Button
							variant="contained"
							color="error"
							startIcon={<DeleteIcon />}
							onClick={handleDelete}
							disabled={idsToDelete.length === 0 ? true : false}
						>
							Delete Rows
						</Button>
					</Stack>
				</Stack>

				<TabPanel value={tabIndex} index={0}>
					<EditableTable
						rows={manipulationTableRows}
						columns={manipulationTableCols}
						dbTable={manipulationTable}
						setIdsToDelete={setIdsToDelete}
						primaryKeys={manipulationPrimaryKeys}
					/>
				</TabPanel>
				<TabPanel value={tabIndex} index={1}>
					<EditableTable
						rows={activationTableRows}
						columns={activationTableCols}
						dbTable={activatedManipulationTable}
						setIdsToDelete={setIdsToDelete}
						primaryKeys={activationPrimaryKeys}
					/>
				</TabPanel>

				<CreateFormulaManipulationModal
					open={openAddRow}
					close={handleClose}
					dbTable={tabIndex === 0 ? manipulationTable : activatedManipulationTable}
					columns={manipulationTableCols}
				/>
				<ActivateFormulaManipulationModal
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
			
		</>
		
	);
};

export default DataManipulation;
