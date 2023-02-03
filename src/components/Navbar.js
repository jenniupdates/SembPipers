import { useState } from "react";
import {
	AppBar,
	Box,
	Toolbar,
	IconButton,
	Menu,
	MenuItem,
	Container,
	Link,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import { Link as RouterLink } from "react-router-dom";


const Navbar = () => {
	const [anchorElNav, setAnchorElNav] = useState(null);
	const pages = localStorage.getItem("role") === "admin" ? {
		"Data Entry": "/admin/dataEntryOptions",
		"Data Annotation": "/admin/annotation",
		"Data Manipulation": "/admin/dataManipulation",
		"Accounts Management": "/admin/accounts"
		
	} :
	{
		"Data Entry": "/engineer/entry",
		"Configuration Table": "/engineer/config",
		"Data Annotation": "/engineer/annotation"
	}
	
	const handleOpenNavMenu = (event) => {
		setAnchorElNav(event.currentTarget);
	};

	const handleCloseNavMenu = () => {
		setAnchorElNav(null);
	};

	return (
		<AppBar position="static" sx={{ bgcolor: "#4A836E" }}>
			<Container maxWidth="xl">
				<Toolbar disableGutters>
					{/* Mobile view */}
					<Box
						sx={{
							flexGrow: 1,
							display: { xs: "flex", md: "none" },
							justifyContent: "flex-end",
						}}
					>
						<IconButton
							size="large"
							onClick={handleOpenNavMenu}
							color="inherit"
						>
							<MenuIcon />
						</IconButton>
						<Menu
							id="menu-appbar"
							anchorEl={anchorElNav}
							anchorOrigin={{
								vertical: "bottom",
								horizontal: "left",
							}}
							keepMounted
							transformOrigin={{
								vertical: "top",
								horizontal: "left",
							}}
							open={Boolean(anchorElNav)}
							onClose={handleCloseNavMenu}
							sx={{
								display: { xs: "block", md: "none" },
							}}
						>
							{Object.keys(pages).map((page) => (
								<MenuItem key={page} onClick={handleCloseNavMenu}>
									<Link
										component={RouterLink}
										to={pages[page]}
										key={page}
										sx={{ color: "black", textDecoration: "none" }}
										textAlign="left"
									>
										{page}
									</Link>
								</MenuItem>
							))}
						</Menu>
					</Box>

					{/* Website view */}
					<Box
						sx={{
							flexGrow: 1,
							display: { xs: "none", md: "flex" },
							justifyContent: "flex-end",
						}}
					>
						{Object.keys(pages).map((page) => (
							<Link
								component={RouterLink}
								to={pages[page]}
								key={page}
								onClick={handleCloseNavMenu}
								sx={{ ml: 3, color: "white" }}
							>
								{page}
							</Link>
						))}
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	);
};
export default Navbar;
