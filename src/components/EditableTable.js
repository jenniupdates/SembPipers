import { useCallback, useState } from "react";
import { DataGrid, GridToolbarContainer, GridToolbarExportContainer, GridCsvExportMenuItem, GridToolbarColumnsButton,GridToolbarFilterButton, GridToolbarDensitySelector } from "@mui/x-data-grid";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Tooltip from "@mui/material/Tooltip"
import axios from "axios";

export default function ServerSidePersistence({
	dbTable,
	rows,
	columns,
	setIdsToDelete,
	primaryKeys,
}) {
	const useMutation = () => {
		return useCallback(
			(row) =>
				new Promise((resolve, reject) =>
					setTimeout(() => {
						let url = dbTable.includes("input")
							? "http://localhost:5003/updateInputRow"
							: "http://localhost:5002/updateConfigRow";
						axios
							.put(url, {
								row: row,
								userEmail: localStorage.getItem("userEmail"),
								table: dbTable,
								columns: columns,
								primaryKeys: primaryKeys
							})
							.then(() => {
								resolve({ ...row });
								setSnackbar({
									children: "Row successfully saved",
									severity: "success",
								});
							})
							.catch((e) =>
								reject(
									setSnackbar({
										children: e.response.data.message,
										severity: "error",
									})
								)
							);
					}, 200)
				),
			[columns, primaryKeys]
		);
	};
	const mutateRow = useMutation();

	const [snackbar, setSnackbar] = useState(null);

	const handleCloseSnackbar = () => setSnackbar(null);

	const processRowUpdate = useCallback(
		async (newRow) => {
			const response = await mutateRow(newRow);
			return response;
		},
		[mutateRow, columns, primaryKeys]
	);

	const handleProcessRowUpdateError = useCallback((error) => {
		setSnackbar({ children: error.message, severity: "error" });
	}, []);

	const csvOptions = { fileName: dbTable };

	function CustomToolBar() {
		return (
			<GridToolbarContainer>
				<GridToolbarColumnsButton />
      			<GridToolbarFilterButton />
      			<GridToolbarDensitySelector />
				<GridToolbarExportContainer>
					<GridCsvExportMenuItem options={csvOptions} />
				</GridToolbarExportContainer>
			</GridToolbarContainer>
		);
	}

	let colFormatted = [];
	let omit_tables = ["validation_formula", "activated_validation_formula"];
	for (let col of columns) {
		if (omit_tables.includes(dbTable) || col in ["created_at", "last_modified_by", "modified_at"] || col[2] === "PRI") {
			colFormatted.push({
				field: col[0],
				headerName: col[0],
				width: 200,
				renderCell: (params) => (
					<Tooltip title={params.value}>
					 <span className="table-cell-trucate">{params.value}</span>
					</Tooltip>
				),
			});
		} else {
			colFormatted.push({
				field: col[0],
				headerName: col[0],
				editable: true,
				width: 200,
				renderCell: (params) => (
					<Tooltip title={params.value}>
					 <span className="table-cell-trucate">{params.value}</span>
					</Tooltip>
				),
			});
		}
	}

	return (
		<div style={{ height: 400, width: "100%" }}>
			<DataGrid
				rows={rows}
				columns={colFormatted}
				components={{
					Toolbar: CustomToolBar,
				}}
				componentsProps={{
					toolbar: { showQuickFilter: true },
				}}
				getRowId={(row) => primaryKeys.map((pk) => row[pk]).join(",")}
				checkboxSelection={true}
				processRowUpdate={processRowUpdate}
				onProcessRowUpdateError={handleProcessRowUpdateError}
				experimentalFeatures={{ newEditingApi: true }}
				onSelectionModelChange={(ids) => {
					setIdsToDelete(ids);
				}}
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
		</div>
	);
}