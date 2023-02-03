import {
	Breadcrumbs,
	Link,
	Typography,
	Box,
	Stack,
	Snackbar,
	Alert,
	FormControl,
	RadioGroup,
	FormControlLabel,
	Radio,
	TextField
} from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import axios from "axios";
import { useState } from "react";
import { LoadingButton } from "@mui/lab";

const ImportDataPage = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [isDisabled, setIsDisabled] = useState(false);
	const breadcrumbs =
		localStorage.getItem("role") === "engineer"
			? [
					<Link
						component={RouterLink}
						to="/engineer/entry"
						underline="hover"
						key="1"
						color="inherit"
					>
						Data Entry
					</Link>,
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
					<Link
						component={RouterLink}
						to="/admin/dataEntryOptions/entry"
						underline="hover"
						key="1"
						color="inherit"
					>
						Edit Data
					</Link>,
					<Typography key="3" color="text.primary">
						Import Data
					</Typography>,
			  ];
	const email = localStorage.getItem("userEmail");

	const [snackbar, setSnackbar] = useState(null);
	const [selectedFile, setSelectedFile] = useState();
	const [overwriteTable, setOverwriteTable] = useState("no");
	const [errorBar, setErrorBar] = useState(false);
	const [errorRows, setErrorRows] = useState([]);

	const location = useLocation();
	const navigate = useNavigate();
	const handleCloseSnackbar = () => setSnackbar(null);

	function ErrorMessage(props) {
		let errorArray = props.errorRows;
		let errorMsg = "";
		for (let error_obj of errorArray) {
			errorMsg += "row " + error_obj.row_num + ": " + error_obj.message + " : " + error_obj.rule_code + "\n\n"
		}
		if (errorMsg === "") {
			return <div></div>
		}
		return (
			<div>
				<TextField
				error
				id="outlined-error"
				label="Error"
				defaultValue={errorMsg}
				maxRows={8}
				multiline
				disabled
				fullWidth
				/>
			</div>
		)
	}

	const handleSubmitImport = (event) => {
		setIsLoading(true);
		setErrorBar(false);
		event.preventDefault();
		const data = new FormData();
		data.append("file", selectedFile);

		axios
			.post(
				`http://localhost:5004/processFile?table=${location.state.dbTable}&email=${email}&overwrite=${overwriteTable}`,
				data
			)
			.then(() => {
				setIsLoading(false);
				setIsDisabled(true);
				setSnackbar({
					children:
						"File upload successful. Page will now go back to previous page.",
					severity: "success",
				});
				setTimeout(() => navigate(-1), 1000);
			})
			.catch((e) => {
				if (e.response.data.hasOwnProperty('error_rows')) {
					setErrorRows(e.response.data.error_rows);
					setErrorBar(true);
				}
				setIsLoading(false);
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

				<Stack direction="column" alignItems={"flex-start"} spacing={5} mt={10}>
					{/* <Box>
						<Typography>Step 1: Select your ad-hoc validation(s)</Typography>
					</Box> */}
					<Box>
						<Typography>Step 1: Choose your import file</Typography>
						<input
							type="file"
							accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
							onChange={(e) => setSelectedFile(e.target.files[0])}
							id="fileData"
							name="fileData"
						/>
					</Box>
					<Box>
						<Typography>
							Step 2: Do you want this import to overwrite ALL existing data in
							the table?
						</Typography>
						<FormControl>
							<RadioGroup defaultValue="no" name="overwrite-table" onChange={e => setOverwriteTable(e.target.value)}>
								<FormControlLabel value="yes" control={<Radio />} label="Yes" />
								<FormControlLabel value="no" control={<Radio />} label="No" />
							</RadioGroup>
						</FormControl>
					</Box>
					<LoadingButton variant="contained" onClick={handleSubmitImport} loading={isLoading} disabled={isDisabled}>
						Submit
					</LoadingButton>
				</Stack>
				<br />
				<Stack>
					{!!errorBar && (
						<ErrorMessage errorRows={errorRows} />
					)}
				</Stack>
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
		</Box>
	);
};

export default ImportDataPage;
