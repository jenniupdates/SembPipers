import {
	Breadcrumbs,
	Link,
	Typography,
	Box,
	Stack,
	Snackbar,
	Alert,
	Button,
	FormControl,
	RadioGroup,
	FormControlLabel,
	Radio,
} from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";

import React, { useEffect } from "react";


import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import axios from "axios";
import { useState } from "react";

const AnnotationPage = () => {
	const breadcrumbs =
		localStorage.getItem("role") === "engineer"
			? [

					<Typography key="3" color="text.primary">
						Annotate
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
					<Typography key="3" color="text.primary">
					Annotate
					</Typography>,
			];

	const [snackbar, setSnackbar] = useState(null);
	const handleCloseSnackbar = () => setSnackbar(null);
	const [isButton, setIsButton] = useState(false);
	const [annotationData, setAnnotationData] = useState([]);

	function ingestAnnotationData () {
		axios.get("http://localhost:5031/sqlitetomysqldb").then((res) => {
			console.log(res.data)
			// console.log("result data type: ", typeof res.data);
			// console.log("result data: ", res.data);
			// setAnnotationData = res.data;
		}).catch (error => {
			console.log(error);
		});
		setIsButton(true);
	}

	return (
		<Box m={10}>
			<Box>
				<Breadcrumbs
					separator={<NavigateNextIcon fontSize="small" />}
					alignItems={"flex-start"}
				>
					{breadcrumbs}
				</Breadcrumbs>

				<Stack mt={3}>
					<Button
						variant="contained"
						onClick={ingestAnnotationData}
					>
						Ingest labelled Annotation Data into MySQL DB
					</Button>
						{/* <p>{isButton && annotationData == "True" ? 
						'Successfully ingested annotation data into centralised db!' : ''}
						{isButton && annotationData !== "True" ?
						'Failed to ingest annotation data into centralised db...' : ''}
						</p>					 */}
				</Stack>

				<Stack direction="column" alignItems={"flex-start"} spacing={3} mt={0}>
					<Box>
						<iframe src='http://localhost:5040/d/Z1h4NhH4k/new-dashboard_test?orgId=1&editPanel=2&from=1666811583011&to=1666833183011'width="1260" height="580" ></iframe>
					</Box>
				</Stack>

			</Box>
			{!!snackbar && (
				<Snackbar
					open
					anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
					onClose={handleCloseSnackbar}
					autoHideDuration={6000}
				>
					<Alert {...snackbar} onClose={handleCloseSnackbar} />
				</Snackbar>
			)}
		</Box>
	);
};

export default AnnotationPage;