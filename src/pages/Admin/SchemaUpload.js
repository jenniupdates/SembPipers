import { useCallback, useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
	Box,
	Breadcrumbs,
	Link,
	Typography,
	Stack,
	Alert,
} from "@mui/material";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import axios from "axios";
import ReactCodeMirror from "@uiw/react-codemirror";
import { MySQL } from "@codemirror/lang-sql";
import { LoadingButton } from "@mui/lab";

const SchemaUpload = () => {
	useEffect(() => {
		const token = localStorage.getItem("token");
		const role = localStorage.getItem("role");
		if (!token || role !== "admin") {
			navigate("/noAccess");
		}
	});
	const [uploadSuccess, setUploadSuccess] = useState(null);
	const [queryText, setQueryText] = useState("");
	const [responseMsg, setResponseMsg] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isDisabled, setIsDisabled] = useState(false);
	const [isLoadingResubmit, setIsLoadingResubmit] = useState(false);
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
			to="/admin"
			underline="hover"
			key="1"
			color="inherit"
		>
			Data Entry
		</Link>,
		<Typography key="3" color="text.primary">
			Schema Import
		</Typography>,
	];
	let navigate = useNavigate();

	const handleFileUpload = (event) => {
		setIsLoading(true);
		let file = event.target.files[0];
		let read = new FileReader();
		read.readAsText(file);
		read.onloadend = () => {
			axios
				.post("http://localhost:5004/createSchema", {
					createQuery: read.result,
				})
				.then((res) => {
					setIsLoading(false);
					setIsDisabled(true);
					setUploadSuccess(true);
					setResponseMsg(res.data.message);
					setTimeout(() => navigate(-1), 2000);
				})
				.catch((e) => {
					setIsLoading(false);
					setIsDisabled(true);
					setUploadSuccess(false);
					setQueryText(read.result);
					setResponseMsg(e.response.data.message);
				});
		};
	};

	const handleResubmit = (event) => {
		setIsLoadingResubmit(true);
		axios
			.post("http://localhost:5004/createSchema", {
				createQuery: queryText,
			})
			.then(() => {
				setIsLoadingResubmit(false);
				setUploadSuccess(true);
				setResponseMsg("Schema created! Will now redirect to Data Entry.");
				setTimeout(() => navigate(-1), 2000);
			})
			.catch((e) => {
				setIsLoadingResubmit(false);
				setUploadSuccess(false);
				setResponseMsg(e.response.data.message);
			});
	};

	const onEditorChange = useCallback((value, viewUpdate) => {
		setQueryText(value);
	}, []);

	return (
		<Box m={10}>
			<Breadcrumbs
				separator={<NavigateNextIcon fontSize="small" />}
				alignItems={"flex-start"}
			>
				{breadcrumbs}
			</Breadcrumbs>
			<Stack direction="column" alignItems="flex-start" spacing={2} mt={3}>
				<Typography>Import schema (.sql files allowed only):</Typography>
				<LoadingButton
					variant="contained"
					startIcon={<FileUploadIcon />}
					component="label"
					loading={isLoading}
					disabled={isDisabled}
				>
					Import
					<input hidden type="file" accept=".sql" onChange={handleFileUpload} />
				</LoadingButton>
				{uploadSuccess === false && (
					<>
						<ReactCodeMirror
							value={queryText}
							height="200px"
							width="500px"
							extensions={[MySQL]}
							onChange={onEditorChange}
						/>
						<Alert severity="error" sx={{ mt: 3 }}>
							{responseMsg}
						</Alert>
						<LoadingButton variant="contained" onClick={handleResubmit} loading={isLoadingResubmit}>
							Submit
						</LoadingButton>
					</>
				)}
				{!!uploadSuccess && (
					<Alert severity="success" sx={{ mt: 3 }}>
						{responseMsg}
					</Alert>
				)}
			</Stack>
		</Box>
	);
};

export default SchemaUpload;
