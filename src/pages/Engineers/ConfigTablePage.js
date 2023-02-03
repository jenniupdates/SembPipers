import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
	Alert,
	Box,
	Breadcrumbs,
	Button,
	Link,
	Snackbar,
	Stack,
	Typography,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import AddIcon from "@mui/icons-material/Add";
import { Link as RouterLink } from "react-router-dom";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import EditableTable from "../../components/EditableTable";
import AddConfigModal from "../../components/AddConfigModal";
import { LoadingButton } from "@mui/lab";


const ConfigTablePage = () => {
	const { handleSubmit, control, register } = useForm();
	const [openAddRow, setOpenAddRow] = useState(false);
	const [configTable, setConfigTable] = useState("");
	const [configTableRows, setConfigTableRows] = useState([]);
	const [configTableCols, setConfigTableCols] = useState([]);
	const [idsToDelete, setIdsToDelete] = useState([]);
	const [snackbar, setSnackbar] = useState(null);
	const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
	const [primaryKeys, setPrimaryKeys] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isDisabled, setIsDisabled] = useState(false);
	const [isLoadingDelete, setIsLoadingDelete] = useState(false);
	const [isDisabledDelete, setIsDisabledDelete] = useState(false);
	
	const handleOpenDelCfm = () => setOpenDeleteConfirmation(true);
	const handleCloseDelCfm = () => setOpenDeleteConfirmation(false);

	const role = localStorage.getItem("role");
	const email = localStorage.getItem("userEmail");

	useEffect(() => {
		axios.get(`http://localhost:5002/getConfigTable`).then((res) => {
			setConfigTable(res.data.table);

			axios(`http://localhost:5002/getConfigTableColInfo`).then((res) => {
				setConfigTableCols(res.data.columns);
				setPrimaryKeys(res.data.primary_keys);
			});
			axios({
				method: "GET",
				url: `http://localhost:5002/getConfigTableRows`,
			}).then((res) => setConfigTableRows(res.data.rows));
		});
	}, [role]);

	const breadcrumbs =
		role === "engineer"
			? [
					<Typography key="3" color="text.primary">
						Configuration Table
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
						Configuration Table
					</Typography>,
			  ];

	const handleCloseSnackbar = () => setSnackbar(null);
	const handleFileUpload = (event) => {
		event.preventDefault();
		setIsLoading(true);
		const data = new FormData();
		data.append("file", event.target.files[0]);

		axios
			.post(
				`http://localhost:5004/processFile?table=${configTable}&email=${email}`,
				data
			)
			.then(() => {
				setIsLoading(false);
				setIsDisabled(true);
				setSnackbar({
					children: "Config file upload successful. Page will now refresh.",
					severity: "success",
				});
				setTimeout(() => window.location.reload(), 2000);
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
	const handleOpen = () => {
		setOpenAddRow(true);
	};
	const handleClose = () => {
		setOpenAddRow(false);
	};
	const handleDelete = () => {
		setIsLoadingDelete(true);
		setIsDisabledDelete(true);
		axios
			.delete("http://localhost:5002/deleteConfigRows", {
				data: {
					ids: idsToDelete,
					primary_keys: primaryKeys
				},
			})
			.then(() => {
				setIsLoadingDelete(false);
				setSnackbar({
					children: "Delete successful. Page will now refresh.",
					severity: "success",
				});
				setTimeout(() => window.location.reload(), 1000);
			})
			.catch((e) => {
				setIsDisabledDelete(false);
				setIsLoadingDelete(false);
				setSnackbar({
					children: e.response.data.message,
					severity: "error",
				})
			});
	};

	return (
		<Box m={10}>
			<Stack direction="row" justifyContent={"space-between"} mb={3}>
				<Breadcrumbs
					separator={<NavigateNextIcon fontSize="small" />}
					alignItems={"flex-start"}
				>
					{breadcrumbs}
				</Breadcrumbs>

				{role === "engineer" ? null : (
					<Stack direction="row" spacing={3}>
						<LoadingButton
							startIcon={<FileUploadIcon />}
							variant="contained"
							component="label"
							disabled={isDisabled}
							loading={isLoading}
						>
							Import Data
							<input
								hidden
								{...register("fileData")}
								id="fileData"
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
				)}
			</Stack>
			<EditableTable
				rows={configTableRows}
				columns={configTableCols}
				dbTable={configTable}
				setIdsToDelete={setIdsToDelete}
				primaryKeys={primaryKeys}
			/>
			<AddConfigModal
				open={openAddRow}
				close={handleClose}
				dbTable={configTable}
				columns={configTableCols}
				handleSubmit={handleSubmit}
				control={control}
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
				<DialogTitle id="alert-dialog-title">Delete Rows?</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						You will lose your data once you confirm this deletion.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDelCfm} disabled={isDisabledDelete}>
						Close
					</Button>
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
		</Box>
	);
};

export default ConfigTablePage;
