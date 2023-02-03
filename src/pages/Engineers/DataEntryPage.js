import { useEffect, useState } from "react";
import axios from "axios";
import {
	Typography,
	Breadcrumbs,
	Tabs,
	Tab,
	Box,
	Button,
	Alert,
	Snackbar,
	Link,
	Stack,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import EditableTable from "../../components/EditableTable";
import TabPanel from "../../components/TabPanel";
import AddRowModal from "../../components/AddRowModal";
import { LoadingButton } from "@mui/lab";

const DataEntryPage = () => {
	const { handleSubmit, control, reset } = useForm();
	const [tabIndex, setTabIndex] = useState(0);
	const [openAddRow, setOpenAddRow] = useState(false);
	const [idsToDelete, setIdsToDelete] = useState([]);
	const [primaryKeys, setPrimaryKeys] = useState([])

	const [inputTables, setInputTables] = useState([]);
	const [inputTableCols, setInputTableCols] = useState([]);
	const [inputTableRows, setInputTableRows] = useState([]);
	const [snackbar, setSnackbar] = useState(null);
	const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isDisabled, setIsDisabled] = useState(false);
	const [controlDict, setControlDict] = useState({});

	const handleOpenDelCfm = () => setOpenDeleteConfirmation(true);
	const handleCloseDelCfm = () => setOpenDeleteConfirmation(false);

	const handleCloseSnackbar = () => setSnackbar(null);

	const handleOpen = () => {
		setOpenAddRow(true);
	};

	const handleClose = () => {
		setOpenAddRow(false);
	};

	useEffect(() => {
		axios.get("http://localhost:5002/getAllowableValues")
		.then((res) => setControlDict(res.data.controlDict));

	}, []);
	
	const breadcrumbs =
		localStorage.getItem("role") === "engineer"
			? [
					<Typography key="3" color="text.primary">
						Edit Data
					</Typography>,
			  ]
			: [
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
						Edit Data
					</Typography>,
			  ];


	useEffect(() => {

		if (localStorage.getItem("inputTabIndex") !== null) {
			setTabIndex(parseInt(localStorage.getItem("inputTabIndex")));
		}
		else {
			localStorage.setItem("inputTabIndex",0);
		}

		axios.get(`http://localhost:5003/getInputTables`).then((res) => {
			let currTable = res.data.tables[localStorage.getItem("inputTabIndex")];
			setInputTables(res.data.tables);

			axios
				.get(`http://localhost:5003/getInputTableColInfo?table=${currTable}`)
				.then((res) => {
					setInputTableCols(res.data.columns);
					setPrimaryKeys(res.data.primary_keys);
				});
			axios
				.get(`http://localhost:5003/getInputTableRows?table=${currTable}`)
				.then((res) => setInputTableRows(res.data.rows));
		});
	}, []);

	const handleChange = (event, newValue) => {
		localStorage.setItem("inputTabIndex",newValue);
		setTabIndex(newValue);
		setIdsToDelete([]);
		reset();
		let currTable = inputTables[newValue];
		axios
			.get(`http://localhost:5003/getInputTableColInfo?table=${currTable}`)
			.then((res) => {
				setInputTableCols(res.data.columns);
				setPrimaryKeys(res.data.primary_keys);
			});

		axios
			.get(`http://localhost:5003/getInputTableRows?table=${currTable}`)
			.then((res) => setInputTableRows(res.data.rows));
	};

			
	const handleDelete = () => {
		setIsLoading(true);
		setIsDisabled(true);
		axios
			.delete("http://localhost:5003/deleteInputRows", {
				data: {
					table: inputTables[tabIndex],
					ids: idsToDelete,
					primary_keys: primaryKeys
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
			<Box>
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
					<Tabs
						value={tabIndex}
						onChange={handleChange}
						variant="scrollable"
						scrollButtons="auto"
						sx={{ pt: 10 }}
					>
						{inputTables.map((table) => (
							<Tab key={table} label={table} />
						))}
					</Tabs>

					<Stack direction="row" spacing={3}>
						<Button
							variant="contained"
							component={RouterLink}
							to="import"
							state={{ dbTable: inputTables[tabIndex] }}
						>
							Import Data
						</Button>

						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={handleOpen}
						>
							Add new row
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

				{inputTables.map((table, idx) => (
					<TabPanel key={table} value={tabIndex} index={idx}>
						<EditableTable
							rows={inputTableRows}
							columns={inputTableCols}
							dbTable={table}
							setIdsToDelete={setIdsToDelete}
							primaryKeys={primaryKeys}
						/>
					</TabPanel>
				))}

				<AddRowModal
					open={openAddRow}
					close={handleClose}
					dbTable={inputTables[tabIndex]}
					columns={inputTableCols}
					controlDict={controlDict[inputTables[tabIndex]]}
					handleSubmit={handleSubmit}
					control={control}
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
				<DialogTitle id="alert-dialog-title">Delete Rows?</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						You will lose your data once you confirm this deletion.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDelCfm} disabled={isDisabled}>
						Close
					</Button>
					<LoadingButton
						onClick={handleDelete}
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
		</Box>
	);
};

export default DataEntryPage;
