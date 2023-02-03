import {
	Breadcrumbs,
	Link,
	Typography,
	Box,
	Stack,
	Snackbar,
	Alert,
	Button
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

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
	const [message, setMessage] = useState("");
	const [fontColor, setFontColor] = useState("success.light");

	function ingestData () {
		axios.get("http://localhost:5031/annotation").then((res) => {
			// console.log("status: ", res.status)
			if (res.status == 200) {
				setMessage("Annotation Data successfully ingested!")
			} else {
				setMessage("Ingestion failed...")
				setFontColor("error.main")
			}
		})
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
				<Stack direction="row" spacing={3} mt={3}>
					<Button
						startIcon={<AddIcon />}
						variant="contained"
						onClick={ingestData}
					>
						Click to ingest annotation data into db
					</Button>
				</Stack>
				<Stack direction="row" spacing={3} mt={3} sx={{color: fontColor, fontWeight: 'bold'}}>
					{isButton ? message : ''}
				</Stack>
				<Stack direction="column" alignItems={"flex-start"} spacing={3} mt={3}>
					<Box>
						<iframe src='http://localhost:5040/d/Z1h4NhH4k/new-dashboard_test?orgId=1&editPanel=2&from=1666811583011&to=1666833183011'width="1750" height="900" ></iframe>
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