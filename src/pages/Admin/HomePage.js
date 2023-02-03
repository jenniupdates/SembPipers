import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Breadcrumbs, Grid, Typography } from "@mui/material";

import PostAddIcon from "@mui/icons-material/PostAdd";
import RateReviewIcon from "@mui/icons-material/RateReview";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const AdminHomePage = () => {
	useEffect(() => {
		const token = localStorage.getItem("token");
		const role = localStorage.getItem("role");
		if (!token || role !== "admin") {
			navigate("/noAccess");
		}
	});

	let navigate = useNavigate();
	const buttons = [
		{
			icon: <PostAddIcon sx={{ fontSize: 80 }} />,
			text: "Data Entry",
			route: "dataEntryOptions",
		},
		{
			icon: <RateReviewIcon sx={{ fontSize: 80 }} />,
			text: "Data Annotation",
			route: "annotation",
		},
				{
			icon: <AnalyticsIcon sx={{fontSize: 80}} />,
			text: "Data Manipulation",
			route: "dataManipulation",
		},
		{
			icon: <SupervisorAccountIcon sx={{ fontSize: 80 }} />,
			text: "Accounts Management",
			route: "accounts",
		},

	];
	const breadcrumbs = [
		<Typography key="3" color="text.primary">
			Home
		</Typography>,
	];

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

export default AdminHomePage;
