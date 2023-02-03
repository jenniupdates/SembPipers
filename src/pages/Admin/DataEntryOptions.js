import { useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, Breadcrumbs, Grid, Link, Typography } from "@mui/material";

import PostAddIcon from "@mui/icons-material/PostAdd";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import UploadIcon from "@mui/icons-material/Upload";
import RuleIcon from "@mui/icons-material/Rule";
import SettingsIcon from "@mui/icons-material/Settings";

const DataEntry = () => {
	useEffect(() => {
		const token = localStorage.getItem("token");
		const role = localStorage.getItem("role");
		if (!token || role !== "admin") {
			navigate("/noAccess");
		}
	});

	const buttons = [
		{
			icon: <PostAddIcon sx={{ fontSize: 80 }} />,
			text: "Schema Import",
			route: "schemaUpload",
		},
		{
			icon: <UploadIcon sx={{ fontSize: 80 }} />,
			text: "Data Ingestion",
			route: "entry",
		},
		{
			icon: <RuleIcon sx={{ fontSize: 80 }} />,
			text: "Rules Management",
			route: "rulesMgmt",
		},
		{
			icon: <SettingsIcon sx={{ fontSize: 80 }} />,
			text: "Configuration Table",
			route: "configTable",
		},
	];
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
			Data Entry
		</Typography>,
	];
	let navigate = useNavigate();

	return (
		<Box m={10}>
			<Breadcrumbs
				separator={<NavigateNextIcon fontSize="small" />}
				alignItems={"flex-start"}
			>
				{breadcrumbs}
			</Breadcrumbs>
			<Grid
				container
				direction="row"
				spacing={0}
				alignItems="center"
				justifyContent="center"
				sx={{ minHeight: "60vh" }}
			>
				{buttons.map((btn) => (
					<Grid item xs={6} key={btn.text}>
						<Box
							textAlign="center"
							onClick={() => navigate(btn.route)}
							sx={{ cursor: "pointer" }}
						>
							{btn.icon}
							<Typography>{btn.text}</Typography>
						</Box>
					</Grid>
				))}
			</Grid>
		</Box>
	);
};

export default DataEntry;
